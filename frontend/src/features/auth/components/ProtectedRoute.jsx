import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../authStore";

/** A layout route: renders child routes for logged-in users, otherwise redirects to /login. */
export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    // Remember where the user was going, so login can send them back there.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
