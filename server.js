const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
// const logger = require("./mybrarymiddleware/logger");
const morgan = require("morgan"); // This is for logging
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const fileupload = require("express-fileupload");

// Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

// Importing Route Files
const bootcampRouter = require("./routes/bootcamps");
const courseRouter = require("./routes/courses_route");
const authRouter = require("./routes/auth_route");
const userRouter = require("./routes/users_route");

const app = express();

// Using a middleware
// app.use(logger);
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Body Parser
app.use(express.json());

// File uploading
app.use(fileupload());

// Cookie parser
app.use(cookieParser());

// Setting public as static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount Routers
app.use("/api/v1/bootcamps", bootcampRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

// Use middleware for error handling
app.use(errorHandler);

// Running the server
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server Running in ${process.env.NODE_ENV} mode on ${PORT}`)
);

//Handle Unhandled promise Rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error ${err.message}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
