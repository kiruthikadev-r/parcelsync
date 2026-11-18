import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import EmptyState from "../../components/EmptyState";
import DeliveryAssignmentCard from "../../components/DeliveryAssignmentCard";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [assigned, setAssigned] = useState([]);
  const [today, setToday] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([api.get("/delivery/my-parcels"), api.get("/delivery/today"), api.get("/delivery/completed")]).then(
      ([a, t, h]) => {
        setAssigned(a.data.assignments);
        setToday(t.data.assignments);
        setHistory(h.data.assignments);
        setLoading(false);
      }
    );
  }
  useEffect(load, []);

  const completed = history.filter((a) => a.status === "Completed").length;
  const failed = history.filter((a) => a.status === "Failed").length;

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="mt-0.5 text-sm text-slate-500">Area: {user.assignedArea || "Not assigned"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Assigned" value={assigned.length} icon={<Package size={16} />} accent="brand" />
        <StatCard label="Today" value={today.length} icon={<CalendarClock size={16} />} accent="amber" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 size={16} />} accent="emerald" />
        <StatCard label="Failed" value={failed} icon={<XCircle size={16} />} accent="rose" />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Today's Deliveries</h2>
          <Link to="/delivery/today" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>
        </div>
        {today.length === 0 ? (
          <EmptyState icon="📅" title="Nothing scheduled for today" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {today.slice(0, 4).map((a) => <DeliveryAssignmentCard key={a._id} assignment={a} onUpdated={load} />)}
          </div>
        )}
      </section>
    </div>
  );
}
