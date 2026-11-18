import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Download } from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { formatDate } from "../../utils/formatDate";

const TABS = [
  { key: "bookings", label: "Booking Report" },
  { key: "delivery-performance", label: "Delivery Performance" },
  { key: "personnel-performance", label: "Personnel Performance" },
  { key: "pending", label: "Pending Parcels" },
  { key: "returned", label: "Returned Parcels" },
];

const inputClass = "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function Reports() {
  const [tab, setTab] = useState("bookings");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [period, setPeriod] = useState("daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { fromDate: fromDate || undefined, toDate: toDate || undefined };
    if (tab === "bookings") params.period = period;

    api.get(`/reports/${tab}`, { params }).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [tab, fromDate, toDate, period]);

  function handleExport() {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ type: tab, ...(fromDate && { fromDate }), ...(toDate && { toDate }) });
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5100/api"}/reports/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${tab}-report.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">Filter by date range, export to CSV.</p>
        </div>
        {["bookings", "pending", "returned", "personnel-performance"].includes(tab) && (
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-brand-700 shadow-soft" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <input type="date" className={inputClass} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" className={inputClass} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        {tab === "bookings" && (
          <select className={inputClass} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        )}
      </div>

      {loading || !data ? (
        <p className="text-slate-500">Loading...</p>
      ) : tab === "bookings" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          {data.rows.length === 0 ? (
            <EmptyState icon="📊" title="No bookings in this range" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" fontSize={11} stroke="#94a3b8" />
                <YAxis allowDecimals={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : tab === "delivery-performance" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-soft">
            <p className="text-2xl font-bold text-emerald-600">{data.completed}</p>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-soft">
            <p className="text-2xl font-bold text-rose-600">{data.failed}</p>
            <p className="text-sm text-slate-500">Failed</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-soft">
            <p className="text-2xl font-bold text-slate-900">{data.completed + data.failed > 0 ? Math.round((data.completed / (data.completed + data.failed)) * 100) : 0}%</p>
            <p className="text-sm text-slate-500">Success Rate</p>
          </div>
        </div>
      ) : tab === "personnel-performance" ? (
        data.rows.length === 0 ? (
          <EmptyState icon="🧑‍✈️" title="No delivery personnel yet" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Failed</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                    <td className="px-4 py-3 text-slate-500">{r.assignedArea || "—"}</td>
                    <td className="px-4 py-3">{r.assigned}</td>
                    <td className="px-4 py-3 text-emerald-600">{r.completed}</td>
                    <td className="px-4 py-3 text-rose-600">{r.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : data.parcels.length === 0 ? (
        <EmptyState icon="📦" title={`No ${tab} parcels`} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Tracking #</th><th className="px-4 py-3">Sender</th><th className="px-4 py-3">Receiver</th><th className="px-4 py-3">Booked</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.parcels.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-mono text-brand-700">{p.trackingNumber}</td>
                  <td className="px-4 py-3">{p.sender.name}</td>
                  <td className="px-4 py-3">{p.receiver.name}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.bookingDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
