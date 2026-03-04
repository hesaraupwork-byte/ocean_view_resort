import { Navigate, Outlet } from "react-router-dom";

export default function RequireAdmin() {
  const token = localStorage.getItem("ov_token");
  const role = (localStorage.getItem("ov_role") || "").toUpperCase();

  if (!token) return <Navigate to="/login" replace />;
  if (role !== "ADMIN") return <Navigate to="/" replace />;

  return <Outlet />;
}