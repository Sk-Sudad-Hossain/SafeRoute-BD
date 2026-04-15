import { useCallback, useEffect, useState } from "react";
import { fetchCategories } from "../controllers/categoryController";
import { fetchReportSummaries } from "../controllers/reportController";
import { DEFAULT_REPORT_FILTERS } from "../utils/reportFilters";
import ReportFilters from "../views/ReportFilters";
import ReportList from "../views/ReportList";

export default function FilterReportsPage() {
  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    const data = await fetchCategories().catch(() => []);
    setCategories(data);
  }, []);

  const loadReports = useCallback(async activeFilters => {
    setLoading(true);
    setError("");
    try {
      const normalized = { ...DEFAULT_REPORT_FILTERS, ...activeFilters };
      const data = await fetchReportSummaries(normalized);
      setReports(data);
      setFilters(normalized);
      setDraftFilters(normalized);
    } catch (err) {
      setError("Could not load reports. Connect your backend and try again.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadReports(filters);
  }, [loadCategories, loadReports]);

  const handleApply = nextFilters => {
    loadReports(nextFilters);
  };

  const handleReset = () => {
    loadReports(DEFAULT_REPORT_FILTERS);
  };

  return (
    <div className="grid">
      <section className="panel" id="filters">
        <h2 className="panel__title">Filter Reports</h2>
        <ReportFilters
          categories={categories}
          value={draftFilters}
          onChange={setDraftFilters}
          onApply={handleApply}
          onReset={handleReset}
          applying={loading}
          reports={reports}
        />
      </section>

      <section className="panel">
        <div className="panel__title" style={{ justifyContent: "space-between", display: "flex" }}>
          <span>Filtered results</span>
          <span className="muted">{loading ? "Loading..." : `${reports.length} report(s)`}</span>
        </div>
        {error && <div className="pill pill--error">{error}</div>}
        {loading && !error ? <p className="muted">Fetching reports...</p> : <ReportList reports={reports} />}
      </section>
    </div>
  );
}