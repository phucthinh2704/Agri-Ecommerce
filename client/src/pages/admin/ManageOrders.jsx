import { useState, useEffect } from "react";
import { apiGetAllOrders, apiUpdateOrderStatus } from "../../api/order"; // Tạo các hàm này
import { Leaf, AlertCircle, CheckCircle, Truck, XCircle, Package } from "lucide-react";
import { toast } from "react-toastify";

// (Bạn nên chuyển hàm này ra file utils/orderHelpers.js)
const getStatusProps = (status) => {
	switch (status) {
		case "pending":
			return { text: "Chờ xử lý", color: "text-yellow-600 bg-yellow-100" };
		case "shipping":
			return { text: "Đang giao", color: "text-blue-600 bg-blue-100" };
		case "completed":
			return { text: "Hoàn thành", color: "text-green-600 bg-green-100" };
		case "cancelled":
			return { text: "Đã hủy", color: "text-red-600 bg-red-100" };
		default:
			return { text: status, color: "text-gray-600 bg-gray-100" };
	}
};

const ManageOrders = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchOrders = async () => {
		setLoading(true);
		const res = await apiGetAllOrders(); // Cần tạo hàm này
		if (res.success) {
			setOrders(res.data);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const handleStatusChange = async (orderId, newStatus) => {
		try {
			const res = await apiUpdateOrderStatus(orderId, newStatus); // Cần tạo hàm này
			if (res.success) {
				toast.success("Cập nhật trạng thái đơn hàng thành công!");
				fetchOrders(); // Tải lại danh sách
			} else {
				toast.error(res.message || "Cập nhật thất bại.");
			}
		} catch (err) {
      console.log(err);
			toast.error("Lỗi máy chủ.");
		}
	};

	if (loading) {
		return <div className="flex justify-center items-center h-full"><Leaf className="w-10 h-10 animate-spin text-green-600"/></div>;
	}

	return (
		<div className="p-6 bg-white rounded-xl shadow-lg">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Đơn</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{orders.map(order => (
							<tr key={order._id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-8)}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.user_id.name}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">{order.total_price.toLocaleString('vi-VN')}đ</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusProps(order.status).color}`}>
										{getStatusProps(order.status).text}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm">
									{/* Cho phép admin thay đổi trạng thái */}
									<select 
										value={order.status}
										onChange={(e) => handleStatusChange(order._id, e.target.value)}
										className="border border-gray-300 rounded-md p-1"
										disabled={order.status === 'completed' || order.status === 'cancelled'}
									>
										<option value="pending">Chờ xử lý</option>
										<option value="shipping">Đang giao</option>
										<option value="completed">Hoàn thành</option>
										<option value="cancelled">Hủy</option>
									</select>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ManageOrders;