import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { formatDate, formatDateTime } from "../../utils/formatDate";

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function DispatchManagement() {
  const [tab, setTab] = useState("unassigned");
  const [unassigned, setUnassigned] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ deliveryPersonnelId: "", deliveryArea: "", dispatchDate: new Date().toISOString().slice(0, 10) });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      api.get("/dispatch/unassigned"),
      api.get("/dispatch/assignments"),
      api.get("/users", { params: { role: "delivery_personnel" } }),
    ]).then(([u, a, p]) => {
      setUnassigned(u.data.parcels);
      setAssignments(a.data.assignments);
      setPersonnel(p.data.users.filter((x) => x.isActive));
      setLoading(false);
    });
  }
  useEffect(load, []);

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleDispatch(e) {
    e.preventDefault();
    if (selected.length === 0) return toast.error("Select at least one parcel");
    if (!form.deliveryPersonnelId || !form.deliveryArea) return toast.error("Choose delivery personnel and area");

    setSubmitting(true);
    try {
      await api.post("/dispatch", { parcelIds: selected, ...form });
      toast.success(`Dispatched ${selected.length} parcel(s)`);
      setSelected([]);
      setForm({ deliveryPersonnelId: "", deliveryArea: "", dispatchDate: new Date().toISOString().slice(0, 10) });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not dispatch parcels");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Dispatch Management</h1>
        <p className="mt-0.5 text-sm text-slate-500">Assign booked parcels to delivery personnel.</p>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {["unassigned", "assignments"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white text-brand-700 shadow-soft" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "unassigned" ? "Unassigned Parcels" : "All Dispatches"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : tab === "unassigned" ? (
        unassigned.length === 0 ? (
          <EmptyState icon="📦" title="No unassigned parcels" subtitle="Everything booked has been dispatched." />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3"></th>
                    <th className="px-4 py-3">Tracking #</th>
                    <th className="px-4 py-3">Receiver</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Booked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unassigned.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} />
                      </td>
                      <td className="px-4 py-3 font-mono text-brand-700">{p.trackingNumber}</td>
                      <td className="px-4 py-3">{p.receiver.name}</td>
                      <td className="px-4 py-3">{p.receiver.city}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(p.bookingDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleDispatch} className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-sm font-semibold text-slate-700">Dispatch {selected.length} parcel(s)</h2>
              <select className={inputClass} value={form.deliveryPersonnelId} onChange={(e) => setForm({ ...form, deliveryPersonnelId: e.target.value })}>
                <option value="">Select delivery personnel</option>
                {personnel.map((p) => <option key={p.id} value={p.id}>{p.name} {p.assignedArea ? `(${p.assignedArea})` : ""}</option>)}
              </select>
              <input placeholder="Delivery area" className={inputClass} value={form.deliveryArea} onChange={(e) => setForm({ ...form, deliveryArea: e.target.value })} />
              <input type="date" className={inputClass} value={form.dispatchDate} onChange={(e) => setForm({ ...form, dispatchDate: e.target.value })} />
              <button disabled={submitting} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                {submitting ? "Dispatching..." : "Dispatch Selected"}
              </button>
            </form>
          </div>
        )
      ) : assignments.length === 0 ? (
        <EmptyState icon="🚚" title="No dispatches yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Tracking #</th>
                <th className="px-4 py-3">Delivery Personnel</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Dispatched</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-3 font-mono text-brand-700">{a.parcel?.trackingNumber}</td>
                  <td className="px-4 py-3">{a.deliveryPersonnel?.name}</td>
                  <td className="px-4 py-3">{a.deliveryArea}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(a.dispatchDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
