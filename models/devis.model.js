const mongoose = require("mongoose");

const Devis = mongoose.model(
  "Devis",
  new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
      title: String,
      date: Date,
      customer : String,
      total : Number,
      description: String,
      status: {
        type: String,
        enum: ["draft", "pending", "approved", "rejected"],
        default: "draft"
      },
      published: Boolean
    },
    { timestamps: true }
  )
);

module.exports = Devis;
