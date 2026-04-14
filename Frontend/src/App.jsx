import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/Homepage";
import ReportPage from "./pages/ReportPage";
import MyReportsPage from "./pages/MyReportsPage";
import MapTestPage from "./pages/MapTestPage";
import AdminAlerts from "./pages/AdminAlerts";
import AlertsPage from "./pages/AlertsPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleProfilePage from "./pages/VehicleProfilePage";
import FeedbackPage from "./pages/FeedbackPage";
import QrScannerPage from "./pages/QrScannerPage";
import AdminAnalytics from "./pages/Analytics";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/reports" element={<MyReportsPage />} />
      <Route path="/map-test" element={<MapTestPage />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute> }/>
      <Route path="/admin/alerts" element={<AdminAlerts />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/vehicles/:id" element={<VehicleProfilePage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/scan" element={<QrScannerPage />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
    </Routes>
  );
}