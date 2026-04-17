import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { severityColor, severityRadiusMeters } from "../utils/map";
import "./map.css";

const defaultCenter = [23.8103, 90.4125];

// ✅ CLICK HANDLER
function MapClickHandler({ setLocation, setSelectedPosition, selectMode }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (!selectMode) return;

      const coords = [e.latlng.lat, e.latlng.lng];

      setSelectedPosition(coords);

      // 🔥 MOVE MAP ON CLICK
      map.flyTo(coords, 15);

      if (setLocation) {
        setLocation({
          lat: coords[0],
          lng: coords[1],
        });
      }
    },
  });

  return null;
}

export default function ReportMap({
  reports = [],
  setLocation,
  selectMode = false,
}) {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [gpsLoaded, setGpsLoaded] = useState(false);

  const mapRef = useRef(null); // ✅ NEW

  const points = useMemo(() => {
    return (reports || [])
      .filter((r) => r.location)
      .map((r) => {
        const [lat, lng] =
          typeof r.location === "string"
            ? r.location.split(",").map(Number)
            : [r.location.latitude, r.location.longitude];

        return {
          id: r._id || r.id,
          lat,
          lng,
          severity: Number(r.severity ?? 3),
          status: r.status ?? "Pending",
          label: r.issueCategory?.name || "Issue",
          description: r.description || "",
          locationLabel:
            `${r.location?.upazila || ""} ${r.location?.district || ""}`.trim(),
          createdAt: r.createdAt,
        };
      });
  }, [reports]);

  //  GPS (LOAD ONCE + MOVE MAP)
  useEffect(() => {
    if (!selectMode || gpsLoaded) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];

        setSelectedPosition(coords);

        // 🔥 MOVE MAP ON LOAD
        if (mapRef.current) {
          mapRef.current.flyTo(coords, 15);
        }

        if (setLocation) {
          setLocation({
            lat: coords[0],
            lng: coords[1],
          });
        }

        setGpsLoaded(true);
      },
      () => console.log("GPS permission denied")
    );
  }, [selectMode, gpsLoaded, setLocation]);

  const center =
    selectedPosition ||
    (points.length ? [points[0].lat, points[0].lng] : defaultCenter);

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={13}
        className="leaflet-map"
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance; 
        }}
      >
        {/* CLICK HANDLER */}
        <MapClickHandler
          setLocation={setLocation}
          setSelectedPosition={setSelectedPosition}
          selectMode={selectMode}
        />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* EXISTING ZONES */}
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

        {/* EXISTING MARKERS */}
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

        {/* SELECTED LOCATION */}
        {selectMode && selectedPosition && (
          <CircleMarker
            center={selectedPosition}
            radius={10}
            pathOptions={{
              color: "#000",
              weight: 2,
              fillColor: "#3388ff",
              fillOpacity: 1,
            }}
          >
            <Popup>Selected Location</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}