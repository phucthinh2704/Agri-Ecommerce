import {
	ArrowRight,
	DollarSign,
	Leaf,
	Package,
	ShoppingCart,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { apiGetAllOrders } from "../../api/order";
import { apiGetAllProducts } from "../../api/product";
import { apiGetAllUsers } from "../../api/user";
import { getStatusProps } from "../../helpers/orderHelpers";
import path from "../../utils/path";

// Component thẻ thống kê
const StatCard = ({ title, value, icon, color }) => (
	<div
		className={`p-6 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center gap-5 ${color}`}>
		<div className="p-4 bg-white/50 rounded-xl">{icon}</div>
		<div>
			<p className="text-sm font-medium text-gray-100">{title}</p>
			<p className="text-3xl font-bold text-white">{value}</p>
		</div>
	</div>
);

// Component Biểu đồ Doanh thu
const RevenueChart = ({ data, activeFilter, onFilterChange }) => {
	useEffect(() => {
		const style = document.createElement("style");
		style.innerHTML = `.recharts-cartesian-axis-tick-value tspan { fill: #6b7280; }`; // text-gray-500
		document.head.appendChild(style);
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Hàm format cho trục Y (ví dụ: 1,000,000 -> 1000k)
	const formatYAxis = (tickItem) => {
		return `${(tickItem / 1000).toLocaleString("vi-VN")}k`;
	};

	// Hàm format cho Tooltip
	const formatTooltip = (value) => {
		return `${value.toLocaleString("vi-VN")}đ`;
	};

	const FilterButton = ({ filter, text }) => (
		<button
			onClick={() => onFilterChange(filter)}
			className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
				activeFilter === filter
					? "bg-green-600 text-white"
					: "text-gray-500 hover:bg-gray-100"
			}`}>
			{text}
		</button>
	);

	return (
		<div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 col-span-1 lg:col-span-2 h-96">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
				<h3 className="text-xl font-bold text-gray-800">
					Tổng quan doanh thu
				</h3>
				{/* 3. Thêm các nút Filter */}
				<div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
					<FilterButton
						filter="day"
						text="Hôm nay"
					/>
					<FilterButton
						filter="week"
						text="Tuần này"
					/>
					<FilterButton
						filter="month"
						text="Tháng này"
					/>
				</div>
			</div>
			<ResponsiveContainer
				width="100%"
				height={300}>
				<LineChart
					data={data}
					margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#e5e7eb"
					/>
					<XAxis
						dataKey="date"
						stroke="#9ca3af"
						fontSize={12}
					/>
					<YAxis
						stroke="#9ca3af"
						fontSize={12}
						tickFormatter={formatYAxis}
					/>
					<Tooltip
						formatter={formatTooltip}
						labelClassName="font-bold"
						wrapperClassName="rounded-lg shadow-lg border-none"
					/>
					<Legend
						verticalAlign="top"
						height={36}
					/>
					<Line
						type="monotone"
						dataKey="DoanhThu"
						stroke="#10b981" // green-500
						strokeWidth={3}
						dot={{ fill: "#10b981", r: 5 }}
						activeDot={{ r: 8 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

// Component BIỂU ĐỒ SẢN PHẨM MỚI
const TopProductsChart = ({ data }) => {
	return (
		<div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 col-span-1 lg:col-span-1 h-96">
			<h3 className="text-xl font-bold text-gray-800 mb-6">
				Top 5 sản phẩm bán chạy
			</h3>
			<ResponsiveContainer
				width="100%"
				height={300}>
				<BarChart
					data={data}
					layout="vertical"
					margin={{ right: 40 }}>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#e5e7eb"
					/>
					<XAxis
						type="number"
						stroke="#9ca3af"
						fontSize={12}
					/>
					<YAxis
						type="category"
						dataKey="name"
						stroke="#9ca3af"
						fontSize={10}
						width={80} // Tăng khoảng trống cho tên
						tick={{ textAnchor: "end" }} // Căn lề phải
					/>
					<Tooltip
						wrapperClassName="rounded-lg shadow-lg border-none"
						formatter={(value) => [value, "Đã bán"]}
					/>
					<Bar
						dataKey="Đã bán"
						fill="#10b981"
						background={{ fill: "#f3f4f6", radius: 4 }}
						radius={[0, 4, 4, 0]} // Bo góc
						barSize={20}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

// Component Bảng Đơn hàng gần đây
const RecentOrdersTable = ({ orders }) => {
	return (
		<div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 col-span-1 lg:col-span-3">
			<h3 className="text-xl font-bold text-gray-800 mb-6">
				Đơn hàng gần đây
			</h3>
			<div className="space-y-4 overflow-y-auto max-h-[400px]">
				{orders.length === 0 ? (
					<p className="text-gray-500 text-center pt-10">
						Chưa có đơn hàng nào.
					</p>
				) : (
					orders.map((order) => {
						const status = getStatusProps(order.status);
						return (
							<div
								key={order._id}
								className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
								<div className="flex-1">
									<p className="font-semibold text-gray-800">
										{order.user_id.name || "Khách hàng"}
									</p>
									<p className="text-sm text-gray-500">
										{new Date(
											order.createdAt
										).toLocaleDateString("vi-VN")}
									</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-green-600">
										{order.total_price.toLocaleString(
											"vi-VN"
										)}
										đ
									</p>
									<span
										className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
										{status.text}
									</span>
								</div>
							</div>
						);
					})
				)}
			</div>
			<Link to={`/${path.ADMIN}/${path.MANAGE_ORDERS}`}>
				<button className="w-full mt-4 py-2 text-green-600 font-semibold hover:bg-green-50 rounded-lg transition-colors">
					Xem tất cả đơn hàng{" "}
					<ArrowRight className="w-4 h-4 inline-block" />
				</button>
			</Link>
		</div>
	);
};

// HÀM HELPER XỬ LÝ DỮ LIỆU BIỂU ĐỒ
const processChartData = (orders, filterType) => {
	const completedOrders = orders.filter((o) => o.status === "completed");
	const today = new Date();
	let dateArray = [];

	switch (filterType) {
		case "day": {
			const todayKey = today.toISOString().split("T")[0];
			let todayRevenue = 0;
			for (const order of completedOrders) {
				if (order.createdAt.startsWith(todayKey)) {
					todayRevenue += order.total_price;
				}
			}
			return [{ date: "Hôm nay", DoanhThu: todayRevenue }];
		}

		case "month":
			// Tạo 30 ngày gần nhất
			for (let i = 29; i >= 0; i--) {
				const d = new Date(today);
				d.setDate(today.getDate() - i);
				d.setHours(0, 0, 0, 0);
				const label = d.toLocaleDateString("vi-VN", {
					month: "short",
					day: "numeric",
				});
				dateArray.push({
					date: label,
					dateKey: d.toISOString().split("T")[0],
					DoanhThu: 0,
				});
			}
			break;

		case "week":
		default:
			// Tạo 7 ngày gần nhất (mặc định)
			for (let i = 6; i >= 0; i--) {
				const d = new Date(today);
				d.setDate(today.getDate() - i);
				d.setHours(0, 0, 0, 0);
				const label = d.toLocaleDateString("vi-VN", {
					month: "short",
					day: "numeric",
				});
				dateArray.push({
					date: label,
					dateKey: d.toISOString().split("T")[0],
					DoanhThu: 0,
				});
			}
			break;
	}

	// Tính tổng doanh thu theo ngày
	for (const order of completedOrders) {
		const orderDateKey = order.createdAt.split("T")[0]; // Giả sử createdAt là ISO string
		const dayData = dateArray.find((d) => d.dateKey === orderDateKey);
		if (dayData) {
			dayData.DoanhThu += order.total_price;
		}
	}

	return dateArray.map((d) => ({ date: d.date, DoanhThu: d.DoanhThu }));
};

const processProductChartData = (products) => {
	return products
		.map((p) => ({
			name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name, // Cắt ngắn tên
			"Đã bán": p.sold,
		}))
		.reverse(); // Đảo ngược để thanh cao nhất ở trên
};

const Dashboard = () => {
	const [stats, setStats] = useState({
		revenue: 0,
		orders: 0,
		products: 0,
		users: 0,
	});
	const [chartData, setChartData] = useState([]);
	const [topProductsData, setTopProductsData] = useState([]);
	const [recentOrders, setRecentOrders] = useState([]);
	const [allOrders, setAllOrders] = useState([]); // Lưu trữ tất cả đơn hàng
	const [loading, setLoading] = useState(true);

	// 9. State cho filter
	const [revenueFilter, setRevenueFilter] = useState("week"); // 'day', 'week', 'month'

	// 10. useEffect fetch data
	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			try {
				const [productRes, orderRes, userRes] = await Promise.all([
					// Sửa: Lấy top 5 sản phẩm bán chạy cho biểu đồ
					apiGetAllProducts({ limit: 5, sort: "-sold" }),
					apiGetAllOrders(),
					apiGetAllUsers(),
				]);

				let totalRevenue = 0;
				let allOrdersData = [];

				if (orderRes.success) {
					allOrdersData = orderRes.data || [];
					setAllOrders(allOrdersData); // Lưu trữ toàn bộ đơn hàng
					setRecentOrders(allOrdersData.slice(0, 5)); // Lấy 5 đơn hàng gần nhất

					totalRevenue = allOrdersData
						.filter((order) => order.status === "completed")
						.reduce((sum, order) => sum + order.total_price, 0);
				}

				if (productRes.success) {
					// Xử lý data cho biểu đồ sản phẩm
					setTopProductsData(
						processProductChartData(productRes.data)
					);
				}

				setStats({
					revenue: totalRevenue.toLocaleString("vi-VN") + "đ",
					orders: allOrdersData.length || 0,
					// Lấy tổng số sản phẩm từ pagination
					products: productRes.pagination?.total || 0,
					users: userRes.data?.length || 0,
				});
			} catch (err) {
				console.error("Failed to fetch dashboard stats:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	// 11. useEffect mới để xử lý data biểu đồ khi filter thay đổi
	useEffect(() => {
		if (allOrders.length > 0) {
			const processedData = processChartData(allOrders, revenueFilter);
			setChartData(processedData);
		}
	}, [revenueFilter, allOrders]); // Chạy lại khi filter hoặc data đơn hàng thay đổi

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<Leaf className="w-10 h-10 animate-spin text-green-600" />
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold text-gray-800">
				Bảng điều khiển
			</h1>

			{/* Thẻ thống kê */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Tổng doanh thu"
					value={stats.revenue}
					icon={<DollarSign className="w-8 h-8 text-white" />}
					color="bg-gradient-to-br from-green-600 to-emerald-500"
				/>
				<StatCard
					title="Tổng đơn hàng"
					value={stats.orders}
					icon={<ShoppingCart className="w-8 h-8 text-white" />}
					color="bg-gradient-to-br from-blue-600 to-cyan-500"
				/>
				<StatCard
					title="Tổng sản phẩm"
					value={stats.products}
					icon={<Package className="w-8 h-8 text-white" />}
					color="bg-gradient-to-br from-yellow-600 to-orange-500"
				/>
				<StatCard
					title="Tổng người dùng"
					value={stats.users}
					icon={<Users className="w-8 h-8 text-white" />}
					color="bg-gradient-to-br from-purple-600 to-indigo-500"
				/>
			</div>

			{/* Hàng 2: Biểu đồ */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<RevenueChart
					data={chartData}
					activeFilter={revenueFilter}
					onFilterChange={setRevenueFilter}
				/>
				<TopProductsChart data={topProductsData} />
			</div>

			{/* Hàng 3: Bảng đơn hàng gần đây */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<RecentOrdersTable orders={recentOrders} />
			</div>
		</div>
	);
};

export default Dashboard;
