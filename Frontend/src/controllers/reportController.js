import { API_BASE_URL, apiGet, apiPost, apiUpload, apiPatch } from "../config/apiClient";
import { createReport, summarizeReport } from "../models/reportModel";
import { buildReportQuery } from "../utils/reportFilters";


/**
 * All report-related data access lives here.
 * Replace stubs with real fetch calls when backend is ready.
 */
export async function fetchReports(filters = {}) {
  const query = buildReportQuery(filters);
  const data = await apiGet(`/api/reports${query}`).catch(() => []);
  return data.map(createReport);
}

export async function fetchReportSummaries(filters = {}) {
  const reports = await fetchReports(filters);
  return reports.map(summarizeReport);
}

export async function updateReportStatus(reportId, status) {
  if (!reportId || !status) throw new Error("Report id and status are required");
  return apiPatch(`/api/reports/${reportId}/status`, { status });
}

export async function fetchMonthlyAnalytics(year) {
  const q = year ? `?year=${year}` : "";
  const data = await apiGet(`/api/admin/monthly-analytics${q}`).catch(() => []);
  return data;
}

export async function exportReportsCSV({ year, month, start, end } = {}) {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (month) params.set("month", month);
  if (start) params.set("start", start);
  if (end) params.set("end", end);

  const url = `/api/admin/export${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("safepath-token") ? `Bearer ${localStorage.getItem("safepath-token")}` : undefined
    }
  });

  if (!res.ok) throw new Error(`Export failed with ${res.status}`);
  const text = await res.text();
  const blob = new Blob([text], { type: "text/csv" });
  const link = document.createElement("a");
  const href = URL.createObjectURL(blob);
  link.href = href;
  link.download = `reports_export_${year || 'all'}_${month || 'all'}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  return true;
}

export async function uploadMedia(file) {
  const formData = new FormData();
  const mediaType = file.type?.startsWith("video") ? "VIDEO" : "PHOTO";
  formData.append("file", file);
  formData.append("mediaType", mediaType);
  const { media } = await apiUpload("/api/upload/media", formData);
  return media;
}

export async function createReportSubmission(payload) {
  const {
    reporterId,
    vehicleId,
    busStopCode,
    busStopName,
    busStopRaw,
    latitude,
    longitude,
    city,
    district,
    upazila,
    address,
    issueCategoryId,
    severity,
    description,
    file,
    allowVehicleEdit,
    vehicleUpdates
  } = payload;

  const attachmentIds = [];
  if (file) {
    const media = await uploadMedia(file);
    if (media?._id) attachmentIds.push(media._id);
  }

  return apiPost("/api/reports", {
    reporterId,
    vehicleId,
    busStopCode,
    busStopName,
    busStopRaw,
    latitude,
    longitude,
    city,
    district,
    upazila,
    address,
    issueCategoryId,
    severity: severity ?? 3,
    description,
    attachmentIds,
    allowVehicleEdit: Boolean(allowVehicleEdit),
    vehicleUpdates
  });
}