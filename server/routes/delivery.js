const express = require("express");
const {
  listMyAssignments,
  listTodayAssignments,
  listCompletedAssignments,
  searchMyAssignments,
  updateDeliveryStatus,
} = require("../controllers/deliveryController");
const { protect, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect, requireRole("delivery_personnel"));

router.get("/my-parcels", asyncHandler(listMyAssignments));
router.get("/today", asyncHandler(listTodayAssignments));
router.get("/completed", asyncHandler(listCompletedAssignments));
router.get("/search", asyncHandler(searchMyAssignments));
router.put("/:id/status", asyncHandler(updateDeliveryStatus));

module.exports = router;
