import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email] = useState(localStorage.getItem("ov_reset_email") || "");
  const [otp] = useState(localStorage.getItem("ov_reset_otp") || "");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
    else if (!otp) navigate("/enter-otp", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  function onChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  }

  function validate() {
    const next = { newPassword: "", confirmPassword: "" };

    const pw = form.newPassword;

    if (!pw) next.newPassword = "New password is required.";
    else if (pw.length < 6) next.newPassword = "Password must be at least 6 characters";
    else if (!/[A-Z]/.test(pw)) next.newPassword = "Add at least one uppercase letter";
    else if (!/[0-9]/.test(pw)) next.newPassword = "Add at least one number";

    if (!form.confirmPassword) next.confirmPassword = "Confirm password is required";
    else if (form.confirmPassword !== form.newPassword)
      next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return !next.newPassword && !next.confirmPassword;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    if (!validate()) return;

    try {
      setLoading(true);

      // ResetPasswordRequest { email, otp, newPassword }
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: form.newPassword,
        }),
      });

      let data = null;
      try { data = await res.json(); } catch {
        // ignore text  read errors
      }

      if (!res.ok) {
        const msg =
          data?.message || data?.error || "Reset password failed. Please try again";
        setAlert({ type: "error", msg });
        return;
      }

      setAlert({ type: "success", msg: "Password reset successful. Redirecting to login..." });

      localStorage.removeItem("ov_reset_email");
      localStorage.removeItem("ov_reset_otp");

      setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ov-about-section ov-about-bg">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="ov-form-card">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="ov-h4 mb-0">Reset Password</h3>
                <Link to="/enter-otp" className="btn ov-btn-outline">Back</Link>
              </div>

              <p className="ov-p mt-2 mb-3">
                Create a new password for <b>{email}</b>
              </p>

              {alert.msg && (
                <div className={`ov-alert ${alert.type === "success" ? "ov-alert-success" : "ov-alert-error"}`}>
                  {alert.msg}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                  <div className="ov-label">New Password</div>
                  <div className="input-group">
                    <input
                      name="newPassword"
                      type={showPw ? "text" : "password"}
                      className={`form-control ov-input ${errors.newPassword ? "is-invalid" : ""}`}
                      placeholder="Enter new password"
                      value={form.newPassword}
                      onChange={onChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn ov-btn-outline"
                      onClick={() => setShowPw((p) => !p)}
                      disabled={loading}
                    >
                      <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                  {errors.newPassword && (
                    <div className="text-danger small mt-1">{errors.newPassword}</div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="ov-label">Confirm Password</div>
                  <div className="input-group">
                    <input
                      name="confirmPassword"
                      type={showCpw ? "text" : "password"}
                      className={`form-control ov-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                      placeholder="Confirm new password"
                      value={form.confirmPassword}
                      onChange={onChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn ov-btn-outline"
                      onClick={() => setShowCpw((p) => !p)}
                      disabled={loading}
                    >
                      <i className={`bi ${showCpw ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                  )}
                </div>

                <button className="btn ov-btn-dark w-100" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="ov-form-note text-center mt-2">
                  Alerts will auto-hide after 5 seconds.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}