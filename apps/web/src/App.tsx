import { Navigate, Route, Routes } from "react-router";
import { LoginPage, RequireAuth, RequirePermission } from "./modules/auth";
import { EmployeeDetailPage, EmployeesPage } from "./modules/employees";
import { AppLayout, HomeRedirect } from "./modules/layout";
import { PayrollPeriodsPage } from "./modules/payroll";
import { RbacPage } from "./modules/rbac";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route element={<RequirePermission permission="employees:read" />}>
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
          </Route>
          <Route element={<RequirePermission permission="payroll_periods:read" />}>
            <Route path="payroll-periods" element={<PayrollPeriodsPage />} />
          </Route>
          <Route element={<RequirePermission permission="rbac:read" />}>
            <Route path="rbac" element={<RbacPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
