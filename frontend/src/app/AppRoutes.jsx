import { Route, Routes } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import DepartmentDetailPage from "@/features/departments/pages/DepartmentDetailPage";
import DepartmentsPage from "@/features/departments/pages/DepartmentsPage";
import EmployeeCreatePage from "@/features/employees/pages/EmployeeCreatePage";
import EmployeeDetailPage from "@/features/employees/pages/EmployeeDetailPage";
import EmployeeEditPage from "@/features/employees/pages/EmployeeEditPage";
import EmployeesPage from "@/features/employees/pages/EmployeesPage";
import LeaveApprovalsPage from "@/features/leaves/pages/LeaveApprovalsPage";
import MyLeavesPage from "@/features/leaves/pages/MyLeavesPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import UsersPage from "@/features/users/pages/UsersPage";
import NotFoundPage from "@/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Layout route: AppLayout renders the shell and an <Outlet /> for the matched child. */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path="employees">
          <Route index element={<EmployeesPage />} />
          <Route path="new" element={<EmployeeCreatePage />} />
          <Route path=":employeeId" element={<EmployeeDetailPage />} />
          <Route path=":employeeId/edit" element={<EmployeeEditPage />} />
        </Route>

        <Route path="departments">
          <Route index element={<DepartmentsPage />} />
          <Route path=":departmentId" element={<DepartmentDetailPage />} />
        </Route>

        <Route path="leaves">
          <Route index element={<MyLeavesPage />} />
          <Route path="approvals" element={<LeaveApprovalsPage />} />
        </Route>

        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Catch-all inside the layout, so the 404 keeps the sidebar */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
