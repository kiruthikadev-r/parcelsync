const express = require("express");
const { listUnassignedParcels, listAssignments, createDispatch, updateDispatch } = require("../controllers/dispatchController");
const { protect, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/unassigned", asyncHandler(listUnassignedParcels));
router.get("/assignments", asyncHandler(listAssignments));
router.post("/", asyncHandler(createDispatch));
router.put("/:id", asyncHandler(updateDispatch));

module.exports = router;
