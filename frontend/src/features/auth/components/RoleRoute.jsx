import { Outlet } from "react-router";
import ForbiddenPage from "@/pages/ForbiddenPage";
import { usePermission } from "../usePermission";

/** Renders child routes only if the user has `permission`. */
export function RoleRoute({ permission }) {
  const allowed = usePermission(permission);
  return allowed ? <Outlet /> : <ForbiddenPage />;
}
