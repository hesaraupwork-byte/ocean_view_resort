import { Navigate, Outlet } from "react-router-dom";

export default function RequireStaff() {
  const token = localStorage.getItem("ov_token");
  const role = (localStorage.getItem("ov_role") || "").toUpperCase();

  if (!token) return <Navigate to="/login" replace />;
  if (role !== "STAFF") return <Navigate to="/" replace />;

  return <Outlet />;
}