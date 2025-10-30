import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Package,
  Truck,
  XCircle
} from "lucide-react";

const OrderCard = ({ order, onViewDetail }) => {
	const getStatusProps = (status) => {
		switch (status) {
			case "pending":
				return {
					text: "Đang chờ xử lý",
					icon: <AlertCircle className="w-4 h-4" />,
					color: "text-yellow-700 bg-yellow-100 border-yellow-200",
					bgGradient: "from-yellow-50 to-yellow-100",
				};
			case "shipping":
				return {
					text: "Đang giao hàng",
					icon: <Truck className="w-4 h-4" />,
					color: "text-blue-700 bg-blue-100 border-blue-200",
					bgGradient: "from-blue-50 to-blue-100",
				};
			case "completed":
				return {
					text: "Hoàn thành",
					icon: <CheckCircle className="w-4 h-4" />,
					color: "text-green-700 bg-green-100 border-green-200",
					bgGradient: "from-green-50 to-green-100",
				};
			case "cancelled":
				return {
					text: "Đã hủy",
					icon: <XCircle className="w-4 h-4" />,
					color: "text-red-700 bg-red-100 border-red-200",
					bgGradient: "from-red-50 to-red-100",
				};
			default:
				return {
					text: status,
					icon: <Package className="w-4 h-4" />,
					color: "text-gray-700 bg-gray-100 border-gray-200",
					bgGradient: "from-gray-50 to-gray-100",
				};
		}
	};

	const statusProps = getStatusProps(order.status);
	const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");
	const shortOrderId = order._id.slice(-8).toUpperCase();

	return (
		<div className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
			{/* Card Header */}
			<div className={`px-6 py-4 bg-gradient-to-r ${statusProps.bgGradient} border-b border-gray-200`}>
				<div className="flex flex-wrap justify-between items-center gap-3">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
							<Package className="w-6 h-6 text-green-600" />
						</div>
						<div>
							<p className="font-bold text-gray-900 text-lg">#{shortOrderId}</p>
							<p className="text-sm text-gray-600 flex items-center gap-1">
								<Calendar className="w-3.5 h-3.5" />
								{orderDate}
							</p>
						</div>
					</div>
					<div
						className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${statusProps.color} shadow-sm`}>
						{statusProps.icon}
						<span>{statusProps.text}</span>
					</div>
				</div>
			</div>

			{/* Card Body */}
			<div className="p-6">
				{/* Products Preview */}
				<div className="space-y-3 mb-5">
					{order.items.slice(0, 2).map((item, index) => (
						<div key={item._id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
							<img
								src={item.product_id?.images?.[0] || "/placeholder.png"}
								alt={item.product_id?.name || "Sản phẩm"}
								className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
							/>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold text-gray-800 line-clamp-1 mb-1">
									{item.product_id?.name || "Sản phẩm"}
								</p>
								<div className="flex items-center gap-3 text-xs text-gray-600">
									<span className="bg-white px-2 py-1 rounded">SL: {item.quantity}</span>
									<span className="font-medium text-gray-800">
										{(item.price * item.quantity).toLocaleString("vi-VN")}đ
									</span>
								</div>
							</div>
						</div>
					))}
					{order.items.length > 2 && (
						<div className="text-center py-2">
							<span className="text-sm text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
								+ {order.items.length - 2} sản phẩm khác
							</span>
						</div>
					)}
				</div>

				{/* Card Footer */}
				<div className="border-t border-gray-100 pt-4 flex flex-wrap justify-between items-center gap-4">
					<div>
						<p className="text-sm text-gray-600 mb-1">Tổng thanh toán</p>
						<p className="text-2xl font-bold text-green-600">
							{order.total_price.toLocaleString("vi-VN")}đ
						</p>
					</div>
					<button
						onClick={() => onViewDetail(order)}
						className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
						Xem chi tiết
					</button>
				</div>
			</div>
		</div>
	);
};

export default OrderCard;