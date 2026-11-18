import { useEffect, useState } from "react";
import api from "../../services/api";
import DeliveryAssignmentCard from "../../components/DeliveryAssignmentCard";
import EmptyState from "../../components/EmptyState";

export default function TodayDeliveries() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/delivery/today").then((res) => setAssignments(res.data.assignments)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Today's Deliveries</h1>
        <p className="mt-0.5 text-sm text-slate-500">Parcels dispatched to you today.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : assignments.length === 0 ? (
        <EmptyState icon="📅" title="Nothing scheduled for today" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignments.map((a) => (
            <DeliveryAssignmentCard key={a._id} assignment={a} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
}
