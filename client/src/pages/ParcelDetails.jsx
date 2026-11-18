import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import ShipmentTimeline from "../components/ShipmentTimeline";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatDate, formatDateTime } from "../utils/formatDate";

export default function ParcelDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user.role === "admin" ? "/admin" : "/booking";

  const [data, setData] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function load() {
    api.get(`/parcels/${id}`).then((res) => setData(res.data));
  }
  useEffect(load, [id]);

  async function handleCancel() {
    try {
      await api.put(`/parcels/${id}/cancel`, {});
      toast.success("Parcel cancelled");
      setConfirmCancel(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel parcel");
      setConfirmCancel(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/parcels/${id}`);
      toast.success("Parcel deleted");
      navigate(`${basePath}/parcels`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete parcel");
      setConfirmDelete(false);
    }
  }

  if (!data) return <p className="p-8 text-center text-slate-500">Loading...</p>;
  const { parcel, history, assignment } = data;
  const canModify = !["Delivered", "Cancelled", "Returned"].includes(parcel.status) || user.role === "admin";

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`${basePath}/parcels`} className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-700">← Back to parcels</Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-lg font-semibold text-brand-700">{parcel.trackingNumber}</p>
            <p className="mt-0.5 text-sm text-slate-500">Booked {formatDate(parcel.bookingDate)}</p>
          </div>
          <StatusBadge status={parcel.status} />
        </div>

        <div className="mt-6">
          <ShipmentTimeline status={parcel.status} history={history} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Sender</h2>
            <p className="text-sm text-slate-600">{parcel.sender.name}</p>
            <p className="text-sm text-slate-600">{parcel.sender.phone}</p>
            <p className="text-sm text-slate-600">{parcel.sender.address}</p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Receiver</h2>
            <p className="text-sm text-slate-600">{parcel.receiver.name}</p>
            <p className="text-sm text-slate-600">{parcel.receiver.phone}</p>
            <p className="text-sm text-slate-600">{parcel.receiver.address}, {parcel.receiver.city} - {parcel.receiver.postalCode}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><p className="text-xs text-slate-400">Category</p><p className="font-medium text-slate-700">{parcel.category}</p></div>
          <div><p className="text-xs text-slate-400">Weight</p><p className="font-medium text-slate-700">{parcel.weight} kg</p></div>
          <div><p className="text-xs text-slate-400">Charges</p><p className="font-medium text-slate-700">₹{parcel.deliveryCharges}</p></div>
          <div><p className="text-xs text-slate-400">Payment</p><p className="font-medium text-slate-700">{parcel.paymentMethod} · <StatusBadge status={parcel.paymentStatus} /></p></div>
        </div>
        {parcel.description && <p className="mt-4 text-sm text-slate-600">{parcel.description}</p>}

        {assignment && (
          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <h2 className="mb-1 text-sm font-semibold text-slate-700">Delivery Assignment</h2>
            <p className="text-sm text-slate-600">
              {assignment.deliveryPersonnel?.name} · {assignment.deliveryArea} · Dispatched {formatDateTime(assignment.dispatchDate)}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {canModify && (
            <Link to={`${basePath}/parcels/${id}/edit`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Edit
            </Link>
          )}
          {!["Delivered", "Cancelled"].includes(parcel.status) && (
            <button onClick={() => setConfirmCancel(true)} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
              Cancel Booking
            </button>
          )}
          {user.role === "admin" && ["Booked", "Cancelled"].includes(parcel.status) && (
            <button onClick={() => setConfirmDelete(true)} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
              Delete
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this booking?"
        message="This will mark the parcel as Cancelled."
        confirmLabel="Cancel Booking"
        danger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this parcel?"
        message="This permanently removes the parcel and its history."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
