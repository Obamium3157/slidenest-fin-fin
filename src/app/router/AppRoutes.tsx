import { Navigate, Route, Routes } from "react-router-dom";
import { PresentationMaker } from "../../pages/presentation/ui/PresentationMaker";
import { UserPresentationsList } from "../../pages/UserPresentationsList/UserPresentationsList.tsx";
import { RequireAuth } from "../../pages/auth/ui/RequireAuth/RequireAuth.tsx";
import { LoginPage } from "../../pages/auth/ui/LoginPage/LoginPage.tsx";
import { RegisterPage } from "../../pages/auth/ui/RegisterPage/RegisterPage.tsx";
import { PresentationPlayer } from "../../pages/player/ui/PresentationPlayer.tsx";
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/presentations" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/presentations" element={<UserPresentationsList />} />

        <Route path="/editor" element={<PresentationMaker />} />
        <Route path="/editor/:presentationId" element={<PresentationMaker />} />

        <Route path="/player" element={<PresentationPlayer />} />
        <Route
          path="/player/:presentationId"
          element={<PresentationPlayer />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/presentations" replace />} />
    </Routes>
  );
}
