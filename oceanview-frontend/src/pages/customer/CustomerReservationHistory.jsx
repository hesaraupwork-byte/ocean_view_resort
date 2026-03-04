// src/pages/customer/CustomerReservationHistory.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerReservationHistory() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = (localStorage.getItem("ov_role") || "").toUpperCase();
    if (!token) navigate("/login", { replace: true });
    else if (role !== "CUSTOMER") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid py-4">
      <h2 className="ov-h2 mb-1">Reservation History</h2>
      <div className="text-muted small">All past reservations and statuses (we will implement next).</div>

      <div className="ov-card-soft mt-3">
        <div className="text-muted">Placeholder page ✅</div>
      </div>
    </div>
  );
}