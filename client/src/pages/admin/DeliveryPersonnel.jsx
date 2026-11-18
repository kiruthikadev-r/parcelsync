import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import api from "../../services/api";
import EmptyState from "../../components/EmptyState";

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", address: "", username: "", assignedArea: "" };

export default function DeliveryPersonnel() {
  const [personnel, setPersonnel] = useState([]);
  const [performance, setPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api.get("/users", { params: { role: "delivery_personnel" } }).then(async (res) => {
      setPersonnel(res.data.users);
      const perfEntries = await Promise.all(
        res.data.users.map((u) => api.get(`/users/${u.id}/performance`).then((r) => [u.id, r.data]))
      );
      setPerformance(Object.fromEntries(perfEntries));
      setLoading(false);
    });
  }
  useEffect(load, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }
  function openEdit(person) {
    setEditingId(person.id);
    setForm({ ...EMPTY_FORM, ...person, password: "" });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        toast.success("Delivery personnel updated");
      } else {
        await api.post("/users", { ...form, role: "delivery_personnel" });
        toast.success("Delivery personnel added");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save delivery personnel");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(person) {
    await api.put(`/users/${person.id}/active`, { isActive: !person.isActive });
    toast.success(person.isActive ? "Deactivated" : "Activated");
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Delivery Personnel</h1>
          <p className="mt-0.5 text-sm text-slate-500">{personnel.length} total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700">
          <Plus size={15} /> Add Delivery Personnel
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : personnel.length === 0 ? (
        <EmptyState icon="🧑‍✈️" title="No delivery personnel yet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personnel.map((p) => {
            const perf = performance[p.id] || { assigned: 0, completed: 0, failed: 0 };
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Area: {p.assignedArea || "—"}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 py-2"><p className="font-bold text-slate-900">{perf.assigned}</p><p className="text-slate-400">Assigned</p></div>
                  <div className="rounded-lg bg-emerald-50 py-2"><p className="font-bold text-emerald-700">{perf.completed}</p><p className="text-slate-400">Completed</p></div>
                  <div className="rounded-lg bg-rose-50 py-2"><p className="font-bold text-rose-700">{perf.failed}</p><p className="text-slate-400">Failed</p></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 rounded-lg border border-slate-300 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                  <button onClick={() => toggleActive(p)} className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${p.isActive ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                    {p.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">{editingId ? "Edit" : "Add"} Delivery Personnel</h2>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Full Name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Email" disabled={!!editingId} className={`${inputClass} ${editingId ? "bg-slate-50 text-slate-400" : ""}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {!editingId && <input required type="password" placeholder="Password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
              <input placeholder="Phone Number" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input placeholder="Address" className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input placeholder="Username" className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              <input placeholder="Assigned Delivery Area" className={inputClass} value={form.assignedArea} onChange={(e) => setForm({ ...form, assignedArea: e.target.value })} />
              <button disabled={submitting} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Personnel"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
