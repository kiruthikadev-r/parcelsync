import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import api from "../../services/api";
import EmptyState from "../../components/EmptyState";
import { formatDate } from "../../utils/formatDate";

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const EMPTY_FORM = { name: "", email: "", password: "", phone: "", address: "" };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api.get("/users", { params: { role: "booking_staff" } }).then((res) => {
      setUsers(res.data.users);
      setLoading(false);
    });
  }
  useEffect(load, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }
  function openEdit(u) {
    setEditingId(u.id);
    setForm({ ...EMPTY_FORM, ...u, password: "" });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        toast.success("User updated");
      } else {
        await api.post("/users", { ...form, role: "booking_staff" });
        toast.success("Booking staff account created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save user");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(u) {
    await api.put(`/users/${u.id}/active`, { isActive: !u.isActive });
    toast.success(u.isActive ? "Deactivated" : "Activated");
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="mt-0.5 text-sm text-slate-500">Booking staff accounts — {users.length} total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700">
          <Plus size={15} /> Add Booking Staff
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No booking staff accounts yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(u)} className="mr-2 text-xs font-medium text-brand-600 hover:underline">Edit</button>
                    <button onClick={() => toggleActive(u)} className="text-xs font-medium text-rose-600 hover:underline">
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">{editingId ? "Edit" : "Add"} Booking Staff</h2>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Full Name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Email" disabled={!!editingId} className={`${inputClass} ${editingId ? "bg-slate-50 text-slate-400" : ""}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {!editingId && <input required type="password" placeholder="Password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
              <input placeholder="Phone Number" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input placeholder="Address" className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <button disabled={submitting} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                {submitting ? "Saving..." : editingId ? "Save Changes" : "Add User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
