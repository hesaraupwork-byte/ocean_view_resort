import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = ""; // keep "" if you use proxy (vite) to /api

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" }); // type: success | error
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Auto hide alert after 5 seconds
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
    const next = { email: "", password: "" };
    const email = form.email.trim();

    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address.";

    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";

    setErrors(next);
    return !next.email && !next.password;
  }

  function goDashboardByRole(role) {
    const r = String(role || "").toUpperCase();

    if (r === "ADMIN") return navigate("/admin/users", { replace: true });
    if (r === "STAFF") return navigate("/staff/reservations", { replace: true });

    // default CUSTOMER
    return navigate("/customer/dashboard", { replace: true });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // backend may return empty body on error
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Login failed. Please check your credentials.";
        setAlert({ type: "error", msg });
        return;
      }

      // Expected response from your backend:
      // { token, email, fullName, role }
      localStorage.setItem("ov_token", data?.token || "");
      localStorage.setItem("ov_email", data?.email || "");
      localStorage.setItem("ov_fullName", data?.fullName || "");
      localStorage.setItem("ov_role", data?.role || "CUSTOMER");

      setAlert({ type: "success", msg: "Login successful. Redirecting..." });

      setTimeout(() => goDashboardByRole(data?.role), 700);
    } catch (err) {
      setAlert({
        type: "error",
        msg: "Network error. Please try again.",
      });
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
                <h3 className="ov-h4 mb-0">Login</h3>
                <Link to="/" className="btn ov-btn-outline">
                  Back Home
                </Link>
              </div>

              <p className="ov-p mt-2 mb-3">
                Sign in to manage your reservations and account.
              </p>

              {/* ALERT */}
              {alert.msg && (
                <div
                  className={`ov-alert ${
                    alert.type === "success"
                      ? "ov-alert-success"
                      : "ov-alert-error"
                  }`}
                >
                  {alert.msg}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate>
                {/* EMAIL */}
                <div className="mb-3">
                  <div className="ov-label">Email</div>
                  <input
                    name="email"
                    type="email"
                    className={`form-control ov-input ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="mb-2">
                  <div className="ov-label">Password</div>

                  <div className="input-group">
                    <input
                      name="password"
                      type={showPw ? "text" : "password"}
                      className={`form-control ov-input ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={onChange}
                      disabled={loading}
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="btn ov-btn-outline"
                      onClick={() => setShowPw((p) => !p)}
                      disabled={loading}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      title={showPw ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>

                  {errors.password && (
                    <div className="text-danger small mt-1">
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* FORGOT PASSWORD */}
                <div className="d-flex justify-content-end mb-3">
                  <Link
                    to="/forgot-password"
  className="ov-footer-link"
  onClick={() => sessionStorage.removeItem("ov_reset_flow")}
>
  Forgot password?
</Link>
                </div>

                {/* SUBMIT */}
                <button
                  className="btn ov-btn-dark w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>

                {/* SIGN UP */}
                <div className="text-center mt-3">
                  <span className="ov-form-note">Don’t have an account? </span>
                  <Link to="/register" className="ov-footer-link">
                    Sign up
                  </Link>
                </div>

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