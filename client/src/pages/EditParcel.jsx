import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ParcelForm from "../components/ParcelForm";

export default function EditParcel() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user.role === "admin" ? "/admin" : "/booking";
  const [parcel, setParcel] = useState(null);

  useEffect(() => {
    api.get(`/parcels/${id}`).then((res) => setParcel(res.data.parcel));
  }, [id]);

  async function handleSubmit(data) {
    try {
      await api.put(`/parcels/${id}`, data);
      toast.success("Parcel updated");
      navigate(`${basePath}/parcels/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update parcel");
    }
  }

  if (!parcel) return <p className="p-8 text-center text-slate-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`${basePath}/parcels/${id}`} className="mb-4 inline-block text-sm text-slate-500 hover:text-brand-700">← Back to parcel</Link>
      <h1 className="mb-6 text-xl font-bold text-slate-900">Edit Parcel {parcel.trackingNumber}</h1>
      <ParcelForm
        initial={{
          ...parcel,
          bookingDate: parcel.bookingDate?.slice(0, 10),
          expectedDeliveryDate: parcel.expectedDeliveryDate?.slice(0, 10) || "",
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
