import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
	const { user } = useSelector((state) => state.auth);

	if (user && user.role === "admin") {
		return <Outlet />; // Cho phép truy cập
	} else {
		return (
			<Navigate
				to="/"
				replace
			/>
		);
	}
};

export default AdminRoute;
