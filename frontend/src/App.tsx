import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/home/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import NurseExam from "./pages/nurse/NurseExam";
import DoctorExam from "./pages/doctor/DoctorExam";
import ServicesPage from "./pages/home/ServicesPage/ServicesPage";
import EventsPage from "./pages/home/EventsPage/EventsPage";
import Profile from "./pages/auth/Profile";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientMedicalHistory from "./pages/patient/PatientMedicalHistory";

export default function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        {/* Các trang Public sử dụng Main Layout (Header/Footer) */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/dich-vu"
          element={
            <Layout>
              <ServicesPage />
            </Layout>
          }
        />
        <Route
          path="/su-kien"
          element={
            <Layout>
              <EventsPage />
            </Layout>
          }
        />

        {/* Trang Đăng nhập đứng độc lập (hoặc dùng Main Layout tuỳ bạn) */}
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/patient-appointments" element={<PatientAppointments />} />
        <Route path="/patient-history" element={<PatientMedicalHistory />} />

        {/* Các trang Nghiệp vụ Nội bộ (Sử dụng DashboardLayout bên trong component của chúng) */}
        <Route path="/nurse" element={<NurseExam />} />
        <Route path="/doctor" element={<DoctorExam />} />
      </Routes>
    </Router>
  );
}
