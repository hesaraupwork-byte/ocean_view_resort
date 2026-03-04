// src/pages/staff/StaffBills.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { downloadInvoicePdf } from "../../utils/invoicePdf";

const API_BASE = ""; // keep "" if using proxy

function authHeader() {
  const token = localStorage.getItem("ov_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  return Number(v).toFixed(2);
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
   Billing Modal (Create/Update)
========================= */
function BillingModal({ reservation, onClose, onSaved, onError }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const existing = reservation?.billing || null;
  const currencyDefault = existing?.currency || "LKR";

  const [form, setForm] = useState({
    roomRatePerNight: existing?.roomRatePerNight ?? "",
    serviceChargeRate: existing?.serviceChargeRate ?? "", // optional
    taxRate: existing?.taxRate ?? "", // optional
    discountAmount: existing?.discountAmount ?? 0,
    currency: currencyDefault,
    notes: existing?.notes ?? "",
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

    const rate = Number(form.roomRatePerNight);
    if (form.roomRatePerNight === "" || !Number.isFinite(rate) || rate < 0) {
      next.roomRatePerNight = "Room rate per night must be 0 or more.";
    }

    if (!String(form.currency || "").trim()) next.currency = "Currency is required.";

    if (form.serviceChargeRate !== "") {
      const s = Number(form.serviceChargeRate);
      if (!Number.isFinite(s) || s < 0) next.serviceChargeRate = "Service charge rate must be 0 or more.";
    }
    if (form.taxRate !== "") {
      const t = Number(form.taxRate);
      if (!Number.isFinite(t) || t < 0) next.taxRate = "Tax rate must be 0 or more.";
    }
    if (form.discountAmount !== "") {
      const d = Number(form.discountAmount);
      if (!Number.isFinite(d) || d < 0) next.discountAmount = "Discount amount must be 0 or more.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveBilling() {
    if (!validate()) return;

    try {
      setLoading(true);

      const body = {
        roomRatePerNight: Number(form.roomRatePerNight),
        currency: String(form.currency).trim(),
        notes: form.notes || "",
        discountAmount: Number(form.discountAmount || 0),
      };

      if (form.serviceChargeRate !== "") body.serviceChargeRate = Number(form.serviceChargeRate);
      if (form.taxRate !== "") body.taxRate = Number(form.taxRate);

      const res = await fetch(
        `${API_BASE}/api/reservations/${reservation.reservationNo}/billing`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(body),
        }
      );

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        onError(data?.message || data?.error || "Failed to save billing.");
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

  const billing = reservation.billing;

  return createPortal(
    <>
      <div className="ov-modal-backdrop" onMouseDown={onBackdropClick}>
        <div className="ov-modal" onMouseDown={(e) => e.stopPropagation()}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h4 className="ov-h4 mb-0">
                {billing ? "Update Billing" : "Create Billing"} • {reservation.reservationNo}
              </h4>
              <div className="text-muted small">
                {reservation.customerName} • {reservation.customerEmail}
              </div>
            </div>

            <button className="btn ov-btn-outline" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>

          <div className="ov-divider" />

          {billing && (
            <div className="ov-card-soft mb-3">
              <div className="row g-2">
                <div className="col-6 col-md-3">
                  <div className="ov-label">Nights</div>
                  <div className="fw-bold">{billing.nights}</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="ov-label">Subtotal</div>
                  <div className="fw-bold">
                    {billing.currency} {money(billing.roomSubtotal)}
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="ov-label">Tax</div>
                  <div className="fw-bold">
                    {billing.currency} {money(billing.taxAmount)}
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="ov-label">Total</div>
                  <div className="fw-bold">
                    {billing.currency} {money(billing.total)}
                  </div>
                </div>
              </div>
              <div className="text-muted small mt-2">Updated: {fmtDate(billing.updatedAt)}</div>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="ov-label">Room Rate Per Night</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control ov-input ${errors.roomRatePerNight ? "is-invalid" : ""}`}
                  value={form.roomRatePerNight}
                  onChange={(e) => setField("roomRatePerNight", e.target.value)}
                  disabled={loading}
                />
                {errors.roomRatePerNight && (
                  <div className="invalid-feedback">{errors.roomRatePerNight}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Currency</div>
                <input
                  className={`form-control ov-input ${errors.currency ? "is-invalid" : ""}`}
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  disabled={loading}
                  placeholder="LKR"
                />
                {errors.currency && <div className="invalid-feedback">{errors.currency}</div>}
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Service Charge Rate (optional)</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control ov-input ${errors.serviceChargeRate ? "is-invalid" : ""}`}
                  value={form.serviceChargeRate}
                  onChange={(e) => setField("serviceChargeRate", e.target.value)}
                  disabled={loading}
                  placeholder="0.10"
                />
                {errors.serviceChargeRate && (
                  <div className="invalid-feedback">{errors.serviceChargeRate}</div>
                )}
                <div className="ov-form-note">Example: 0.10 = 10%</div>
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Tax Rate (optional)</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control ov-input ${errors.taxRate ? "is-invalid" : ""}`}
                  value={form.taxRate}
                  onChange={(e) => setField("taxRate", e.target.value)}
                  disabled={loading}
                  placeholder="0.05"
                />
                {errors.taxRate && <div className="invalid-feedback">{errors.taxRate}</div>}
                <div className="ov-form-note">Example: 0.05 = 5%</div>
              </div>

              <div className="col-12 col-md-6">
                <div className="ov-label">Discount Amount</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control ov-input ${errors.discountAmount ? "is-invalid" : ""}`}
                  value={form.discountAmount}
                  onChange={(e) => setField("discountAmount", e.target.value)}
                  disabled={loading}
                />
                {errors.discountAmount && (
                  <div className="invalid-feedback">{errors.discountAmount}</div>
                )}
              </div>

              <div className="col-12">
                <div className="ov-label">Notes</div>
                <textarea
                  className="form-control ov-input"
                  rows="3"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  disabled={loading}
                  placeholder="Optional notes for the bill..."
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
                    title: billing ? "Update Billing" : "Create Billing",
                    message: "Are you sure you want to save billing details for this reservation?",
                    confirmText: "Save",
                    danger: false,
                    onConfirm: async () => {
                      setConfirm(null);
                      await saveBilling();
                    },
                  })
                }
              >
                {loading ? "Saving..." : billing ? "Update Billing" : "Create Billing"}
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

            {billing && (
              <div className="mt-3">
                <button
                  className="btn ov-btn-outline w-100"
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    try {
                      downloadInvoicePdf({
                        reservation,
                        billing,
                        resort: {
                          name: "Ocean View Resort",
                          address: "Galle, Sri Lanka",
                          email: "restinoceanview@gmail.com",
                        },
                      });
                    } catch {
                      onError("Failed to generate invoice PDF.");
                    }
                  }}
                >
                  <i className="bi bi-download me-2" />
                  Download PDF Invoice
                </button>
              </div>
            )}
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
   Staff Bills Page
========================= */
export default function StaffBills() {
  const navigate = useNavigate();

  // staff guard
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = (localStorage.getItem("ov_role") || "").toUpperCase();
    if (!token) navigate("/login", { replace: true });
    else if (role !== "STAFF") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({ type: "", msg: "" });
  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  // filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [billFilter, setBillFilter] = useState("ALL");

  // modal
  const [selected, setSelected] = useState(null);

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

      setReservations(Array.isArray(data) ? data : []);
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
    const k = q.trim().toLowerCase();

    return reservations.filter((r) => {
      const hasBill = !!r.billing;

      const matchKeyword =
        !k ||
        (r.reservationNo || "").toLowerCase().includes(k) ||
        (r.customerName || "").toLowerCase().includes(k) ||
        (r.customerEmail || "").toLowerCase().includes(k);

      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;

      const matchBill =
        billFilter === "ALL" ||
        (billFilter === "WITH" && hasBill) ||
        (billFilter === "WITHOUT" && !hasBill);

      return matchKeyword && matchStatus && matchBill;
    });
  }, [reservations, q, statusFilter, billFilter]);

  function openBilling(r) {
    setSelected(r);
  }

  return (
    <div className="container-fluid py-4">
      {/* header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="ov-h2 mb-1">Bill Management</h2>
        </div>

        <button className="btn ov-btn-dark" onClick={fetchReservations} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* alert */}
      {alert.msg && (
        <div
          className={`ov-alert mt-3 ${
            alert.type === "success" ? "ov-alert-success" : "ov-alert-error"
          }`}
        >
          {alert.msg}
        </div>
      )}

      {/* filters */}
      <div className="ov-card-soft mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="ov-label">Search</div>
            <input
              className="form-control ov-input"
              placeholder="Reservation no, name, email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Reservation Status</div>
            <select
              className="form-select ov-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Billing</div>
            <select
              className="form-select ov-input"
              value={billFilter}
              onChange={(e) => setBillFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="WITH">With Billing</option>
              <option value="WITHOUT">Without Billing</option>
            </select>
          </div>

          <div className="col-12 col-lg-3 d-flex gap-2">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => {
                setQ("");
                setStatusFilter("ALL");
                setBillFilter("ALL");
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
          <div className="text-muted small">Billing is saved inside reservation record.</div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Reservation No</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Billing</th>
                <th>Total</th>
                <th>Updated At</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && reservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const hasBill = !!r.billing;
                  const currency = r.billing?.currency || "LKR";

                  return (
                    <tr key={r.id || r.reservationNo}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{r.reservationNo}</td>
                      <td>
                        <div className="fw-semibold">{r.customerName}</div>
                        <div className="text-muted small">{r.customerEmail}</div>
                      </td>
                      <td>
                        <span className="badge text-bg-secondary">{r.status}</span>
                      </td>
                      <td>
                        {hasBill ? (
                          <span className="badge text-bg-success">CREATED</span>
                        ) : (
                          <span className="badge text-bg-warning">NOT CREATED</span>
                        )}
                      </td>
                      <td>
                        {hasBill ? (
                          <span className="fw-bold">
                            {currency} {money(r.billing.total)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{hasBill ? fmtDate(r.billing.updatedAt) : "-"}</td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          <button className="btn ov-btn-soft ov-btn-xs" onClick={() => openBilling(r)}>
                            <i className="bi bi-receipt me-1" />
                            {hasBill ? "View / Update" : "Create Bill"}
                          </button>

                          {hasBill && (
                            <button
                              className="btn ov-btn-outline ov-btn-xs"
                              onClick={() => {
                                try {
                                  downloadInvoicePdf({
                                    reservation: r,
                                    billing: r.billing,
                                    resort: {
                                      name: "Ocean View Resort",
                                      address: "Galle, Sri Lanka",
                                      email: "restinoceanview@gmail.com",
                                    },
                                  });
                                } catch {
                                  setAlert({ type: "error", msg: "Failed to generate invoice PDF." });
                                }
                              }}
                            >
                              <i className="bi bi-download me-1" />
                              Download PDF
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* billing modal */}
      {selected && (
        <BillingModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => {
            setSelected(null);
            setAlert({ type: "success", msg: "Billing saved successfully." });
            await fetchReservations();
          }}
          onError={(msg) => setAlert({ type: "error", msg })}
        />
      )}
    </div>
  );
}