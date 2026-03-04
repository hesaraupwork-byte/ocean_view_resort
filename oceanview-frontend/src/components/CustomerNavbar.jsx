// src/components/CustomerNavbar.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ConfirmModal from "../components/common/ConfirmModal"; // ✅ shared modal

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const user = useMemo(() => {
    const fullName = localStorage.getItem("ov_fullName") || "Customer";
    const email = localStorage.getItem("ov_email") || "";
    const role = (localStorage.getItem("ov_role") || "CUSTOMER").toUpperCase();
    return { fullName, email, role };
  }, []);

  // ✅ lock scroll like admin
  useEffect(() => {
    if (showLogoutConfirm) document.body.classList.add("ov-no-scroll");
    else document.body.classList.remove("ov-no-scroll");
    return () => document.body.classList.remove("ov-no-scroll");
  }, [showLogoutConfirm]);

  function logout() {
    localStorage.removeItem("ov_token");
    localStorage.removeItem("ov_role");
    localStorage.removeItem("ov_fullName");
    localStorage.removeItem("ov_email");
    localStorage.removeItem("ov_reset_email");
    localStorage.removeItem("ov_reset_otp");

    navigate("/login", { replace: true });
  }

  // ✅ active link style like admin
  const navClass = ({ isActive }) =>
    `nav-link ov-admin-link ${isActive ? "active" : ""}`;

  return (
    <>
      <nav className="navbar navbar-expand-lg ov-admin-navbar sticky-top">
        <div className="container">
          <Link
            className="navbar-brand d-flex align-items-center gap-3"
            to="/customer/reservations"
          >
            <img src={logo} alt="Ocean View Resort" className="ov-admin-logo" />
            <div className="d-flex flex-column lh-1">
              <span className="ov-admin-brand">Ocean View Resort</span>
              <span className="ov-admin-sub">Customer Panel</span>
            </div>
          </Link>

          <button
            className="navbar-toggler ov-admin-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#customerNavbarNav"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="customerNavbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2 mt-3 mt-lg-0">
              <li className="nav-item">
                <NavLink className={navClass} to="/customer/reservations">
                  <i className="bi bi-calendar-check me-2" />
                  Reservations
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/customer/history">
                  <i className="bi bi-clock-history me-2" />
                  History
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/customer/bills">
                  <i className="bi bi-receipt me-2" />
                  Bills
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/customer/additional-time">
                  <i className="bi bi-hourglass-split me-2" />
                  Additionals
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className={navClass} to="/customer/profile">
                  <i className="bi bi-person-circle me-2" />
                  Profile
                </NavLink>
              </li>

              {/* ✅ logout (same as admin) */}
              <li className="nav-item">
                <button
                  className="btn ov-admin-logout"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <i className="bi bi-box-arrow-right me-2" />
                  Logout
                </button>
              </li>

              {/* ✅ user chip (same as admin) */}
              <li className="nav-item ms-lg-2">
                <div className="ov-admin-chip">
                  <div className="ov-admin-chip-ic">
                    <i className="bi bi-person-fill" />
                  </div>
                  <div className="d-flex flex-column lh-1">
                    <div className="ov-admin-chip-name">{user.fullName}</div>
                    <div className="ov-admin-chip-email">{user.email}</div>
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
          message="Are you sure you want to logout from the customer panel?"
          cancelText="Cancel"
          confirmText="Logout"
          danger={false}
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