import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { severityColor, severityRadiusMeters } from "../utils/map";
import "./map.css";

const defaultCenter = [23.8103, 90.4125];

export default function ReportMap({ reports = [] }) {
  const points = useMemo(() => {
    return (reports || [])
      .filter(
        (r) =>
          r.location &&
          r.location.latitude !== undefined &&
          r.location.longitude !== undefined
      )
      .map((r) => ({
        id: r._id || r.id,
        lat: Number(r.location.latitude),
        lng: Number(r.location.longitude),
        severity: Number(r.severity ?? 3),
        status: r.status ?? "Pending",
        label: r.issueCategory?.name || "Issue",
        description: r.description || "",
        locationLabel:
          `${r.location.upazila || ""} ${r.location.district || ""}`.trim(),
        createdAt: r.createdAt,
      }));
  }, [reports]);

  const center = points.length ? [points[0].lat, points[0].lng] : defaultCenter;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={12} className="leaflet-map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((p) => {
          const color = severityColor(p.severity);
          const radius = severityRadiusMeters(p.severity);

          return (
            <Circle
              key={`zone-${p.id}`}
              center={[p.lat, p.lng]}
              radius={radius}
              pathOptions={{
                color,
                weight: 2,
                opacity: 0.8,
                fillColor: color,
                fillOpacity: 0.25,
              }}
            />
          );
        })}

        {points.map((p) => {
          const color = severityColor(p.severity);

          return (
            <CircleMarker
              key={`marker-${p.id}`}
              center={[p.lat, p.lng]}
              radius={7}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="map-info">
                  <strong>{p.label}</strong>
                  <div>{p.locationLabel}</div>
                  <div>{p.description || "No description."}</div>
                  <div>
                    Severity: {p.severity} | Status: {p.status}
                  </div>
                  {p.createdAt && (
                    <div>{new Date(p.createdAt).toLocaleString()}</div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}