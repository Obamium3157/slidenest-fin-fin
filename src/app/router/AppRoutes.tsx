import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes.ts";

import { RequireAuth } from "../../pages/auth/ui/RequireAuth/RequireAuth.tsx";
import { LoginPage } from "../../pages/auth/ui/LoginPage/LoginPage.tsx";
import { RegisterPage } from "../../pages/auth/ui/RegisterPage/RegisterPage.tsx";

import { UserPresentationsList } from "../../pages/UserPresentationsList/UserPresentationsList.tsx";
import { PresentationMaker } from "../../pages/presentation/ui/PresentationMaker.tsx";
import { PresentationPlayer } from "../../pages/player/ui/PresentationPlayer.tsx";
import type { JSX } from "react";

type RouteConfig = {
  path: string;
  element: JSX.Element;
};

const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.PRESENTATIONS} replace />,
  },
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.REGISTER, element: <RegisterPage /> },
];

const PRIVATE_ROUTES: RouteConfig[] = [
  { path: ROUTES.PRESENTATIONS, element: <UserPresentationsList /> },
  { path: ROUTES.EDITOR, element: <PresentationMaker /> },
  { path: `${ROUTES.EDITOR}/:presentationId`, element: <PresentationMaker /> },
  { path: ROUTES.PLAYER, element: <PresentationPlayer /> },
  { path: `${ROUTES.PLAYER}/:presentationId`, element: <PresentationPlayer /> },
];

export function AppRoutes() {
  return (
    <Routes>
      {PUBLIC_ROUTES.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}

      <Route element={<RequireAuth />}>
        {PRIVATE_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>

      <Route
        path="*"
        element={<Navigate to={ROUTES.PRESENTATIONS} replace />}
      />
    </Routes>
  );
}
