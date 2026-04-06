import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import busImage from "../assets/prototype-vehicles/bus.png";
import trainImage from "../assets/prototype-vehicles/train.png";
import taxiImage from "../assets/prototype-vehicles/taxi.png";
import "../styles/vehiclePages.css";

const fallbackVehicles = {
  bus: {
    _id: "bus-demo",
    name: "Bus 101",
    route: "Route A - Downtown to Uptown",
    city: "New York City",
    averageSafetyScore: 0,
    totalRatings: 0,
    vehicleType: "Bus",
  },
  train: {
    _id: "train-demo",
    name: "Train XYZ",
    route: "RouteLine 1 - Central Station to East Side",
    city: "Chicago",
    averageSafetyScore: 0,
    totalRatings: 0,
    vehicleType: "Train",
  },
  taxi: {
    _id: "taxi-demo",
    name: "Taxi 123",
    route: "Downtown to Airport",
    city: "Los Angeles",
    averageSafetyScore: 0,
    totalRatings: 0,
    vehicleType: "Taxi",
  },
};

const findRepresentativeVehicle = (vehicles, key) => {
  const checks = {
    bus: (vehicle) => vehicle.vehicleType?.toLowerCase() === "bus",
    train: (vehicle) => ["train", "metro"].includes(vehicle.vehicleType?.toLowerCase()),
    taxi: (vehicle) => vehicle.vehicleType?.toLowerCase() === "taxi",
  };

  return vehicles.find(checks[key]) || fallbackVehicles[key];
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load vehicles");
        }

        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const displayCards = useMemo(
    () => [
      { key: "bus", title: "Bus", image: busImage, vehicle: findRepresentativeVehicle(vehicles, "bus") },
      { key: "train", title: "Train", image: trainImage, vehicle: findRepresentativeVehicle(vehicles, "train") },
      { key: "taxi", title: "Taxi", image: taxiImage, vehicle: findRepresentativeVehicle(vehicles, "taxi") },
    ],
    [vehicles]
  );

  if (loading) {
    return (
      <div className="vehicle-shell">
        <div className="vehicle-selector-device vehicle-loading-state">Loading vehicle profiles...</div>
      </div>
    );
  }

  return (
    <div className="vehicle-shell">
      <div className="vehicle-selector-device">
        <header className="vehicle-selector-header">
          <h1>Vehicle Profile Page</h1>
        </header>

        <main className="vehicle-selector-body">
          {error && <div className="vehicle-inline-alert">{error}</div>}

          <section className="vehicle-selector-grid" aria-label="Vehicle categories">
            {displayCards.map((item) => (
              <Link
                key={item.key}
                to={item.vehicle?._id ? `/vehicles/${item.vehicle._id}` : "/vehicles"}
                className="vehicle-selector-card"
                aria-label={`Open ${item.title} profile`}
              >
                <div className="vehicle-selector-image-frame">
                  <img src={item.image} alt={item.title} className="vehicle-selector-image" />
                </div>
                <span className="vehicle-selector-label">{item.title}</span>
              </Link>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default VehiclesPage;
