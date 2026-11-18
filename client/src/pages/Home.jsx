import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Search } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleTrack(e) {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;
    navigate(`/track/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 px-4 py-24 text-center text-white sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <Package size={28} />
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">ParcelSync</h1>
        <p className="mx-auto mt-3 max-w-lg text-brand-100">Smart Tracking. Seamless Delivery.</p>

        <form onSubmit={handleTrack} className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row">
          <input
            placeholder="Enter your tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full rounded-lg border-0 px-4 py-3 text-sm text-slate-900 shadow-soft focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-soft hover:bg-brand-50">
            <Search size={16} /> Track Parcel
          </button>
        </form>

        <p className="mt-6 text-sm text-brand-100">
          Staff or admin?{" "}
          <Link to="/login" className="font-semibold text-white underline">
            Log in
          </Link>
        </p>
      </section>
    </div>
  );
}
