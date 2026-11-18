const express = require("express");
const { getDashboardStats, getRecentActivity } = require("../controllers/dashboardController");
const { protect, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/stats", asyncHandler(getDashboardStats));
router.get("/recent-activity", asyncHandler(getRecentActivity));

module.exports = router;
