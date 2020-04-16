const express = require("express");
const Course = require("../models/Course_model");
const advancedResults = require("../middleware/advancedResults");
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses_controller");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(advancedResults(Course, "bootcamp"), getCourses)
  .post(protect, authorize("admin", "publisher"), createCourse);
// router.route("/bootcamps/:bootcampId/courses").get(getCourses);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("admin", "publisher"), updateCourse)
  .delete(protect, authorize("admin", "publisher"), deleteCourse);

module.exports = router;
