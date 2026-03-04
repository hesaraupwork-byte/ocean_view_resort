import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";

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

export default function AdminUsers() {
  const navigate = useNavigate();

  // basic admin guard (frontend)
  useEffect(() => {
    const token = localStorage.getItem("ov_token");
    const role = (localStorage.getItem("ov_role") || "").toUpperCase();
    if (!token) navigate("/login", { replace: true });
    else if (role !== "ADMIN") navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({ type: "", msg: "" }); // success/error
  useEffect(() => {
    if (!alert.msg) return;
    const t = setTimeout(() => setAlert({ type: "", msg: "" }), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  // filters
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | DISABLED

  // add/edit modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // confirm modal (disable/delete)
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Yes",
    cancelText: "Cancel",
    danger: false,
    onConfirm: null,
  });

  const anyModalOpen = showAdd || showEdit || confirm.open;

  // ✅ lock scroll when any modal open
  useEffect(() => {
    if (anyModalOpen) document.body.classList.add("ov-no-scroll");
    else document.body.classList.remove("ov-no-scroll");
    return () => document.body.classList.remove("ov-no-scroll");
  }, [anyModalOpen]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // backend may return empty body
      }

      if (!res.ok) {
        setAlert({
          type: "error",
          msg: data?.message || data?.error || "Failed to load users.",
        });
        return;
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filtered list in UI only
  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return users.filter((u) => {
      const matchKeyword =
        !keyword ||
        (u.fullName || "").toLowerCase().includes(keyword) ||
        (u.email || "").toLowerCase().includes(keyword) ||
        (u.phone || "").toLowerCase().includes(keyword) ||
        (u.role || "").toLowerCase().includes(keyword);

      const matchRole = roleFilter === "ALL" || (u.role || "") === roleFilter;

      const active = !!u.active;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "DISABLED" && !active);

      return matchKeyword && matchRole && matchStatus;
    });
  }, [users, q, roleFilter, statusFilter]);

  // ===== Actions (API) =====
  async function disableUser(u) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users/${u.id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch {
            // backend may return empty body
        }
        setAlert({
          type: "error",
          msg: data?.message || data?.error || "Failed to disable user.",
        });
        return;
      }

      setAlert({ type: "success", msg: "User disabled successfully." });
      await fetchUsers();
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function hardDeleteUser(u) {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users/${u.id}/hard`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch {
            // backend may return empty body
        }
        setAlert({
          type: "error",
          msg: data?.message || data?.error || "Failed to delete user.",
        });
        return;
      }

      setAlert({ type: "success", msg: "User deleted permanently." });
      await fetchUsers();
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // ===== Confirmation popup openers =====
  function askDisable(u) {
    setConfirm({
      open: true,
      title: "Disable User",
      message: `Are you sure you want to disable "${u.fullName}" (${u.email})?`,
      confirmText: "Disable",
      cancelText: "Cancel",
      danger: false,
      onConfirm: async () => {
        closeConfirm();
        await disableUser(u);
      },
    });
  }

  function askDelete(u) {
    setConfirm({
      open: true,
      title: "Delete User",
      message: `Are you sure you want to permanently delete "${u.fullName}" (${u.email})? This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
      onConfirm: async () => {
        closeConfirm();
        await hardDeleteUser(u);
      },
    });
  }

  function closeConfirm() {
    setConfirm((p) => ({ ...p, open: false, onConfirm: null }));
  }

  function openEdit(u) {
    setEditUser(u);
    setShowEdit(true);
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 className="ov-h2 mb-1">User Management</h2>
          <div className="text-muted">
          </div>
        </div>

        <div className="d-flex gap-2">
          
          <button className="btn ov-btn" onClick={() => setShowAdd(true)}>
            <i className="bi bi-person-plus me-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Alert */}
      {alert.msg && (
        <div
          className={`ov-alert mt-3 ${
            alert.type === "success" ? "ov-alert-success" : "ov-alert-error"
          }`}
        >
          {alert.msg}
        </div>
      )}

      {/* Filters */}
      <div className="ov-card-soft mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="ov-label">Search</div>
            <input
              className="form-control ov-input"
              placeholder="Search by name, email, phone, role..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Role</div>
            <select
              className="form-select ov-input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <div className="ov-label">Status</div>
            <select
              className="form-select ov-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div className="col-12 col-lg-3 d-flex gap-2">
            <button
              className="btn ov-btn-outline w-100"
              onClick={() => {
                setQ("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Reset Filters
            </button>
            <button
              className="btn ov-btn-dark w-100"
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ov-card-soft mt-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="fw-bold">Users ({filtered.length})</div>
          
        </div>

        <div className="table-responsive mt-3">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{u.fullName || "-"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge text-bg-secondary">{u.role}</span>
                    </td>
                    <td>
                      {u.active ? (
                        <span className="badge text-bg-success">Active</span>
                      ) : (
                        <span className="badge text-bg-danger">Disabled</span>
                      )}
                    </td>
                    <td>{fmtDate(u.createdAt)}</td>

                    {/* smaller buttons */}
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button
                          className="btn ov-btn-soft ov-btn-xs"
                          onClick={() => openEdit(u)}
                          title="Edit user"
                        >
                          <i className="bi bi-pencil-square me-1" />
                          Edit
                        </button>

                        <button
                          className="btn ov-btn-soft ov-btn-xs"
                          onClick={() => askDisable(u)}
                          disabled={!u.active}
                          title={u.active ? "Disable user" : "Already disabled"}
                        >
                          <i className="bi bi-person-x me-1" />
                          Disable
                        </button>

                        <button
                          className="btn ov-btn-danger-soft ov-btn-xs"
                          onClick={() => askDelete(u)}
                          title="Delete permanently"
                        >
                          <i className="bi bi-trash me-1" />
                          Delete
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

      {/* Add/Edit Modals */}
      {showAdd && (
        <UserModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSaved={async () => {
            setShowAdd(false);
            setAlert({ type: "success", msg: "User created successfully." });
            await fetchUsers();
          }}
          onError={(msg) => setAlert({ type: "error", msg })}
        />
      )}

      {showEdit && editUser && (
        <UserModal
          mode="edit"
          user={editUser}
          onClose={() => {
            setShowEdit(false);
            setEditUser(null);
          }}
          onSaved={async () => {
            setShowEdit(false);
            setEditUser(null);
            setAlert({ type: "success", msg: "User updated successfully." });
            await fetchUsers();
          }}
          onError={(msg) => setAlert({ type: "error", msg })}
        />
      )}

      {/* Confirm Modal */}
      {confirm.open && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          danger={confirm.danger}
          onCancel={closeConfirm}
          onConfirm={confirm.onConfirm}
        />
      )}
    </div>
  );
}

/* =========================
   USER ADD/EDIT MODAL
========================= */
function UserModal({ mode, user, onClose, onSaved, onError }) {
  const isAdd = mode === "add";

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "CUSTOMER",
    active: typeof user?.active === "boolean" ? user.active : true,
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
  });

  // ESC to close
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
    const next = { fullName: "", email: "", role: "", password: "" };

    if (!form.fullName.trim()) next.fullName = "Full name is required.";

    const email = form.email.trim();
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email.";

    if (!form.role) next.role = "Role is required.";

    if (isAdd) {
      if (!form.password) next.password = "Password is required.";
      else if (form.password.length < 6) next.password = "Min 6 characters.";
    }

    setErrors(next);
    return !next.fullName && !next.email && !next.role && !next.password;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      if (isAdd) {
        const res = await fetch(`/api/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            role: form.role,
            active: !!form.active,
            password: form.password,
          }),
        });

        let data = null;
        try {
          data = await res.json();
        } catch {
            // backend may return empty body
        }

        if (!res.ok) {
          onError(data?.message || data?.error || "Failed to create user.");
          return;
        }

        onSaved();
        return;
      }

      // EDIT (no password)
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: form.role,
          active: !!form.active,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // backend may return empty body
      }

      if (!res.ok) {
        onError(data?.message || data?.error || "Failed to update user.");
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

  return createPortal(
    <div className="ov-modal-backdrop" onMouseDown={onBackdropClick}>
      <div className="ov-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="ov-h4 mb-0">{isAdd ? "Add User" : "Update User"}</h4>
          <button className="btn ov-btn-outline" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>

        <div className="ov-divider" />

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-3">
            <div className="ov-label">Full Name</div>
            <input
              className={`form-control ov-input ${errors.fullName ? "is-invalid" : ""}`}
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              disabled={loading}
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>

          <div className="mb-3">
            <div className="ov-label">Email</div>
            <input
              type="email"
              className={`form-control ov-input ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              disabled={loading}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="ov-label">Role</div>
              <select
                className={`form-select ov-input ${errors.role ? "is-invalid" : ""}`}
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                disabled={loading}
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {errors.role && <div className="invalid-feedback">{errors.role}</div>}
            </div>

            <div className="col-12 col-md-6">
              <div className="ov-label">Status</div>
              <select
                className="form-select ov-input"
                value={String(form.active)}
                onChange={(e) => setField("active", e.target.value === "true")}
                disabled={loading}
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          {isAdd && (
            <div className="mt-3">
              <div className="ov-label">Password</div>
              <div className="input-group">
                <input
                  type={showPw ? "text" : "password"}
                  className={`form-control ov-input ${errors.password ? "is-invalid" : ""}`}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn ov-btn-outline"
                  onClick={() => setShowPw((p) => !p)}
                  disabled={loading}
                  title={showPw ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>

              {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
              <div className="ov-form-note">
                Admin cannot change passwords later (only set on create).
              </div>
            </div>
          )}

          <div className="d-flex gap-2 mt-4">
            <button className="btn ov-btn-dark w-100" type="submit" disabled={loading}>
              {loading ? "Saving..." : isAdd ? "Create User" : "Update User"}
            </button>
            <button className="btn ov-btn-outline w-100" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* =========================
   CONFIRM MODAL
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
  // ESC to cancel
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