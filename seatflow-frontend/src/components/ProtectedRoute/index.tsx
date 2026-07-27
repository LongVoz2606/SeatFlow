import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

interface IProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'ADMIN';
}

export const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children, requireRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && role !== requireRole) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-card border border-rose-500/30 rounded-2xl text-center bg-slate-950">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-4" />
        <p className="text-rose-400 font-semibold mb-2">Bạn không có quyền truy cập trang này.</p>
        <p className="text-xs text-slate-400">Chức năng này chỉ dành cho quản trị viên.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
