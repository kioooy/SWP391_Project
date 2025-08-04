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
import Article from "./pages/News";
import ArticleDetail from "./pages/NewsDetail";
import BookingPage from "./pages/BookingPage";
import BookingTransfusion from "./pages/BookingTransfusion";
import TransfusionHistory from "./pages/TransfusionHistory";
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
import AppointmentHistory from "./pages/AppointmentHistory";
import HospitalLocationEdit from "./pages/HospitalLocationEdit";
import BloodSearch from "./pages/BloodSearch";
import BloodDonationPeriodManagement from "./pages/BloodDonationPeriodManagement";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import DonationRequestManagement from "./pages/DonationRequestManagement";
import { RequireAuth } from "./components/RequireAuth";
import BlogPage from "./pages/BlogPage";
import UserProfileRecipient from "./pages/UserProfileRecipient";
import RequireRecipient from "./components/RequireRecipient";
import BlogDetail from "./pages/BlogDetail";
import ArticleManage from "./pages/admin/ArticleManage";
import BlogManage from "./pages/admin/BlogManage";
import Unauthorized from "./pages/Unauthorized";
import SidebarLayout from "./layouts/SidebarLayout";
import AdminProfile from "./pages/admin/AdminProfile";
import StaffProfile from "./pages/StaffProfile";
import EmergencyTransfusionPage from "./pages/admin/EmergencyTransfusion";
import BloodWorkflowDashboard from "./pages/BloodWorkflowDashboard";
import UrgentRequestManage from "./pages/admin/UrgentRequestManage";
import UserManage from './pages/admin/UserManage';
import axios from "axios";
import BloodCompatibilityPage from "./pages/BloodCompatibilityPage";
import TransfusionAppointmentHistory from "./pages/TransfusionAppointmentHistory"
import UrgentRequestManageV2 from "./pages/admin/UrgentRequestManageV2";
import UrgentDonationRegistration from "./pages/UrgentDonationRegistration";
import UrgentDonationSuccess from "./pages/UrgentDonationSuccess";


dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const App = () => {
  console.log("DEBUG App.js loaded");
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state) => state.auth.user); // Lấy user từ redux
  const role = user?.role;
  React.useEffect(() => {
    if (user && user.userId) {
      axios.post(`/api/Notification/CreateRecoveryReminder/${user.userId}`)
        .catch((err) => {
          // Có thể log lỗi hoặc bỏ qua
          console.error("Không thể tạo notification nhắc nhở phục hồi:", err);
        });
    }
  }, [user]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              // Kiểm tra nếu có thông tin urgent donation thì cho phép vào Login
              //nếu người hiến bấm vào email thì sẽ chuyển hướng đến trang urgent donation
              (() => {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                const urgentRequestId = urlParams.get('urgentRequestId');
                const bloodType = urlParams.get('bloodType');
                
                if (redirect && urgentRequestId && bloodType) {
                  console.log('🔍 [DEBUG] User authenticated but has urgent donation params, allowing access to Login');
                  return <Login />;
                } else {
                  console.log('🔍 [DEBUG] User authenticated, redirecting to home');
                  return <Navigate to="/" replace />;
                }
              })()
            )
          }
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />}
        />
      </Route>

      {/* Main Routes cho user thường */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/events" element={<Events />} />
        <Route path="/article" element={<Article />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/transfusion-history" element={<TransfusionHistory />} />
        <Route path="/transfusion-appointment-history" element={<TransfusionAppointmentHistory />} />
        <Route
          path="/profile"
          element={
            <RequireAuth roles={["Member"]}>
              <UserProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/user-profile-recipient"
          element={
            <RequireRecipient>
              <UserProfileRecipient />
            </RequireRecipient>
          }
        />
        <Route path="/certificate" element={<BloodDonationCertificate />} />
        <Route path="/emergency-request" element={<EmergencyRequest />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:postId" element={<BlogDetail />} />
        <Route path="/history" element={<AppointmentHistory />} />
        <Route 
          path="/urgent-donation-registration" 
          element={
            <RequireAuth roles={["Member"]}>
              <UrgentDonationRegistration />
            </RequireAuth>
          } 
        />
        <Route 
          path="/urgent-donation-success" 
          element={
            <RequireAuth roles={["Member"]}>
              <UrgentDonationSuccess />
            </RequireAuth>
          } 
        />
        <Route
          path="/blood-compatibility"
          element={
            <RequireRecipient>
              <BloodCompatibilityPage />
            </RequireRecipient>
          }
        />
      </Route>

      {/* Sidebar Layout cho staff/admin - TẤT CẢ route quản trị chỉ ở đây */}
      <Route element={<SidebarLayout />}>
        <Route
          path="/profile"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <UserProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile-admin"
          element={
            <RequireAuth roles={["Admin"]}>
              <AdminProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile-staff"
          element={
            <RequireAuth roles={["Staff"]}>
              <StaffProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-requests"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <DonationRequestManagement />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-blood-periods"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <BloodDonationPeriodManagement />
            </RequireAuth>
          }
        />
        <Route
          path="/blood-inventory"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <BloodInventory />
            </RequireAuth>
          }
        />
        <Route
          path="/transfusion-management"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <TransfusionManagement />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-article"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <ArticleManage />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-blog"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <BlogManage />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-urgent-request"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <UrgentRequestManage />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-urgent-request-v2"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <UrgentRequestManageV2 />
            </RequireAuth>
          }
        />
        <Route
          path="/emergency-transfusion"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <EmergencyTransfusionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/hospital-location"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <HospitalLocationEdit />
            </RequireAuth>
          }
        />
        <Route
          path="/blood-workflow"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <BloodWorkflowDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/manage-roles"
          element={
            <RequireAuth roles={["Admin"]}>
              <div>Quản lý vai trò (đang phát triển)</div>
            </RequireAuth>
          }
        />
        <Route
          path="/manage-users"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <UserManage />
            </RequireAuth>
          }
        />
        <Route
          path="/certificate"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <BloodDonationCertificate />
            </RequireAuth>
          }
        />
        {/* Đưa blood-search vào layout quản trị */}
        <Route
          path="/blood-search"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <BloodSearch />
            </RequireAuth>
          }
        />
        <Route
          path="/search-by-distance"
          element={
            <RequireAuth roles={["Admin", "Staff"]}>
              <SearchByDistance />
            </RequireAuth>
          }
        />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
