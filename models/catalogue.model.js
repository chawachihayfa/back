
const mongoose = require("mongoose");

const Catalogue = mongoose.model(
  "Catalogue",
  new mongoose.Schema({
     title : String,
      startDate: Date,
      endDate:Date,
      image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
      },
      promotions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Promotion"
        }
      ],
      produits: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        }
      ]
    },
    { timestamps: true }
  )
);

module.exports = Catalogue;

