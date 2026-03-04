// src/pages/customer/CustomerProfile.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const API_BASE = ""; // keep "" if using proxy

function authHeader() {
  const token = localStorage.getItem("ov_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* =========================
   Confirm Modal (blur)
========================= */
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

/* =========================
   Password Modal
========================= */
function ChangePasswordModal({ onClose, onSaved, onError }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.body.classList.add("ov-no-scroll");
    return () => document.body.classList.remove("ov-no-scroll");
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const next = { currentPassword: "", newPassword: "", confirmPassword: "" };

    if (!form.currentPassword) next.currentPassword = "Current password is required.";
    if (!form.newPassword) next.newPassword = "New password is required.";
    else if (form.newPassword.length < 6) next.newPassword = "New password must be at least 6 characters.";

    if (!form.confirmPassword) next.confirmPassword = "Confirm password is required.";
    else if (form.confirmPassword !== form.newPassword) next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return !next.currentPassword && !next.newPassword && !next.confirmPassword;
  }

  async function submit() {
    if (!validate()) return;

    try {
      setLoading(true);

      // ✅ PATCH /api/profile/password
      const res = await fetch(`${API_BASE}/api/profile/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        onError(data?.message || data?.error || "Failed to change password.");
        return;
      }

      onSaved();
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onBackdropClick(e) {
    if (e.target.classList.contains("ov-modal-backdrop")) onClose();
  }

  return createPortal(
    <>
      <div className="ov-modal-backdrop" onMouseDown={onBackdropClick}>
        <div className="ov-modal" onMouseDown={(e) => e.stopPropagation()}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="ov-h4 mb-0">Change Password</h4>
            <button className="btn ov-btn-outline" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>

          <div className="ov-divider" />

          <div className="mb-3">
            <div className="ov-label">Current Password</div>
            <div className="input-group">
              <input
                type={showPw.current ? "text" : "password"}
                className={`form-control ov-input ${errors.currentPassword ? "is-invalid" : ""}`}
                value={form.currentPassword}
                onChange={(e) => setField("currentPassword", e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="btn ov-btn-outline"
                onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                disabled={loading}
              >
                <i className={`bi ${showPw.current ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
            {errors.currentPassword && <div className="invalid-feedback d-block">{errors.currentPassword}</div>}
          </div>

          <div className="mb-3">
            <div className="ov-label">New Password</div>
            <div className="input-group">
              <input
                type={showPw.next ? "text" : "password"}
                className={`form-control ov-input ${errors.newPassword ? "is-invalid" : ""}`}
                value={form.newPassword}
                onChange={(e) => setField("newPassword", e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="btn ov-btn-outline"
                onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                disabled={loading}
              >
                <i className={`bi ${showPw.next ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
            {errors.newPassword && <div className="invalid-feedback d-block">{errors.newPassword}</div>}
          </div>

          <div className="mb-3">
            <div className="ov-label">Confirm Password</div>
            <div className="input-group">
              <input
                type={showPw.confirm ? "text" : "password"}
                className={`form-control ov-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="btn ov-btn-outline"
                onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                disabled={loading}
              >
                <i className={`bi ${showPw.confirm ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
            {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
          </div>

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn ov-btn-dark w-100"
              type="button"
              disabled={loading}
              onClick={() =>
                setConfirm({
                  title: "Change Password",
                  message: "Are you sure you want to update your password?",
                  confirmText: "Update",
                  onConfirm: async () => {
                    setConfirm(null);
                    await submit();
                  },
                })
              }
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button className="btn ov-btn-outline w-100" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmText={confirm.confirmText}
          cancelText="Back"
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}
    </>
  );
}

/* =========================
   Customer Profile Page
========================= */
export default function CustomerProfile() {
  const navigate = useNavigate();

  // ✅ customer guard
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = (localStorage.getItem("ov_role") || "").toUpperCase();
    if (!token) navigate("/login", { replace: true });
    else if (role !== "CUSTOMER") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [alert, setAlert] = useState({ type: "", msg: "" });
  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [errors, setErrors] = useState({ fullName: "", phone: "" });

  const [showPwModal, setShowPwModal] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        setAlert({
          type: "error",
          msg: data?.message || data?.error || "Failed to load profile.",
        });
        return;
      }

      setProfile(data);
      setForm({ fullName: data.fullName || "", phone: data.phone || "" });

      if (data.fullName) localStorage.setItem("ov_fullName", data.fullName);
      if (data.email) localStorage.setItem("ov_email", data.email);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const next = { fullName: "", phone: "" };
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (form.phone && form.phone.trim().length < 7) next.phone = "Enter a valid phone number.";
    setErrors(next);
    return !next.fullName && !next.phone;
  }

  async function saveProfile() {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        setAlert({
          type: "error",
          msg: data?.message || data?.error || "Failed to update profile.",
        });
        return;
      }

      setProfile(data);
      setAlert({ type: "success", msg: "Profile updated successfully." });

      if (data.fullName) localStorage.setItem("ov_fullName", data.fullName);
      if (data.email) localStorage.setItem("ov_email", data.email);

      // ✅ AUTO REFRESH PAGE AFTER SAVE
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="ov-h2 mb-1">Edit Profile</h2>
        </div>

        <button className="btn ov-btn-dark" onClick={loadProfile} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {alert.msg && (
        <div className={`ov-alert mt-3 ${alert.type === "success" ? "ov-alert-success" : "ov-alert-error"}`}>
          {alert.msg}
        </div>
      )}

      <div className="row g-3 mt-2">
        <div className="col-12 col-lg-7">
          <div className="ov-card-soft">
            <h4 className="ov-h4 mb-1">My Details</h4>
            <div className="text-muted small">Email and role cannot be changed here</div>

            <div className="ov-divider" />

            <div className="row g-3">
              <div className="col-12">
                <div className="ov-label">Email</div>
                <input className="form-control ov-input" value={profile?.email || ""} disabled />
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Role</div>
                <input className="form-control ov-input" value={profile?.role || ""} disabled />
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Status</div>
                <input className="form-control ov-input" value={profile?.active ? "Active" : "Disabled"} disabled />
              </div>

              <div className="col-12">
                <div className="ov-label">Full Name</div>
                <input
                  className={`form-control ov-input ${errors.fullName ? "is-invalid" : ""}`}
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  disabled={loading}
                />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>

              <div className="col-12">
                <div className="ov-label">Phone (optional)</div>
                <input
                  className={`form-control ov-input ${errors.phone ? "is-invalid" : ""}`}
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  disabled={loading}
                  placeholder="07xxxxxxxx"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn ov-btn-dark w-100" type="button" disabled={loading} onClick={() => setConfirmSave(true)}>
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                className="btn ov-btn-outline w-100"
                type="button"
                disabled={loading}
                onClick={() => {
                  if (!profile) return;
                  setForm({ fullName: profile.fullName || "", phone: profile.phone || "" });
                  setErrors({ fullName: "", phone: "" });
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="ov-card-soft">
            <h4 className="ov-h4 mb-1">Security</h4>
            <div className="text-muted small">Change your password securely</div>

            <div className="ov-divider" />

            <div className="ov-info">
              <div className="ov-info-ic">
                <i className="bi bi-shield-lock-fill" />
              </div>
              <div>
                <div className="ov-info-title">Password</div>
                <div className="ov-info-value">Update your password using your current password</div>
              </div>
            </div>

            <button className="btn ov-btn-dark w-100 mt-3" onClick={() => setShowPwModal(true)}>
              <i className="bi bi-key me-2" />
              Change Password
            </button>
          </div>

          <div className="ov-card-soft mt-3">
            <h4 className="ov-h4 mb-1">Account</h4>
            <div className="text-muted small">Account summary</div>

            <div className="ov-divider" />

            <div className="ov-about-stats">
              <div className="ov-stat">
                <div className="ov-stat-label">User ID</div>
                <div className="ov-stat-value">{profile?.id || "-"}</div>
              </div>
              <div className="ov-stat">
                <div className="ov-stat-label">Email</div>
                <div className="ov-stat-value">{profile?.email || "-"}</div>
              </div>
              <div className="ov-stat">
                <div className="ov-stat-label">Role</div>
                <div className="ov-stat-value">{profile?.role || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmSave && (
        <ConfirmModal
          title="Save Profile"
          message="Are you sure you want to update your profile details?"
          confirmText="Save"
          cancelText="Back"
          onCancel={() => setConfirmSave(false)}
          onConfirm={async () => {
            setConfirmSave(false);
            await saveProfile();
          }}
        />
      )}

      {showPwModal && (
        <ChangePasswordModal
          onClose={() => setShowPwModal(false)}
          onSaved={() => {
            setShowPwModal(false);
            setAlert({ type: "success", msg: "Password updated successfully." });
          }}
          onError={(msg) => setAlert({ type: "error", msg })}
        />
      )}
    </div>
  );
}