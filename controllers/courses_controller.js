const Course = require("../models/Course_model");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc     Get All Courses
// @route    GET /api/v1/courses
// @route    GET /api/v1/bootcamps/:bootcampId/courses
// @access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId,
    });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    // Populates the botcamp field in course with the actual bootcamp's attribute
    // query = Course.find().populate("bootcamp");
    // query = Course.find().populate({
    //   path: "bootcamp",
    //   select: "name description",
    // });

    // Use middleware instead
    res.status(200).json(res.advancedResults);
  }
});

// @desc     Get single Course
// @route    GET /api/v1/courses/:id
// @access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!course) {
    return next(
      new ErrorResponse(`cannot find Course with Id ${req.params.id}`)
    );
  }
  res.status(200).send({ success: true, data: course });
});

// @desc     Create new Course
// @route    POST /api/v1/bootcamps/:bootcampId/courses
// @access   Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcampId = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(bootcampId);
  if (!bootcamp) {
    return next(new ErrorResponse(`No Bootcamp with id ${bootcampId}`));
  }

  // Check for the ownership of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` User ${req.user.id} is not authorized to add course to the id ${bootcamp.id}`
      ),
      401
    );
  }

  const course = await Course.create(req.body);
  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc     Update single Course
// @route    PUT /api/v1/courses/:id
// @access   Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`cannot find Course with Id ${req.params.id}`)
    );
  }

  const bootcamp = await Bootcamp.findById(course.bootcamp);

  // Check for the ownership of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` User ${req.user.id} is not authorized to update course of the id ${course.id}`
      ), 
      401
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // When we get response we want data to be updated data
    runValidators: true,
  });
  res.status(200).send({ success: true, msg: course });
});

// @desc     Delete single Course
// @route    Delete /api/v1/courses/:id
// @access   Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`cannot find Course with Id ${req.params.id}`)
    );
  }

  const bootcamp = await Bootcamp.findById(course.bootcamp);

  // Check for the ownership of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` User ${req.user.id} is not authorized to update course of the id ${course.id}`
      ),
      401
    );
  }
  await course.remove();
  res.status(200).send({ success: true, data: {} });
});
