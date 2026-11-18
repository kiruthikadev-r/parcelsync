import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const LINKS = [
  { to: "/delivery", label: "Dashboard", end: true, icon: "📊" },
  { to: "/delivery/assigned", label: "Assigned Parcels", icon: "📦" },
  { to: "/delivery/today", label: "Today's Deliveries", icon: "📅" },
  { to: "/delivery/completed", label: "Completed Deliveries", icon: "✅" },
  { to: "/delivery/failed", label: "Failed Deliveries", icon: "⚠️" },
  { to: "/delivery/notifications", label: "Notifications", icon: "🔔" },
  { to: "/delivery/profile", label: "Profile", icon: "👤" },
];

export default function DeliveryLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)] w-full flex-col md:flex-row">
        <Sidebar title="Delivery Personnel" links={LINKS} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
