import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../services/api";
import ShipmentTimeline from "../components/ShipmentTimeline";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatDateTime } from "../utils/formatDate";
import EmptyState from "../components/EmptyState";

export default function TrackParcel({ basePath = "/track" }) {
  const { trackingNumber: initialTrackingNumber } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(initialTrackingNumber || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTrackingNumber) fetchTracking(initialTrackingNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrackingNumber]);

  async function fetchTracking(trackingNumber) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.get(`/tracking/${encodeURIComponent(trackingNumber)}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find that parcel");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    navigate(`${basePath}/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Track Your Parcel</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your tracking number — no login required.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
        <input
          placeholder="e.g. PS-20261117-AB12CD"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Search size={15} /> Track
        </button>
      </form>

      {loading && <p className="mt-8 text-center text-slate-500">Loading...</p>}

      {!loading && error && <div className="mt-8"><EmptyState icon="📭" title={error} /></div>}

      {!loading && result && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-brand-700">{result.trackingNumber}</p>
              <p className="mt-1 text-sm text-slate-500">
                From <span className="font-medium text-slate-700">{result.senderName}</span> to{" "}
                <span className="font-medium text-slate-700">{result.receiverName}</span>
              </p>
            </div>
            <StatusBadge status={result.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Booking Date</p>
              <p className="font-medium text-slate-700">{formatDate(result.bookingDate)}</p>
            </div>
            {result.expectedDeliveryDate && (
              <div>
                <p className="text-xs text-slate-400">Expected Delivery</p>
                <p className="font-medium text-slate-700">{formatDate(result.expectedDeliveryDate)}</p>
              </div>
            )}
            {result.deliveredAt && (
              <div>
                <p className="text-xs text-slate-400">Delivered On</p>
                <p className="font-medium text-slate-700">{formatDateTime(result.deliveredAt)}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <ShipmentTimeline status={result.status} history={result.history} />
          </div>
        </div>
      )}
    </div>
  );
}
