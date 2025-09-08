import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  // Nếu đã đăng nhập, chuyển hướng về trang chủ
  if (user) return <Navigate to="/" replace />;

  return children;
}
