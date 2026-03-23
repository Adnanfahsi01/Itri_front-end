import { Navigate, Outlet } from 'react-router-dom';

function AdminRoute() {
  const token = localStorage.getItem('adminToken');
  const rawAdmin = localStorage.getItem('adminData');

  let admin = null;
  try {
    admin = rawAdmin ? JSON.parse(rawAdmin) : null;
  } catch {
    admin = null;
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // If role exists in payload, enforce admin role.
  if (admin?.role && admin.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
