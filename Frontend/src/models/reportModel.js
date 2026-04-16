import { getSeverityMeta } from "../utils/reportFilters";

/**
 * Shape helpers for reports.
 * Keep domain logic here so controllers and views stay lean.
 */
export function createReport(payload = {}) {
  return {
    id: payload._id ?? payload.id ?? "",
    reporterId: payload.reporterId ?? "",
    vehicle: payload.vehicle ?? null,
    location: payload.location ?? {
      latitude: 0,
      longitude: 0,
      city: "",
      district: "",
      upazila: "",
      address: ""
    },
    issueType: payload.issueType ?? payload.issueCategory?.name ?? "",
    issueCategory: payload.issueCategory ?? null,
    severity: payload.severity ?? 3,
    description: payload.description ?? "",
    attachments: payload.attachments ?? [],
    Attached_Image_URL: payload.Attached_Image_URL ?? payload.attachedImageUrl ?? "",
    status: payload.status ?? "PENDING",
    createdAt: payload.createdAt ?? new Date().toISOString()
  };
}

export function summarizeReport(report) {
  const vehicleLabel =
    report.vehicle?.numberPlate ||
    report.vehicle?.registrationNumber ||
    report.vehicle?.qrCode ||
    "Vehicle not set";

  const severityScore = report.severity ?? 0;
  const severityLevel =
    severityScore >= 4 ? "HIGH" : severityScore >= 3 ? "MEDIUM" : "LOW";
  const severityMeta = getSeverityMeta(severityLevel);

  return {
    id: report._id ?? report.id ?? "",
    headline: report.description?.slice(0, 80) || "No description",
    city: report.location?.city || report.location?.district || "Unknown",
    district: report.location?.district || report.location?.city || "",
    upazila: report.location?.upazila || "",
    severity: severityScore,
    severityLevel,
    severityLabel: severityMeta.label,
    categoryName: report.issueCategory?.name || "Unknown category",
    status: report.status ?? "PENDING",
    createdAt: report.createdAt ?? new Date().toISOString(),
    vehicleLabel
  };
}