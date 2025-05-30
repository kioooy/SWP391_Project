import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/Home';
import FAQ from './pages/FAQ';
import News from './pages/News';
import Contact from './pages/Contact';
import NewsDetail from './pages/NewsDetail';
import Profile from './pages/Profile';
import ScheduleEvents from './pages/ScheduleEvents';
import { selectIsAuthenticated } from './features/auth/authSlice';

const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* Auth Routes - Đặt riêng biệt không nằm trong MainLayout */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Main Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/schedule-events" element={<ScheduleEvents />} />
        <Route path="/profile" element={
          isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
        } />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App; 