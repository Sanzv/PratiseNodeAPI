const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User_model");

// @desc     Register User
// @route    POST /api/v1/auth/register
// @access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // To hash the password when saved we will use a middleware instead of hashing it here in controller

  sendTokenResponse(user, 200, res);
});

// @desc     Login User
// @route    POST /api/v1/auth/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please provide both email and password`),
      400
    );
  }
  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(`Invalid creadentials`), 401);
  }

  // Verify user entered password to hashed password in database with models method
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Invalid creadentials`), 401);
  }
  sendTokenResponse(user, 200, res);
});

// @desc     Get the current logged in User
// @route    Get /api/v1/auth/me
// @access   Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).send({ success: true, data: user });
});

// @desc     Forgot Password
// @route    Get /api/v1/auth/forgotpassword
// @access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ErrorResponse(
        ` There is no user with the email ${req.body.email}`,
        404
      )
    );
  }

  // Get Reset TOken
  const resetToken = user.getPasswordResetToken();
  console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  res.status(200).send({ success: true, data: user });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create Token  // To hash the password when saved we will use a middleware instead of hashing it here in controller
  options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // To make it access from client side only
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  const token = user.getSignedJwtToken();
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
