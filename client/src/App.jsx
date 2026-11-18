import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import RootLayout from "./layouts/RootLayout";
import AdminLayout from "./layouts/AdminLayout";
import BookingLayout from "./layouts/BookingLayout";
import DeliveryLayout from "./layouts/DeliveryLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import TrackParcel from "./pages/TrackParcel";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ParcelList from "./pages/ParcelList";
import AddParcel from "./pages/AddParcel";
import EditParcel from "./pages/EditParcel";
import ParcelDetails from "./pages/ParcelDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DispatchManagement from "./pages/admin/DispatchManagement";
import DeliveryPersonnel from "./pages/admin/DeliveryPersonnel";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";

import BookingDashboard from "./pages/booking/BookingDashboard";

import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import AssignedParcels from "./pages/delivery/AssignedParcels";
import TodayDeliveries from "./pages/delivery/TodayDeliveries";
import CompletedDeliveries from "./pages/delivery/CompletedDeliveries";
import FailedDeliveries from "./pages/delivery/FailedDeliveries";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/track" element={<TrackParcel />} />
            <Route path="/track/:trackingNumber" element={<TrackParcel />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="parcels" element={<ParcelList />} />
            <Route path="parcels/new" element={<AddParcel />} />
            <Route path="parcels/:id" element={<ParcelDetails />} />
            <Route path="parcels/:id/edit" element={<EditParcel />} />
            <Route path="dispatch" element={<DispatchManagement />} />
            <Route path="personnel" element={<DeliveryPersonnel />} />
            <Route path="tracking" element={<TrackParcel basePath="/admin/tracking" />} />
            <Route path="tracking/:trackingNumber" element={<TrackParcel basePath="/admin/tracking" />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/booking"
            element={
              <ProtectedRoute roles={["booking_staff"]}>
                <BookingLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BookingDashboard />} />
            <Route path="parcels" element={<ParcelList />} />
            <Route path="parcels/new" element={<AddParcel />} />
            <Route path="parcels/:id" element={<ParcelDetails />} />
            <Route path="parcels/:id/edit" element={<EditParcel />} />
            <Route path="tracking" element={<TrackParcel basePath="/booking/tracking" />} />
            <Route path="tracking/:trackingNumber" element={<TrackParcel basePath="/booking/tracking" />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/delivery"
            element={
              <ProtectedRoute roles={["delivery_personnel"]}>
                <DeliveryLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DeliveryDashboard />} />
            <Route path="assigned" element={<AssignedParcels />} />
            <Route path="today" element={<TodayDeliveries />} />
            <Route path="completed" element={<CompletedDeliveries />} />
            <Route path="failed" element={<FailedDeliveries />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
