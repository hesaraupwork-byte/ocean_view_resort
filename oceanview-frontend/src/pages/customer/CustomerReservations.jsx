// src/pages/customer/CustomerReservations.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = ""; // keep "" if using proxy (Vite) to /api

function authHeader() {
  const token = localStorage.getItem("ov_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeRole(role) {
  const r = String(role || "").toUpperCase();
  return r.startsWith("ROLE_") ? r.replace("ROLE_", "") : r;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(iso, days) {
  try {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return iso;
  }
}

function calcNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 0;
  try {
    const inD = new Date(checkInDate + "T00:00:00").getTime();
    const outD = new Date(checkOutDate + "T00:00:00").getTime();
    const diff = outD - inD;
    if (!Number.isFinite(diff) || diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export default function CustomerReservations() {
  const navigate = useNavigate();

  // guard (extra safety even if you already use RequireCustomer)
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = normalizeRole(localStorage.getItem("ov_role"));
    if (!token) navigate("/login", { replace: true });
    else if (role !== "CUSTOMER") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultCheckIn = addDaysISO(todayISO(), 1);
  const defaultCheckOut = addDaysISO(todayISO(), 2);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });

  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 6500);
    return () => clearTimeout(t);
  }, [alert]);

  const [form, setForm] = useState({
    customerName: localStorage.getItem("ov_fullName") || "",
    customerEmail: localStorage.getItem("ov_email") || "",
    customerPhone: "",
    roomType: "Standard",
    checkInDate: defaultCheckIn,
    checkOutDate: defaultCheckOut,
    adults: 1,
    children: 0,
    specialRequests: "",
  });

  const [errors, setErrors] = useState({});

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const next = {};

    if (!form.customerName.trim()) next.customerName = "Full name is required.";

    const email = form.customerEmail.trim();
    if (!email) next.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.customerEmail = "Enter a valid email.";

    if (form.customerPhone && form.customerPhone.trim().length < 7)
      next.customerPhone = "Enter a valid phone number.";

    if (!form.roomType) next.roomType = "Room type is required.";

    if (!form.checkInDate) next.checkInDate = "Check-in date is required.";
    if (!form.checkOutDate) next.checkOutDate = "Check-out date is required.";

    if (form.checkInDate && form.checkOutDate) {
      const inD = new Date(form.checkInDate);
      const outD = new Date(form.checkOutDate);
      if (!(outD > inD)) next.checkOutDate = "Check-out date must be after check-in date.";
    }

    const a = Number(form.adults);
    const c = Number(form.children);
    if (!Number.isFinite(a) || a < 1) next.adults = "Adults must be at least 1.";
    if (!Number.isFinite(c) || c < 0) next.children = "Children cannot be negative.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitReservation(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          roomType: form.roomType,
          checkInDate: form.checkInDate,
          checkOutDate: form.checkOutDate,
          adults: Number(form.adults),
          children: Number(form.children),
          specialRequests: form.specialRequests || "",
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        setAlert({
          type: "error",
          msg: data?.message || data?.error || "Failed to create reservation.",
        });
        return;
      }

      setAlert({
        type: "success",
        msg: `Reservation submitted successfully. Reservation No: ${data?.reservationNo || "OVR-..."} (PENDING)`,
      });

      // reset only booking fields (keep user info)
      setForm((p) => ({
        ...p,
        roomType: "Standard",
        checkInDate: addDaysISO(todayISO(), 1),
        checkOutDate: addDaysISO(todayISO(), 2),
        adults: 1,
        children: 0,
        specialRequests: "",
      }));
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const nights = useMemo(
    () => calcNights(form.checkInDate, form.checkOutDate),
    [form.checkInDate, form.checkOutDate]
  );

  const hasEmail = useMemo(() => !!String(form.customerEmail || "").trim(), [form.customerEmail]);

  // Theme-friendly inline styles (uses OceanView vibe: sea/sky)
  const heroStyle = {
    borderRadius: 18,
    padding: "18px 18px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,0.14) 0%, rgba(16,185,129,0.12) 45%, rgba(99,102,241,0.10) 100%)",
    border: "1px solid rgba(148,163,184,0.35)",
  };

  const pill = {
    borderRadius: 999,
    padding: "8px 12px",
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(8px)",
  };

  const sideCardStyle = {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      {/* HERO HEADER */}
      <div style={heroStyle}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="d-inline-flex align-items-center justify-content-center"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "rgba(14,165,233,0.18)",
                  border: "1px solid rgba(14,165,233,0.25)",
                }}
              >
                <i className="bi bi-calendar2-check" style={{ fontSize: 18, color: "#0ea5e9" }} />
              </span>

              <h2 className="ov-h2 mb-0">Make a Reservation</h2>
            </div>

            
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div style={pill} className="d-flex align-items-center gap-2">
              <i className="bi bi-moon-stars" style={{ color: "#0284c7" }} />
              <span className="small text-muted">Nights</span>
              <span className="fw-semibold">{nights || 0}</span>
            </div>

            <div style={pill} className="d-flex align-items-center gap-2">
              <i className="bi bi-hourglass-split" style={{ color: "#f59e0b" }} />
              <span className="small text-muted">Status</span>
              <span className="fw-semibold" style={{ color: "#b45309" }}>
                PENDING
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT */}
      {alert.msg && (
        <div
          className={`ov-alert mt-3 ${alert.type === "success" ? "ov-alert-success" : "ov-alert-error"}`}
          style={{ borderRadius: 14 }}
        >
          {alert.msg}
        </div>
      )}

      {!hasEmail && (
        <div className="ov-alert mt-3 ov-alert-error" style={{ borderRadius: 14 }}>
          Your email is missing. Please login again (or open Profile and refresh local storage).
        </div>
      )}

      {/* CONTENT */}
      <div className="row g-3 mt-1">
        {/* FORM */}
        <div className="col-12 col-lg-8">
          <div
            className="ov-card-soft"
            style={{
              borderRadius: 18,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h4 className="ov-h4 mb-1">Reservation Details</h4>
                <div className="text-muted small">
                  Provide your information and preferred dates. We’ll notify you by email after submission.
                </div>
              </div>

              {/* quick summary chip */}
              <div
                style={{
                  borderRadius: 16,
                  padding: "10px 12px",
                  background:
                    "linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(16,185,129,0.08) 100%)",
                  border: "1px solid rgba(14,165,233,0.16)",
                  minWidth: 240,
                }}
              >
                <div className="small text-muted">Quick Summary</div>
                <div className="fw-semibold" style={{ color: "#0f172a" }}>
                  {form.roomType} • {nights || 0} night(s)
                </div>
                <div className="small text-muted">
                  {Number(form.adults) || 0} adult(s), {Number(form.children) || 0} child(ren)
                </div>
              </div>
            </div>

            <div className="ov-divider" />

            <form onSubmit={submitReservation} noValidate>
              <div className="row g-3">
                {/* SECTION: Customer */}
                <div className="col-12">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        background: "rgba(99,102,241,0.14)",
                        border: "1px solid rgba(99,102,241,0.22)",
                      }}
                    >
                      <i className="bi bi-person-badge" style={{ color: "#4f46e5" }} />
                    </span>
                    <div>
                      <div className="ov-label mb-0">Customer Information</div>
                      <div className="text-muted small">Used for confirmation emails and contact.</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="ov-label">Full Name</div>
                  <input
                    className={`form-control ov-input ${errors.customerName ? "is-invalid" : ""}`}
                    value={form.customerName}
                    onChange={(e) => setField("customerName", e.target.value)}
                    disabled={loading}
                    placeholder="Your full name"
                  />
                  {errors.customerName && <div className="invalid-feedback">{errors.customerName}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <div className="ov-label">Email</div>
                  <input
                    type="email"
                    className={`form-control ov-input ${errors.customerEmail ? "is-invalid" : ""}`}
                    value={form.customerEmail}
                    onChange={(e) => setField("customerEmail", e.target.value)}
                    disabled={loading}
                    placeholder="you@example.com"
                  />
                  {errors.customerEmail && <div className="invalid-feedback">{errors.customerEmail}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <div className="ov-label">Phone (optional)</div>
                  <input
                    className={`form-control ov-input ${errors.customerPhone ? "is-invalid" : ""}`}
                    value={form.customerPhone}
                    onChange={(e) => setField("customerPhone", e.target.value)}
                    disabled={loading}
                    placeholder="07xxxxxxxx"
                  />
                  {errors.customerPhone && <div className="invalid-feedback">{errors.customerPhone}</div>}
                </div>

                {/* SECTION: Booking */}
                <div className="col-12">
                  <div className="ov-divider" />
                </div>

                <div className="col-12">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        background: "rgba(14,165,233,0.14)",
                        border: "1px solid rgba(14,165,233,0.22)",
                      }}
                    >
                      <i className="bi bi-door-open" style={{ color: "#0284c7" }} />
                    </span>
                    <div>
                      <div className="ov-label mb-0">Booking Information</div>
                      <div className="text-muted small">Choose room, guests, and dates.</div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="ov-label">Room Type</div>
                  <select
                    className={`form-select ov-input ${errors.roomType ? "is-invalid" : ""}`}
                    value={form.roomType}
                    onChange={(e) => setField("roomType", e.target.value)}
                    disabled={loading}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                  {errors.roomType && <div className="invalid-feedback">{errors.roomType}</div>}
                  <div className="ov-form-note">Tip: Deluxe & Suite have a better ocean view.</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="ov-label">Guests</div>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        min="1"
                        className={`form-control ov-input ${errors.adults ? "is-invalid" : ""}`}
                        value={form.adults}
                        onChange={(e) => setField("adults", e.target.value)}
                        disabled={loading}
                        placeholder="Adults"
                      />
                      {errors.adults && <div className="invalid-feedback">{errors.adults}</div>}
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        min="0"
                        className={`form-control ov-input ${errors.children ? "is-invalid" : ""}`}
                        value={form.children}
                        onChange={(e) => setField("children", e.target.value)}
                        disabled={loading}
                        placeholder="Children"
                      />
                      {errors.children && <div className="invalid-feedback">{errors.children}</div>}
                    </div>
                  </div>
                  <div className="ov-form-note">Adults must be at least 1.</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="ov-label">Check-in Date</div>
                  <input
                    type="date"
                    className={`form-control ov-input ${errors.checkInDate ? "is-invalid" : ""}`}
                    value={form.checkInDate}
                    onChange={(e) => setField("checkInDate", e.target.value)}
                    disabled={loading}
                    min={todayISO()}
                  />
                  {errors.checkInDate && <div className="invalid-feedback">{errors.checkInDate}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <div className="ov-label">Check-out Date</div>
                  <input
                    type="date"
                    className={`form-control ov-input ${errors.checkOutDate ? "is-invalid" : ""}`}
                    value={form.checkOutDate}
                    onChange={(e) => setField("checkOutDate", e.target.value)}
                    disabled={loading}
                    min={form.checkInDate || todayISO()}
                  />
                  {errors.checkOutDate && <div className="invalid-feedback">{errors.checkOutDate}</div>}
                  <div className="ov-form-note">Check-out must be after check-in.</div>
                </div>

                <div className="col-12">
                  <div className="ov-label">Special Requests (optional)</div>
                  <textarea
                    className="form-control ov-input"
                    rows="4"
                    value={form.specialRequests}
                    onChange={(e) => setField("specialRequests", e.target.value)}
                    disabled={loading}
                    placeholder="Arrival time, accessibility needs, baby cot, food allergies, etc."
                  />
                </div>
              </div>

              <div className="ov-divider" />

              {/* actions */}
              <div className="d-flex flex-column flex-md-row gap-2">
                <button
                  className="btn ov-btn-dark w-100"
                  type="submit"
                  disabled={loading || !hasEmail}
                  style={{ borderRadius: 14 }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-check me-2" />
                      Submit Reservation
                    </>
                  )}
                </button>

                <button
                  className="btn ov-btn-outline w-100"
                  type="button"
                  disabled={loading}
                  style={{ borderRadius: 14 }}
                  onClick={() => {
                    setForm((p) => ({
                      ...p,
                      roomType: "Standard",
                      checkInDate: addDaysISO(todayISO(), 1),
                      checkOutDate: addDaysISO(todayISO(), 2),
                      adults: 1,
                      children: 0,
                      specialRequests: "",
                    }));
                    setErrors({});
                    setAlert({ type: "", msg: "" });
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-2" />
                  Reset Form
                </button>
              </div>

              <div className="ov-form-note mt-2" style={{ color: "#334155" }}>
                After submitting, track your request in <b>Reservation History</b>. Your request stays <b>PENDING</b>{" "}
                until confirmation.
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="col-12 col-lg-4">
          <div className="ov-card-soft p-0" style={sideCardStyle}>
            <div
              style={{
                padding: 16,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                background:
                  "linear-gradient(135deg, rgba(14,165,233,0.16) 0%, rgba(16,185,129,0.12) 100%)",
                borderBottom: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <h4 className="ov-h4 mb-1">What happens next?</h4>
              <div className="text-muted small">Simple reservation flow</div>
            </div>

            <div style={{ padding: 16 }}>
              <div className="ov-info mb-3">
                <div className="ov-info-ic">
                  <i className="bi bi-envelope-check-fill" style={{ color: "#0284c7" }} />
                </div>
                <div>
                  <div className="ov-info-title">Instant email</div>
                  <div className="ov-info-value">You’ll get a PENDING email after submission.</div>
                </div>
              </div>

              <div className="ov-info mb-3">
                <div className="ov-info-ic">
                  <i className="bi bi-person-check-fill" style={{ color: "#059669" }} />
                </div>
                <div>
                  <div className="ov-info-title">Staff review</div>
                  <div className="ov-info-value">Staff/admin reviews and confirms your booking.</div>
                </div>
              </div>

              <div className="ov-info">
                <div className="ov-info-ic">
                  <i className="bi bi-check2-circle" style={{ color: "#4f46e5" }} />
                </div>
                <div>
                  <div className="ov-info-title">Track status</div>
                  <div className="ov-info-value">Check Reservation History for updates anytime.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ov-card-soft mt-3" style={sideCardStyle}>
            <div
              style={{
                padding: 16,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                background: "rgba(99,102,241,0.10)",
                borderBottom: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <h4 className="ov-h4 mb-1">Tips</h4>
              <div className="text-muted small">Avoid common mistakes</div>
            </div>

            <div style={{ padding: 16 }}>
              <ul className="mb-0" style={{ color: "#334155", lineHeight: 1.9, paddingLeft: 18 }}>
                <li>Use your real email address to receive confirmations.</li>
                <li>Check-out must be after check-in (at least 1 night).</li>
                <li>Adults must be at least 1.</li>
                <li>Add special requests if you need early check-in or assistance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}