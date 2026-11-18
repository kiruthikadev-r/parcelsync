const express = require("express");
const { trackParcel } = require("../controllers/trackingController");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// Intentionally public — no protect middleware. Customers track without logging in.
router.get("/:trackingNumber", asyncHandler(trackParcel));

module.exports = router;
