# ParcelSync — Project Notes

## Stack
MERN. MongoDB Atlas only (spec requirement, like the AI-Resume-Job-Portal and AI-Invoice-Expense-Management projects in this workspace — not the shared local `mongod` the placement portal / marketplace use). Backend port 5100, frontend port 5260.

## Status as of 2026-11-17
Backend and frontend fully built. Backend verified structurally (`node -e "require('./app.js')"` loads clean, no mongoose index warnings, friendly "Atlas not configured" error confirmed on `npm run dev`). Frontend builds cleanly (`npm run build`, zero errors) and the public Home/Login pages were visually verified in a real headless browser with zero console errors. **Not yet runtime-tested against a live database** — blocked on the user providing a real `MONGODB_URI` directly into `server/.env` (never through chat).

## A real environment bug hit and fixed during this build
`npm run build` failed with `Error: An Application Control policy has blocked this file` for Rollup's native Windows binary — a second instance of the class of bug documented in [[vite8-rolldown-blocked-by-app-control]]. This time it wasn't Rolldown (already avoided by pinning `vite@^6`) but a *fresh* Rollup version Vite 6 pulled in, which had never run on this machine before and got blocked, while the *older* Rollup version already trusted from the Kiruthika-Portfolio project ran fine. Fixed by adding `"overrides": { "rollup": "4.65.0" }` to `client/package.json` (pinning to the exact already-trusted version, confirmed via `sha256sum`) and doing a full clean reinstall. See that memory entry for the general lesson — the block is keyed to the exact binary file, not the package or major version.

## Deviations from / clarifications of the literal spec (and why)
- **No public self-registration.** The spec's section 2 only describes Admin/Booking Staff/Delivery Personnel capabilities and section 6 explicitly says "Allow administrators to: Add delivery personnel" — there's no registration form anywhere in the spec's page list or nav structure. Implemented as: only `POST /auth/login` is public; all non-admin accounts are created by admin via `POST /users`. One admin is seeded via `npm run seed:admin`, matching the pattern used in the other `Pro` projects.
- **"My Bookings" is scoped to the booking staff member's own bookings** (`GET /parcels` filters by `createdBy` for `booking_staff`, not for `admin`) — the spec's section 13 sidebar explicitly labels it "My Bookings," which only makes sense as a personal filter; section 4's "View and manage registered parcels" is satisfied for admin seeing everything.
- **"Returned" status reused for failed deliveries.** Section 7's public tracking timeline lists "Also support a Returned status" as the one failure-terminal state, and section 8 separately says delivery personnel "Mark parcels as Delivery Failed." These are the same event from two sections' perspectives — implemented as one: marking a delivery Failed sets `parcel.status = "Returned"` and `DeliveryAssignment.status = "Failed"`.
- **Cancel vs delete restrictions** (section 4's "appropriate restrictions", section 14's business rules): a parcel can be deleted (hard) only while `Booked` or already `Cancelled`; cancelling is blocked once `Dispatched` or later unless the actor is admin; `Delivered` parcels can never be cancelled or deleted. Booking-staff edits are blocked once a parcel reaches `Delivered`/`Cancelled`/`Returned` — admin can still edit, serving as the spec's "authorized admin correction process."
- **Dashboard interpretation**: "Pending Deliveries" (section 3) is implemented as parcels with status `Booked` or `Dispatched` (i.e. not yet actively in the "In Transit"/"Out for Delivery" stages, which already have their own dedicated stat cards) — kept distinct from those two so none of the 8 cards overlap in meaning.
- **Admin tracking page** (section 13's admin sidebar "Shipment Tracking" item) reuses the same public `TrackParcel` component (with a `basePath` prop so its internal navigation stays inside `/admin/...` instead of redirecting out to the public `/track/...` route) rather than duplicating the UI — lets admin see exactly what a customer sees.

## Known gaps
- Not runtime-tested yet (see Status above).
- No automated tests.
- No deployment config yet.
- No case where the spec asked for something that was skipped entirely — everything in the 17 sections has at least a first-pass implementation.
