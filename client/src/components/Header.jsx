import {
	ChevronDown,
	Heart,
	History,
	LayoutDashboard,
	Leaf,
	Loader2,
	LogOut,
	Menu,
	Package,
	Search,
	Settings,
	ShoppingCart,
	User,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGetAllProducts } from "../api/product";
import path from "../utils/path";

const Header = ({
	cartCount,
	user,
	onLogout,
	categories = [],
	onEditProfile,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const userMenuRef = useRef(null);

	const [suggestions, setSuggestions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const suggestionsRef = useRef(null);
	const suggestionsRefDesktop = useRef(null);
	const suggestionsRefMobile = useRef(null);

	const navigate = useNavigate();

	useEffect(() => {
		// Hủy timer nếu có
		const timerId = setTimeout(async () => {
			if (searchQuery.trim()) {
				setIsLoading(true);
				try {
					const res = await apiGetAllProducts({
						search: searchQuery,
						limit: 5, // Lấy 5 gợi ý
					});
					if (res.success) {
						setSuggestions(res.data);
					}
				} catch (error) {
					console.error("Lỗi khi tìm kiếm:", error);
					setSuggestions([]);
				} finally {
					setIsLoading(false);
				}
			} else {
				setSuggestions([]); // Xóa gợi ý nếu input rỗng
			}
		}, 300); // Delay 300ms

		// Cleanup: Hủy timer khi component unmount hoặc searchQuery thay đổi
		return () => {
			clearTimeout(timerId);
		};
	}, [searchQuery]);

	// 6. Cập nhật useEffect để xử lý click ra ngoài
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Đóng user menu
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target)
			) {
				setIsUserMenuOpen(false);
			}
			// Đóng suggestions
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target)
			) {
				setSuggestions([]);
			}
			const inDesktop = suggestionsRefDesktop.current?.contains(
				event.target
			);
			const inMobile = suggestionsRefMobile.current?.contains(
				event.target
			);
			if (!inDesktop && !inMobile) setSuggestions([]);
		};

		// document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []); // Chỉ chạy 1 lần

	// 7. Cập nhật hàm submit để điều hướng
	const handleSearchSubmit = () => {
		const trimmedQuery = searchQuery.trim();
		if (trimmedQuery) {
			setSuggestions([]); // Đóng gợi ý
			setSearchQuery(""); // Xóa chữ trong input

			// Điều hướng đến trang AllProductsPage với query param 'search'
			navigate(
				`${path.PRODUCTS}?search=${encodeURIComponent(trimmedQuery)}`
			);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSearchSubmit();
		}
	};

	// 8. Thêm hàm xử lý khi click vào suggestion
	const handleSuggestionClick = (slug) => {
		setSearchQuery(""); // Xóa input
		setSuggestions([]); // Đóng dropdown
		navigate(`/product/${slug}`); // Đi tới trang chi tiết
	};

	const getRoleDisplay = (role) => {
		const roleMap = {
			customer: "Khách hàng",
			admin: "Quản trị viên",
			seller: "Người bán",
		};
		return roleMap[role] || "Khách hàng";
	};

	const getRoleBadgeColor = (role) => {
		const colorMap = {
			customer: "bg-blue-100 text-blue-800",
			admin: "bg-purple-100 text-purple-800",
			seller: "bg-green-100 text-green-800",
		};
		return colorMap[role] || "bg-gray-100 text-gray-800";
	};

	return (
		<header className="bg-white shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link to="/">
						<div className="flex items-center space-x-2 cursor-pointer">
							<Leaf className="w-8 h-8 text-green-600" />
							<span className="text-2xl font-bold text-green-700">
								FarmFresh
							</span>
						</div>
					</Link>

					{/* Search Bar - Desktop */}
					<div
						className="hidden md:flex flex-1 max-w-md mx-8"
						ref={suggestionsRefDesktop}>
						<div className="relative w-full">
							<input
								type="text"
								placeholder="Tìm kiếm sản phẩm..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) =>
									e.key === "Enter" && handleSearchSubmit()
								}
								autoComplete="off"
								className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
							<button
								onClick={handleSearchSubmit}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform">
								<Search className="w-5 h-5 text-gray-400" />
							</button>

							{/* 10. Render Dropdown Gợi ý (Desktop) */}
							{(isLoading || suggestions.length > 0) && (
								<div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
									{isLoading ? (
										<div className="flex items-center justify-center px-4 py-2 text-gray-500">
											<Loader2 className="w-4 h-4 animate-spin mr-2" />
											Đang tìm...
										</div>
									) : (
										suggestions.map((product) => (
											<div
												key={product._id}
												onMouseDown={(e) =>
													e.stopPropagation()
												}
												onClick={() =>
													handleSuggestionClick(
														product.slug
													)
												}
												className="flex items-center px-4 py-2 space-x-3 hover:bg-green-100 cursor-pointer">
												<div className="w-10 h-10 bg-green-100 rounded-full overflow-hidden">
													<img
														src={product.images[0]}
														alt={product.name}
														className="w-full h-full object-cover"
													/>
												</div>
												<div className="flex-1 min-w-0 font-medium">
													<p className="text-s text-gray-800 truncate">
														{product.name}
													</p>
												</div>
											</div>
										))
									)}
									{/* Nút "Tìm kiếm cho..." */}
									{searchQuery && !isLoading && (
										<button
											onClick={handleSearchSubmit}
											className="w-full flex items-center px-4 py-2 space-x-3 hover:bg-gray-100 cursor-pointer border-t border-gray-100 text-left">
											<Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
											<p className="text-sm text-green-600 font-medium">
												Tìm kiếm cho "{searchQuery}"
											</p>
										</button>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center space-x-4">
						{/* User Account - Desktop */}
						{user ? (
							<div
								className="hidden md:block relative"
								ref={userMenuRef}>
								<button
									onClick={() =>
										setIsUserMenuOpen(!isUserMenuOpen)
									}
									className="cursor-pointer flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors">
									{user.avatar ? (
										<img
											src={user.avatar}
											alt={user.name}
											className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
										/>
									) : (
										<div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
											{user.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div className="text-left">
										<div className="text-sm font-medium">
											{user.name}
										</div>
										<div className="text-xs text-gray-500">
											{getRoleDisplay(user.role)}
										</div>
									</div>
									<ChevronDown
										className={`w-4 h-4 transition-transform ${
											isUserMenuOpen ? "rotate-180" : ""
										}`}
									/>
								</button>

								{/* User Dropdown Menu */}
								{isUserMenuOpen && (
									<div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
										{/* User Info Section */}
										<div className="px-4 py-3 border-b border-gray-100">
											<div className="flex items-center space-x-3">
												{user.avatar ? (
													<img
														src={user.avatar}
														alt={user.name}
														className="w-12 h-12 rounded-full object-cover"
													/>
												) : (
													<div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
														{user.name
															.charAt(0)
															.toUpperCase()}
													</div>
												)}
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-gray-900 truncate">
														{user.name}
													</p>
													<p className="text-xs text-gray-500 truncate">
														{user.email}
													</p>
													<span
														className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(
															user.role
														)}`}>
														{getRoleDisplay(
															user.role
														)}
													</span>
												</div>
											</div>
											{user.phone && (
												<p className="text-xs text-gray-600 mt-2">
													<span className="font-medium">
														SĐT:
													</span>{" "}
													{user.phone}
												</p>
											)}
											{user.address && (
												<p
													className="text-xs text-gray-600 mt-1 truncate"
													title={user.address}>
													<span className="font-medium">
														Địa chỉ:
													</span>{" "}
													{user.address}
												</p>
											)}
										</div>

										{/* Menu Items */}
										<div className="py-1">
											{user?.role === "admin" && (
												<Link to={path.ADMIN}>
													<button className="w-full px-4 py-2 text-left text-sm font-bold text-purple-700 hover:bg-purple-50 flex items-center space-x-2">
														<LayoutDashboard className="w-4 h-4" />
														<span>
															Trang quản trị
														</span>
													</button>
												</Link>
											)}
											<button
												className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer"
												onClick={() => {
													onEditProfile(); // Gọi hàm từ props
													setIsUserMenuOpen(false); // Đóng menu
												}}>
												<User className="w-4 h-4" />
												<span>
													Thông tin người dùng
												</span>
											</button>
											<button
												className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer"
												onClick={() =>
													navigate(
														`/${path.MY_ORDERS}`
													)
												}>
												<Package className="w-4 h-4" />
												<span>Đơn hàng của tôi</span>
											</button>
											{/* <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer">
												<Heart className="w-4 h-4" />
												<span>Sản phẩm yêu thích</span>
											</button> */}
										</div>

										{/* Logout */}
										<div className="border-t border-gray-100 pt-1">
											<button
												onClick={onLogout}
												className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
												<LogOut className="w-4 h-4" />
												<span>Đăng xuất</span>
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<Link to="/login">
								<button className="cursor-pointer hidden md:flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors">
									<User className="w-5 h-5" />
									<span className="text-sm">Đăng nhập</span>
								</button>
							</Link>
						)}

						{/* Shopping Cart */}
						<Link to={path.MY_CART}>
							<button className="relative p-2 text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
								<ShoppingCart className="w-6 h-6" />
								{cartCount > 0 && (
									<span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
										{cartCount > 99 ? "99+" : cartCount}
									</span>
								)}
							</button>
						</Link>

						{/* Mobile Menu Toggle */}
						<button
							className="md:hidden"
							onClick={() => setIsMenuOpen(!isMenuOpen)}>
							{isMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>

				{/* 2. NAVIGATION - DESKTOP */}
				<nav className="hidden md:flex items-center justify-center space-x-8 h-12 border-t border-green-700">
					<Link
						to={path.PRODUCTS}
						className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
						Tất cả sản phẩm
					</Link>
					{categories.map((category) => (
						<Link
							key={category.slug}
							to={`/category/${category.slug}`}
							className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
							{category.name}
						</Link>
					))}
				</nav>

				{/* Mobile Search */}
				<div
					className="md:hidden pb-4"
					ref={suggestionsRefMobile}>
					<div className="relative">
						<input
							type="text"
							placeholder="Tìm kiếm sản phẩm..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyPress={handleKeyPress}
							autoComplete="off"
							className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
						<button
							onClick={handleSearchSubmit}
							className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<Search className="w-5 h-5 text-gray-400" />
						</button>

						{/* 10. Render Dropdown Gợi ý (Mobile) */}
						{(isLoading || suggestions.length > 0) && (
							<div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
								{isLoading ? (
									<div className="flex items-center justify-center px-4 py-2 text-gray-500">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Đang tìm...
									</div>
								) : (
									suggestions.map((product) => (
										<div
											key={product._id}
											onMouseDown={(e) =>
												e.stopPropagation()
											}
											onClick={() =>
												handleSuggestionClick(
													product.slug
												)
											}
											className="flex items-center px-4 py-2 space-x-3 hover:bg-gray-100 cursor-pointer">
											<History className="w-4 h-4 text-gray-400 flex-shrink-0" />
											<div className="flex-1 min-w-0">
												<p className="text-sm text-gray-800 truncate">
													{product.name}
												</p>
											</div>
										</div>
									))
								)}
								{/* Nút "Tìm kiếm cho..." */}
								{searchQuery && !isLoading && (
									<button
										onClick={handleSearchSubmit}
										className="w-full flex items-center px-4 py-2 space-x-3 hover:bg-gray-100 cursor-pointer border-t border-gray-100 text-left">
										<Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
										<p className="text-sm text-green-600 font-medium">
											Tìm kiếm cho "{searchQuery}"
										</p>
									</button>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden pb-4 border-t border-gray-100 pt-4">
						{/* 3. NAVIGATION - MOBILE */}
						<div className="space-y-1">
							<h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
								Danh mục
							</h3>
							{categories.map((category) => (
								<a
									key={category.slug}
									href={`/category/${category.slug}`}
									className="w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center">
									<span>{category.name}</span>
								</a>
							))}
						</div>

						{/* Separator */}
						<div className="border-t border-gray-100 my-4"></div>

						{/* User Section - Mobile */}
						{user ? (
							<div className="space-y-3">
								{/* User Info Mobile */}
								<div className="flex items-center space-x-3 px-2 py-2 bg-gray-50 rounded-lg">
									{user.avatar ? (
										<img
											src={user.avatar}
											alt={user.name}
											className="w-10 h-10 rounded-full object-cover"
										/>
									) : (
										<div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
											{user.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-gray-900 truncate">
											{user.name}
										</p>
										<p className="text-xs text-gray-500 truncate">
											{user.email}
										</p>
									</div>
								</div>

								{/* Mobile Menu Items */}
								<button
									className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer"
									onClick={() => {
										onEditProfile(); // Gọi hàm từ props
										setIsUserMenuOpen(false); // Đóng menu
									}}>
									<User className="w-4 h-4" />
									<span>Thông tin người dùng</span>
								</button>
								<button
									className="w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
									onClick={() =>
										navigate(`/${path.MY_ORDERS}`)
									}>
									<Package className="w-4 h-4" />
									<span>Đơn hàng của tôi</span>
								</button>
								{/* <button className="w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
									<Heart className="w-4 h-4" />
									<span>Sản phẩm yêu thích</span>
								</button> */}
								<button
									onClick={onLogout}
									className="w-full px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded flex items-center space-x-2">
									<LogOut className="w-4 h-4" />
									<span>Đăng xuất</span>
								</button>
							</div>
						) : (
							<Link to="/login">
								<button className="w-full px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2">
									<User className="w-4 h-4" />
									<span>Đăng nhập</span>
								</button>
							</Link>
						)}
					</div>
				)}
			</div>
		</header>
	);
};
export default Header;
