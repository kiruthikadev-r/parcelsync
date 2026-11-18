import { useState } from "react";

const CATEGORIES = ["Documents", "Electronics", "Clothing", "Food", "Fragile", "Furniture", "Other"];
const PAYMENT_METHODS = ["Cash", "UPI", "Bank Transfer", "Card", "Other"];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

const DEFAULTS = {
  sender: { name: "", phone: "", address: "" },
  receiver: { name: "", phone: "", address: "", city: "", postalCode: "" },
  category: CATEGORIES[0],
  description: "",
  weight: "",
  bookingDate: new Date().toISOString().slice(0, 10),
  deliveryCharges: "",
  paymentStatus: "Pending",
  paymentMethod: PAYMENT_METHODS[0],
  expectedDeliveryDate: "",
};

export default function ParcelForm({ initial, onSubmit, submitLabel = "Save Parcel", submitting }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...initial });

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function updateNested(group, key, value) {
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      weight: Number(form.weight),
      deliveryCharges: Number(form.deliveryCharges) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Sender Details</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input required placeholder="Sender Name" className={inputClass} value={form.sender.name} onChange={(e) => updateNested("sender", "name", e.target.value)} />
          <input required placeholder="Sender Phone Number" className={inputClass} value={form.sender.phone} onChange={(e) => updateNested("sender", "phone", e.target.value)} />
          <input required placeholder="Sender Address" className={inputClass} value={form.sender.address} onChange={(e) => updateNested("sender", "address", e.target.value)} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Receiver Details</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input required placeholder="Receiver Name" className={inputClass} value={form.receiver.name} onChange={(e) => updateNested("receiver", "name", e.target.value)} />
          <input required placeholder="Receiver Phone Number" className={inputClass} value={form.receiver.phone} onChange={(e) => updateNested("receiver", "phone", e.target.value)} />
          <input required placeholder="Delivery City" className={inputClass} value={form.receiver.city} onChange={(e) => updateNested("receiver", "city", e.target.value)} />
          <input required placeholder="Receiver Address" className={`${inputClass} sm:col-span-2`} value={form.receiver.address} onChange={(e) => updateNested("receiver", "address", e.target.value)} />
          <input required placeholder="Postal Code" className={inputClass} value={form.receiver.postalCode} onChange={(e) => updateNested("receiver", "postalCode", e.target.value)} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Parcel Details</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select className={inputClass} value={form.category} onChange={(e) => updateField("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input required type="number" step="0.01" placeholder="Weight (kg)" className={inputClass} value={form.weight} onChange={(e) => updateField("weight", e.target.value)} />
          <input type="date" className={inputClass} value={form.bookingDate} onChange={(e) => updateField("bookingDate", e.target.value)} />
          <input type="number" placeholder="Delivery Charges" className={inputClass} value={form.deliveryCharges} onChange={(e) => updateField("deliveryCharges", e.target.value)} />
          <select className={inputClass} value={form.paymentStatus} onChange={(e) => updateField("paymentStatus", e.target.value)}>
            <option>Pending</option>
            <option>Paid</option>
          </select>
          <select className={inputClass} value={form.paymentMethod} onChange={(e) => updateField("paymentMethod", e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <input type="date" placeholder="Expected Delivery Date" className={inputClass} value={form.expectedDeliveryDate || ""} onChange={(e) => updateField("expectedDeliveryDate", e.target.value)} />
          <textarea rows={3} placeholder="Parcel Description" className={`${inputClass} sm:col-span-3`} value={form.description} onChange={(e) => updateField("description", e.target.value)} />
        </div>
      </section>

      <button disabled={submitting} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:opacity-50">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
