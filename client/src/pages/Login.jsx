import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/auth/authSlice";
import { apiLogin } from "../api/auth";
import { Navbar, PrivateRoute } from "../components";

import Swal from "sweetalert2";

export default function Login() {
	const dispatch = useDispatch();

	const handleLogin = async (e) => {
		e.preventDefault();
		const res = await apiLogin({
			email: "admin@gmail.com",
			password: "123456",
		});

		if (res.success) {
			dispatch(
				loginSuccess({
					user: res.user,
					accessToken: res.accessToken,
					refreshToken: res.refreshToken,
				})
			);
			Swal.fire({
				title: "Login successfully",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
			});
		}
	};

	return (
		<div>
			<Navbar />
			<button onClick={handleLogin}>Login</button>
		</div>
	);
}
