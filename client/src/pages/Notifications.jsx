import { useEffect, useState } from "react";
import api from "../services/api";
import EmptyState from "../components/EmptyState";

const TYPE_ICONS = {
  parcel_booked: "📦",
  parcel_dispatched: "🚚",
  parcel_assigned: "📋",
  in_transit: "🛣️",
  out_for_delivery: "🏃",
  delivered: "✅",
  delivery_failed: "⚠️",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/notifications").then((res) => setNotifications(res.data.notifications)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function markRead(id) {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  }

  if (loading) return <p className="p-8 text-center text-slate-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-slate-900">Notifications</h1>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <button key={n._id} onClick={() => !n.isRead && markRead(n._id)} className={`flex w-full items-start gap-3 p-4 text-left ${n.isRead ? "" : "bg-brand-50/50"}`}>
                <span className="text-lg">{TYPE_ICONS[n.type] || "🔔"}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">{n.title}</div>
                  <div className="text-sm text-slate-600">{n.message}</div>
                  <div className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
