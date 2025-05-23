import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/Home';
import FAQ from './pages/FAQ';
import News from './pages/News';
import Contact from './pages/Contact';
import NewsDetail from './pages/NewsDetail';
import { selectIsAuthenticated } from './features/auth/authSlice';

const App = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          !isAuthenticated ? <Login /> : <Navigate to="/" replace />
        } />
        <Route path="/signup" element={
          !isAuthenticated ? <Signup /> : <Navigate to="/" replace />
        } />
      </Route>

      {/* Public Homepage */}
      <Route element={<MainLayout />}>
        <Route path="/faq" element={<FAQ />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/home" element={<Home />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App; 