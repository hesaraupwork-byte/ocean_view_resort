// src/components/CustomerNavbar.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function onBackdropClick(e) {
    if (e.target.classList.contains("ov-modal-backdrop")) onCancel();
  }

  return createPortal(
    <div className="ov-modal-backdrop" onMouseDown={onBackdropClick}>
      <div className="ov-modal ov-confirm" onMouseDown={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="ov-h4 mb-0">{title}</h4>
          <button className="btn ov-btn-outline" onClick={onCancel}>
            Close
          </button>
        </div>

        <div className="ov-divider" />

        <p className="mb-0" style={{ color: "#374151", lineHeight: 1.6 }}>
          {message}
        </p>

        <div className="d-flex gap-2 mt-4">
          <button className="btn ov-btn-outline w-100" onClick={onCancel}>
            {cancelText}
          </button>

          <button className={`btn w-100 ${danger ? "ov-btn-danger" : "ov-btn-dark"}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const user = useMemo(() => {
    const fullName = localStorage.getItem("ov_fullName") || "Customer";
    const email = localStorage.getItem("ov_email") || "";
    const role = (localStorage.getItem("ov_role") || "CUSTOMER").toUpperCase();
    return { fullName, email, role };
  }, []);

  function logout() {
    localStorage.removeItem("ov_token");
    localStorage.removeItem("ov_role");
    localStorage.removeItem("ov_fullName");
    localStorage.removeItem("ov_email");

    localStorage.removeItem("ov_reset_email");
    localStorage.removeItem("ov_reset_otp");

    navigate("/login", { replace: true });
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg ov-navbar sticky-top ov-customer-navbar">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-3" to="/customer/reservations">
            <img src={logo} alt="Ocean View Resort" className="ov-logo" />
            <div className="d-flex flex-column lh-1">
              <span className="ov-brand">Ocean View Resort</span>
              <span className="ov-role-tag">
                <i className="bi bi-person-check me-1" />
                CUSTOMER PANEL
              </span>
            </div>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#custNav">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="custNav">
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item">
                <NavLink className="nav-link ov-link" to="/customer/reservations">
                  Reservations
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link ov-link" to="/customer/history">
                  History
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link ov-link" to="/customer/bills">
                  Bills
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link ov-link" to="/customer/additional-time">
                  Additionals
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link ov-link" to="/customer/profile">
                  Profile
                </NavLink>
              </li>

              <li className="nav-item ms-lg-2">
                <div className="ov-userchip">
                  <div className="ov-userchip-ic">
                    <i className="bi bi-person-circle" />
                  </div>
                  <div className="ov-userchip-meta">
                    <div className="ov-userchip-name">{user.fullName}</div>
                    <div className="ov-userchip-email">{user.email}</div>
                  </div>
                </div>
              </li>

              <li className="nav-item">
                <button className="btn ov-btn-dark" onClick={() => setShowLogoutConfirm(true)}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Logout"
          message="Are you sure you want to logout from the customer panel?"
          confirmText="Logout"
          cancelText="Cancel"
          danger
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
        />
      )}
    </>
  );
}