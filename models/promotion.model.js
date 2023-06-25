
const mongoose = require("mongoose");

const Promotion = mongoose.model(
  "Promotion",
  new mongoose.Schema({
     title : String,
      startDate: Date,
      endDate:Date,
      description: String,
      percentage : Number,
      promotionStatus: Boolean,
      image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
      },
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

module.exports = Promotion;

