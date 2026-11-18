import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { formatDate } from "../utils/formatDate";

const STATUSES = ["Booked", "Dispatched", "In Transit", "Out for Delivery", "Delivered", "Returned", "Cancelled"];

export default function ParcelList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user.role === "admin" ? "/admin" : "/booking";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ parcels: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setLoading(true);
    api
      .get("/parcels", {
        params: {
          search: debouncedSearch || undefined,
          status: status || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          sort,
          page,
          limit: 12,
        },
      })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [debouncedSearch, status, fromDate, toDate, sort, page]);

  useEffect(() => setPage(1), [debouncedSearch, status, fromDate, toDate, sort]);

  const inputClass = "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.role === "admin" ? "Parcel Management" : "My Bookings"}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{data.total} parcel{data.total !== 1 ? "s" : ""}</p>
        </div>
        <Link to={`${basePath}/parcels/new`} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700">
          <Plus size={15} /> Add New Parcel
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <input placeholder="Search tracking #, sender, or receiver..." className={`${inputClass} w-64`} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" className={inputClass} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" className={inputClass} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <select className={inputClass} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : data.parcels.length === 0 ? (
        <EmptyState icon="📦" title="No parcels found" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tracking #</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Receiver</th>
                  <th className="px-4 py-3">Booking Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.parcels.map((p) => (
                  <tr key={p._id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`${basePath}/parcels/${p._id}`)}>
                    <td className="px-4 py-3 font-mono text-brand-700">{p.trackingNumber}</td>
                    <td className="px-4 py-3">{p.sender.name}</td>
                    <td className="px-4 py-3">{p.receiver.name}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.bookingDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
