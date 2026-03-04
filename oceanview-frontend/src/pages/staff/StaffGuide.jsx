// src/pages/staff/StaffGuide.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

/**
 * Staff Guide Page (Idea)
 * - Quick operational guide for STAFF users
 * - Search + category filter
 * - Expand/collapse sections
 * - Checklist modal for daily duties
 * - Notes are stored in localStorage (simple, no backend needed)
 */

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

function ChecklistModal({ checklist, setChecklist, onClose }) {
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

  function toggle(id) {
    setChecklist((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  const doneCount = checklist.filter((x) => x.done).length;

  return createPortal(
    <div className="ov-modal-backdrop" onMouseDown={onBackdropClick}>
      <div className="ov-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="ov-h4 mb-0">Daily Checklist</h4>
            <div className="text-muted small">
              Completed - <span className="fw-semibold">{doneCount}</span> / {checklist.length}
            </div>
          </div>
          <button className="btn ov-btn-outline" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="ov-divider" />

        <div className="d-flex flex-column gap-2">
          {checklist.map((x) => (
            <label
              key={x.id}
              className="ov-card-soft p-3 d-flex align-items-start gap-3"
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={!!x.done}
                onChange={() => toggle(x.id)}
                style={{ marginTop: 5 }}
              />
              <div>
                <div className="fw-semibold">{x.title}</div>
                <div className="text-muted small">{x.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="d-flex gap-2 mt-4">
          <button
            className="btn ov-btn-outline w-100"
            type="button"
            onClick={() => setChecklist((prev) => prev.map((x) => ({ ...x, done: false })))}
          >
            Reset Checklist
          </button>
          <button className="btn ov-btn-dark w-100" type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function StaffGuide() {
  const navigate = useNavigate();

  // ✅ staff guard
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = (localStorage.getItem("ov_role") || "").toUpperCase();
    if (!token) navigate("/login", { replace: true });
    else if (role !== "STAFF") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GUIDE = useMemo(
    () => [
      {
        id: "res-1",
        category: "Reservations",
        icon: "bi-calendar2-check",
        title: "Confirm a reservation",
        steps: [
          "Open Staff → Reservations.",
          "Use Search/Filters to find the reservation number or customer.",
          "Click Confirm to set status as CONFIRMED (customer gets an email automatically).",
          "If needed, click View/Edit to update dates, guests, room type, or notes before confirming.",
        ],
        tips: [
          "Always re-check check-in/check-out dates before confirming.",
          "If the customer email looks wrong, edit it first (so confirmation email is delivered).",
        ],
      },
      {
        id: "res-2",
        category: "Reservations",
        icon: "bi-x-circle",
        title: "Cancel a reservation",
        steps: [
          "Open Staff → Reservations.",
          "Click Cancel on the reservation row.",
          "Confirm the action in the popup.",
          "Add special notes inside View/Edit (optional) before cancelling.",
        ],
        tips: ["Cancel only after confirming with customer or management policy."],
      },
      {
        id: "bill-1",
        category: "Billing",
        icon: "bi-receipt",
        title: "Create / update a bill",
        steps: [
          "Open Staff → Bills.",
          "Search reservation number / customer.",
          "Click Create Bill or View/Update.",
          "Fill room rate, tax/service charge (optional) and discount.",
          "Save and download invoice PDF (if available).",
        ],
        tips: [
          "Check number of nights is correct (system calculates it from dates).",
          "Use discount only if approved (add note to explain reason).",
        ],
      },
      {
        id: "q-1",
        category: "Questions",
        icon: "bi-chat-dots",
        title: "Reply to customer questions",
        steps: [
          "Open Staff → Questions.",
          "Filter PENDING to see unanswered questions.",
          "Click View / Answer.",
          "Type a clear reply and send (email will be sent automatically by backend).",
        ],
        tips: [
          "Keep replies short and polite.",
          "If it’s a policy question (refunds/discounts), confirm with admin before replying.",
        ],
      },
      {
        id: "sec-1",
        category: "Security",
        icon: "bi-shield-lock",
        title: "Security best practices",
        steps: [
          "Never share your password or OTP with anyone.",
          "Logout when leaving your desk.",
          "Use strong passwords (min 8+ characters is recommended).",
          "Report suspicious reservations or emails to admin.",
        ],
        tips: [
          "If you think your account is compromised, change password immediately from Profile.",
        ],
      },
      {
        id: "ops-1",
        category: "Operations",
        icon: "bi-journal-check",
        title: "Daily shift workflow (recommended)",
        steps: [
          "Check new PENDING reservations → confirm or contact customer.",
          "Check cancellations and update room availability.",
          "Review questions → answer pending items.",
          "Review billing → ensure confirmed reservations have bills where needed.",
          "Write your shift notes before logout.",
        ],
        tips: ["Use the Daily Checklist button in this page to keep track."],
      },
    ],
    []
  );

  const CATEGORIES = useMemo(() => {
    const all = Array.from(new Set(GUIDE.map((x) => x.category)));
    return ["All", ...all];
  }, [GUIDE]);

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);

  // notes (local only)
  const [notes, setNotes] = useState(() => localStorage.getItem("ov_staff_notes") || "");

  const [confirmClear, setConfirmClear] = useState(false);

  // checklist (local only)
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklist, setChecklist] = useState(() => {
    try {
      const raw = localStorage.getItem("ov_staff_checklist");
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      { id: "c1", title: "Review PENDING reservations", desc: "Confirm/Cancel or update details", done: false },
      { id: "c2", title: "Check Questions inbox", desc: "Answer pending customer questions", done: false },
      { id: "c3", title: "Verify Bills", desc: "Create/update billing for confirmed reservations", done: false },
      { id: "c4", title: "Write shift notes", desc: "Record important actions and issues", done: false },
      { id: "c5", title: "Logout safely", desc: "Logout before leaving workstation", done: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem("ov_staff_notes", notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("ov_staff_checklist", JSON.stringify(checklist));
  }, [checklist]);

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();

    return GUIDE.filter((x) => {
      const matchCat = category === "All" || x.category === category;
      const matchText =
        !k ||
        x.title.toLowerCase().includes(k) ||
        x.category.toLowerCase().includes(k) ||
        x.steps.some((s) => s.toLowerCase().includes(k)) ||
        x.tips.some((t) => t.toLowerCase().includes(k));
      return matchCat && matchText;
    });
  }, [GUIDE, category, search]);

  function toggleOpen(id) {
    setOpenId((p) => (p === id ? null : id));
  }

  return (
    <div className="container-fluid py-4">
      {/* header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="ov-h2 mb-1">Staff Guide</h2>
         
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn ov-btn-outline" onClick={() => setShowChecklist(true)}>
            <i className="bi bi-list-check me-2" />
            Daily Checklist
          </button>
          <button className="btn ov-btn-dark" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
            <i className="bi bi-stickies me-2" />
            Shift Notes
          </button>
        </div>
      </div>

      {/* quick links */}
      <div className="ov-card-soft mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="ov-label">Search in guide</div>
            <input
              className="form-control ov-input"
              placeholder="Type keywords (confirm, cancel, bill, answer...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="ov-label">Category</div>
            <select className="form-select ov-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-lg-4 d-flex gap-2">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setOpenId(null);
              }}
            >
              Reset
            </button>
            <button className="btn ov-btn-dark w-100" onClick={() => navigate("/staff/reservations")}>
              <i className="bi bi-arrow-right-circle me-2" />
              Go Reservations
            </button>
          </div>
        </div>
      </div>

      {/* guide cards */}
      <div className="row g-3 mt-1">
        {filtered.length === 0 ? (
          <div className="col-12">
            <div className="ov-card-soft p-4 text-center">
              No guide items found for your search.
            </div>
          </div>
        ) : (
          filtered.map((g) => {
            const open = openId === g.id;
            return (
              <div className="col-12 col-lg-6" key={g.id}>
                <div className="ov-card-soft">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="d-flex gap-3">
                      <div className="ov-info-ic">
                        <i className={`bi ${g.icon}`} />
                      </div>
                      <div>
                        <div className="text-muted small">{g.category}</div>
                        <div className="fw-bold">{g.title}</div>
                      </div>
                    </div>

                    <button className="btn ov-btn-soft ov-btn-xs" onClick={() => toggleOpen(g.id)}>
                      {open ? (
                        <>
                          <i className="bi bi-chevron-up me-1" /> Hide
                        </>
                      ) : (
                        <>
                          <i className="bi bi-chevron-down me-1" /> View
                        </>
                      )}
                    </button>
                  </div>

                  {open && (
                    <>
                      <div className="ov-divider" />

                      <div className="ov-label">Steps</div>
                      <ol className="mb-3" style={{ color: "#374151" }}>
                        {g.steps.map((s, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>
                            {s}
                          </li>
                        ))}
                      </ol>

                      <div className="ov-label">Tips</div>
                      <ul className="mb-0" style={{ color: "#374151" }}>
                        {g.tips.map((t, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* notes */}
      <div className="ov-card-soft mt-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="ov-h4 mb-0">Shift Notes (local)</h4>
            <div className="text-muted small">
              These notes save in your browser (localStorage). Admin can’t see them unless you share.
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn ov-btn-outline" onClick={() => setConfirmClear(true)}>
              <i className="bi bi-trash me-2" />
              Clear Notes
            </button>
          </div>
        </div>

        <div className="ov-divider" />

        <textarea
          className="form-control ov-input"
          rows="6"
          placeholder={`Example
- Confirmed OV-00012 (customer asked early check-in)
- Pending: OV-00015 needs phone confirmation
- Billing updated for OV-00010 (discount approved by admin)
`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

      </div>

      {showChecklist && (
        <ChecklistModal
          checklist={checklist}
          setChecklist={setChecklist}
          onClose={() => setShowChecklist(false)}
        />
      )}

      {confirmClear && (
        <ConfirmModal
          title="Clear Notes"
          message="Are you sure you want to clear your shift notes? This cannot be undone."
          confirmText="Clear"
          cancelText="Back"
          danger
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            setConfirmClear(false);
            setNotes("");
          }}
        />
      )}
    </div>
  );
}