// src/pages/customer/CustomerAdditionalTime.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const API_BASE = ""; // keep "" if using proxy

function authHeader() {
  const token = localStorage.getItem("ov_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeRole(role) {
  const r = String(role || "").toUpperCase();
  return r.startsWith("ROLE_") ? r.replace("ROLE_", "") : r;
}

function fmtDateTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function fmtDateOnly(d) {
  if (!d) return "-";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString();
  } catch {
    return d;
  }
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

function statusPill(status) {
  const s = String(status || "").toUpperCase();
  if (s === "CONFIRMED") return <span className="badge text-bg-success">CONFIRMED</span>;
  if (s === "CANCELLED") return <span className="badge text-bg-danger">CANCELLED</span>;
  return <span className="badge text-bg-warning">PENDING</span>;
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
   Edit Pending Reservation Modal
   - Uses PUT /api/reservations/{reservationNo}
========================= */
function EditReservationModal({ reservation, onClose, onSaved, onError }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [form, setForm] = useState({
    customerName: reservation.customerName || "",
    customerEmail: reservation.customerEmail || "",
    customerPhone: reservation.customerPhone || "",
    roomType: reservation.roomType || "Standard",
    checkInDate: reservation.checkInDate || addDaysISO(todayISO(), 1),
    checkOutDate: reservation.checkOutDate || addDaysISO(todayISO(), 2),
    adults: reservation.adults ?? 1,
    children: reservation.children ?? 0,
    specialRequests: reservation.specialRequests || "",
  });

  const [errors, setErrors] = useState({});

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
    const next = {};
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

  async function save() {
    if (!validate()) return;

    try {
      setLoading(true);

      // Your backend update() requires ReservationUpdateRequest including status.
      // Customer is allowed only for PENDING; keep status PENDING.
      const res = await fetch(`${API_BASE}/api/reservations/${reservation.reservationNo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          customerName: reservation.customerName, // keep original (optional)
          customerEmail: reservation.customerEmail, // keep original
          customerPhone: form.customerPhone?.trim() || "",
          roomType: form.roomType,
          checkInDate: form.checkInDate,
          checkOutDate: form.checkOutDate,
          adults: Number(form.adults),
          children: Number(form.children),
          specialRequests: form.specialRequests || "",
          status: "PENDING",
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        onError(data?.message || data?.error || "Failed to update reservation.");
        return;
      }

      onSaved(data);
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onBackdropClick(e) {
    if (e.target.classList.contains("ov-modal-backdrop")) onClose();
  }

  const nights = calcNights(form.checkInDate, form.checkOutDate);

  return createPortal(
    <>
      <div className="ov-modal-backdrop" onMouseDown={onBackdropClick}>
        <div className="ov-modal" onMouseDown={(e) => e.stopPropagation()}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h4 className="ov-h4 mb-0">Edit Pending Reservation</h4>
              <div className="text-muted small">
                {reservation.reservationNo} • Status: <b>PENDING</b>
              </div>
            </div>

            <button className="btn ov-btn-outline" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>

          <div className="ov-divider" />

          <div className="ov-card-soft mb-3">
            <div className="row g-2">
              <div className="col-6 col-md-3">
                <div className="ov-label">Room</div>
                <div className="fw-bold">{form.roomType}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="ov-label">Nights</div>
                <div className="fw-bold">{nights || "-"}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="ov-label">Guests</div>
                <div className="fw-bold">
                  {Number(form.adults) || 0} Adults, {Number(form.children) || 0} Children
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="ov-label">Status</div>
                <span className="badge text-bg-warning">PENDING</span>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="row g-3">
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
              </div>

              <div className="col-6 col-md-3">
                <div className="ov-label">Adults</div>
                <input
                  type="number"
                  min="1"
                  className={`form-control ov-input ${errors.adults ? "is-invalid" : ""}`}
                  value={form.adults}
                  onChange={(e) => setField("adults", e.target.value)}
                  disabled={loading}
                />
                {errors.adults && <div className="invalid-feedback">{errors.adults}</div>}
              </div>

              <div className="col-6 col-md-3">
                <div className="ov-label">Children</div>
                <input
                  type="number"
                  min="0"
                  className={`form-control ov-input ${errors.children ? "is-invalid" : ""}`}
                  value={form.children}
                  onChange={(e) => setField("children", e.target.value)}
                  disabled={loading}
                />
                {errors.children && <div className="invalid-feedback">{errors.children}</div>}
              </div>

              <div className="col-12">
                <div className="ov-label">Special Requests (optional)</div>
                <textarea
                  className="form-control ov-input"
                  rows="3"
                  value={form.specialRequests}
                  onChange={(e) => setField("specialRequests", e.target.value)}
                  disabled={loading}
                  placeholder="Any notes you want to add..."
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                className="btn ov-btn-dark w-100"
                type="button"
                disabled={loading}
                onClick={() =>
                  setConfirm({
                    title: "Save Changes",
                    message: "Are you sure you want to update this pending reservation?",
                    confirmText: "Save",
                    danger: false,
                    onConfirm: async () => {
                      setConfirm(null);
                      await save();
                    },
                  })
                }
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button className="btn ov-btn-outline w-100" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>

            <div className="ov-form-note mt-2">
              You can edit only while status is <b>PENDING</b>. Once confirmed, changes must be requested via staff.
            </div>
          </form>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmText={confirm.confirmText}
          cancelText="Back"
          danger={confirm.danger}
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}
    </>,
    document.body
  );
}

/* =========================
   Customer Additional Time Page
   - Shows ONLY PENDING reservations for logged user
   - Actions:
     1) Edit roomType/dates/guests/specialRequests (PUT)
     2) Cancel reservation (PUT status=CANCELLED)
========================= */
export default function CustomerAdditionalTime() {
  const navigate = useNavigate();

  // guard
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = normalizeRole(localStorage.getItem("ov_role"));
    if (!token) navigate("/login", { replace: true });
    else if (role !== "CUSTOMER") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const email = (localStorage.getItem("ov_email") || "").trim().toLowerCase();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [alert, setAlert] = useState({ type: "", msg: "" });
  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 6500);
    return () => clearTimeout(t);
  }, [alert]);

  // filters
  const [q, setQ] = useState("");

  // modals
  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    const anyModal = !!selected || !!confirmCancel;
    if (anyModal) document.body.classList.add("ov-no-scroll");
    else document.body.classList.remove("ov-no-scroll");
    return () => document.body.classList.remove("ov-no-scroll");
  }, [selected, confirmCancel]);

  async function loadPending() {
    if (!email) {
      setAlert({ type: "error", msg: "Your email is missing. Please login again." });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/reservations`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        setAlert({ type: "error", msg: data?.message || data?.error || "Failed to load reservations." });
        return;
      }

      const all = Array.isArray(data) ? data : [];

      const minePending = all
        .filter((r) => String(r.customerEmail || "").toLowerCase() === email)
        .filter((r) => String(r.status || "").toUpperCase() === "PENDING")
        .sort((a, b) => {
          const ax = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bx = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bx - ax;
        });

      setItems(minePending);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return items.filter((r) => {
      if (!k) return true;
      return (
        String(r.reservationNo || "").toLowerCase().includes(k) ||
        String(r.roomType || "").toLowerCase().includes(k) ||
        String(r.customerName || "").toLowerCase().includes(k)
      );
    });
  }, [items, q]);

  async function cancelReservation(reservation) {
    try {
      setLoading(true);

      // Use PUT update with status=CANCELLED (your backend supports)
      const res = await fetch(`${API_BASE}/api/reservations/${reservation.reservationNo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone || "",
          roomType: reservation.roomType,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          adults: Number(reservation.adults ?? 1),
          children: Number(reservation.children ?? 0),
          specialRequests: reservation.specialRequests || "",
          status: "CANCELLED",
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        setAlert({ type: "error", msg: data?.message || data?.error || "Failed to cancel reservation." });
        return;
      }

      setAlert({ type: "success", msg: `Reservation ${reservation.reservationNo} cancelled successfully.` });
      await loadPending();
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const heroStyle = {
    borderRadius: 18,
    padding: "16px 18px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,0.14) 0%, rgba(99,102,241,0.10) 45%, rgba(245,158,11,0.10) 100%)",
    border: "1px solid rgba(148,163,184,0.35)",
  };

  const glassCard = {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div className="container-fluid py-3 py-md-4">
      {/* HERO */}
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
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.22)",
                }}
              >
                <i className="bi bi-clock-history" style={{ fontSize: 18, color: "#b45309" }} />
              </span>
              <h2 className="ov-h2 mb-0">Additional Time & Changes</h2>
            </div>
            
          </div>

          <button className="btn ov-btn-dark" onClick={loadPending} disabled={loading} style={{ borderRadius: 14 }}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Refreshing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-repeat me-2" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* ALERT */}
      {alert.msg && (
        <div className={`ov-alert mt-3 ${alert.type === "success" ? "ov-alert-success" : "ov-alert-error"}`} style={{ borderRadius: 14 }}>
          {alert.msg}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="ov-card-soft mt-3" style={glassCard}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-8">
            <div className="ov-label">Search your pending reservations</div>
            <input
              className="form-control ov-input"
              placeholder="Reservation no, room type..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-12 col-lg-4 d-flex gap-2">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => setQ("")}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="mt-3">
        {loading && items.length === 0 ? (
          <div className="ov-card-soft text-center py-5" style={glassCard}>
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading pending reservations...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ov-card-soft text-center py-5" style={glassCard}>
            <div
              className="mx-auto mb-2 d-flex align-items-center justify-content-center"
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.18)",
              }}
            >
              <i className="bi bi-check2-circle" style={{ color: "#059669", fontSize: 20 }} />
            </div>
            <div className="fw-semibold">No pending reservations</div>
            <div className="text-muted small">Only pending reservations can be changed here.</div>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((r) => {
              const nights = calcNights(r.checkInDate, r.checkOutDate);
              return (
                <div className="col-12 col-lg-6" key={r.id || r.reservationNo}>
                  <div className="ov-card-soft h-100" style={glassCard}>
                    <div
                      style={{
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        padding: 14,
                        background: "linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(99,102,241,0.08) 100%)",
                        borderBottom: "1px solid rgba(148,163,184,0.35)",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                        <div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {r.reservationNo}
                          </div>
                          <div className="text-muted small">
                            Created: {fmtDateTime(r.createdAt)} • {statusPill(r.status)}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 14,
                            padding: "8px 10px",
                            background: "rgba(15,23,42,0.06)",
                            border: "1px solid rgba(148,163,184,0.35)",
                            minWidth: 220,
                          }}
                        >
                          <div className="text-muted small">Stay</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {fmtDateOnly(r.checkInDate)} → {fmtDateOnly(r.checkOutDate)} • {nights || 0} night(s)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: 14 }}>
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="text-muted small">Room</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {r.roomType}
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="text-muted small">Guests</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {r.adults} adults, {r.children} children
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="text-muted small">Special requests</div>
                          <div style={{ color: "#334155", whiteSpace: "pre-wrap" }}>
                            {r.specialRequests ? r.specialRequests : <span className="text-muted">No requests</span>}
                          </div>
                        </div>
                      </div>

                      <div className="ov-divider" />

                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn ov-btn-dark"
                          type="button"
                          disabled={loading}
                          onClick={() => setSelected(r)}
                          style={{ borderRadius: 14 }}
                        >
                          <i className="bi bi-pencil-square me-2" />
                          Edit
                        </button>

                        <button
                          className="btn ov-btn-outline"
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            setConfirmCancel({
                              reservation: r,
                              title: "Cancel Reservation",
                              message: `Cancel ${r.reservationNo}? This action cannot be undone.`,
                            })
                          }
                          style={{ borderRadius: 14 }}
                        >
                          <i className="bi bi-x-circle me-2" />
                          Cancel
                        </button>

                        <div className="ms-auto text-muted small d-flex align-items-center">
                          <i className="bi bi-info-circle me-2" />
                          Only <b className="ms-1 me-1">PENDING</b> reservations are editable
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {selected && (
        <EditReservationModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => {
            setSelected(null);
            setAlert({ type: "success", msg: "Reservation updated successfully." });
            await loadPending();
          }}
          onError={(msg) => setAlert({ type: "error", msg })}
        />
      )}

      {/* CANCEL CONFIRM */}
      {confirmCancel && (
        <ConfirmModal
          title={confirmCancel.title}
          message={confirmCancel.message}
          confirmText="Yes, Cancel"
          cancelText="Back"
          danger
          onCancel={() => setConfirmCancel(null)}
          onConfirm={async () => {
            const r = confirmCancel.reservation;
            setConfirmCancel(null);
            await cancelReservation(r);
          }}
        />
      )}
    </div>
  );
}