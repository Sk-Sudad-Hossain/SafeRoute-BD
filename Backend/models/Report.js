import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected", "Resolved"],
      default: "Pending",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
    Attached_Image_URL:
      {
        type: String,
        required: false,
        
      },
    

  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);