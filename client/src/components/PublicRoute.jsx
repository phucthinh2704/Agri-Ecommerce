import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function PublicRoute({ children }) {
	const { user } = useSelector((state) => state.auth);
	const location = useLocation();
	const from = location.state?.from;
	
	if (user) return <Navigate to={from || "/"} replace />;

	return children;
}
