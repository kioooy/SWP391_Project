import { useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const RequireAuth = ({ children, roles }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!token || !user) {
    // Nếu chưa, chuyển hướng họ đến trang đăng nhập
    // state={{ from: location }} để sau khi đăng nhập có thể quay lại trang cũ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra xem vai trò của người dùng có nằm trong danh sách vai trò được phép không
  const userHasRequiredRole = user && roles?.includes(user.role);

  if (!userHasRequiredRole) {
    // Nếu không có quyền, bạn có thể chuyển hướng về trang chủ hoặc trang "Unauthorized"
    // Ở đây, chúng ta chuyển hướng về trang chủ
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Nếu có đủ quyền, hiển thị component con (trang được bảo vệ)
  return children;
}; 