import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  function validateEmail(value) {
    const e = value.trim();
    if (!e) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Enter a valid email";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    const err = validateEmail(email);
    setError(err);
    if (err) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data = null;
      try { data = await res.json(); } catch {
        // ignore text  read errors
      }

      if (!res.ok) {
        const msg =
          data?.message || data?.error || "Failed to send OTP. Please try again";
        setAlert({ type: "error", msg });
        return;
      }

      localStorage.setItem("ov_reset_email", email.trim());

      setAlert({ type: "success", msg: "OTP sent to your email. Continue..." });
      setTimeout(() => navigate("/enter-otp", { replace: true }), 800);
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
                <h3 className="ov-h4 mb-0">Forgot Password</h3>
                <Link to="/login" className="btn ov-btn-outline">Back</Link>
              </div>

              <p className="ov-p mt-2 mb-3">
                Enter your registered email. We will send a 6-digit OTP code
              </p>

              {alert.msg && (
                <div className={`ov-alert ${alert.type === "success" ? "ov-alert-success" : "ov-alert-error"}`}>
                  {alert.msg}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                  <div className="ov-label">Email</div>
                  <input
                    type="email"
                    className={`form-control ov-input ${error ? "is-invalid" : ""}`}
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    disabled={loading}
                    autoComplete="email"
                  />
                  {error && <div className="invalid-feedback">{error}</div>}
                </div>

                <button className="btn ov-btn-dark w-100" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                <div className="text-center mt-3">
                  <span className="ov-form-note">Remembered your password? </span>
                  <Link to="/login" className="ov-footer-link">Login</Link>
                </div>

                <div className="ov-form-note text-center mt-2">
                  Alerts will auto-hide after 5 seconds
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}