import { useState, useEffect, useMemo, useCallback } from "react";
import {
	apiGetAllOrders,
	apiUpdateOrderStatus,
	apiGetOrderStats,
} from "../../api/order";
import {
	Leaf,
	Search,
	Filter,
	Calendar,
	DollarSign,
	User,
	Package,
	TrendingUp,
	TrendingDown,
	Eye,
	RefreshCw,
	Download,
	ArrowUpDown,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { OrderDetailModalAdmin, Pagination } from "../../components";
import { getStatusProps } from "../../helpers/orderHelpers";

const ManageOrders = () => {
	const [orders, setOrders] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);

	const [selectedOrder, setSelectedOrder] = useState(null);

	const [dashboardStats, setDashboardStats] = useState({
		totalOrders: 0,
		totalRevenue: 0,
		pending: 0,
		shipping: 0,
		completed: 0,
		cancelled: 0,
	});
	const [loadingStats, setLoadingStats] = useState(true);

	const [searchParams, setSearchParams] = useSearchParams();

	const params = useMemo(
		() => ({
			page: searchParams.get("page") || 1,
			search: searchParams.get("search") || "",
			status: searchParams.get("status") || "",
			sort: searchParams.get("sort") || "-createdAt",
			limit: 10,
		}),
		[searchParams]
	);

	const fetchOrders = useCallback(async () => {
		setLoading(true);
		const validParams = Object.entries(params).reduce(
			(acc, [key, value]) => {
				if (value) acc[key] = value;
				return acc;
			},
			{}
		);

		const res = await apiGetAllOrders(validParams);
		if (res.success) {
			setOrders(res.data);
			setPagination(res.pagination);
		} else {
			toast.error(res.message);
		}
		setLoading(false);
	}, [params]);

	useEffect(() => {
		const fetchStats = async () => {
			setLoadingStats(true);
			// Chỉ lấy filter, bỏ qua page, limit, sort
			const statParams = {
				search: params.search,
				status: params.status,
			};

			const validParams = Object.entries(statParams).reduce(
				(acc, [key, value]) => {
					if (value) acc[key] = value;
					return acc;
				},
				{}
			);

			const res = await apiGetOrderStats(validParams);
			if (res.success) {
				setDashboardStats(res.data);
			}
			setLoadingStats(false);
		};

		fetchStats();
		// 6. Chạy lại khi filter thay đổi (search hoặc status)
	}, [params.search, params.status]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleFilterChange = (name, value) => {
		const newParams = new URLSearchParams(searchParams);
		if (value) {
			newParams.set(name, value);
		} else {
			newParams.delete(name);
		}
		newParams.set("page", "1");
		setSearchParams(newParams);
	};

	const handlePageChange = (newPage) => {
		const newParams = new URLSearchParams(searchParams);
		newParams.set("page", newPage);
		setSearchParams(newParams);
	};

	const handleStatusChange = async (orderId, newStatus) => {
		try {
			const res = await apiUpdateOrderStatus(orderId, newStatus);
			if (res.success) {
				toast.success("Cập nhật trạng thái thành công!");
				fetchOrders();
			} else {
				toast.error(res.message || "Cập nhật thất bại");
			}
		} catch (err) {
			console.log(err);
			toast.error("Lỗi máy chủ");
		}
	};

	const handleViewDetails = (order) => {
		setSelectedOrder(order);
	};
	const handleCloseModal = () => {
		setSelectedOrder(null);
	};

	if (loading && orders.length === 0) {
		return (
			<div className="flex flex-col justify-center items-center h-screen">
				<Leaf className="w-16 h-16 animate-spin text-green-600 mb-4" />
				<p className="text-gray-600 font-medium">
					Đang tải đơn hàng...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="flex justify-between items-start mb-4">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
								Quản lý Đơn hàng
							</h1>
							<p className="text-gray-600">
								Theo dõi và quản lý tất cả đơn hàng của bạn
							</p>
						</div>
						<div className="flex gap-3">
							<button
								onClick={fetchOrders}
								className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-green-500 hover:text-green-600 transition-all shadow-sm">
								<RefreshCw className="w-5 h-5" />
								Làm mới
							</button>
							<button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30">
								<Download className="w-5 h-5" />
								Xuất Excel
							</button>
						</div>
					</div>

					{/* Statistics Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						{/* Card 1: Tổng đơn hàng */}
						<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Tổng đơn hàng
									</p>
									<p className="text-3xl font-bold text-gray-900">
										{loadingStats
											? "..."
											: dashboardStats.totalOrders}
									</p>
								</div>
								<div className="bg-blue-100 p-3 rounded-lg">
									<Package className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>

						{/* Card 2: Doanh thu */}
						<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-green-100 hover:shadow-xl transition-all">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Doanh thu
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{loadingStats
											? "..."
											: dashboardStats.totalRevenue.toLocaleString(
													"vi-VN"
											  ) + "đ"}
									</p>
								</div>
								<div className="bg-green-100 p-3 rounded-lg">
									<DollarSign className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>

						{/* Card 3: Chờ xử lý */}
						<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-yellow-100 hover:shadow-xl transition-all">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Chờ xử lý
									</p>
									<p className="text-3xl font-bold text-yellow-600">
										{loadingStats
											? "..."
											: dashboardStats.pending}
									</p>
								</div>
								<div className="bg-yellow-100 p-3 rounded-lg">
									<TrendingUp className="w-6 h-6 text-yellow-600" />
								</div>
							</div>
						</div>

						{/* Card 4: Hoàn thành */}
						<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Hoàn thành
									</p>
									<p className="text-3xl font-bold text-purple-600">
										{loadingStats
											? "..."
											: dashboardStats.completed}
									</p>
								</div>
								<div className="bg-purple-100 p-3 rounded-lg">
									<TrendingDown className="w-6 h-6 text-purple-600" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
					<div className="flex items-center gap-2 mb-4">
						<Filter className="w-5 h-5 text-gray-600" />
						<h2 className="text-lg font-semibold text-gray-800">
							Bộ lọc
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Search */}
						<div className="relative">
							<Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder="Tìm theo tên, email khách hàng..."
								defaultValue={params.search}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleFilterChange(
											"search",
											e.target.value
										);
									}
								}}
								className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
							/>
						</div>

						{/* Status Filter */}
						<div className="relative">
							<select
								value={params.status}
								onChange={(e) =>
									handleFilterChange("status", e.target.value)
								}
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white appearance-none cursor-pointer transition-colors">
								<option value="">Tất cả trạng thái</option>
								<option value="pending">Chờ xử lý</option>
								<option value="shipping">Đang giao</option>
								<option value="completed">Hoàn thành</option>
								<option value="cancelled">Đã hủy</option>
							</select>
							<ArrowUpDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>

						{/* Sort */}
						<div className="relative">
							<select
								value={params.sort}
								onChange={(e) =>
									handleFilterChange("sort", e.target.value)
								}
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white appearance-none cursor-pointer transition-colors">
								<option value="-createdAt">Mới nhất</option>
								<option value="createdAt">Cũ nhất</option>
								<option value="-total_price">
									Giá cao → thấp
								</option>
								<option value="total_price">
									Giá thấp → cao
								</option>
							</select>
							<ArrowUpDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>
				</div>

				{/* Orders Table */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
					<div className="overflow-x-auto relative">
						{loading && (
							<div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
								<Leaf className="w-10 h-10 animate-spin text-green-600" />
							</div>
						)}

						<table className="min-w-full">
							<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										Mã đơn
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										<div className="flex items-center gap-2">
											<User className="w-4 h-4" />
											Khách hàng
										</div>
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4" />
											Ngày đặt
										</div>
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										<div className="flex items-center gap-2">
											<DollarSign className="w-4 h-4" />
											Tổng tiền
										</div>
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										Trạng thái
									</th>
									<th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
										Hành động
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{orders.length === 0 ? (
									<tr>
										<td
											colSpan="6"
											className="px-6 py-12 text-center">
											<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
											<p className="text-gray-500 text-lg">
												Không tìm thấy đơn hàng nào
											</p>
										</td>
									</tr>
								) : (
									orders.map((order) => {
										const statusInfo = getStatusProps(
											order.status
										);
										return (
											<tr
												key={order._id}
												className="hover:bg-gray-50 transition-colors">
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center gap-2">
														<div className="w-2 h-2 rounded-full bg-green-500"></div>
														<span className="text-sm font-bold text-gray-900">
															#
															{order._id
																.slice(-8)
																.toUpperCase()}
														</span>
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														{order.user_id
															.avatar ? (
															<img
																src={
																	order
																		.user_id
																		.avatar
																}
																alt={
																	order
																		.user_id
																		.name
																}
																className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
															/>
														) : (
															<div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
																{order.user_id.name
																	.charAt(0)
																	.toUpperCase()}
															</div>
														)}
														<div>
															<div className="text-sm font-semibold text-gray-900">
																{
																	order
																		.user_id
																		.name
																}
															</div>
															<div className="text-xs text-gray-500">
																{
																	order
																		.user_id
																		.email
																}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{new Date(
															order.createdAt
														).toLocaleDateString(
															"vi-VN"
														)}
													</div>
													<div className="text-xs text-gray-500">
														{new Date(
															order.createdAt
														).toLocaleTimeString(
															"vi-VN",
															{
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className="text-lg font-bold text-green-600">
														{order.total_price.toLocaleString(
															"vi-VN"
														)}
														đ
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
														<span className="w-2 h-2 rounded-full bg-current mr-2"></span>
														{statusInfo.text}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap flex items-center justify-end gap-1">
													<button
														onClick={() =>
															handleViewDetails(
																order
															)
														}
														className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
														title="Xem chi tiết">
														<Eye className="w-5 h-5" />
													</button>
													<select
														value={order.status}
														onChange={(e) =>
															handleStatusChange(
																order._id,
																e.target.value
															)
														}
														disabled={
															order.status ===
																"completed" ||
															order.status ===
																"cancelled"
														}
														className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none bg-white disabled:bg-gray-100 text-center disabled:cursor-not-allowed transition-colors">
														<option value="pending">
															Chờ xử lý
														</option>
														<option value="shipping">
															Đang giao
														</option>
														<option value="completed">
															Hoàn thành
														</option>
														<option value="cancelled">
															Hủy
														</option>
													</select>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-600">
									Hiển thị{" "}
									<span className="font-semibold text-gray-900">
										{(pagination.page - 1) * params.limit +
											1}
									</span>{" "}
									-{" "}
									<span className="font-semibold text-gray-900">
										{Math.min(
											pagination.page * params.limit,
											pagination.total
										)}
									</span>{" "}
									trong tổng số{" "}
									<span className="font-semibold text-gray-900">
										{pagination.total}
									</span>{" "}
									đơn hàng
								</div>
								<Pagination
									currentPage={pagination.page}
									totalPages={pagination.totalPages}
									onPageChange={handlePageChange}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			{selectedOrder && (
				<OrderDetailModalAdmin
					order={selectedOrder}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
};

export default ManageOrders;
