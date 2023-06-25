const mongoose = require("mongoose");

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    titles: String,
    description: String,
    price: Number,
    quantityStock:Number,
    published:Boolean,
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
      }
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
  )
);

module.exports = Product;
