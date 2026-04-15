export default function ReportList({ reports = [] }) {
  if (!reports.length) {
    return <p className="muted">No reports match these filters yet. Try widening your search.</p>;
  }

  return (
    <ul className="list">
      {reports.map(report => {
        const createdDate = report.createdAt ? new Date(report.createdAt).toLocaleString() : "";
        const severityClass = report.severityLevel ? `pill--severity-${report.severityLevel.toLowerCase()}` : "";

        return (
          <li className="list__item" key={report.id || report.createdAt}>
            <div>
              <div className="list__headline">{report.headline}</div>
              <div className="list__meta muted">
                <span className={`pill ${severityClass}`.trim()}>
                  Severity: {report.severityLabel} ({report.severity})
                </span>
                <span className="pill">Category: {report.categoryName}</span>
                <span className="pill">
                  {report.upazila ? `${report.upazila}, ` : ""}
                  {report.district || report.city}
                </span>
                <span className="pill">Vehicle: {report.vehicleLabel || "Unknown"}</span>
                <span className="pill">Status: {report.status}</span>
              </div>
            </div>
            {createdDate && <div className="muted" style={{ fontSize: "0.85rem" }}>{createdDate}</div>}
          </li>
        );
      })}
    </ul>
  );
}