import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PrivateRoute({ children }) {
	const { accessToken } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	useEffect(() => {
		if (!accessToken) {
			toast.info("Bạn cần đăng nhập để vào hệ thống!", {
				autoClose: 2000,
			});
			navigate("/login", { replace: true });
		}
	}, [accessToken, navigate]);
	if (!accessToken) return null;
	return children;
}
