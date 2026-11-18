import { Check } from "lucide-react";
import { formatDateTime } from "../utils/formatDate";

const HAPPY_PATH = ["Booked", "Dispatched", "In Transit", "Out for Delivery", "Delivered"];

export default function ShipmentTimeline({ status, history }) {
  const isCancelled = status === "Cancelled";
  const isReturned = status === "Returned";

  const historyByStatus = {};
  for (const h of history) historyByStatus[h.status] = h;

  if (isCancelled) {
    return <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">This parcel's booking was cancelled.</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        {HAPPY_PATH.map((step, i) => {
          const reached = Boolean(historyByStatus[step]);
          const entry = historyByStatus[step];
          return (
            <div key={step} className="flex flex-1 flex-col items-center text-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  reached ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {reached ? <Check size={14} /> : i + 1}
              </div>
              <span className={`mt-1.5 text-xs ${reached ? "font-medium text-slate-700" : "text-slate-400"}`}>{step}</span>
              {entry && <span className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(entry.createdAt)}</span>}
            </div>
          );
        })}
      </div>

      {isReturned && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          ⚠️ This delivery was unsuccessful and the parcel has been returned.
          {historyByStatus.Returned?.note && <div className="mt-1">Reason: {historyByStatus.Returned.note}</div>}
        </div>
      )}
    </div>
  );
}
