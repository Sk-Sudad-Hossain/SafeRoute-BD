import express from "express";
import Report from "../models/Report.js";

const router = express.Router();

// Create report
router.post("/", async (req, res) => {
  try {
    const report = new Report(req.body);
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

// delete reports
router.delete("/:id", async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete alert",
      error: error.message,
    });
  }
});

// Update report status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const allowedStatuses = ["Verified", "Rejected", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || "",
      },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update report status",
      error: error.message,
    });
  }
});

export default router;