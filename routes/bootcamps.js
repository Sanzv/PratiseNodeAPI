const express = require("express");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampInRadius,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");
const { protect, authorize } = require("../middleware/auth");

// Include other resource routers
const courseRouter = require("./courses_route");

const router = express.Router();

// Reroute into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("admin", "publisher"), createBootcamp);
router
  .route("/:id/photo")
  .put(protect, authorize("admin", "publisher"), uploadBootcampPhoto);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("admin", "publisher"), updateBootcamp)
  .delete(protect, authorize("admin", "publisher"), deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampInRadius);

module.exports = router;
