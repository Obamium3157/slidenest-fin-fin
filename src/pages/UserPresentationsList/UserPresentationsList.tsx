import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import {
  listMyPresentations,
  type PresentationMeta,
  loadPresentationByPresentationId,
  savePresentationToAppwrite,
  deletePresentationAndAssets,
} from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import { createDefaultPresentation } from "../../entities/presentation/model/createDefaultPresentation.ts";

import type { Presentation } from "../../entities/presentation/model/types.ts";
import type { Slide } from "../../entities/slide/model/types.ts";
import { AllSlideObjects } from "../../widgets/allSlideObjects/ui/AllSlideObjects.tsx";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../shared/lib/constants/constants.ts";
import { ROUTES } from "../../app/router/routes.ts";

import styles from "./UserPresentationsList.module.css";
import { LogoutButton } from "../../widgets/logoutButton/ui/LogoutButton.tsx";

import trash from "./assets/tabler/trash.svg";

type LoadState = "idle" | "loading" | "error";

const PREVIEW_SCALE_FACTOR = 5;
const PREVIEW_W = SLIDE_WIDTH / PREVIEW_SCALE_FACTOR;
const PREVIEW_H = SLIDE_HEIGHT / PREVIEW_SCALE_FACTOR;
const PREVIEW_FETCH_CONCURRENCY = 6;

function getFirstSlide(p: Presentation): Slide | null {
  const firstId = p.slides.order[0];
  if (!firstId) return null;
  return p.slides.collection[firstId] ?? null;
}

export function UserPresentationsList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<PresentationMeta[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [firstSlides, setFirstSlides] = useState<Record<string, Slide | null>>(
    {},
  );
  const previewsLoadedRef = useRef(new Set<string>());
  const previewsInFlightRef = useRef(new Set<string>());

  const canWork = useMemo(() => !authLoading && !!user, [authLoading, user]);

  const load = useCallback(async () => {
    if (!canWork) return;
    setState("loading");
    setErrorText(null);
    try {
      const metas = await listMyPresentations();
      setItems(metas);
      setState("idle");
    } catch (e) {
      setState("error");
      setErrorText(e instanceof Error ? e.message : String(e));
    }
  }, [canWork]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;
    const queue = items
      .map((x) => x.presentationId)
      .filter(
        (id) =>
          !previewsLoadedRef.current.has(id) &&
          !previewsInFlightRef.current.has(id),
      );

    if (queue.length === 0) return;

    const runWorker = async () => {
      while (!cancelled && queue.length > 0) {
        const id = queue.shift();
        if (!id) continue;
        if (previewsLoadedRef.current.has(id)) continue;
        if (previewsInFlightRef.current.has(id)) continue;

        previewsInFlightRef.current.add(id);
        try {
          const p = await loadPresentationByPresentationId(id);
          const slide = getFirstSlide(p);
          if (!cancelled) {
            setFirstSlides((prev) => ({ ...prev, [id]: slide }));
          }
        } catch {
          if (!cancelled) {
            setFirstSlides((prev) => ({ ...prev, [id]: null }));
          }
        } finally {
          previewsInFlightRef.current.delete(id);
          previewsLoadedRef.current.add(id);
        }
      }
    };

    const workers = Array.from({ length: PREVIEW_FETCH_CONCURRENCY }, () =>
      runWorker(),
    );
    void Promise.all(workers);

    return () => {
      cancelled = true;
    };
  }, [items]);

  const onCreate = useCallback(async () => {
    if (!canWork) return;

    setCreating(true);
    setErrorText(null);

    try {
      const p = createDefaultPresentation();
      await savePresentationToAppwrite(p);
      await load();
      navigate(`${ROUTES.EDITOR}/${p.id}`);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }, [canWork, load, navigate]);

  const onDelete = useCallback(
    async (e: MouseEvent<HTMLButtonElement>, meta: PresentationMeta) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canWork) return;

      const title = meta.title || "Без названия";
      const ok = window.confirm(`Удалить презентацию "${title}"?`);
      if (!ok) return;

      setDeletingId(meta.presentationId);
      setErrorText(null);
      try {
        await deletePresentationAndAssets(meta.presentationId);
        setItems((prev) =>
          prev.filter((x) => x.presentationId !== meta.presentationId),
        );
        setFirstSlides((prev) => {
          const next = { ...prev };
          delete next[meta.presentationId];
          return next;
        });
        previewsLoadedRef.current.delete(meta.presentationId);
      } catch (err) {
        setErrorText(err instanceof Error ? err.message : String(err));
      } finally {
        setDeletingId(null);
      }
    },
    [canWork],
  );

  if (authLoading) return <div>Загрузка...</div>;

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  const gridStyle = {
    ["--tile-w" as string]: `${PREVIEW_W}px`,
    ["--tile-h" as string]: `${PREVIEW_H}px`,
  } as CSSProperties;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={onCreate}
            disabled={creating}
          >
            {creating ? "Создание..." : "Создать новую презентацию"}
          </button>

          <button
            className={styles.actionButton}
            onClick={() => void load()}
            disabled={state === "loading" || creating}
          >
            Обновить
          </button>
        </div>

        <div className={styles.sideContainer}>
          <LogoutButton />
        </div>
      </div>

      {errorText && (
        <div className={styles.error} role="alert">
          {errorText}
        </div>
      )}

      <div className={styles.content}>
        {state === "loading" ? (
          <div className={styles.statusText}>Загрузка списка...</div>
        ) : items.length === 0 ? (
          <div className={styles.statusText}>У вас пока нет презентаций.</div>
        ) : (
          <div className={styles.gridScroller}>
            <div className={styles.grid} style={gridStyle}>
              {items.map((p) => {
                const slide = firstSlides[p.presentationId];
                return (
                  <Link
                    key={p.presentationId}
                    to={`${ROUTES.EDITOR}/${p.presentationId}`}
                    className={styles.tile}
                  >
                    <div
                      className={styles.preview}
                      style={{
                        background: slide?.backgroundColor?.color ?? "#ffffff",
                      }}
                    >
                      {slide ? (
                        <div
                          className={styles.previewInner}
                          style={{
                            width: SLIDE_WIDTH,
                            height: SLIDE_HEIGHT,
                            transform: `scale(${1 / PREVIEW_SCALE_FACTOR})`,
                            transformOrigin: "top left",
                          }}
                        >
                          <AllSlideObjects slide={slide} readonly />
                        </div>
                      ) : (
                        <div className={styles.previewPlaceholder} />
                      )}
                    </div>

                    <div className={styles.titleRow}>
                      <div className={styles.titleText}>
                        {p.title || "Без названия"}
                      </div>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={(e) => void onDelete(e, p)}
                        disabled={deletingId === p.presentationId}
                        aria-label="Удалить презентацию"
                        title="Удалить"
                      >
                        <img
                          className={styles.deleteIcon}
                          src={trash}
                          alt={"Удалить"}
                        />
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
