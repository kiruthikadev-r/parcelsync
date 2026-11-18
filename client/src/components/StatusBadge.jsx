const STYLES = {
  Booked: "bg-slate-100 text-slate-700",
  Dispatched: "bg-blue-100 text-blue-700",
  "In Transit": "bg-violet-100 text-violet-700",
  "Out for Delivery": "bg-amber-100 text-amber-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Returned: "bg-rose-100 text-rose-700",
  Cancelled: "bg-slate-200 text-slate-500",
  Assigned: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-rose-100 text-rose-700",
  Pending: "bg-amber-100 text-amber-700",
  Paid: "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
