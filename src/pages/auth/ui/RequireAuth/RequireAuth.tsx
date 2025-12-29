import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../../auth";
import { ROUTES } from "../../../../app/router/routes.ts";

type LocationState = {
  from?: { pathname?: string };
};

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Загрузка...</div>;

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location } satisfies LocationState}
      />
    );
  }

  return <Outlet />;
}
