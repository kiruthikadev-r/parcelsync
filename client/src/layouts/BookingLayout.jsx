import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const LINKS = [
  { to: "/booking", label: "Dashboard", end: true, icon: "📊" },
  { to: "/booking/parcels/new", label: "New Parcel Booking", icon: "➕" },
  { to: "/booking/parcels", label: "My Bookings", icon: "📦" },
  { to: "/booking/tracking", label: "Parcel Tracking", icon: "📍" },
  { to: "/booking/notifications", label: "Notifications", icon: "🔔" },
  { to: "/booking/profile", label: "Profile", icon: "👤" },
];

export default function BookingLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)] w-full flex-col md:flex-row">
        <Sidebar title="Booking Staff" links={LINKS} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
