import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const HOME_BY_ROLE = { admin: "/admin", booking_staff: "/booking", delivery_personnel: "/delivery" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const base = user ? HOME_BY_ROLE[user.role] || "" : "";
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    function refresh() {
      api.get("/notifications").then((res) => setUnreadCount(res.data.unreadCount)).catch(() => {});
    }
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Link to={user ? base : "/"} className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Package size={16} />
          </span>
          <span className="hidden sm:inline">ParcelSync</span>
        </Link>

        {user && (
          <div className="ml-auto flex items-center gap-2" ref={menuRef}>
            <Link to={`${base}/notifications`} className="relative rounded-lg p-2.5 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button onClick={() => setShowProfile((v) => !v)} aria-label="Profile menu" className="flex items-center gap-2 rounded-full">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </span>
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-2 shadow-card">
                  <div className="border-b border-slate-100 px-4 py-2">
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                  <Link to={`${base}/profile`} onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <User size={15} /> Profile
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
