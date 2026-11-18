import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import ParcelForm from "../components/ParcelForm";
import { useAuth } from "../context/AuthContext";

export default function AddParcel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(data) {
    try {
      const res = await api.post("/parcels", data);
      toast.success(`Parcel booked — tracking number ${res.data.parcel.trackingNumber}`);
      navigate(user.role === "admin" ? `/admin/parcels/${res.data.parcel._id}` : `/booking/parcels/${res.data.parcel._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not book parcel");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">New Parcel Booking</h1>
        <p className="mt-0.5 text-sm text-slate-500">A unique tracking number will be generated automatically.</p>
      </div>
      <ParcelForm onSubmit={handleSubmit} submitLabel="Book Parcel" />
    </div>
  );
}
