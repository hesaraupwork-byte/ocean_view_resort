// src/pages/customer/CustomerBills.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadInvoicePdf } from "../../utils/invoicePdf";

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

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  return Number(v).toFixed(2);
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

function statusMeta(status) {
  const s = String(status || "").toUpperCase();
  if (s === "CONFIRMED")
    return { label: "CONFIRMED", bg: "rgba(16,185,129,0.12)", bd: "rgba(16,185,129,0.22)", fg: "#059669", ic: "bi-check2-circle" };
  if (s === "CANCELLED")
    return { label: "CANCELLED", bg: "rgba(239,68,68,0.10)", bd: "rgba(239,68,68,0.20)", fg: "#dc2626", ic: "bi-x-octagon" };
  return { label: "PENDING", bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.22)", fg: "#b45309", ic: "bi-hourglass-split" };
}

export default function CustomerBills() {
  const navigate = useNavigate();

  // customer guard
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = normalizeRole(localStorage.getItem("ov_role"));
    if (!token) navigate("/login", { replace: true });
    else if (role !== "CUSTOMER") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const email = (localStorage.getItem("ov_email") || "").trim().toLowerCase();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // reservations for this customer WITH billing

  const [alert, setAlert] = useState({ type: "", msg: "" });
  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 6500);
    return () => clearTimeout(t);
  }, [alert]);

  // filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL/PENDING/CONFIRMED/CANCELLED
  const [sort, setSort] = useState("NEWEST"); // NEWEST/OLDEST/TOTAL_DESC/TOTAL_ASC

  async function loadBills() {
    if (!email) {
      setAlert({ type: "error", msg: "Your email is missing. Please login again." });
      return;
    }

    try {
      setLoading(true);

      // Backend currently: GET /api/reservations (no "my bills" endpoint)
      // We filter by customerEmail + billing exists.
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
        setAlert({ type: "error", msg: data?.message || data?.error || "Failed to load bills." });
        return;
      }

      const all = Array.isArray(data) ? data : [];

      const mineWithBilling = all
        .filter((r) => String(r.customerEmail || "").toLowerCase() === email)
        .filter((r) => !!r.billing);

      setItems(mineWithBilling);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();

    const base = items.filter((r) => {
      const resNo = String(r.reservationNo || "").toLowerCase();
      const room = String(r.roomType || "").toLowerCase();
      const status = String(r.status || "").toUpperCase();

      const bill = r.billing || {};
      const currency = String(bill.currency || "").toLowerCase();
      const totalStr = String(bill.total ?? "").toLowerCase();

      const matchKeyword =
        !k || resNo.includes(k) || room.includes(k) || status.toLowerCase().includes(k) || currency.includes(k) || totalStr.includes(k);

      const matchStatus = statusFilter === "ALL" || status === statusFilter;

      return matchKeyword && matchStatus;
    });

    const sorted = [...base].sort((a, b) => {
      const ax = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bx = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      const at = Number(a.billing?.total ?? 0);
      const bt = Number(b.billing?.total ?? 0);

      if (sort === "OLDEST") return ax - bx;
      if (sort === "TOTAL_ASC") return at - bt;
      if (sort === "TOTAL_DESC") return bt - at;
      return bx - ax; // NEWEST
    });

    return sorted;
  }, [items, q, statusFilter, sort]);

  const stats = useMemo(() => {
    const totalBills = items.length;
    const sum = items.reduce((acc, r) => acc + Number(r.billing?.total ?? 0), 0);
    const currency = items[0]?.billing?.currency || "LKR";
    return { totalBills, sum, currency };
  }, [items]);

  const heroStyle = {
    borderRadius: 18,
    padding: "16px 18px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,0.14) 0%, rgba(99,102,241,0.10) 45%, rgba(16,185,129,0.10) 100%)",
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
                  background: "rgba(14,165,233,0.14)",
                  border: "1px solid rgba(14,165,233,0.22)",
                }}
              >
                <i className="bi bi-receipt-cutoff" style={{ fontSize: 18, color: "#0284c7" }} />
              </span>
              <h2 className="ov-h2 mb-0">My Bills</h2>
            </div>

            
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <div
              style={{
                borderRadius: 999,
                padding: "8px 12px",
                background: "rgba(15,23,42,0.06)",
                border: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <span className="small text-muted">Bills</span>{" "}
              <span className="fw-semibold" style={{ color: "#0f172a" }}>
                {stats.totalBills}
              </span>
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: "8px 12px",
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.22)",
              }}
            >
              <span className="small" style={{ color: "#059669" }}>
                Total
              </span>{" "}
              <span className="fw-semibold" style={{ color: "#059669" }}>
                {stats.currency} {money(stats.sum)}
              </span>
            </div>

            <button className="btn ov-btn-dark" onClick={loadBills} disabled={loading} style={{ borderRadius: 14 }}>
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
      </div>

      {/* ALERT */}
      {alert.msg && (
        <div className={`ov-alert mt-3 ${alert.type === "success" ? "ov-alert-success" : "ov-alert-error"}`} style={{ borderRadius: 14 }}>
          {alert.msg}
        </div>
      )}

      {!email && (
        <div className="ov-alert mt-3 ov-alert-error" style={{ borderRadius: 14 }}>
          Your email is missing in localStorage. Please login again.
        </div>
      )}

      {/* FILTER BAR */}
      <div className="ov-card-soft mt-3" style={glassCard}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-6">
            <div className="ov-label">Search</div>
            <input
              className="form-control ov-input"
              placeholder="Reservation no, room type, status, currency, total..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Reservation Status</div>
            <select className="form-select ov-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Sort</div>
            <select className="form-select ov-input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="TOTAL_DESC">Total (high → low)</option>
              <option value="TOTAL_ASC">Total (low → high)</option>
            </select>
          </div>

          <div className="col-12 col-lg-2 d-flex gap-2">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => {
                setQ("");
                setStatusFilter("ALL");
                setSort("NEWEST");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-3">
        {loading && items.length === 0 ? (
          <div className="ov-card-soft text-center py-5" style={glassCard}>
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading your bills...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ov-card-soft text-center py-5" style={glassCard}>
            <div
              className="mx-auto mb-2 d-flex align-items-center justify-content-center"
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.22)",
              }}
            >
              <i className="bi bi-receipt" style={{ color: "#b45309", fontSize: 20 }} />
            </div>
            <div className="fw-semibold">No bills available yet</div>
            <div className="text-muted small">
              Bills will appear after staff/admin calculates billing for your reservation.
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((r) => {
              const b = r.billing;
              const meta = statusMeta(r.status);
              const nights = calcNights(r.checkInDate, r.checkOutDate);
              const currency = b?.currency || "LKR";

              return (
                <div className="col-12 col-md-6 col-xl-4" key={r.id || r.reservationNo}>
                  <div className="ov-card-soft h-100" style={glassCard}>
                    {/* header */}
                    <div
                      style={{
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        padding: 14,
                        background: "linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(99,102,241,0.08) 100%)",
                        borderBottom: "1px solid rgba(148,163,184,0.35)",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {r.reservationNo}
                          </div>
                          <div className="text-muted small">
                            {fmtDateOnly(r.checkInDate)} → {fmtDateOnly(r.checkOutDate)} • {nights || 0} night(s)
                          </div>
                        </div>

                        <div
                          className="d-inline-flex align-items-center gap-2"
                          style={{
                            borderRadius: 999,
                            padding: "6px 10px",
                            background: meta.bg,
                            border: `1px solid ${meta.bd}`,
                            color: meta.fg,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <i className={`bi ${meta.ic}`} />
                          {meta.label}
                        </div>
                      </div>
                    </div>

                    {/* body */}
                    <div style={{ padding: 14 }}>
                      <div className="d-flex justify-content-between align-items-end gap-2">
                        <div>
                          <div className="text-muted small">Total Amount</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
                            {currency} {money(b?.total)}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 14,
                            padding: "8px 10px",
                            background: "rgba(16,185,129,0.10)",
                            border: "1px solid rgba(16,185,129,0.18)",
                          }}
                        >
                          <div className="text-muted small">Updated</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {fmtDateTime(b?.updatedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="ov-divider" />

                      {/* breakdown */}
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="text-muted small">Rate / Night</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {currency} {money(b?.roomRatePerNight)}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Nights</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {b?.nights ?? nights ?? "-"}
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="text-muted small">Subtotal</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {currency} {money(b?.roomSubtotal)}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Service</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {currency} {money(b?.serviceChargeAmount)}
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="text-muted small">Tax</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {currency} {money(b?.taxAmount)}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Discount</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {currency} {money(b?.discountAmount)}
                          </div>
                        </div>
                      </div>

                      {b?.notes ? (
                        <div
                          className="mt-3"
                          style={{
                            borderRadius: 14,
                            padding: "10px 12px",
                            background: "rgba(99,102,241,0.06)",
                            border: "1px solid rgba(99,102,241,0.14)",
                          }}
                        >
                          <div className="text-muted small">Notes</div>
                          <div style={{ color: "#334155", whiteSpace: "pre-wrap" }}>{b.notes}</div>
                        </div>
                      ) : null}

                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn ov-btn-dark w-100"
                          type="button"
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
                          <i className="bi bi-download me-2" />
                          Download Invoice (PDF)
                        </button>
                      </div>

                      <div className="text-muted small mt-2">
                        Created: <b>{fmtDateTime(r.createdAt)}</b>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-muted small mt-3">
        Showing <b>{filtered.length}</b> of <b>{items.length}</b> bills for <b>{email || "your account"}</b>.
      </div>
    </div>
  );
}