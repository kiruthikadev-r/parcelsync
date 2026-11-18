import { useEffect, useState } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

export default function FailedDeliveries() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/delivery/completed").then((res) => {
      setAssignments(res.data.assignments.filter((a) => a.status === "Failed"));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Failed Deliveries</h1>
        <p className="mt-0.5 text-sm text-slate-500">Delivery attempts that were unsuccessful.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : assignments.length === 0 ? (
        <EmptyState icon="⚠️" title="No failed deliveries" />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a._id} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold text-slate-900">{a.parcel?.trackingNumber}</p>
                <StatusBadge status="Returned" />
              </div>
              <p className="mt-1 text-sm text-slate-600">{a.parcel?.receiver?.name}</p>
              {a.parcel?.failureReason && <p className="mt-1 text-sm text-rose-700">Reason: {a.parcel.failureReason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
