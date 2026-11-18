import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import api from "../../services/api";
import DeliveryAssignmentCard from "../../components/DeliveryAssignmentCard";
import EmptyState from "../../components/EmptyState";

export default function AssignedParcels() {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search);

  function load() {
    setLoading(true);
    const request = debouncedSearch
      ? api.get("/delivery/search", { params: { trackingNumber: debouncedSearch } })
      : api.get("/delivery/my-parcels");
    request.then((res) => setAssignments(res.data.assignments)).finally(() => setLoading(false));
  }
  useEffect(load, [debouncedSearch]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Assigned Parcels</h1>
        <p className="mt-0.5 text-sm text-slate-500">Everything currently assigned to you.</p>
      </div>

      <input
        placeholder="Search by tracking number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 w-full max-w-sm rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : assignments.length === 0 ? (
        <EmptyState icon="📦" title="No assigned parcels" />
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
