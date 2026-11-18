import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true, icon: "📊" },
  { to: "/admin/parcels", label: "Parcel Management", icon: "📦" },
  { to: "/admin/parcels/new", label: "Add New Parcel", icon: "➕" },
  { to: "/admin/dispatch", label: "Dispatch Management", icon: "🚚" },
  { to: "/admin/personnel", label: "Delivery Personnel", icon: "🧑‍✈️" },
  { to: "/admin/tracking", label: "Shipment Tracking", icon: "📍" },
  { to: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { to: "/admin/reports", label: "Reports & Analytics", icon: "📈" },
  { to: "/admin/users", label: "User Management", icon: "👥" },
  { to: "/admin/profile", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)] w-full flex-col md:flex-row">
        <Sidebar title="Admin" links={LINKS} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
