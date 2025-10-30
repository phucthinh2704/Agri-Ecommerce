import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { apiCancelOrder } from "../api/order";
import useAlert from "../hooks/useAlert";

const OrderDetailModal = ({ order, onClose, onCancelOrder }) => {
	const [isCancelling, setIsCancelling] = useState(false);

	const { showConfirm } = useAlert();

	const getStatusProps = (status) => {
		switch (status) {
			case "pending":
				return {
					text: "Đang chờ xử lý",
					icon: <AlertCircle className="w-5 h-5" />,
					color: "text-yellow-600 bg-yellow-100 border-yellow-200",
				};
			case "shipping":
				return {
					text: "Đang giao hàng",
					icon: <Truck className="w-5 h-5" />,
					color: "text-blue-600 bg-blue-100 border-blue-200",
				};
			case "completed":
				return {
					text: "Hoàn thành",
					icon: <CheckCircle className="w-5 h-5" />,
					color: "text-green-600 bg-green-100 border-green-200",
				};
			case "cancelled":
				return {
					text: "Đã hủy",
					icon: <XCircle className="w-5 h-5" />,
					color: "text-red-600 bg-red-100 border-red-200",
				};
			default:
				return {
					text: status,
					icon: <Package className="w-5 h-5" />,
					color: "text-gray-600 bg-gray-100 border-gray-200",
				};
		}
	};

	const statusProps = getStatusProps(order.status);
	const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	const handleCancelOrder = async () => {
		const result = await showConfirm("Bạn có chắc chắn muốn hủy đơn hàng này?");
    
    if (!result.isConfirmed) return; // Người dùng bấm "Không"
		
		setIsCancelling(true);
		try {
			const res = await apiCancelOrder(order._id);
			if (res.success) {
				toast.success("Đã hủy đơn hàng thành công");
				onCancelOrder();
				onClose();
			} else {
				toast.error(res.message || "Không thể hủy đơn hàng");
			}
		} catch (error) {
			console.log(error);
			toast.error("Có lỗi xảy ra. Vui lòng thử lại");
		} finally {
			setIsCancelling(false);
		}
	};

	// Tính phí vận chuyển
	const FREE_SHIP_THRESHOLD = +import.meta.env.VITE_FREE_SHIP_THRESHOLD || 300000;
	const SHIPPING_FEE = +import.meta.env.VITE_SHIPPING_FEE || 30000;
	const shippingFee = order.total_price - SHIPPING_FEE >= FREE_SHIP_THRESHOLD ? "Miễn phí" : `${SHIPPING_FEE.toLocaleString("vi-VN")}đ`;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
			<div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
				{/* Header */}
				<div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
							<Package className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-white">Chi tiết đơn hàng</h2>
							<p className="text-sm text-green-100">
								#{order._id.slice(-8).toUpperCase()}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
						<X className="w-5 h-5 text-white" />
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
					{/* Status & Date */}
					<div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl">
						<div className="flex items-center gap-3">
							<Calendar className="w-5 h-5 text-gray-400" />
							<div>
								<p className="text-xs text-gray-500">Ngày đặt hàng</p>
								<p className="font-semibold text-gray-800">{orderDate}</p>
							</div>
						</div>
						<div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${statusProps.color} font-medium`}>
							{statusProps.icon}
							<span>{statusProps.text}</span>
						</div>
					</div>

					{/* Recipient Info */}
					<div className="space-y-3">
						<h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
							<MapPin className="w-5 h-5 text-green-600" />
							Thông tin người nhận
						</h3>
						<div className="bg-green-50 border border-green-100 rounded-2xl p-4 space-y-3">
							<div className="flex items-center gap-3">
								<User className="w-5 h-5 text-green-600" />
								<div>
									<p className="text-xs text-gray-600">Người nhận</p>
									<p className="font-semibold text-gray-800">{order.recipientInfo.name}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Phone className="w-5 h-5 text-green-600" />
								<div>
									<p className="text-xs text-gray-600">Số điện thoại</p>
									<p className="font-semibold text-gray-800">{order.recipientInfo.mobile}</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Truck className="w-5 h-5 text-green-600 mt-1" />
								<div className="flex-1">
									<p className="text-xs text-gray-600">Địa chỉ giao hàng</p>
									<p className="font-semibold text-gray-800">{order.shipping_address}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Payment Method */}
					<div className="space-y-3">
						<h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
							<CreditCard className="w-5 h-5 text-green-600" />
							Phương thức thanh toán
						</h3>
						<div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
							<p className="font-semibold text-gray-800">
								{order.payment_method === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán qua ngân hàng"}
							</p>
						</div>
					</div>

					{/* Order Items */}
					<div className="space-y-3">
						<h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
							<ShoppingBag className="w-5 h-5 text-green-600" />
							Sản phẩm ({order.items.length})
						</h3>
						<div className="space-y-3">
							{order.items.map((item, index) => (
								<div
									key={item._id || index}
									className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
									<img
										src={item.product_id?.images?.[0] || "/placeholder.png"}
										alt={item.product_id?.name || "Sản phẩm"}
										className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
									/>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-gray-800 line-clamp-2 mb-1">
											{item.product_id?.name || "Sản phẩm"}
										</p>
										<div className="flex items-center gap-4 text-sm">
											<span className="text-gray-600">
												Đơn giá: <span className="font-medium text-gray-800">{item.price.toLocaleString("vi-VN")}đ</span>
											</span>
											<span className="text-gray-600">
												SL: <span className="font-medium text-gray-800">{item.quantity}</span>
											</span>
										</div>
									</div>
									<div className="text-right">
										<p className="text-xs text-gray-500 mb-1">Thành tiền</p>
										<p className="font-bold text-green-600 text-lg">
											{(item.price * item.quantity).toLocaleString("vi-VN")}đ
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Order Summary */}
					<div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 space-y-3">
						<h3 className="font-bold text-gray-900 text-lg mb-3">Tổng kết đơn hàng</h3>
						<div className="space-y-2">
							<div className="flex justify-between text-gray-600">
								<span>Tạm tính:</span>
								<span className="font-semibold">
									{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("vi-VN")}đ
								</span>
							</div>
							<div className="flex justify-between text-gray-600">
								<span>Phí vận chuyển:</span>
								<span className="font-semibold text-green-600">{shippingFee}</span>
							</div>
							<div className="border-t border-green-200 pt-3 flex justify-between items-center">
								<span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
								<span className="text-2xl font-bold text-green-600">
									{order.total_price.toLocaleString("vi-VN")}đ
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
					<button
						onClick={onClose}
						className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
						Đóng
					</button>
					{order.status === "pending" && (
						<button
							onClick={handleCancelOrder}
							disabled={isCancelling}
							className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
							{isCancelling ? (
								<>
									<Clock className="w-4 h-4 animate-spin" />
									Đang hủy...
								</>
							) : (
								<>
									<XCircle className="w-4 h-4" />
									Hủy đơn hàng
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrderDetailModal;