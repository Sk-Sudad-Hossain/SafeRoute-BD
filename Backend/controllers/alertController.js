const Alert = require("../models/Alert");
const Report = require("../models/Report");

/**
 * Citizen: get active alerts (NOT expired + isActive)
 */
exports.getActiveAlerts = async (req, res) => {
  const now = new Date();

  const alerts = await Alert.find({
    isActive: true,
    expiresAt: { $gt: now } //  only within 24h
  })
    .sort({ createdAt: -1 })
    .limit(5);
  res.json(alerts);
};

/**
 *  Citizen: get ALL alerts (history) with isExpired flag
 */
exports.getAllAlerts = async (req, res) => {
  try {
    const now = new Date();

    const alerts = await Alert.find().sort({ createdAt: -1 });

    const results = alerts.map((a) => {
      const obj = a.toObject();

      const created = obj.createdAt ? new Date(obj.createdAt) : null;
      const expires = obj.expiresAt ? new Date(obj.expiresAt) : null;

      //  Expired if:
      // 1) expiresAt exists AND it's in the past
      // 2) OR expiresAt missing AND createdAt older than 24h
      const isExpired =
        expires ? expires <= now :
        created ? (now - created) > 24 * 60 * 60 * 1000 :
        true;

      obj.isExpired = isExpired;

      //  if old alert had no expiresAt, compute one for UI display
      if (!obj.expiresAt && created) {
        obj.expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000);
      }

      return obj;
    });

    return res.json(results);
  } catch (err) {
    console.error("getAllAlerts error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


/**
 * Admin: list all alerts
 */
exports.adminGetAlerts = async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  res.json(alerts);
};

/**
 * Admin: create alert
 * (optional: allow custom expiry hours later if you want)
 */
exports.adminCreateAlert = async (req, res) => {
  const { title, message, city, district, upazila, level, sourceReportId } = req.body;

  if (sourceReportId) {
    const report = await Report.findById(sourceReportId);
    if (!report || report.status !== "VERIFIED") {
      return res.status(400).json({ message: "Alert must be linked to a VERIFIED report" });
    }
  }

  const alert = await Alert.create({
    title,
    message,
    city,
    district,
    upazila,
    level,
    sourceReportId
    // expiresAt will auto default to 24h
  });

  res.status(201).json(alert);
};

exports.adminUpdateAlert = async (req, res) => {
  const updated = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Alert not found" });
  res.json(updated);
};

exports.adminDeleteAlert = async (req, res) => {
  await Alert.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};