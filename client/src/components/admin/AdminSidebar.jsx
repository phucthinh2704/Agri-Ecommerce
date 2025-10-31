import { NavLink } from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	Package,
	ShoppingCart,
	List,
	Home,
	Sparkles,
} from "lucide-react";
import path from "../../utils/path";

const AdminSidebar = () => {
	// Thay thế path imports bằng hardcoded paths
	const navLinks = [
		{
			to: path.ADMIN + "/" + path.DASHBOARD,
			icon: LayoutDashboard,
			text: "Bảng điều khiển",
		},
		{
			to: path.ADMIN + "/" + path.MANAGE_PRODUCTS,
			icon: Package,
			text: "Quản lý sản phẩm",
		},
		{
			to: path.ADMIN + "/" + path.MANAGE_ORDERS,
			icon: ShoppingCart,
			text: "Quản lý đơn hàng",
		},
		{
			to: path.ADMIN + "/" + path.MANAGE_CATEGORIES,
			icon: List,
			text: "Quản lý danh mục",
		},
		{
			to: path.ADMIN + "/" + path.MANAGE_USERS,
			icon: Users,
			text: "Quản lý người dùng",
		},
		{ to: "", icon: Home, text: "Về trang chủ" },
	];

	return (
		<aside className="w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 shadow-2xl relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
			<div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

			{/* Logo section */}
			<div className="relative mb-12 text-center">
				<div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/30 mb-2">
					<Sparkles className="w-6 h-6 animate-pulse" />
					<span className="text-2xl font-bold tracking-tight">
						Admin
					</span>
				</div>
				<p className="text-slate-400 text-sm mt-2">Quản trị hệ thống</p>
			</div>

			{/* Navigation */}
			<nav className="relative">
				<ul className="space-y-2">
					{navLinks.map((link, index) => (
						<li
							key={link.to}
							style={{ animationDelay: `${index * 50}ms` }}
							className="animate-fade-in">
							<NavLink
								to={`/${link.to}`}
								end
								className={({ isActive }) =>
									`group flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
										isActive
											? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40 scale-105"
											: "hover:bg-slate-700/50 hover:translate-x-1 text-slate-300 hover:text-white"
									}`
								}>
								{({ isActive }) => (
									<>
										{isActive && (
											<div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
										)}
										<link.icon
											className={`w-5 h-5 transition-transform duration-300 ${
												isActive
													? "scale-110"
													: "group-hover:scale-110"
											}`}
										/>
										<span className="font-medium relative z-10">
											{link.text}
										</span>
										{isActive && (
											<div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
										)}
									</>
								)}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			{/* Bottom decoration */}
			<div className="absolute bottom-6 left-6 right-6">
				<div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
				<p className="text-center text-slate-500 text-xs mt-4">
					v2.0.1
				</p>
			</div>

			<style>{`
				@keyframes fade-in {
					from {
						opacity: 0;
						transform: translateX(-10px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
				
				@keyframes shimmer {
					0% {
						transform: translateX(-100%);
					}
					100% {
						transform: translateX(100%);
					}
				}

				.animate-fade-in {
					animation: fade-in 0.5s ease-out forwards;
					opacity: 0;
				}

				.animate-shimmer {
					animation: shimmer 2s infinite;
				}

				.delay-700 {
					animation-delay: 700ms;
				}
			`}</style>
		</aside>
	);
};

export default AdminSidebar;
