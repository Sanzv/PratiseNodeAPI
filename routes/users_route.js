const express = require("express");
const { getAllUsers, deleteUser } = require("../controllers/users_controller");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User_model");

const router = express.Router();

router.get("/", advancedResults(User, ""), getAllUsers);
router.delete("/:id", deleteUser);

module.exports = router;
