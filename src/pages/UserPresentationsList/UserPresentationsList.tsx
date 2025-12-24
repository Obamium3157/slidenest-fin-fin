import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import {
  listMyPresentations,
  type PresentationMeta,
  savePresentationToAppwrite,
} from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import { createDefaultPresentation } from "../../entities/presentation/model/createDefaultPresentation.ts";

type LoadState = "idle" | "loading" | "error";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function UserPresentationsList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<PresentationMeta[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [creating, setCreating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const canWork = useMemo(() => !authLoading && !!user, [authLoading, user]);

  const load = useCallback(async () => {
    if (!canWork) return;
    setState("loading");
    setErrorText(null);
    try {
      const metas = await listMyPresentations(200);
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

  const onCreate = useCallback(async () => {
    if (!canWork) return;

    setCreating(true);
    setErrorText(null);

    try {
      const p = createDefaultPresentation();
      await savePresentationToAppwrite(p);
      await load();
      navigate(`/editor/${p.id}`);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }, [canWork, load, navigate]);

  if (authLoading) return <div>Загрузка...</div>;
  if (!user) return <div>Нужно войти в аккаунт.</div>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onCreate} disabled={creating}>
          {creating ? "Создание..." : "Создать новую презентацию"}
        </button>

        <button
          onClick={() => void load()}
          disabled={state === "loading" || creating}
        >
          Обновить
        </button>
      </div>

      {errorText && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: "crimson" }}>{errorText}</div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {state === "loading" ? (
          <div>Загрузка списка...</div>
        ) : items.length === 0 ? (
          <div>У вас пока нет презентаций.</div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {items.map((p) => (
              <li
                key={p.presentationId}
                style={{
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  <Link to={`/editor/${p.presentationId}`}>
                    {p.title || "Без названия"}
                  </Link>
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
                  id: {p.presentationId}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  обновлено: {formatDateTime(p.updatedAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
