const mongoose = require("mongoose");

const Image = mongoose.model(
  "Image",
  new mongoose.Schema({
    filename: String,
  path: String,
  contentType: String,
  size: Number,
  published: Boolean,
  
  },
  { timestamps: true }
  )
);

module.exports = Image;
