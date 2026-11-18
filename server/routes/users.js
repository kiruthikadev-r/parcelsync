const express = require("express");
const {
  listUsers,
  createUser,
  updateUser,
  setUserActive,
  getDeliveryPersonnelPerformance,
} = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/", asyncHandler(listUsers));
router.post("/", asyncHandler(createUser));
router.put("/:id", asyncHandler(updateUser));
router.put("/:id/active", asyncHandler(setUserActive));
router.get("/:id/performance", asyncHandler(getDeliveryPersonnelPerformance));

module.exports = router;
