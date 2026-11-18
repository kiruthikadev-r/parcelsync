const express = require("express");
const { login, me, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.post("/login", asyncHandler(login));
router.get("/me", protect, asyncHandler(me));
router.put("/profile", protect, asyncHandler(updateProfile));

module.exports = router;
