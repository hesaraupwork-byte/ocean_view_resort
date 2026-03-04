import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = ""; // keep "" if proxy is configured

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

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
    const next = {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!fullName) next.fullName = "Full name is required.";
    else if (fullName.length < 3) next.fullName = "Full name is too short.";

    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address.";

    // Phone is optional. If filled, validate basic format.
    if (phone) {
      if (!/^[0-9+\s-]{7,15}$/.test(phone))
        next.phone = "Enter a valid phone number.";
    }

    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    else if (!/[A-Z]/.test(form.password))
      next.password = "Add at least one uppercase letter.";
    else if (!/[0-9]/.test(form.password))
      next.password = "Add at least one number.";

    if (!form.confirmPassword)
      next.confirmPassword = "Confirm password is required.";
    else if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return (
      !next.fullName &&
      !next.email &&
      !next.phone &&
      !next.password &&
      !next.confirmPassword
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    if (!validate()) return;

    try {
      setLoading(true);

      // send only fields your backend surely supports
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // backend may return empty json
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Registration failed. Please try again.";
        setAlert({ type: "error", msg });
        return;
      }

      setAlert({
        type: "success",
        msg: "Account created successfully. Redirecting to login...",
      });

      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ov-about-section ov-about-bg">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6">
            <div className="ov-form-card">
              <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <h3 className="ov-h4 mb-0">Create Account</h3>
                <Link to="/" className="btn ov-btn-outline">
                  Back Home
                </Link>
              </div>

              <p className="ov-p mt-2 mb-3">
                Register to book rooms and manage your reservations.
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
                {/* Full Name */}
                <div className="mb-3">
                  <div className="ov-label">Full Name</div>
                  <input
                    name="fullName"
                    type="text"
                    className={`form-control ov-input ${
                      errors.fullName ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="name"
                  />
                  {errors.fullName && (
                    <div className="invalid-feedback">{errors.fullName}</div>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <div className="ov-label">Email</div>
                  <input
                    name="email"
                    type="email"
                    className={`form-control ov-input ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your Email"
                    value={form.email}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div className="mb-3">
                  <div className="ov-label">Phone (Optional)</div>
                  <input
                    name="phone"
                    type="text"
                    className={`form-control ov-input ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={onChange}
                    disabled={loading}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div className="ov-label">Password</div>
                  <div className="input-group">
                    <input
                      name="password"
                      type={showPw ? "text" : "password"}
                      className={`form-control ov-input ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={onChange}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn ov-btn-outline"
                      onClick={() => setShowPw((p) => !p)}
                      disabled={loading}
                      title={showPw ? "Hide password" : "Show password"}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>

                  {errors.password ? (
                    <div className="text-danger small mt-1">
                      {errors.password}
                    </div>
                  ) : (
                    <div className="ov-form-note">
                      Use 6+ characters with at least 1 uppercase letter and 1 number.
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <div className="ov-label">Confirm Password</div>
                  <div className="input-group">
                    <input
                      name="confirmPassword"
                      type={showCpw ? "text" : "password"}
                      className={`form-control ov-input ${
                        errors.confirmPassword ? "is-invalid" : ""
                      }`}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={onChange}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn ov-btn-outline"
                      onClick={() => setShowCpw((p) => !p)}
                      disabled={loading}
                      title={showCpw ? "Hide password" : "Show password"}
                      aria-label={showCpw ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showCpw ? "bi-eye-slash" : "bi-eye"}`} />
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <div className="text-danger small mt-1">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  className="btn ov-btn-dark w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Register"}
                </button>

                <div className="text-center mt-3">
                  <span className="ov-form-note">Already have an account? </span>
                  <Link to="/login" className="ov-footer-link">
                    Login
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