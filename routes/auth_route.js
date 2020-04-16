const express = require("express");
const User = require("../models/User_model");
const { protect, authorize } = require("../middleware/auth");
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
} = require("../controllers/auth_controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.post("/forgotPassword", forgotPassword);

module.exports = router;
