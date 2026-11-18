const express = require("express");
const { createParcel, listParcels, getParcel, updateParcel, cancelParcel, deleteParcel } = require("../controllers/parcelController");
const { protect, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect);

router.get("/", requireRole("admin", "booking_staff"), asyncHandler(listParcels));
router.post("/", requireRole("admin", "booking_staff"), asyncHandler(createParcel));
router.get("/:id", asyncHandler(getParcel)); // ownership check for delivery_personnel is inside the controller
router.put("/:id", requireRole("admin", "booking_staff"), asyncHandler(updateParcel));
router.put("/:id/cancel", requireRole("admin", "booking_staff"), asyncHandler(cancelParcel));
router.delete("/:id", requireRole("admin"), asyncHandler(deleteParcel));

module.exports = router;
