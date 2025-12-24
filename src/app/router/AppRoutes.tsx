import { Navigate, Route, Routes } from "react-router-dom";
import { PresentationMaker } from "../../pages/presentation/ui/PresentationMaker";
import { UserPresentationsList } from "../../pages/UserPresentationsList/UserPresentationsList.tsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/presentations" replace />} />

      <Route path="/presentations" element={<UserPresentationsList />} />

      <Route path="/editor" element={<PresentationMaker />} />
      <Route path="/editor/:presentationId" element={<PresentationMaker />} />

      <Route path="*" element={<Navigate to="/my" replace />} />
    </Routes>
  );
}
