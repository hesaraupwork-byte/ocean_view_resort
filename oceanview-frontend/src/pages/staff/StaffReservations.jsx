// src/pages/staff/StaffReservations.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const API_BASE = ""; // keep "" if using proxy

function authHeader() {
  const token = localStorage.getItem("ov_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    // d is like "2026-03-04"
    return new Date(d + "T00:00:00").toLocaleDateString();
  } catch {
    return d;
  }
}

/* =========================
   CONFIRM MODAL (REUSE)
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

/* =========================
   RESERVATION EDIT MODAL
========================= */
function ReservationModal({ reservation, onClose, onSaved, onError }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);

  const [form, setForm] = useState({
    customerName: reservation?.customerName || "",
    customerEmail: reservation?.customerEmail || "",
    customerPhone: reservation?.customerPhone || "",
    roomType: reservation?.roomType || "Standard",
    checkInDate: reservation?.checkInDate || "",
    checkOutDate: reservation?.checkOutDate || "",
    adults: reservation?.adults ?? 1,
    children: reservation?.children ?? 0,
    specialRequests: reservation?.specialRequests || "",
    status: reservation?.status || "PENDING",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.classList.add("ov-no-scroll");
    return () => document.body.classList.remove("ov-no-scroll");
  }, []);

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const next = {};

    if (!form.customerName.trim()) next.customerName = "Customer name is required";
    const email = form.customerEmail.trim();
    if (!email) next.customerEmail = "Customer email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.customerEmail = "Enter a valid email.";

    if (!form.roomType) next.roomType = "Room type is required";
    if (!form.checkInDate) next.checkInDate = "Check-in date is required";
    if (!form.checkOutDate) next.checkOutDate = "Check-out date is required";

    if (form.checkInDate && form.checkOutDate) {
      const inD = new Date(form.checkInDate);
      const outD = new Date(form.checkOutDate);
      if (!(outD > inD)) next.checkOutDate = "Check-out must be after check-in";
    }

    const a = Number(form.adults);
    const c = Number(form.children);
    if (!Number.isFinite(a) || a < 1) next.adults = "Adults must be at least 1";
    if (!Number.isFinite(c) || c < 0) next.children = "Children cannot be negative";

    if (!form.status) next.status = "Status is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/reservations/${reservation.reservationNo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          roomType: form.roomType,
          checkInDate: form.checkInDate,
          checkOutDate: form.checkOutDate,
          adults: Number(form.adults),
          children: Number(form.children),
          specialRequests: form.specialRequests,
          status: form.status,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        onError(data?.message || data?.error || "Failed to update reservation");
        return;
      }

      onSaved();
    } catch {
      onError("Network error. Please try again");
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
            <div>
              <h4 className="ov-h4 mb-0">Reservation {reservation.reservationNo}</h4>
              <div className="text-muted small">
                Created: {fmtDateTime(reservation.createdAt)} • Status:{" "}
                <span className="fw-bold">{reservation.status}</span>
              </div>
            </div>

            <button className="btn ov-btn-outline" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>

          <div className="ov-divider" />

          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="ov-label">Customer Name</div>
                <input
                  className={`form-control ov-input ${errors.customerName ? "is-invalid" : ""}`}
                  value={form.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                  disabled={loading}
                />
                {errors.customerName && (
                  <div className="invalid-feedback">{errors.customerName}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Customer Email</div>
                <input
                  type="email"
                  className={`form-control ov-input ${errors.customerEmail ? "is-invalid" : ""}`}
                  value={form.customerEmail}
                  onChange={(e) => setField("customerEmail", e.target.value)}
                  disabled={loading}
                />
                {errors.customerEmail && (
                  <div className="invalid-feedback">{errors.customerEmail}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Customer Phone</div>
                <input
                  className="form-control ov-input"
                  value={form.customerPhone}
                  onChange={(e) => setField("customerPhone", e.target.value)}
                  disabled={loading}
                />
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
                {errors.roomType && (
                  <div className="invalid-feedback">{errors.roomType}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Check-in Date</div>
                <input
                  type="date"
                  className={`form-control ov-input ${errors.checkInDate ? "is-invalid" : ""}`}
                  value={form.checkInDate}
                  onChange={(e) => setField("checkInDate", e.target.value)}
                  disabled={loading}
                />
                {errors.checkInDate && (
                  <div className="invalid-feedback">{errors.checkInDate}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Check-out Date</div>
                <input
                  type="date"
                  className={`form-control ov-input ${errors.checkOutDate ? "is-invalid" : ""}`}
                  value={form.checkOutDate}
                  onChange={(e) => setField("checkOutDate", e.target.value)}
                  disabled={loading}
                />
                {errors.checkOutDate && (
                  <div className="invalid-feedback">{errors.checkOutDate}</div>
                )}
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
                {errors.children && (
                  <div className="invalid-feedback">{errors.children}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Status</div>
                <select
                  className={`form-select ov-input ${errors.status ? "is-invalid" : ""}`}
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                  disabled={loading}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                {errors.status && (
                  <div className="invalid-feedback">{errors.status}</div>
                )}
              </div>

              <div className="col-12">
                <div className="ov-label">Special Requests</div>
                <textarea
                  className="form-control ov-input"
                  rows="3"
                  value={form.specialRequests}
                  onChange={(e) => setField("specialRequests", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                className="btn ov-btn-dark w-100"
                type="button"
                onClick={() =>
                  setShowConfirm({
                    title: "Save Changes",
                    message: "Are you sure you want to save changes to this reservation?",
                    confirmText: "Save",
                    danger: false,
                    onConfirm: async () => {
                      setShowConfirm(null);
                      await save();
                    },
                  })
                }
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>

              <button
                className="btn ov-btn-outline w-100"
                type="button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title={showConfirm.title}
          message={showConfirm.message}
          confirmText={showConfirm.confirmText}
          cancelText="Cancel"
          danger={showConfirm.danger}
          onCancel={() => setShowConfirm(null)}
          onConfirm={showConfirm.onConfirm}
        />
      )}
    </>,
    document.body
  );
}

/* =========================
   STAFF RESERVATIONS PAGE
========================= */
export default function StaffReservations() {
  const navigate = useNavigate();

  // staff guard
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = (localStorage.getItem("ov_role") || "").toUpperCase();
    if (!token) navigate("/login", { replace: true });
    else if (role !== "STAFF") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({ type: "", msg: "" });
  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // modals
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const anyModalOpen = !!selected || !!confirm;
  useEffect(() => {
    if (anyModalOpen) document.body.classList.add("ov-no-scroll");
    else document.body.classList.remove("ov-no-scroll");
    return () => document.body.classList.remove("ov-no-scroll");
  }, [anyModalOpen]);

  async function fetchReservations() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/reservations`, {
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
          msg: data?.message || data?.error || "Failed to load reservations.",
        });
        return;
      }

      setItems(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    const from = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
    const to = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

    return items.filter((r) => {
      const matchKeyword =
        !keyword ||
        (r.reservationNo || "").toLowerCase().includes(keyword) ||
        (r.customerName || "").toLowerCase().includes(keyword) ||
        (r.customerEmail || "").toLowerCase().includes(keyword) ||
        (r.customerPhone || "").toLowerCase().includes(keyword) ||
        (r.roomType || "").toLowerCase().includes(keyword) ||
        (r.status || "").toLowerCase().includes(keyword);

      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchRoom = roomFilter === "ALL" || r.roomType === roomFilter;

      const createdAtMs = r.createdAt ? new Date(r.createdAt).getTime() : null;
      const matchDate =
        (!from || (createdAtMs !== null && createdAtMs >= from)) &&
        (!to || (createdAtMs !== null && createdAtMs <= to));

      return matchKeyword && matchStatus && matchRoom && matchDate;
    });
  }, [items, q, statusFilter, roomFilter, fromDate, toDate]);

  // quick status update actions (same as admin)
  async function updateStatus(reservation, status) {
    try {
      setLoading(true);

      const res = await fetch(`/api/reservations/${reservation.reservationNo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          roomType: reservation.roomType,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          adults: reservation.adults,
          children: reservation.children,
          specialRequests: reservation.specialRequests,
          status,
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
          msg: data?.message || data?.error || "Failed to update status.",
        });
        return;
      }

      setAlert({ type: "success", msg: `Reservation ${reservation.reservationNo} updated to ${status}.` });
      await fetchReservations();
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function badgeStatus(status) {
    if (status === "CONFIRMED") return <span className="badge text-bg-success">CONFIRMED</span>;
    if (status === "CANCELLED") return <span className="badge text-bg-danger">CANCELLED</span>;
    return <span className="badge text-bg-warning">PENDING</span>;
  }

  return (
    <div className="container-fluid py-4">
      {/* header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="ov-h2 mb-1">Staff Reservations</h2>
        </div>

        <div className="d-flex gap-2">
          <button className="btn ov-btn-dark" onClick={fetchReservations} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* alert */}
      {alert.msg && (
        <div className={`ov-alert mt-3 ${alert.type === "success" ? "ov-alert-success" : "ov-alert-error"}`}>
          {alert.msg}
        </div>
      )}

      {/* filters */}
      <div className="ov-card-soft mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="ov-label">Search</div>
            <input
              className="form-control ov-input"
              placeholder="Reservation no, name, email, phone..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Status</div>
            <select className="form-select ov-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Room Type</div>
            <select className="form-select ov-input" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">From</div>
            <input type="date" className="form-control ov-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">To</div>
            <input type="date" className="form-control ov-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <div className="col-12 col-lg-2 d-flex gap-2">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => {
                setQ("");
                setStatusFilter("ALL");
                setRoomFilter("ALL");
                setFromDate("");
                setToDate("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="ov-card-soft mt-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="fw-bold">Reservations ({filtered.length})</div>
          <div className="text-muted small">Confirming a reservation sends email automatically</div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Reservation No</th>
                <th>Customer</th>
                <th>Room</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading reservations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id || r.reservationNo}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{r.reservationNo}</td>
                    <td>
                      <div className="fw-semibold">{r.customerName}</div>
                      <div className="text-muted small">{r.customerEmail}</div>
                    </td>
                    <td>{r.roomType}</td>
                    <td>
                      <div>
                        {fmtDateOnly(r.checkInDate)} → {fmtDateOnly(r.checkOutDate)}
                      </div>
                      <div className="text-muted small">
                        {r.adults} adults, {r.children} children
                      </div>
                    </td>
                    <td>{badgeStatus(r.status)}</td>
                    <td>{fmtDateTime(r.createdAt)}</td>

                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button className="btn ov-btn-soft ov-btn-xs" onClick={() => setSelected(r)}>
                          <i className="bi bi-eye me-1" />
                          View/Edit
                        </button>

                        <button
                          className="btn ov-btn-soft ov-btn-xs"
                          disabled={r.status === "CONFIRMED"}
                          onClick={() =>
                            setConfirm({
                              title: "Confirm Reservation",
                              message: `Confirm reservation ${r.reservationNo}? This will send a CONFIRMED email.`,
                              confirmText: "Confirm",
                              danger: false,
                              onConfirm: async () => {
                                setConfirm(null);
                                await updateStatus(r, "CONFIRMED");
                              },
                            })
                          }
                          title={r.status === "CONFIRMED" ? "Already confirmed" : "Confirm reservation"}
                        >
                          <i className="bi bi-check2-circle me-1" />
                          Confirm
                        </button>

                        <button
                          className="btn ov-btn-danger-soft ov-btn-xs"
                          disabled={r.status === "CANCELLED"}
                          onClick={() =>
                            setConfirm({
                              title: "Cancel Reservation",
                              message: `Cancel reservation ${r.reservationNo}?`,
                              confirmText: "Cancel Reservation",
                              danger: true,
                              onConfirm: async () => {
                                setConfirm(null);
                                await updateStatus(r, "CANCELLED");
                              },
                            })
                          }
                          title={r.status === "CANCELLED" ? "Already cancelled" : "Cancel reservation"}
                        >
                          <i className="bi bi-x-circle me-1" />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* edit modal */}
      {selected && (
        <ReservationModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => {
            setSelected(null);
            setAlert({ type: "success", msg: "Reservation updated successfully." });
            await fetchReservations();
          }}
          onError={(msg) => setAlert({ type: "error", msg })}
        />
      )}

      {/* confirm modal */}
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
    </div>
  );
}