const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User_model");

// @desc     Get All Users
// @route    GET /api/v1/users
// @access   Public
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc     Delete a User
// @route    DELETE /api/v1/users/:id
// @access   Public
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`Cannot find User with Id ${req.params.id}`));
  }
  user.remove();
  res.status(200).send({ success: true, data: {} });
});
