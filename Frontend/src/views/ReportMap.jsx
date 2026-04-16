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

//  CLICK HANDLER
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

  const mapRef = useRef(null); // 

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
        label: r.issueType || "Issue",
        description: r.description || "",
        locationLabel: 
          typeof r.location === "string" 
            ? r.location 
            : (() => {
                const parts = [];
                if (r.location?.upazila) parts.push(r.location.upazila);
                if (r.location?.district) parts.push(r.location.district);
                if (r.location?.city && !parts.includes(r.location.city)) parts.push(r.location.city);
                return parts.length > 0 ? parts.join(", ") : (r.location?.address || "Unknown Location");
              })(),
        createdAt: r.createdAt,
        imageUrl: r.Attached_Image_URL || "",
        reporterId: r.reporterId || "Unknown",
        adminNote: r.adminNote || "",
        };

      });
  }, [reports]);

  // FIXED GPS (LOAD ONCE + MOVE MAP)
  useEffect(() => {
    if (!selectMode || gpsLoaded) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];

        setSelectedPosition(coords);

        //  MOVE MAP ON LOAD
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
          mapRef.current = mapInstance; // STORE MAP
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
            <Popup maxWidth={400} className="report-popup">
            <div className="map-info">
                {/* IMAGE AT TOP FOR CLEAR VISIBILITY */}
                {p.imageUrl ? (
                  <div className="popup-image-wrapper-top">
                    <img
                      src={p.imageUrl}
                      alt="Report attachment"
                      className="popup-image-large"
                      onError={(e) => {
                        e.target.alt = "Image failed to load";
                        e.target.style.backgroundColor = "#f0f0f0";
                      }}
                    />
                  </div>
                ) : (
                  <div className="popup-no-image">📷 No image attached</div>
                )}

                <div className="popup-header">
                  <strong className="popup-title">{p.label}</strong>
                  <span className={`popup-status status-${p.status?.toLowerCase()}`}>{p.status}</span>
                </div>

                {p.locationLabel && (
                  <div className="popup-location-name">
                    <strong>📍 Location:</strong>
                    <p>{p.locationLabel}</p>
                  </div>
                )}

                <div className="popup-section">
                  <strong>Description</strong>
                  <p>{p.description || "No description provided."}</p>
                </div>

                <div className="popup-meta">
                  <div className="meta-item">
                    <span className="meta-label">Severity:</span>
                    <span className={`severity-${p.severity}`}>{p.severity}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status:</span>
                    <span>{p.status}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Reporter ID:</span>
                    <span>{p.reporterId}</span>
                  </div>
                </div>

                {p.adminNote && (
                  <div className="popup-section admin-note">
                    <strong>Admin Note</strong>
                    <p>{p.adminNote}</p>
                  </div>
                )}

                {p.createdAt && (
                  <div className="popup-date">
                    🕐 {new Date(p.createdAt).toLocaleString()}
                  </div>
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