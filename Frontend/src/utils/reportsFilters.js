export const DEFAULT_REPORT_FILTERS = {
  district: "",
  upazila: "",
  categoryId: "",
  severityLevel: "ALL",
  status: ""
};

export const SEVERITY_LEVELS = [
  {
    value: "ALL",
    label: "All severities",
    description: "Show every report regardless of severity"
  },
  {
    value: "HIGH",
    label: "High (4-5)",
    description: "Major accidents or dangerous intersections",
    range: { min: 4, max: 5 }
  },
  {
    value: "MEDIUM",
    label: "Medium (3)",
    description: "Frequent minor accidents or risky turns",
    range: { min: 3, max: 3 }
  },
  {
    value: "LOW",
    label: "Low (1-2)",
    description: "Slippery roads or broken footpaths",
    range: { min: 1, max: 2 }
  }
];

export function buildReportQuery(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.city) params.set("city", filters.city);
  if (filters.district) params.set("district", filters.district);
  if (filters.upazila) params.set("upazila", filters.upazila);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.severity !== "" && filters.severity !== undefined) params.set("severity", filters.severity);

  const q = params.toString();
  return q ? `?${q}` : "";
}

export function getSeverityMeta(value = "ALL") {
  return SEVERITY_LEVELS.find(level => level.value === value) || SEVERITY_LEVELS[0];
}