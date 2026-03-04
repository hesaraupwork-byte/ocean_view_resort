// src/pages/staff/StaffQuestions.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const API_BASE = ""; // keep "" if using proxy

function authHeader() {
  const token = localStorage.getItem("ov_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ backend paths (your controller)
const API = {
  LIST: "/api/questions", // GET
  GET_ONE: (questionId) => `/api/questions/${questionId}`, // GET
  ANSWER: (questionId) => `/api/questions/${questionId}/answer`, // PATCH
};

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
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
   Question View/Answer Modal
========================= */
function QuestionModal({ question, onClose, onSaved, onError }) {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(question?.answerMessage || question?.answer || "");
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(null);

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

  function onBackdropClick(e) {
    if (e.target.classList.contains("ov-modal-backdrop")) onClose();
  }

  function validate() {
    const v = answer.trim();
    if (!v) return "Answer is required.";
    if (v.length < 5) return "Answer is too short.";
    return "";
  }

  async function sendAnswer() {
    const e = validate();
    setErr(e);
    if (e) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}${API.ANSWER(question.questionId || question.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          answer: answer.trim(),
          answerMessage: answer.trim(),
          replyMessage: answer.trim(),
          message: answer.trim(),
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse error
      }

      if (!res.ok) {
        onError(data?.message || data?.error || "Failed to send answer.");
        return;
      }

      onSaved();
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const qid = question?.questionId || question?.id || "-";
  const name = question?.customerName || question?.name || "-";
  const email = question?.customerEmail || question?.email || "-";
  const subject = question?.subject || "-";
  const msg = question?.message || question?.customerMessage || "-";

  const answered = !!(question?.answeredAt || question?.answerAt || question?.answerMessage || question?.answer);

  return createPortal(
    <>
      <div className="ov-modal-backdrop" onMouseDown={onBackdropClick}>
        <div className="ov-modal" onMouseDown={(e) => e.stopPropagation()}>
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>
              <h4 className="ov-h4 mb-0">Question: {qid}</h4>
              <div className="text-muted small">
                Status: <span className="fw-semibold">{answered ? "ANSWERED" : "PENDING"}</span>
              </div>
            </div>

            <button className="btn ov-btn-outline" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>

          <div className="ov-divider" />

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="ov-label">Customer Name</div>
              <div className="ov-card-soft p-3">{name}</div>
            </div>

            <div className="col-12 col-md-6">
              <div className="ov-label">Customer Email</div>
              <div className="ov-card-soft p-3">{email}</div>
            </div>

            <div className="col-12">
              <div className="ov-label">Subject</div>
              <div className="ov-card-soft p-3">{subject}</div>
            </div>

            <div className="col-12">
              <div className="ov-label">Message</div>
              <div className="ov-card-soft p-3" style={{ whiteSpace: "pre-wrap" }}>
                {msg}
              </div>
            </div>
          </div>

          <div className="ov-divider" />

          <div className="ov-label">Answer</div>
          <textarea
            className={`form-control ov-input ${err ? "is-invalid" : ""}`}
            rows="5"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setErr("");
            }}
            placeholder="Type the answer message here..."
            disabled={loading}
          />
          {err && <div className="invalid-feedback d-block">{err}</div>}

          <div className="ov-form-note mt-2">
            This answer will be sent to the customer email (backend sends email).
          </div>

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn ov-btn-dark w-100"
              type="button"
              disabled={loading}
              onClick={() =>
                setConfirm({
                  title: "Send Answer",
                  message: "Are you sure you want to send this answer to the customer?",
                  confirmText: "Send",
                  danger: false,
                  onConfirm: async () => {
                    setConfirm(null);
                    await sendAnswer();
                  },
                })
              }
            >
              {loading ? "Sending..." : "Send Answer"}
            </button>

            <button className="btn ov-btn-outline w-100" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
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
   Staff Questions Page
========================= */
export default function StaffQuestions() {
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | ANSWERED

  const [selected, setSelected] = useState(null);

  async function fetchQuestions() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${API.LIST}`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse error
      }

      if (!res.ok) {
        setAlert({ type: "error", msg: data?.message || data?.error || "Failed to load questions." });
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
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openQuestion(q) {
    try {
      setLoading(true);
      const qid = q.questionId || q.id;
      if (!qid) {
        setSelected(q);
        return;
      }

      const res = await fetch(`${API_BASE}${API.GET_ONE(qid)}`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse error
      }

      if (!res.ok) {
        setSelected(q);
        return;
      }

      setSelected(data);
    } catch {
      setSelected(q);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();

    return items.filter((x) => {
      const qid = String(x.questionId || x.id || "").toLowerCase();
      const name = String(x.customerName || x.name || "").toLowerCase();
      const email = String(x.customerEmail || x.email || "").toLowerCase();
      const subject = String(x.subject || "").toLowerCase();
      const msg = String(x.message || x.customerMessage || "").toLowerCase();

      const answered = !!(x.answeredAt || x.answerAt || x.answerMessage || x.answer);

      const matchKeyword =
        !k || qid.includes(k) || name.includes(k) || email.includes(k) || subject.includes(k) || msg.includes(k);

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && !answered) ||
        (statusFilter === "ANSWERED" && answered);

      return matchKeyword && matchStatus;
    });
  }, [items, search, statusFilter]);

  function statusBadge(answered) {
    return answered ? (
      <span className="badge text-bg-success">ANSWERED</span>
    ) : (
      <span className="badge text-bg-warning">PENDING</span>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="ov-h2 mb-1">Question History</h2>
        </div>

        <button className="btn ov-btn-dark" onClick={fetchQuestions} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
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
          <div className="col-12 col-md-8 col-lg-6">
            <div className="ov-label">Search</div>
            <input
              className="form-control ov-input"
              placeholder="Search by question id, name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div className="ov-label">Status</div>
            <select
              className="form-select ov-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="ANSWERED">Answered</option>
            </select>
          </div>

          <div className="col-12 col-lg-4 d-flex gap-2">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="ov-card-soft mt-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="fw-bold">Questions ({filtered.length})</div>
          <div className="text-muted small">Click View/Answer to reply and send email.</div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Question ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading questions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No questions found.
                  </td>
                </tr>
              ) : (
                filtered.map((x, idx) => {
                  const answered = !!(x.answeredAt || x.answerAt || x.answerMessage || x.answer);

                  return (
                    <tr key={x.questionId || x.id || idx}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{x.questionId || x.id || "-"}</td>
                      <td>
                        <div className="fw-semibold">{x.customerName || x.name || "-"}</div>
                        <div className="text-muted small">{x.customerEmail || x.email || "-"}</div>
                      </td>
                      <td className="fw-semibold">{x.subject || "-"}</td>
                      <td>{statusBadge(answered)}</td>
                      <td>{fmtDate(x.createdAt)}</td>
                      <td className="text-end">
                        <button className="btn ov-btn-soft ov-btn-xs" onClick={() => openQuestion(x)}>
                          <i className="bi bi-reply me-1" />
                          View / Answer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal */}
      {selected && (
        <QuestionModal
          question={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => {
            setSelected(null);
            setAlert({ type: "success", msg: "Answer sent successfully." });
            await fetchQuestions();
          }}
          onError={(msg) => setAlert({ type: "error", msg })}
        />
      )}
    </div>
  );
}