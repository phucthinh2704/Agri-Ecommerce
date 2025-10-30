import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Leaf,
	Package,
	PackageSearch,
	ShoppingBag,
	Truck,
	XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetMyOrders } from "../api/order";
import path from "../utils/path";
import { OrderCard, OrderDetailModal } from "../components";

const LoadingSpinner = () => (
	<div className="min-h-[60vh] flex items-center justify-center">
		<div className="text-center">
			<Leaf className="w-20 h-20 text-green-600 animate-bounce mx-auto mb-4" />
			<p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
		</div>
	</div>
);

// Component Empty Orders
const EmptyOrders = () => (
	<div className="min-h-[60vh] flex items-center justify-center">
		<div className="text-center max-w-md mx-auto px-4">
			<div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<PackageSearch className="w-16 h-16 text-green-600" />
			</div>
			<h2 className="text-3xl font-bold text-gray-900 mb-3">
				Chưa có đơn hàng nào
			</h2>
			<p className="text-gray-600 mb-8 text-lg">
				Hãy bắt đầu mua sắm những sản phẩm tươi ngon nhất!
			</p>
			<Link
				to={`/${path.PRODUCTS}`}
				className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
				<ShoppingBag className="w-5 h-5" />
				Khám phá sản phẩm
			</Link>
		</div>
	</div>
);

// Main Component
const MyOrdersPage = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [filterStatus, setFilterStatus] = useState("all");

	const loadOrders = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await apiGetMyOrders();
			if (res.success) {
				setOrders(res.data);
			} else {
				setError(res.message);
			}
		} catch (err) {
			console.error("Failed to fetch orders:", err);
			setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadOrders();
	}, []);

	const handleViewDetail = (order) => {
		setSelectedOrder(order);
	};

	const handleCloseModal = () => {
		setSelectedOrder(null);
	};

	const handleCancelOrder = () => {
		loadOrders();
	};

	const filteredOrders = filterStatus === "all" 
		? orders 
		: orders.filter(order => order.status === filterStatus);

	const statusCounts = {
		all: orders.length,
		pending: orders.filter(o => o.status === "pending").length,
		shipping: orders.filter(o => o.status === "shipping").length,
		completed: orders.filter(o => o.status === "completed").length,
		cancelled: orders.filter(o => o.status === "cancelled").length,
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="text-center text-red-500">
					<AlertCircle className="w-16 h-16 mx-auto mb-4" />
					<p className="text-xl font-semibold">{error}</p>
				</div>
			</div>
		);
	}

	if (orders.length === 0) {
		return <EmptyOrders />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
			<div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center gap-3">
						<div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
							<Package className="w-6 h-6 text-white" />
						</div>
						Đơn hàng của tôi
					</h1>
					<p className="text-gray-600 text-lg">Quản lý và theo dõi đơn hàng của bạn</p>
				</div>

				{/* Filter Tabs */}
				<div className="bg-white rounded-2xl shadow-md border border-gray-100 p-2 mb-6 overflow-x-auto">
					<div className="flex gap-2 min-w-max">
						{[
							{ key: "all", label: "Tất cả", icon: Package },
							{ key: "pending", label: "Chờ xử lý", icon: AlertCircle },
							{ key: "shipping", label: "Đang giao", icon: Truck },
							{ key: "completed", label: "Hoàn thành", icon: CheckCircle },
							{ key: "cancelled", label: "Đã hủy", icon: XCircle },
						// eslint-disable-next-line no-unused-vars
						].map(({ key, label, icon: Icon }) => (
							<button
								key={key}
								onClick={() => setFilterStatus(key)}
								className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
									filterStatus === key
										? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
										: "text-gray-600 hover:bg-gray-100"
								}`}>
								<Icon className="w-4 h-4" />
								<span>{label}</span>
								<span className={`text-xs px-2 py-0.5 rounded-full ${
									filterStatus === key
										? "bg-white/20"
										: "bg-gray-200"
								}`}>
									{statusCounts[key]}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Orders Grid */}
				{filteredOrders.length === 0 ? (
					<div className="text-center py-20">
						<PackageSearch className="w-24 h-24 text-gray-300 mx-auto mb-4" />
						<p className="text-xl text-gray-600">Không có đơn hàng nào</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6">
						{filteredOrders.map((order) => (
							<OrderCard
								key={order._id}
								order={order}
								onViewDetail={handleViewDetail}
							/>
						))}
					</div>
				)}
			</div>

			{/* Modal */}
			{selectedOrder && (
				<OrderDetailModal
					order={selectedOrder}
					onClose={handleCloseModal}
					onCancelOrder={handleCancelOrder}
				/>
			)}
		</div>
	);
};

export default MyOrdersPage;