const express = require("express");
const {
  getBookingReport,
  getDeliveryPerformanceReport,
  getPersonnelPerformanceReport,
  getPendingParcelReport,
  getReturnedParcelReport,
  exportReportCsv,
} = require("../controllers/reportController");
const { protect, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/bookings", asyncHandler(getBookingReport));
router.get("/delivery-performance", asyncHandler(getDeliveryPerformanceReport));
router.get("/personnel-performance", asyncHandler(getPersonnelPerformanceReport));
router.get("/pending", asyncHandler(getPendingParcelReport));
router.get("/returned", asyncHandler(getReturnedParcelReport));
router.get("/export", asyncHandler(exportReportCsv));

module.exports = router;
