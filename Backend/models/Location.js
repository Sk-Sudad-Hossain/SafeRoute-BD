const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },

    longitude: { type: Number, required: true },

    address: { type: String, default: "" },

    city: { type: String, required: true },

    district: { type: String, default: "" },
    
    upazila: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", LocationSchema);