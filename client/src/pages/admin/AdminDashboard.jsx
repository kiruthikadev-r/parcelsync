import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Package, CalendarClock, Truck, Navigation, CheckCircle2, Clock, Undo2, Users } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { formatDateTime } from "../../utils/formatDate";

const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8", "#1e3a8a", "#bfdbfe", "#94a3b8"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data));
    api.get("/dashboard/recent-activity").then((res) => setActivity(res.data));
  }, []);

  if (!stats) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">Operations overview, all real-time from the database.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Parcels" value={stats.totalParcels} icon={<Package size={16} />} accent="brand" />
        <StatCard label="Today's Bookings" value={stats.todaysBookings} icon={<CalendarClock size={16} />} accent="slate" />
        <StatCard label="In Transit" value={stats.inTransit} icon={<Truck size={16} />} accent="violet" />
        <StatCard label="Out for Delivery" value={stats.outForDelivery} icon={<Navigation size={16} />} accent="amber" />
        <StatCard label="Delivered" value={stats.delivered} icon={<CheckCircle2 size={16} />} accent="emerald" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock size={16} />} accent="amber" />
        <StatCard label="Returned" value={stats.returned} icon={<Undo2 size={16} />} accent="rose" />
        <StatCard label="Delivery Personnel" value={stats.totalDeliveryPersonnel} icon={<Users size={16} />} accent="slate" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Monthly Parcel Booking Statistics</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.monthlyBookings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
              <YAxis allowDecimals={false} fontSize={12} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Delivery Status Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stats.statusDistribution} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {stats.statusDistribution.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Weekly Booking Trends</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" fontSize={11} stroke="#94a3b8" />
              <YAxis allowDecimals={false} fontSize={12} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Successful vs Failed Deliveries</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { label: "Successful", count: stats.successfulDeliveries },
                { label: "Failed", count: stats.failedDeliveries },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" fontSize={12} stroke="#94a3b8" />
              <YAxis allowDecimals={false} fontSize={12} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#f43f5e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {activity && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
            <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">Recent Bookings</h2>
            <div className="divide-y divide-slate-100">
              {activity.recentBookings.map((p) => (
                <Link key={p._id} to={`/admin/parcels/${p._id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-mono text-sm font-medium text-slate-900">{p.trackingNumber}</p>
                    <p className="text-xs text-slate-500">{p.sender.name} → {p.receiver.name}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
            <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">Recent Delivery Activity</h2>
            <div className="divide-y divide-slate-100">
              {activity.recentActivity.map((h) => (
                <div key={h._id} className="px-5 py-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-mono font-medium">{h.parcel?.trackingNumber}</span> → {h.status}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(h.createdAt)} · {h.updatedBy?.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
