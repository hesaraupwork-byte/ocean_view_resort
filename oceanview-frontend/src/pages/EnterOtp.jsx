import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "";

export default function EnterOtp() {
  const navigate = useNavigate();

  const [email] = useState(localStorage.getItem("ov_reset_email") || "");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ type: "", msg: "" });

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  function validateOtp(value) {
    const v = value.trim();
    if (!v) return "OTP is required.";
    if (!/^[0-9]{6}$/.test(v)) return "OTP must be exactly 6 digits.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    const err = validateOtp(otp);
    setError(err);
    if (err) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data = null;
      let text = "";

      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          // ignore text  read errors
        }
      } else {
        try {
          text = await res.text();
        } catch {
          // ignore text  read errors
        }
      }

      const msg = data?.message || data?.error || text || "";

      if (!res.ok) {
        setAlert({
          type: "error",
          msg: msg || "Invalid OTP... Please try again",
        });
        return;
      }

      setAlert({ type: "success", msg: "OTP verified successfully. Continue..." });
      localStorage.setItem("ov_reset_otp", otp.trim());

      setTimeout(() => navigate("/reset-password", { replace: true }), 800);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again" });
    } finally {
      setLoading(false);
    }
  }
  async function resendOtp() {
    setAlert({ type: "", msg: "" });

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore text  read errors
      }

      if (!res.ok) {
        setAlert({
          type: "error",
          msg: data?.message || data?.error || "Failed to resend OTP",
        });
        return;
      }

      setAlert({ type: "success", msg: "OTP resent to your email" });
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
                <h3 className="ov-h4 mb-0">Enter OTP</h3>
                <Link to="/forgot-password" className="btn ov-btn-outline">
                  Back
                </Link>
              </div>

              <p className="ov-p mt-2 mb-3">
                Enter the 6-digit OTP sent to <b>{email}</b>
              </p>

              {/* ✅ page-level alert (auto hides in 5s) */}
              {alert.msg && (
                <div
                  className={`ov-alert ${
                    alert.type === "success" ? "ov-alert-success" : "ov-alert-error"
                  }`}
                >
                  {alert.msg}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                  <div className="ov-label">OTP Code</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`form-control ov-input ${error ? "is-invalid" : ""}`}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(v);
                      setError("");
                    }}
                    disabled={loading}
                  />
                  {error && <div className="invalid-feedback">{error}</div>}
                </div>

                <button className="btn ov-btn-dark w-100" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Continue"}
                </button>

                {/* Optional resend */}
                <button
                  type="button"
                  className="btn ov-btn w-100 mt-2"
                  onClick={resendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>

                <div className="ov-form-note text-center mt-2">
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}