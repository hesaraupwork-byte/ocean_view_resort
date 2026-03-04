import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function safeDecodeJwt(token) {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onCancel,
  onConfirm,
}) {
  // ESC to cancel
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

          <button
            className={`btn w-100 ${danger ? "ov-btn-danger" : "ov-btn-dark"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AdminNavbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("ov_token") || "";
  const storedName = localStorage.getItem("ov_fullName") || "";
  const storedEmail = localStorage.getItem("ov_email") || "";

  const payload = token ? safeDecodeJwt(token) : null;
  const fullName = storedName || payload?.fullName || payload?.name || "Admin";
  const email = storedEmail || payload?.sub || payload?.email || "admin@oceanview.lk";

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // optional: lock scroll like other modals
  useEffect(() => {
    if (showLogoutConfirm) document.body.classList.add("ov-no-scroll");
    else document.body.classList.remove("ov-no-scroll");
    return () => document.body.classList.remove("ov-no-scroll");
  }, [showLogoutConfirm]);

  function doLogout() {
    localStorage.removeItem("ov_token");
    localStorage.removeItem("ov_role");
    localStorage.removeItem("ov_email");
    localStorage.removeItem("ov_fullName");

    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  }

  const navClass = ({ isActive }) =>
    `nav-link ov-admin-link ${isActive ? "active" : ""}`;

  return (
    <>
      <nav className="navbar navbar-expand-lg ov-admin-navbar sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-3" to="/admin/users">
            <img src={logo} alt="Ocean View Resort" className="ov-admin-logo" />
            <div className="d-flex flex-column lh-1">
              <span className="ov-admin-brand">Ocean View Resort</span>
              <span className="ov-admin-sub">Admin Panel</span>
            </div>
          </Link>

          <button
            className="navbar-toggler ov-admin-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminNavbarNav"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="adminNavbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2 mt-3 mt-lg-0">
              <li className="nav-item">
                <NavLink className={navClass} to="/admin/users">
                  <i className="bi bi-people me-2" />
                  Users
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/admin/reservations">
                  <i className="bi bi-check2-square me-2" />
                  Reservations
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/admin/questions">
                  <i className="bi bi-chat-left-text me-2" />
                  Questions
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/admin/bills">
                  <i className="bi bi-receipt me-2" />
                  Bills
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/admin/profile">
                  <i className="bi bi-person-circle me-2" />
                  Profile
                </NavLink>
              </li>

              {/* ✅ Logout opens confirm modal */}
              <li className="nav-item">
                <button
                  className="btn ov-admin-logout"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <i className="bi bi-box-arrow-right me-2" />
                  Logout
                </button>
              </li>

              <li className="nav-item ms-lg-2">
                <div className="ov-admin-chip">
                  <div className="ov-admin-chip-ic">
                    <i className="bi bi-person-fill" />
                  </div>
                  <div className="d-flex flex-column lh-1">
                    <div className="ov-admin-chip-name">{fullName}</div>
                    <div className="ov-admin-chip-email">{email}</div>
                  </div>
                </div>
              </li>

              
            </ul>
          </div>
        </div>
      </nav>

      {/* ✅ Logout confirmation popup */}
      {showLogoutConfirm && (
        <ConfirmModal
          title="Logout"
          message="Are you sure you want to logout from the admin panel?"
          cancelText="Cancel"
          confirmText="Logout"
          danger={false}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={doLogout}
        />
      )}
    </>
  );
}