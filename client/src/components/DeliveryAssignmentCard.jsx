import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import StatusBadge from "./StatusBadge";
import { formatDate, formatDateTime } from "../utils/formatDate";

const PROGRESS_OPTIONS = ["In Transit", "Out for Delivery"];

export default function DeliveryAssignmentCard({ assignment, onUpdated }) {
  const { parcel } = assignment;
  const [showFail, setShowFail] = useState(false);
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function updateStatus(status, extra = {}) {
    setSubmitting(true);
    try {
      await api.put(`/delivery/${assignment._id}/status`, { status, ...extra });
      toast.success(`Marked as ${status}`);
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    } finally {
      setSubmitting(false);
      setShowFail(false);
    }
  }

  async function handleFailSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return toast.error("A reason is required");
    await updateStatus("Failed", { reason, remarks });
  }

  const isActive = assignment.status === "Assigned";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold text-brand-700">{parcel.trackingNumber}</p>
          <p className="mt-1 text-sm text-slate-600">{parcel.receiver.name} · {parcel.receiver.phone}</p>
          <p className="text-xs text-slate-500">{parcel.receiver.address}, {parcel.receiver.city} - {parcel.receiver.postalCode}</p>
        </div>
        <StatusBadge status={parcel.status} />
      </div>

      <p className="mt-2 text-xs text-slate-400">Dispatched {formatDateTime(assignment.dispatchDate)} · Area: {assignment.deliveryArea}</p>

      {isActive && (
        <div className="mt-4 flex flex-wrap gap-2">
          {PROGRESS_OPTIONS.filter((s) => s !== parcel.status).map((s) => (
            <button
              key={s}
              disabled={submitting}
              onClick={() => updateStatus(s)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Mark {s}
            </button>
          ))}
          <button disabled={submitting} onClick={() => updateStatus("Delivered")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            Mark Delivered
          </button>
          <button disabled={submitting} onClick={() => setShowFail(true)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
            Mark Failed
          </button>
        </div>
      )}

      {showFail && (
        <form onSubmit={handleFailSubmit} className="mt-4 space-y-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <input required placeholder="Reason for failed delivery" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <textarea placeholder="Additional remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
              Confirm Failed Delivery
            </button>
            <button type="button" onClick={() => setShowFail(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
