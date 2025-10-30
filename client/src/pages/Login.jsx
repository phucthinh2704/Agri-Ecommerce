import { GoogleOAuthProvider } from "@react-oauth/google";
import {
	ArrowRight,
	Eye,
	EyeOff,
	Leaf,
	Lock,
	Mail,
	Phone,
	ShoppingBag,
	User,
} from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { apiLogin, apiRegister } from "../api/auth";
import { GoogleButton } from "../components";
import useAlert from "../hooks/useAlert";
import { loginSuccess } from "../store/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import path from "../utils/path";

const LoginFarmAuth = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
		rememberMe: false,
	});
	const [errors, setErrors] = useState({});
	const { showSuccess, showError } = useAlert();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const fromPath = location.state?.from || path.HOME;

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const validateForm = () => {
		let newErrors = {};

		if (!formData.email) {
			newErrors.email = "Vui lòng nhập email";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email không hợp lệ";
		}

		if (!formData.password) {
			newErrors.password = "Vui lòng nhập mật khẩu";
		} else if (formData.password.length < 6) {
			newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
		}

		if (!isLogin) {
			if (!formData.fullName) {
				newErrors.fullName = "Vui lòng nhập họ và tên";
			}
			if (!formData.phone) {
				newErrors.phone = "Vui lòng nhập số điện thoại";
			} else if (!/^\d{9,11}$/.test(formData.phone)) {
				newErrors.phone = "Số điện thoại không hợp lệ";
			}
			if (!formData.confirmPassword) {
				newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
			} else if (formData.confirmPassword !== formData.password) {
				newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);

		setTimeout(async () => {
			(async () => {
				if (isLogin) {
					const res = await apiLogin({
						email: formData.email,
						password: formData.password,
					});

					if (res.success) {
						console.log("Navigate:", fromPath)
						navigate(fromPath, { replace: true });
						dispatch(
							loginSuccess({
								user: res.user,
								accessToken: res.accessToken,
								refreshToken: res.refreshToken,
							})
						);
						showSuccess("Đăng nhập thành công");
					} else {
						showError(
							res.message ||
								"Đăng nhập thất bại. Vui lòng thử lại."
						);
						setIsLoading(false);
					}
				} else {
					const res = await apiRegister({
						email: formData.email,
						password: formData.password,
						name: formData.fullName,
						phone: formData.phone,
					});
					if (res.success) {
						showSuccess("Đăng ký tài khoản thành công");
						setIsLogin(true);
						setErrors({});
						setFormData((prev) => ({
							...prev,
							fullName: "",
							phone: "",
							confirmPassword: "",
						}));
					} else {
						showError(
							res.message || "Đăng ký thất bại. Vui lòng thử lại."
						);
					}
					setIsLoading(false);
				}
			})();
		}, 300);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 relative overflow-hidden">
			{/* Animated Background Elements */}
			<div className="absolute inset-0">
				<div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-br from-green-200/30 to-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-gradient-to-br from-yellow-200/30 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-green-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
			</div>

			{/* Floating Elements */}
			<div className="absolute top-20 left-20 animate-bounce">
				<div className="w-12 h-12 bg-green-200/40 rounded-2xl flex items-center justify-center backdrop-blur-sm">
					<Leaf className="w-6 h-6 text-green-600" />
				</div>
			</div>
			<div className="absolute bottom-32 right-32 animate-bounce delay-700">
				<div className="w-10 h-10 bg-yellow-200/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
					<span className="text-xl">🌾</span>
				</div>
			</div>

			<div className="relative z-10 flex items-center justify-center min-h-screen p-4">
				<div className="w-full max-w-6xl mx-auto">
					<div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
						<div className="grid lg:grid-cols-2 min-h-[700px]">
							{/* Left Panel - Branding & Features */}
							<div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-green-700 p-8 lg:p-12 flex flex-col justify-center text-white">
								{/* Background Pattern */}
								<div className="absolute inset-0 opacity-10">
									<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
								</div>

								<div className="relative z-10">
									{/* Logo & Brand */}
									<div className="mb-12">
										<div className="flex items-center mb-6">
											<div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
												<ShoppingBag className="w-8 h-8 text-white" />
											</div>
											<div>
												<h1 className="text-3xl lg:text-4xl font-bold mb-1">
													Nông Sản Việt
												</h1>
												<p className="text-emerald-100 text-sm">
													Chất lượng từ thiên nhiên
												</p>
											</div>
										</div>
										<div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
									</div>

									{/* Features */}
									<div className="space-y-6 mb-12">
										<div className="flex items-start space-x-4">
											<div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
												<span className="text-2xl">
													🌾
												</span>
											</div>
											<div>
												<h3 className="font-semibold text-lg mb-1">
													Gạo Cao Cấp
												</h3>
												<p className="text-emerald-100 text-sm">
													Gạo thơm ngon từ các vùng
													trồng lúa nổi tiếng, đảm bảo
													chất lượng và an toàn thực
													phẩm
												</p>
											</div>
										</div>

										<div className="flex items-start space-x-4">
											<div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
												<span className="text-2xl">
													🥭
												</span>
											</div>
											<div>
												<h3 className="font-semibold text-lg mb-1">
													Xoài Tươi Ngon
												</h3>
												<p className="text-emerald-100 text-sm">
													Xoài chín cây từ các vườn
													trồng hữu cơ, ngọt thơm và
													giàu dinh dưỡng
												</p>
											</div>
										</div>

										<div className="flex items-start space-x-4">
											<div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
												<span className="text-2xl">
													🚚
												</span>
											</div>
											<div>
												<h3 className="font-semibold text-lg mb-1">
													Giao Hàng Nhanh
												</h3>
												<p className="text-emerald-100 text-sm">
													Hệ thống giao hàng toàn quốc
													trong 24h, đảm bảo sản phẩm
													tươi ngon
												</p>
											</div>
										</div>
									</div>

									{/* Stats */}
									<div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
										<div className="text-center">
											<div className="text-2xl font-bold text-yellow-300">
												10K+
											</div>
											<div className="text-xs text-emerald-100">
												Khách hàng
											</div>
										</div>
										<div className="text-center">
											<div className="text-2xl font-bold text-yellow-300">
												99%
											</div>
											<div className="text-xs text-emerald-100">
												Hài lòng
											</div>
										</div>
										<div className="text-center">
											<div className="text-2xl font-bold text-yellow-300">
												24/7
											</div>
											<div className="text-xs text-emerald-100">
												Hỗ trợ
											</div>
										</div>
									</div>
								</div>

								{/* Decorative elements */}
								<div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/5 rounded-full"></div>
								<div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
							</div>

							{/* Right Panel - Auth Form */}
							<div className="p-8 lg:p-12 flex flex-col justify-center">
								<div className="max-w-sm mx-auto w-full">
									{/* Header */}
									<div className="text-center mb-8">
										<h2 className="text-3xl font-bold text-gray-800 mb-2">
											{isLogin
												? "Chào mừng trở lại"
												: "Tạo tài khoản mới"}
										</h2>
										<p className="text-gray-600">
											{isLogin
												? "Đăng nhập để tiếp tục mua sắm"
												: "Tham gia cùng chúng tôi ngay hôm nay"}
										</p>
										{/* Divider */}
										<div className="w-10 h-1 mx-auto my-4 bg-gray-200 rounded-full"></div>
										<Link to={"/"}>
											<p className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
												Hoặc tiếp tục mua hàng mà không
												cần đăng nhập
											</p>
										</Link>
									</div>

									{/* Tab Switcher */}
									<div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
										<button
											onClick={() => setIsLogin(true)}
											className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
												isLogin
													? "bg-white text-emerald-600 shadow-md"
													: "text-gray-500 hover:text-gray-700"
											}`}>
											Đăng Nhập
										</button>
										<button
											onClick={() => setIsLogin(false)}
											className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
												!isLogin
													? "bg-white text-emerald-600 shadow-md"
													: "text-gray-500 hover:text-gray-700"
											}`}>
											Đăng Ký
										</button>
									</div>

									{/* Form */}
									<form onSubmit={handleSubmit}>
										<div className="space-y-5">
											{!isLogin && (
												<div className="relative group">
													<User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
													<input
														type="text"
														name="fullName"
														placeholder="Họ và tên đầy đủ"
														value={
															formData.fullName
														}
														onChange={
															handleInputChange
														}
														className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all duration-200 placeholder-gray-400"
													/>
													{errors.fullName && (
														<p className="text-red-500 text-sm mt-1">
															{errors.fullName}
														</p>
													)}
												</div>
											)}

											<div className="relative group">
												<Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
												<input
													type="email"
													name="email"
													placeholder="Địa chỉ email"
													value={formData.email}
													onChange={handleInputChange}
													className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all duration-200 placeholder-gray-400"
												/>
												{errors.email && (
													<p className="text-red-500 text-sm mt-1">
														{errors.email}
													</p>
												)}
											</div>

											{!isLogin && (
												<div className="relative group">
													<Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
													<input
														type="tel"
														name="phone"
														placeholder="Số điện thoại"
														value={formData.phone}
														onChange={
															handleInputChange
														}
														className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all duration-200 placeholder-gray-400"
													/>
													{errors.phone && (
														<p className="text-red-500 text-sm mt-1">
															{errors.phone}
														</p>
													)}
												</div>
											)}

											<div className="relative group">
												<Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
												<input
													type={
														showPassword
															? "text"
															: "password"
													}
													name="password"
													placeholder="Mật khẩu"
													value={formData.password}
													onChange={handleInputChange}
													className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all duration-200 placeholder-gray-400"
												/>
												<button
													type="button"
													onClick={() =>
														setShowPassword(
															!showPassword
														)
													}
													className="absolute right-4 top-5 text-gray-400 hover:text-emerald-500 transition-colors">
													{showPassword ? (
														<EyeOff className="h-5 w-5" />
													) : (
														<Eye className="h-5 w-5" />
													)}
												</button>
												{errors.password && (
													<p className="text-red-500 text-sm mt-1">
														{errors.password}
													</p>
												)}
											</div>

											{!isLogin && (
												<div className="relative group">
													<Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
													<input
														type={
															showConfirmPassword
																? "text"
																: "password"
														}
														name="confirmPassword"
														placeholder="Xác nhận mật khẩu"
														value={
															formData.confirmPassword
														}
														onChange={
															handleInputChange
														}
														className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all duration-200 placeholder-gray-400"
													/>
													<button
														type="button"
														onClick={() =>
															setShowConfirmPassword(
																!showConfirmPassword
															)
														}
														className="absolute right-4 top-5 text-gray-400 hover:text-emerald-500 transition-colors">
														{showConfirmPassword ? (
															<EyeOff className="h-5 w-5" />
														) : (
															<Eye className="h-5 w-5" />
														)}
													</button>
													{errors.confirmPassword && (
														<p className="text-red-500 text-sm mt-1">
															{
																errors.confirmPassword
															}
														</p>
													)}
												</div>
											)}

											{isLogin && (
												<div className="flex items-center justify-between">
													<label className="flex items-center cursor-pointer">
														<input
															type="checkbox"
															name="rememberMe"
															checked={
																formData.rememberMe
															}
															onChange={
																handleInputChange
															}
															className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
														/>
														<span className="ml-2 text-sm text-gray-600">
															Ghi nhớ đăng nhập
														</span>
													</label>
													<button
														type="button"
														className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
														Quên mật khẩu?
													</button>
												</div>
											)}

											<button
												onClick={handleSubmit}
												disabled={isLoading}
												className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center group">
												{isLoading ? (
													<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
												) : (
													<>
														{isLogin
															? "Đăng Nhập"
															: "Tạo Tài Khoản"}
														<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
													</>
												)}
											</button>

											{/* Divider */}
											<div className="relative my-6">
												<div className="absolute inset-0 flex items-center">
													<div className="w-full border-t border-gray-200"></div>
												</div>
												<div className="relative flex justify-center text-sm">
													<span className="px-4 bg-white text-gray-500">
														Hoặc tiếp tục với
													</span>
												</div>
											</div>

											{/* Social Login */}
											<div className="grid grid-cols-2 gap-3">
												<GoogleOAuthProvider
													clientId={`${
														import.meta.env
															.VITE_GOOGLE_CLIENT_ID
													}`}>
													<GoogleButton></GoogleButton>
												</GoogleOAuthProvider>
												<button
													type="button"
													className="flex items-center justify-center py-3 px-4 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 group">
													<svg
														className="w-5 h-5 mr-2"
														fill="#1877F2"
														viewBox="0 0 24 24">
														<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
													</svg>
													<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
														Facebook
													</span>
												</button>
											</div>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="text-center mt-8">
						<p className="text-sm text-gray-600">
							© 2025 Nông Sản Việt. Cam kết chất lượng từ trang
							trại đến bàn ăn.
						</p>
						<div className="flex justify-center items-center space-x-6 mt-3 text-xs text-gray-500">
							<a
								href="#"
								className="hover:text-emerald-600 transition-colors">
								Chính sách bảo mật
							</a>
							<a
								href="#"
								className="hover:text-emerald-600 transition-colors">
								Điều khoản sử dụng
							</a>
							<a
								href="#"
								className="hover:text-emerald-600 transition-colors">
								Liên hệ hỗ trợ
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginFarmAuth;
