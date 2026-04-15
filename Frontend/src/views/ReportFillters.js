import { useMemo } from "react";
import { SEVERITY_LEVELS } from "../utils/reportFilters";
import locations from "../data/bdLocations.json";
import "./reportFilters.css";

export default function ReportFilters({
  value,
  onChange,
  onApply,
  onReset,
  categories,
  reports = [],
  applying
}) {
  const districtOptions = useMemo(
    () => locations.map(loc => loc.district),
    []
  );

  const upazilaOptions = useMemo(() => {
    const match = locations.find(loc => loc.district === value.district);
    return match ? match.upazilas : [];
  }, [value.district]);

  const selectedCategory = categories.find(cat => cat.id === value.categoryId);
  const severityMeta = SEVERITY_LEVELS.find(level => level.value === value.severityLevel) || SEVERITY_LEVELS[0];

  const updateField = (field, newValue) => {
    if (field === "district") {
      onChange({ ...value, district: newValue, upazila: "" });
      return;
    }
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="filters">
      <div className="filters__row">
        <div className="filters__field">
          <label>District</label>
          <select
            value={value.district}
            onChange={e => updateField("district", e.target.value)}
          >
            <option value="">All districts</option>
            {districtOptions.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="filters__helper muted">Choose where you need to see safety reports.</div>
        </div>

        <div className="filters__field">
          <label>Severity level</label>
          <select
            value={value.severityLevel}
            onChange={e => updateField("severityLevel", e.target.value)}
          >
            {SEVERITY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <div className="filters__helper muted">{severityMeta.description}</div>
        </div>

        <div className="filters__field">
          <label>Upazila</label>
          <select
            value={value.upazila}
            onChange={e => updateField("upazila", e.target.value)}
            disabled={!value.district}
          >
            <option value="">{value.district ? "All upazilas" : "Pick a district first"}</option>
            {upazilaOptions.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="filters__helper muted">Filter down to specific upazilas inside the district.</div>
        </div>

        <div className="filters__field">
          <label>Issue category</label>
          <select
            value={value.categoryId}
            onChange={e => updateField("categoryId", e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map(cat => (
              <option key={cat.id || cat.name} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="filters__helper muted">Narrow down to reckless driving, road damage, or jam hotspots.</div>
        </div>
      </div>

      <div className="filters__actions">
          <div className="filters__buttons">
            <button type="button" onClick={() => onApply(value)} disabled={applying}>
              {applying ? "Filtering..." : "Apply filters"}
            </button>
            <button type="button" className="secondary" onClick={onReset} disabled={applying}>
            Reset
          </button>
        </div>
        <div className="filters__chips">
          {value.district && <span className="pill">District: {value.district}</span>}
          {value.upazila && <span className="pill">Upazila: {value.upazila}</span>}
          {value.categoryId && <span className="pill">Category: {selectedCategory?.name || "Selected"}</span>}
          {value.severityLevel !== "ALL" && (
            <span className={`pill pill--severity-${value.severityLevel.toLowerCase()}`}>
              {severityMeta.label}
            </span>
          )}
          {!value.district && !value.upazila && !value.categoryId && value.severityLevel === "ALL" && (
            <span className="muted">Showing every report</span>
          )}
        </div>
      </div>
    </div>
  );
}