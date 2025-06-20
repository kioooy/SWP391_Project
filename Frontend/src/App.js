import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/Home";
import FAQ from "./pages/FAQ";
import Events from "./pages/Events";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import BookingPage from "./pages/BookingPage";
import { selectIsAuthenticated } from "./features/auth/authSlice";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import TransfusionManagement from "./pages/TransfusionManagement ";
import BloodDonationCertificate from "./pages/Certificate";
import SearchByDistance from "./pages/SearchByDistance";
import EmergencyRequest from "./pages/EmergencyRequest";
import BloodInventory from "./pages/BloodInventory";
import UserProfile from "./pages/UserProfile";
import SearchDistance from "./pages/SearchDistance";
import Dashboard from "./pages/Dashboard";
import AppointmentHistory from "./pages/AppointmentHistory";
import HospitalLocationEdit from "./pages/HospitalLocationEdit";
import BloodSearch from "./pages/BloodSearch";
import BloodDonationPeriodManagement from './pages/BloodDonationPeriodManagement';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const App = () => {
  console.log('DEBUG App.js loaded');
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(state => state.auth.user?.role);
  console.log('isAuthenticated in App.js:', isAuthenticated);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />}
        />
      </Route>

      {/* Main Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/events" element={<Events />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route
          path="/transfusion-request"
          element={<TransfusionManagement />}
        />
        <Route path="/certificate" element={<BloodDonationCertificate />} />
        <Route path="/search-distance" element={<SearchByDistance />} />
        <Route path="/emergency-request" element={<EmergencyRequest />} />
        <Route path="/blood-inventory" element={<BloodInventory />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/search-distance" element={<SearchDistance />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<AppointmentHistory />} />
        <Route path="/hospital-location" element={<HospitalLocationEdit />} />
        <Route path="/blood-search" element={<BloodSearch />} />
        {/* Route chỉ cho staff */}
        {role === 'Staff' && (
          <Route path="/manage-blood-periods" element={<BloodDonationPeriodManagement />} />
        )}
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;