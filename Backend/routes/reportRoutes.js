import express from "express";
import mongoose from "mongoose";
import Report from "../models/Report.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

const allowedStatuses = ["Verified", "Rejected", "Resolved"];

// Create report
router.post("/", async (req, res) => {
  try {
    const { issueType, description, location, severity } = req.body;

    if (!issueType || !description || !location || !severity) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const report = new Report({
      issueType,
      description,
      location,
      severity,
    });

    const savedReport = await report.save();

    res.status(201).json(savedReport);

  } catch (error) {
    res.status(400).json({
      message: "Failed to create report",
      error: error.message,
    });
  }
});

// Get all reports
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

export default router;