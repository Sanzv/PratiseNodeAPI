const advancedResults = (model, populate) => async (req, res, next) => {
  // Copy Request params
  const reqQuery = { ...req.query };

  // Fields to exclude from find
  const removeFields = ["select", "sort", "page", "limit"];

  // Looping over the fields to remove
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create a query String
  let queryString = JSON.stringify(reqQuery);
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  let query = model.find(JSON.parse(queryString));

  // Selecting only particular fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    console.log("Printing fields");
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-created_at");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // if (req.query.limit)
  // Executing Query
  const results = await query;

  // Pagination result
  const pagiantion = {};

  if (endIndex < total) {
    pagiantion.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagiantion.prev = {
      page: page - 1,
      limit,
    };
  }

  // Create a response object general to all
  res.advancedResults = {
    success: true,
    count: results.length,
    pagiantion,
    data: results,
  };
  next();
};

module.exports = advancedResults;
