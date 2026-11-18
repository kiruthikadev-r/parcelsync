import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Package, CheckCircle2, Clock } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";

export default function BookingDashboard() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/parcels", { params: { limit: 100 } }).then((res) => {
      setParcels(res.data.parcels);
      setLoading(false);
    });
  }, []);

  const delivered = parcels.filter((p) => p.status === "Delivered").length;
  const pending = parcels.filter((p) => ["Booked", "Dispatched", "In Transit", "Out for Delivery"].includes(p.status)).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="mt-0.5 text-sm text-slate-500">Your bookings at a glance.</p>
        </div>
        <Link to="/booking/parcels/new" className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700">
          <Plus size={15} /> New Parcel Booking
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="My Bookings" value={parcels.length} icon={<Package size={16} />} accent="brand" />
        <StatCard label="In Progress" value={pending} icon={<Clock size={16} />} accent="amber" />
        <StatCard label="Delivered" value={delivered} icon={<CheckCircle2 size={16} />} accent="emerald" />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Recent Bookings</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : parcels.length === 0 ? (
          <EmptyState icon="📦" title="No bookings yet" action={<Link to="/booking/parcels/new" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Create your first booking</Link>} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
            <div className="divide-y divide-slate-100">
              {parcels.slice(0, 5).map((p) => (
                <Link key={p._id} to={`/booking/parcels/${p._id}`} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div>
                    <p className="font-mono text-sm font-medium text-brand-700">{p.trackingNumber}</p>
                    <p className="text-xs text-slate-500">{p.sender.name} → {p.receiver.name} · {formatDate(p.bookingDate)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
