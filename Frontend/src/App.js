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
import Dashboard from "./pages/Dashboard";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

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
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
