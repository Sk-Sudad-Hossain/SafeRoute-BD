const Awareness = require("../models/Awareness");

/**
 * Citizen: get active awareness messages
 */
exports.getActiveAwareness = async (req, res) => {
  try {
    const now = new Date();
    const messages = await Awareness.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .populate("createdBy", "name email");
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching awareness messages", error: error.message });
  }
};

/**
 * Admin: list all awareness messages
 */
exports.adminGetAwareness = async (req, res) => {
  try {
    const messages = await Awareness.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching awareness messages", error: error.message });
  }
};

/**
 * Admin: create awareness message
 */
exports.adminCreateAwareness = async (req, res) => {
  try {
    const { title, message, description, category, priority, expiresAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not authenticated" });
    }

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const awareness = await Awareness.create({
      title,
      message,
      description,
      category,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: userId
    });

    await awareness.populate("createdBy", "name email");
    res.status(201).json(awareness);
  } catch (error) {
    res.status(500).json({ message: "Error creating awareness message", error: error.message });
  }
};

/**
 * Admin: update awareness message
 */
exports.adminUpdateAwareness = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, description, category, priority, isActive, expiresAt } = req.body;

    const updated = await Awareness.findByIdAndUpdate(
      id,
      {
        title,
        message,
        description,
        category,
        priority,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      { new: true }
    ).populate("createdBy", "name email");

    if (!updated) {
      return res.status(404).json({ message: "Awareness message not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating awareness message", error: error.message });
  }
};

/**
 * Admin: delete awareness message
 */
exports.adminDeleteAwareness = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Awareness.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Awareness message not found" });
    }

    res.json({ success: true, message: "Awareness message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting awareness message", error: error.message });
  }
};

/**
 * Admin: toggle awareness message active status
 */
exports.adminToggleAwareness = async (req, res) => {
  try {
    const { id } = req.params;
    const awareness = await Awareness.findById(id);

    if (!awareness) {
      return res.status(404).json({ message: "Awareness message not found" });
    }

    awareness.isActive = !awareness.isActive;
    await awareness.save();
    await awareness.populate("createdBy", "name email");

    res.json(awareness);
  } catch (error) {
    res.status(500).json({ message: "Error toggling awareness message", error: error.message });
  }
};