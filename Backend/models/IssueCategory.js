const mongoose = require("mongoose");

const issueCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },       // e.g. "Overspeeding"
    description: { type: String }                 // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("IssueCategory", issueCategorySchema);