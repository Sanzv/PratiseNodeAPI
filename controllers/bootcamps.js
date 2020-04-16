const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const ErrorResponse = require("../utils/errorResponse");

// @desc     Get All Bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
  // res.status(400).send({ success: false });
});

// @desc     Get single Bootcamps
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Cannot find Bootcamp with Id ${req.params.id}`)
    );
  }
  res.status(200).send({ success: true, data: bootcamp });
});

// @desc     Create new Bootcamp
// @route    POST /api/v1/bootcamps/
// @access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  // Check for published bootcamp for the user
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with Id ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc     Update single Bootcamps
// @route    PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    err;
    return next(
      new ErrorResponse(`Cannot find Bootcamp with Id ${req.params.id}`)
    );
  }

  // Check for the ownership of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` You must be an owner or admin to update the bootcamp`
      ),
      401
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // When we get response we want data to be updated data
    runValidators: true,
  });
  res.status(200).send({ success: true, msg: bootcamp });
});

// @desc     Delete single Bootcamps
// @route    Delete /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Cannot find Bootcamp with Id ${req.params.id}`)
    );
  }
  // Check for the ownership of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` You must be an owner or admin to DELETE the bootcamp`
      ),
      401
    );
  }
  bootcamp.remove();
  res.status(200).send({ success: true, data: {} });
});

// @desc     Upload photo for Bootcamp
// @route    PUT /api/v1/bootcamps/:id/photo
// @access   Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Cannot find Bootcamp with Id ${req.params.id}`)
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please Upload a File`));
  }
  // Check for the ownership of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` You must be an owner or admin to update the bootcamp`
      ),
      401
    );
  }

  const field = " file";
  const file = req.files.file;
  console.log(req.files);

  // For some validation
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please Upload a file of image type.", 400));
  }
  if (file.size > process.env.IMAGE_UPLOAD_SIZE) {
    return next(
      new ErrorResponse(
        `File must be less than ${process.env.IMAGE_UPLOAD_SIZE}`,
        400
      )
    );
  }

  // Create a custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // mv is a function attached with the file object to move it to desired folder
  file.mv(`${process.env.IMAGE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse("Problem with file upload", 500));
    }
    const newBootcamp = await Bootcamp.findByIdAndUpdate(
      bootcamp.id,
      {
        photo: file.name,
      },
      {
        new: true,
      }
    );
    res.status(200).send({ success: true, data: newBootcamp });
  });
});

// @desc     Get Bootcamps within radius
// @route    Delete /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latitude and longitude from the geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate the radius using raidans
  // Divide dist by radius of Earth
  // earth Radius = 3,963mi / 6378 Km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  if (!bootcamps) {
    return next(err);
  }
  res
    .status(200)
    .send({ success: true, count: (await bootcamps).length, data: bootcamps });
});
