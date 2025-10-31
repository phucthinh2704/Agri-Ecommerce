import { AlertCircle, CheckCircle, Truck, XCircle, Package } from "lucide-react";

export const getStatusProps = (status) => {
	switch (status) {
		case "pending":
			return { text: "Chờ xử lý", icon: <AlertCircle className="w-4 h-4" />, color: "text-yellow-700 bg-yellow-100" };
		case "shipping":
			return { text: "Đang giao", icon: <Truck className="w-4 h-4" />, color: "text-blue-700 bg-blue-100" };
		case "completed":
			return { text: "Hoàn thành", icon: <CheckCircle className="w-4 h-4" />, color: "text-green-700 bg-green-100" };
		case "cancelled":
			return { text: "Đã hủy", icon: <XCircle className="w-4 h-4" />, color: "text-red-700 bg-red-100" };
		default:
			return { text: status, icon: <Package className="w-4 h-4" />, color: "text-gray-700 bg-gray-100" };
	}
};