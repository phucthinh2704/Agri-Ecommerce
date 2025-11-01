import {
	Calendar,
	CreditCard,
	MapPin,
	Package,
	Phone,
	Truck,
	User,
	X,
} from "lucide-react";
import { getStatusProps } from "../../helpers/orderHelpers";

const OrderDetailModal = ({ order, onClose }) => {
	if (!order) return null;

	const statusProps = getStatusProps(order.status);
	const orderDate = new Date(order.createdAt).toLocaleString("vi-VN", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	// Tính toán phụ
	const subtotal = order.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const shippingFee = order.total_price - subtotal; // Suy ra phí ship

	return (
		// Lớp nền mờ
		<div
			className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}>
			{/* Nội dung Modal */}
			<div
				className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()} // Ngăn click bên trong modal đóng modal
			>
				{/* Header Modal */}
				<div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
					<div className="flex items-center gap-3">
						<Package className="w-6 h-6 text-green-600" />
						<div>
							<h2 className="text-xl font-bold text-gray-800">
								Chi tiết đơn hàng
							</h2>
							<p className="text-sm text-gray-500">
								Mã đơn: #{order._id.slice(-8).toUpperCase()}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
						<X className="w-5 h-5 text-gray-600" />
					</button>
				</div>

				{/* Thân Modal (có thể cuộn) */}
				<div className="overflow-y-auto p-6 space-y-6">
					{/* Status & Date */}
					<div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
						<div className="flex items-center gap-3">
							<Calendar className="w-5 h-5 text-gray-500" />
							<div>
								<p className="text-xs text-gray-500">
									Ngày đặt hàng
								</p>
								<p className="font-semibold text-gray-800">
									{orderDate}
								</p>
							</div>
						</div>
						<div
							className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${statusProps.color}`}>
							{statusProps.icon}
							<span>{statusProps.text}</span>
						</div>
					</div>

					{/* Thông tin người nhận & Thanh toán */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Người nhận */}
						<div className="space-y-3">
							<h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
								<MapPin className="w-5 h-5 text-green-600" />
								Thông tin người nhận
							</h3>
							<div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3 text-sm">
								<div className="flex items-center gap-3">
									<User className="w-4 h-4 text-green-700" />
									<span className="font-semibold text-gray-800">
										{order.recipientInfo.name}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<Phone className="w-4 h-4 text-green-700" />
									<span className="text-gray-700">
										{order.recipientInfo.mobile}
									</span>
								</div>
								<div className="flex items-start gap-3">
									<Truck className="w-4 h-4 text-green-700 mt-0.5" />
									<span className="text-gray-700">
										{order.shipping_address}
									</span>
								</div>
							</div>
						</div>
						{/* Thanh toán */}
						<div className="space-y-3">
							<h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
								<CreditCard className="w-5 h-5 text-green-600" />
								Thông tin thanh toán
							</h3>
							<div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">
										Phương thức:
									</span>
									<span className="font-semibold text-gray-800">
										{order.payment_method === "cod"
											? "Thu tiền mặt (COD)"
											: "Đã thanh toán (Banking)"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										Tạm tính:
									</span>
									<span className="font-semibold text-gray-800">
										{subtotal.toLocaleString("vi-VN")}đ
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										Phí vận chuyển:
									</span>
									<span className="font-semibold text-gray-800">
										{shippingFee.toLocaleString("vi-VN")}đ
									</span>
								</div>
								<div className="border-t border-blue-200 pt-3 mt-3 flex justify-between">
									<span className="text-base font-bold text-gray-900">
										Tổng cộng:
									</span>
									<span className="text-xl font-bold text-green-600">
										{order.total_price.toLocaleString(
											"vi-VN"
										)}
										đ
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Danh sách sản phẩm */}
					<div className="space-y-3">
						<h3 className="font-bold text-gray-900 text-lg">
							Sản phẩm đã đặt ({order.items.length})
						</h3>
						<div className="space-y-3 max-h-64 overflow-y-auto pr-2 border-2 border-gray-300 rounded-xl p-3">
							{order.items.map((item) => (
								<div
									key={item._id}
									className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
									<img
										src={
											item.product_id?.images?.[0] ||
											"/placeholder.png"
										}
										alt={
											item.product_id?.name || "Sản phẩm"
										}
										className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300"
									/>
									<div className="flex-1">
										<p className="font-semibold text-gray-800 line-clamp-1">
											{item.product_id?.name ||
												"Sản phẩm đã bị xóa"}
										</p>
										<p className="text-sm text-gray-500">
											SL: {item.quantity} x{" "}
											{item.price.toLocaleString("vi-VN")}
											đ
										</p>
									</div>
									<p className="font-semibold text-gray-800">
										{(
											item.price * item.quantity
										).toLocaleString("vi-VN")}
										đ
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Footer Modal */}
				<div className="px-6 py-4 bg-gray-50 border-t">
					<button
						onClick={onClose}
						className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
						Đóng
					</button>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailModal;
