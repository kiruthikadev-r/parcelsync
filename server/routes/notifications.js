const express = require("express");
const { listNotifications, markRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(protect);

router.get("/", asyncHandler(listNotifications));
router.put("/:id/read", asyncHandler(markRead));

module.exports = router;
