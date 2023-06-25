
const mongoose = require("mongoose");

const Command = mongoose.model(
  "Command",
  new mongoose.Schema({

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
      dateCommand:String,
      TotalPriceCommmand:Number,
      statusCommand:Boolean,
      addressDelivry:String,
      produits: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        }
      ],
    },
    { timestamps: true }
  )
);

module.exports = Command;

