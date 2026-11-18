# ParcelSync — Smart Parcel Dispatch and Delivery Management System

*Smart Tracking. Seamless Delivery.*

A full-stack MERN application managing the complete parcel delivery lifecycle: booking, dispatch, delivery personnel assignment, public shipment tracking, status updates, notifications, and reporting.

> **Status**: backend and frontend built, structurally verified (clean build, clean route wiring, friendly "Atlas not configured" error path confirmed). **Not yet runtime-tested against a live database** — needs a real MongoDB Atlas connection string, see below.

## Tech stack

- **Frontend**: React (Vite) + Tailwind CSS + Recharts + Lucide React + Axios + React Router
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas only — no local MongoDB
- **Auth**: JWT + bcrypt

## Setup

### 1. MongoDB Atlas

This project requires Atlas — not a local `mongod`.

1. Create a free account and cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register) (the free M0 tier is enough).
2. Database Access → add a database user (username + password).
3. Network Access → Add IP Address → "Allow Access from Anywhere" is simplest for local dev.
4. Database → Connect → Drivers → copy the `mongodb+srv://...` string.
5. Paste it into `server/.env` as `MONGODB_URI` — **edit that file directly, never paste the real string into chat.**

### 2. Backend

```
cd server
npm install
npm run seed:admin   # creates the initial admin account
npm run dev
```

Runs at `http://localhost:5100`. Default seeded admin: `admin@parcelsync.com` / `Admin@123` (override via `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars before running the seed).

### 3. Frontend

```
cd client
npm install
npm run dev
```

Runs at `http://localhost:5260`.

### Creating Booking Staff and Delivery Personnel accounts

There's no public registration — by design, per the spec's role model. Log in as admin, then use **User Management** (Booking Staff) and **Delivery Personnel** (Admin sidebar) to create those accounts.

## Environment variables

`server/.env` (see `server/.env.example`):

| Variable | Purpose |
|---|---|
| `PORT` | Backend port (default `5100`) |
| `MONGODB_URI` | MongoDB Atlas connection string — required |
| `JWT_SECRET` | Token signing secret — change for any real deployment |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Frontend origin, for CORS (default `http://localhost:5260`) |

`client/.env`:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL (default `http://localhost:5100/api`) |

## Data model

- **User** — admin / booking_staff / delivery_personnel, with `assignedArea` and `username` fields specific to delivery personnel.
- **Parcel** — sender + receiver + parcel/payment details, unique `trackingNumber`, `status` (Booked → Dispatched → In Transit → Out for Delivery → Delivered, plus Returned/Cancelled).
- **DeliveryAssignment** — links a parcel to a delivery person + area + dispatch date; its own `status` (Assigned/Completed/Failed) tracks that specific delivery attempt.
- **ShipmentHistory** — append-only log; every status transition writes a row here (enforced centrally in `services/shipmentService.js`, never skippable).
- **Notification** — per-user, typed, read/unread.

## API overview

All routes are prefixed `/api`. Everything except `/auth/login` and `/tracking/:trackingNumber` requires `Authorization: Bearer <token>`.

| Area | Routes |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile` |
| Users (admin) | `GET/POST /users`, `PUT /users/:id`, `PUT /users/:id/active`, `GET /users/:id/performance` |
| Parcels (admin/booking_staff) | `GET/POST /parcels`, `GET/PUT /parcels/:id`, `PUT /parcels/:id/cancel`, `DELETE /parcels/:id` (admin only) |
| Tracking (public) | `GET /tracking/:trackingNumber` |
| Dispatch (admin) | `GET /dispatch/unassigned`, `GET /dispatch/assignments`, `POST /dispatch`, `PUT /dispatch/:id` |
| Delivery (delivery_personnel) | `GET /delivery/my-parcels`, `GET /delivery/today`, `GET /delivery/completed`, `GET /delivery/search`, `PUT /delivery/:id/status` |
| Dashboard (admin) | `GET /dashboard/stats`, `GET /dashboard/recent-activity` |
| Reports (admin) | `GET /reports/bookings|delivery-performance|personnel-performance|pending|returned`, `GET /reports/export` (CSV) |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read` |

Booking staff's parcel list (`GET /parcels`) is automatically scoped to parcels they personally created ("My Bookings"); admin sees everything.

## Business rules enforced

- Unique tracking number per parcel (auto-generated, collision-checked).
- Every status change writes a `ShipmentHistory` row — centralized in `shipmentService.applyStatusChange`, used by every code path that changes a parcel's status, so this can't be silently skipped.
- Delivery personnel can only access assignments/parcels that are actually theirs (`DeliveryAssignment.deliveryPersonnel` ownership check on every delivery route and on `GET /parcels/:id`).
- Only admin can assign delivery personnel (dispatch routes are admin-only).
- Delivered/Cancelled/Returned parcels are locked from edits for booking staff — admin can still correct them.
- Failed deliveries require a reason (validated server-side).
- Public tracking needs no auth and only exposes customer-safe fields (no internal IDs, `createdBy`, etc.).

## Known gaps

- Not yet runtime-tested against a real Atlas cluster (needs real credentials — see Setup).
- No automated test suite — verification so far is a structural build check + visual pass on public pages only.
- No deployment configuration yet.

See `Memory/project-notes.md` for implementation notes and deviations from the literal spec.
