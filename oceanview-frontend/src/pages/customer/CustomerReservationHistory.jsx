// src/pages/customer/CustomerReservationHistory.jsx
import { useEffect, useMemo, useState } from "react";
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
  if (s === "CONFIRMED") {
    return {
      label: "CONFIRMED",
      icon: "bi-check2-circle",
      bg: "rgba(16,185,129,0.12)",
      bd: "rgba(16,185,129,0.22)",
      fg: "#059669",
    };
  }
  if (s === "CANCELLED") {
    return {
      label: "CANCELLED",
      icon: "bi-x-octagon",
      bg: "rgba(239,68,68,0.10)",
      bd: "rgba(239,68,68,0.20)",
      fg: "#dc2626",
    };
  }
  return {
    label: "PENDING",
    icon: "bi-hourglass-split",
    bg: "rgba(245,158,11,0.12)",
    bd: "rgba(245,158,11,0.22)",
    fg: "#b45309",
  };
}

function roomMeta(roomType) {
  const t = String(roomType || "").toUpperCase();
  if (t === "SUITE") return { icon: "bi-gem", tone: "#4f46e5" };
  if (t === "DELUXE") return { icon: "bi-stars", tone: "#0284c7" };
  return { icon: "bi-door-open", tone: "#0ea5e9" };
}

export default function CustomerReservationHistory() {
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
  const [items, setItems] = useState([]);

  const [alert, setAlert] = useState({ type: "", msg: "" });
  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 6500);
    return () => clearTimeout(t);
  }, [alert]);

  // filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL/PENDING/CONFIRMED/CANCELLED
  const [roomFilter, setRoomFilter] = useState("ALL"); // ALL/Standard/Deluxe/Suite
  const [sort, setSort] = useState("NEWEST"); // NEWEST/OLDEST

  async function loadHistory() {
    if (!email) {
      setAlert({ type: "error", msg: "Your email is missing. Please login again." });
      return;
    }

    try {
      setLoading(true);

      // NOTE: Backend doesn't have a dedicated "my reservations" endpoint in your controller.
      // So we use GET /api/reservations and filter by customerEmail client-side.
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
        setAlert({ type: "error", msg: data?.message || data?.error || "Failed to load reservation history." });
        return;
      }

      const all = Array.isArray(data) ? data : [];
      const mine = all
        .filter((r) => String(r.customerEmail || "").toLowerCase() === email)
        .sort((a, b) => {
          const ax = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bx = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bx - ax;
        });

      setItems(mine);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();

    const base = items.filter((r) => {
      const resNo = String(r.reservationNo || "").toLowerCase();
      const room = String(r.roomType || "").toLowerCase();
      const status = String(r.status || "").toUpperCase();
      const name = String(r.customerName || "").toLowerCase();

      const matchKeyword = !k || resNo.includes(k) || room.includes(k) || name.includes(k);

      const matchStatus = statusFilter === "ALL" || status === statusFilter;

      const matchRoom =
        roomFilter === "ALL" || String(r.roomType || "").toUpperCase() === String(roomFilter).toUpperCase();

      return matchKeyword && matchStatus && matchRoom;
    });

    const sorted = [...base].sort((a, b) => {
      const ax = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bx = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === "OLDEST" ? ax - bx : bx - ax;
    });

    return sorted;
  }, [items, q, statusFilter, roomFilter, sort]);

  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((x) => String(x.status || "").toUpperCase() === "PENDING").length;
    const confirmed = items.filter((x) => String(x.status || "").toUpperCase() === "CONFIRMED").length;
    const cancelled = items.filter((x) => String(x.status || "").toUpperCase() === "CANCELLED").length;
    return { total, pending, confirmed, cancelled };
  }, [items]);

  const heroStyle = {
    borderRadius: 18,
    padding: "16px 18px",
    background:
      "linear-gradient(135deg, rgba(14,165,233,0.14) 0%, rgba(16,185,129,0.12) 45%, rgba(99,102,241,0.10) 100%)",
    border: "1px solid rgba(148,163,184,0.35)",
  };

  const cardStyle = {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(10px)",
  };

  const statPill = (bg, bd) => ({
    borderRadius: 999,
    padding: "8px 12px",
    background: bg,
    border: `1px solid ${bd}`,
  });

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
                  background: "rgba(99,102,241,0.14)",
                  border: "1px solid rgba(99,102,241,0.22)",
                }}
              >
                <i className="bi bi-clock-history" style={{ fontSize: 18, color: "#4f46e5" }} />
              </span>
              <h2 className="ov-h2 mb-0">Reservation History</h2>
            </div>

            
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <div style={statPill("rgba(15,23,42,0.06)", "rgba(148,163,184,0.35)")}>
              <span className="small text-muted">Total</span>{" "}
              <span className="fw-semibold" style={{ color: "#0f172a" }}>
                {stats.total}
              </span>
            </div>
            <div style={statPill("rgba(245,158,11,0.12)", "rgba(245,158,11,0.22)")}>
              <span className="small" style={{ color: "#b45309" }}>
                Pending
              </span>{" "}
              <span className="fw-semibold" style={{ color: "#b45309" }}>
                {stats.pending}
              </span>
            </div>
            <div style={statPill("rgba(16,185,129,0.12)", "rgba(16,185,129,0.22)")}>
              <span className="small" style={{ color: "#059669" }}>
                Confirmed
              </span>{" "}
              <span className="fw-semibold" style={{ color: "#059669" }}>
                {stats.confirmed}
              </span>
            </div>
            <div style={statPill("rgba(239,68,68,0.10)", "rgba(239,68,68,0.20)")}>
              <span className="small" style={{ color: "#dc2626" }}>
                Cancelled
              </span>{" "}
              <span className="fw-semibold" style={{ color: "#dc2626" }}>
                {stats.cancelled}
              </span>
            </div>

            <button className="btn ov-btn-dark" onClick={loadHistory} disabled={loading} style={{ borderRadius: 14 }}>
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
      <div className="ov-card-soft mt-3" style={cardStyle}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-5">
            <div className="ov-label">Search</div>
            <input
              className="form-control ov-input"
              placeholder="Search by reservation no, name, room..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ov-label">Status</div>
            <select className="form-select ov-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ov-label">Room Type</div>
            <select className="form-select ov-input" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div className="col-12 col-md-4 col-lg-2">
            <div className="ov-label">Sort</div>
            <select className="form-select ov-input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
            </select>
          </div>

          <div className="col-12 col-lg-1 d-flex">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => {
                setQ("");
                setStatusFilter("ALL");
                setRoomFilter("ALL");
                setSort("NEWEST");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* MODERN CARD GRID */}
      <div className="mt-3">
        {loading && items.length === 0 ? (
          <div className="ov-card-soft text-center py-5" style={cardStyle}>
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading your reservation history...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ov-card-soft text-center py-5" style={cardStyle}>
            <div
              className="mx-auto mb-2 d-flex align-items-center justify-content-center"
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                background: "rgba(14,165,233,0.14)",
                border: "1px solid rgba(14,165,233,0.22)",
              }}
            >
              <i className="bi bi-calendar-x" style={{ color: "#0284c7", fontSize: 20 }} />
            </div>
            <div className="fw-semibold">No reservations found</div>
            <div className="text-muted small">Try changing filters or create a new reservation.</div>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((r) => {
              const meta = statusMeta(r.status);
              const rm = roomMeta(r.roomType);
              const nights = calcNights(r.checkInDate, r.checkOutDate);

              return (
                <div className="col-12 col-md-6 col-xl-4" key={r.id || r.reservationNo}>
                  <div className="ov-card-soft h-100" style={cardStyle}>
                    {/* card header */}
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
                            {r.reservationNo || "Reservation"}
                          </div>
                          <div className="text-muted small">Created: {fmtDateTime(r.createdAt)}</div>
                        </div>

                        <div
                          className="d-inline-flex align-items-center gap-2"
                          style={{
                            borderRadius: 999,
                            padding: "6px 10px",
                            background: meta.bg,
                            border: `1px solid ${meta.bd}`,
                            color: meta.fg,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <i className={`bi ${meta.icon}`} />
                          {meta.label}
                        </div>
                      </div>
                    </div>

                    {/* body */}
                    <div style={{ padding: 14 }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className={`bi ${rm.icon}`} style={{ color: rm.tone }} />
                        <div className="fw-semibold" style={{ color: "#0f172a" }}>
                          {r.roomType || "Room"}
                        </div>
                        <div className="text-muted small">• {nights || 0} night(s)</div>
                      </div>

                      <div className="d-flex gap-2 flex-wrap mb-2">
                        <div
                          style={{
                            borderRadius: 12,
                            padding: "8px 10px",
                            background: "rgba(15,23,42,0.04)",
                            border: "1px solid rgba(148,163,184,0.30)",
                            flex: "1 1 160px",
                          }}
                        >
                          <div className="small text-muted">Check-in</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {fmtDateOnly(r.checkInDate)}
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 12,
                            padding: "8px 10px",
                            background: "rgba(15,23,42,0.04)",
                            border: "1px solid rgba(148,163,184,0.30)",
                            flex: "1 1 160px",
                          }}
                        >
                          <div className="small text-muted">Check-out</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {fmtDateOnly(r.checkOutDate)}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 flex-wrap">
                        <div
                          style={{
                            borderRadius: 12,
                            padding: "8px 10px",
                            background: "rgba(16,185,129,0.06)",
                            border: "1px solid rgba(16,185,129,0.14)",
                            flex: "1 1 140px",
                          }}
                        >
                          <div className="small text-muted">Guests</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {r.adults} adult(s), {r.children} child(ren)
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: 12,
                            padding: "8px 10px",
                            background: "rgba(14,165,233,0.06)",
                            border: "1px solid rgba(14,165,233,0.14)",
                            flex: "1 1 140px",
                          }}
                        >
                          <div className="small text-muted">Confirmed</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            {r.confirmedAt ? fmtDateTime(r.confirmedAt) : "-"}
                          </div>
                        </div>
                      </div>

                      {r.specialRequests ? (
                        <div
                          className="mt-3"
                          style={{
                            borderRadius: 14,
                            padding: "10px 12px",
                            background: "rgba(99,102,241,0.06)",
                            border: "1px solid rgba(99,102,241,0.14)",
                          }}
                        >
                          <div className="small text-muted">Special requests</div>
                          <div style={{ color: "#334155", whiteSpace: "pre-wrap" }}>{r.specialRequests}</div>
                        </div>
                      ) : null}

                      {/* billing preview (if exists) */}
                      {r.billing ? (
                        <div
                          className="mt-3 d-flex justify-content-between align-items-center"
                          style={{
                            borderRadius: 14,
                            padding: "10px 12px",
                            background: "rgba(245,158,11,0.08)",
                            border: "1px solid rgba(245,158,11,0.18)",
                          }}
                        >
                          <div>
                            <div className="small text-muted">Billing</div>
                            <div className="fw-semibold" style={{ color: "#0f172a" }}>
                              Total: {r.billing.currency} {Number(r.billing.total ?? 0).toFixed(2)}
                            </div>
                          </div>
                          <span
                            className="d-inline-flex align-items-center gap-2"
                            style={{
                              borderRadius: 999,
                              padding: "6px 10px",
                              background: "rgba(16,185,129,0.10)",
                              border: "1px solid rgba(16,185,129,0.18)",
                              color: "#059669",
                              fontWeight: 700,
                            }}
                          >
                            <i className="bi bi-receipt" />
                            READY
                          </span>
                        </div>
                      ) : (
                        <div
                          className="mt-3"
                          style={{
                            borderRadius: 14,
                            padding: "10px 12px",
                            background: "rgba(15,23,42,0.04)",
                            border: "1px solid rgba(148,163,184,0.30)",
                          }}
                        >
                          <div className="small text-muted">Billing</div>
                          <div className="fw-semibold" style={{ color: "#0f172a" }}>
                            Not created yet
                          </div>
                          <div className="text-muted small">You can print a bill after staff/admin creates billing.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-muted small mt-3">
        Showing <b>{filtered.length}</b> of <b>{items.length}</b> reservations for <b>{email || "your account"}</b>.
      </div>
    </div>
  );
}