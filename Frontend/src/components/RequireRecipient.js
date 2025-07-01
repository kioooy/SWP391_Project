import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const RequireRecipient = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user || !user.isRecipient) {
    // Nếu không phải recipient, chuyển về trang chủ
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireRecipient; 