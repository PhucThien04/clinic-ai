import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import DashboardLayout from '../DashboardLayout/DashboardLayout';

export function ClinicalAccess({ roles, children }: { roles: string[]; children: ReactNode }) {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.VaiTro)) return <DashboardLayout>
    <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">Bạn không có quyền thực hiện chức năng này.</p>
  </DashboardLayout>;
  return children;
}
