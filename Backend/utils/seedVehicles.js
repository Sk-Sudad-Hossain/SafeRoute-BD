import Vehicle from "../models/Vehicle.js";

const defaultVehicles = [
  {
    name: "Bus 101",
    vehicleType: "Bus",
    route: "Route A - Downtown to Uptown",
    city: "New York City",
    registrationNumber: "BUS-101",
    description: "Public bus profile used for the vehicle rating and QR demo.",
  },
  {
    name: "Train XYZ",
    vehicleType: "Train",
    route: "RouteLine 1 - Central Station to East Side",
    city: "Chicago",
    registrationNumber: "TRAIN-XYZ",
    description: "Train profile used for the vehicle rating and QR demo.",
  },
  {
    name: "Taxi 123",
    vehicleType: "Taxi",
    route: "Downtown to Airport",
    city: "Los Angeles",
    registrationNumber: "TAXI-123",
    description: "Taxi profile used for the vehicle rating and QR demo.",
  },
];

export const seedVehicles = async () => {
  const count = await Vehicle.countDocuments();

  if (count > 0) {
    return;
  }

  await Vehicle.insertMany(defaultVehicles);
  console.log("Default vehicles inserted for QR and vehicle rating demo");
};
