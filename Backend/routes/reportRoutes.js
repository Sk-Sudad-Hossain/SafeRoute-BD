import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Report from "../models/Report.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(" Created uploads directory:", uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const allowedStatuses = ["Verified", "Rejected", "Resolved"];

// Create report (must be logged in, accepts optional photo)
router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {
  console.log("=== Report POST received ===");
  console.log("   req.body:", req.body);
  console.log("   req.file:", req.file);
  console.log("   req.user:", req.user?._id);

  try {
    const { issueType, description, severity, incidentTime } = req.body;

    // location comes as a JSON string when using FormData
    let location;
    try {
      location =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;
    } catch (err) {
      console.error(" Location parse error:", err);
      return res.status(400).json({ message: "Invalid location format" });
    }

    if (!issueType || !description || !location || !severity || !incidentTime) {
      console.error(" Missing fields:", {
        issueType,
        description,
        location,
        severity,
        incidentTime,
      });
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Photo is required
    if (!req.file) {
      return res.status(400).json({
        message: "Photo evidence is required",
      });
    }

    // Parse and validate incidentTime
    const incidentDate = new Date(incidentTime);
    if (isNaN(incidentDate.getTime())) {
      return res.status(400).json({ message: "Invalid incident time" });
    }
    if (incidentDate > new Date()) {
      return res
        .status(400)
        .json({ message: "Incident time cannot be in the future" });
    }

    const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log("   photoUrl:", photoUrl);

    const report = new Report({
      issueType,
      description,
      location,
      severity,
      incidentTime: incidentDate,
      photoUrl,
      reportedBy: req.user._id,
    });

    const savedReport = await report.save();

    console.log(" Report saved:", savedReport._id);
    res.status(201).json(savedReport);
  } catch (error) {
    console.error(" Report creation error:", error);
    res.status(400).json({
      message: "Failed to create report",
      error: error.message || "Unknown error",
    });
  }
});

// Get all reports (public - used by map and admin dashboard)
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
});

// Get reports created by the logged-in user
// IMPORTANT: this must come BEFORE "/:id" route
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your reports",
      error: error.message,
    });
  }
});

// Get single report by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch report",
      error: error.message,
    });
  }
});

// Delete report - admin only
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const deletedReport = await Report.findByIdAndDelete(req.params.id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete report",
      error: error.message,
    });
  }
});

// Update report status - admin only
router.patch("/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const { status, adminNote } = req.body;

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote?.trim() || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      message: `Report marked as ${status}`,
      report: updatedReport,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update report status",
      error: error.message,
    });
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  console.error(" Multer error:", err);
  res.status(400).json({
    message: err.message || "Upload failed",
    error: err.toString(),
  });
});

export default router;