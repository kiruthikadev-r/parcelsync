import { useEffect, useState } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { formatDateTime } from "../../utils/formatDate";

export default function CompletedDeliveries() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/delivery/completed").then((res) => {
      setAssignments(res.data.assignments.filter((a) => a.status === "Completed"));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Completed Deliveries</h1>
        <p className="mt-0.5 text-sm text-slate-500">Your delivery history.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : assignments.length === 0 ? (
        <EmptyState icon="✅" title="No completed deliveries yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Tracking #</th><th className="px-4 py-3">Receiver</th><th className="px-4 py-3">Delivered On</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-3 font-mono text-brand-700">{a.parcel?.trackingNumber}</td>
                  <td className="px-4 py-3">{a.parcel?.receiver?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(a.parcel?.deliveredAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status="Delivered" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
