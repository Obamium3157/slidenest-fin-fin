import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes.ts";

import { RequireAuth } from "../../pages/auth/ui/RequireAuth/RequireAuth.tsx";
import { LoginPage } from "../../pages/auth/ui/LoginPage/LoginPage.tsx";
import { RegisterPage } from "../../pages/auth/ui/RegisterPage/RegisterPage.tsx";

import { UserPresentationsList } from "../../pages/UserPresentationsList/UserPresentationsList.tsx";
import { PresentationMaker } from "../../pages/presentation/ui/PresentationMaker.tsx";
import { PresentationPlayer } from "../../pages/player/ui/PresentationPlayer.tsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.ROOT}
        element={<Navigate to={ROUTES.PRESENTATIONS} replace />}
      />

      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route
          path={ROUTES.PRESENTATIONS}
          element={<UserPresentationsList />}
        />

        <Route path={ROUTES.EDITOR} element={<PresentationMaker />} />
        <Route
          path={`${ROUTES.EDITOR}/:presentationId`}
          element={<PresentationMaker />}
        />

        <Route path={ROUTES.PLAYER} element={<PresentationPlayer />} />
        <Route
          path={`${ROUTES.PLAYER}/:presentationId`}
          element={<PresentationPlayer />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={ROUTES.PRESENTATIONS} replace />}
      />
    </Routes>
  );
}
