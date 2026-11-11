import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { FullPageLoader } from "@/components/feedback/Loaders";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleRoute } from "@/features/auth/components/RoleRoute";

// Each lazy() call becomes a separate chunk, downloaded on first visit.
// Layouts and guards stay eager: they're needed on every page.
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const EmployeesPage = lazy(() => import("@/features/employees/pages/EmployeesPage"));
const EmployeeDetailPage = lazy(() => import("@/features/employees/pages/EmployeeDetailPage"));
const EmployeeCreatePage = lazy(() => import("@/features/employees/pages/EmployeeCreatePage"));
const EmployeeEditPage = lazy(() => import("@/features/employees/pages/EmployeeEditPage"));
const DepartmentsPage = lazy(() => import("@/features/departments/pages/DepartmentsPage"));
const DepartmentDetailPage = lazy(() => import("@/features/departments/pages/DepartmentDetailPage"));
const MyLeavesPage = lazy(() => import("@/features/leaves/pages/MyLeavesPage"));
const LeaveApprovalsPage = lazy(() => import("@/features/leaves/pages/LeaveApprovalsPage"));
const UsersPage = lazy(() => import("@/features/users/pages/UsersPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export function AppRoutes() {
  return (
    // Outer boundary: covers pages outside AppLayout (the login page).
    // Inside the app, AppLayout's own Suspense catches pages first, so the sidebar
    // and top bar stay visible while a page chunk loads.
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />

            <Route path="employees">
              <Route index element={<EmployeesPage />} />
              <Route path=":employeeId" element={<EmployeeDetailPage />} />
              <Route element={<RoleRoute permission="employees.manage" />}>
                <Route path="new" element={<EmployeeCreatePage />} />
                <Route path=":employeeId/edit" element={<EmployeeEditPage />} />
              </Route>
            </Route>

            <Route path="departments">
              <Route index element={<DepartmentsPage />} />
              <Route path=":departmentId" element={<DepartmentDetailPage />} />
            </Route>

            <Route path="leaves">
              <Route index element={<MyLeavesPage />} />
              <Route element={<RoleRoute permission="leaves.review" />}>
                <Route path="approvals" element={<LeaveApprovalsPage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute permission="users.manage" />}>
              <Route path="users" element={<UsersPage />} />
            </Route>

            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
