import { useSelector } from "react-redux";
import { Bell, LogOut, Search, Menu, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const AdminHeader = () => {
	const { user } = useSelector((state) => state.auth);
	const [showNotifications, setShowNotifications] = useState(false);

	const notifications = [
		{ id: 1, text: "Đơn hàng mới #12345", time: "2 phút trước" },
		{ id: 2, text: "Sản phẩm sắp hết hàng", time: "15 phút trước" },
		{ id: 3, text: "Khách hàng mới đăng ký", time: "1 giờ trước" },
	];

	return (
		<header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
			<div className="px-6 py-4 flex justify-between items-center">
				{/* Left section - Search */}
				<div className="flex items-center gap-4 flex-1 max-w-2xl">
					<button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
						<Menu className="w-6 h-6 text-slate-600" />
					</button>
					
					<div className="relative flex-1 hidden md:block">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
						<input
							type="text"
							placeholder="Tìm kiếm sản phẩm, đơn hàng..."
							className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
						/>
					</div>
				</div>

				{/* Right section - Actions */}
				<div className="flex items-center gap-3">
					{/* Settings */}
					<button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 group">
						<Settings className="w-5 h-5 text-slate-600 group-hover:rotate-90 transition-transform duration-300" />
					</button>

					{/* Notifications */}
					<div className="relative">
						<button 
							onClick={() => setShowNotifications(!showNotifications)}
							className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105"
						>
							<Bell className="w-5 h-5 text-slate-600" />
							<span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg animate-pulse">
								{notifications.length}
							</span>
						</button>

						{/* Notifications Dropdown */}
						{showNotifications && (
							<div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-down">
								<div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
									<h3 className="text-white font-semibold">Thông báo</h3>
								</div>
								<div className="max-h-96 overflow-y-auto">
									{notifications.map((notif) => (
										<div
											key={notif.id}
											className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer transition-colors"
										>
											<p className="text-sm text-slate-800 font-medium">{notif.text}</p>
											<p className="text-xs text-slate-500 mt-1">{notif.time}</p>
										</div>
									))}
								</div>
								<div className="px-4 py-3 bg-slate-50 text-center">
									<button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
										Xem tất cả
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Divider */}
					<div className="w-px h-8 bg-slate-200"></div>

					{/* User Profile */}
					<div className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
						<div className="relative">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
								{user?.name?.charAt(0).toUpperCase()}
							</div>
							<div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
						</div>
						<div className="hidden lg:block">
							<p className="font-semibold text-slate-800 text-sm">{user?.name}</p>
							<p className="text-xs text-slate-500">Administrator</p>
						</div>
					</div>

					{/* Logout */}
					<Link 
						to="/" 
						title="Đăng xuất"
						className="p-2.5 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 group"
					>
						<LogOut className="w-5 h-5 text-slate-600 group-hover:text-red-500 transition-colors" />
					</Link>
				</div>
			</div>

			<style>{`
				@keyframes slide-down {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-slide-down {
					animation: slide-down 0.2s ease-out;
				}
			`}</style>
		</header>
	);
};

export default AdminHeader;