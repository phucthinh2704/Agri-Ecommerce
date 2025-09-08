import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiGoogleLogin } from "../api/auth";
import { logoutUser } from "../store/auth/authThunks";
import useAlert from "../hooks/useAlert";
import { loginSuccess } from "../store/auth";

export default function Navbar() {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const { showSuccess, showError } = useAlert();

	const handleSuccess = async (credentialResponse) => {
		try {
			const credentialToken = credentialResponse.credential;

			try {
				// Gửi token lên FastAPI để verify
				const res = await apiGoogleLogin({ credentialToken });
				if (!res.success) {
					showError(res.message || "Đăng nhập thất bại");
					console.error("Error during API login:", res.message);
					return;
				}
				dispatch(
					loginSuccess({
						user: res.user,
						accessToken: res.accessToken,
						refreshToken: res.refreshToken,
					})
				);
				await showSuccess("Đăng nhập thành công!");
				navigate("/");
			} catch (error) {
				console.error("Error during API login:", error);
			}
		} catch (error) {
			console.error("Error during Google login:", error);
		}
	};

	const handleLogout = () => {
		dispatch(logoutUser());
	};

	return (
		<nav>
			{user ? (
				<>
					<span>Hello {user.name}</span>
					<button onClick={handleLogout}>Logout</button>
				</>
			) : (
				<GoogleOAuthProvider
					clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
					<div className="App">
						<GoogleLogin
							onSuccess={handleSuccess}
							onError={() => console.log("Login Failed")}
						/>
					</div>
				</GoogleOAuthProvider>
			)}
		</nav>
	);
}
