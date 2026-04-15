import { useEffect, useState } from "react";
import ReportMap from "../views/ReportMap"; 
import { fetchReports } from "../controllers/reportController"; 


export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchReports({ status: "VERIFIED" });
        setReports((data || []).filter(r => (r.status || "").toUpperCase() === "VERIFIED"));
      } catch (err) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="grid">
      <section className="panel">
        <h2 className="panel__title">Unsafe Areas Map</h2>
        <p className="muted">Color-coded zones: red/high, yellow/moderate, green/low.</p>
        {error && <div className="pill pill--error">{error}</div>}
        {loading ? <p className="muted">Loading map data...</p> : <ReportMap reports={reports} />}
      </section>
    </div>
  );
}