import express from "express";
import Alert from "../models/Alert.js";

const router = express.Router();

// Create alert
router.post("/", async (req, res) => {
  try {
    const alert = new Alert(req.body);
    const savedAlert = await alert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create alert",
      error: error.message,
    });
  }
});

// Get all alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

// Get single alert
router.get("/:id", async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch alert",
      error: error.message,
    });
  }
});

// Update alert
router.patch("/:id", async (req, res) => {
  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.status(200).json(updatedAlert);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update alert",
      error: error.message,
    });
  }
});

// Delete alert
router.delete("/:id", async (req, res) => {
  try {
    const deletedAlert = await Alert.findByIdAndDelete(req.params.id);

    if (!deletedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete alert",
      error: error.message,
    });
  }
});

export default router;