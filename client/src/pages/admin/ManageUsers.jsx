import {
	ArrowUpDown,
	Calendar,
	Crown,
	Download,
	Eye,
	Leaf,
	Mail,
	MapPin,
	Phone,
	RefreshCw,
	Search,
	Shield,
	ShoppingBag,
	Store,
	UserCircle,
	Users,
	UserX,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
	apiDeleteUser,
	apiGetAllUsers,
	apiUpdateUserRole,
} from "../../api/user";
import { Pagination } from "../../components";
import useAlert from "../../hooks/useAlert";

const ManageUsers = () => {
	const [users, setUsers] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedUser, setSelectedUser] = useState(null);
	const { showConfirm } = useAlert();

	const [searchParams, setSearchParams] = useSearchParams();

	const params = useMemo(
		() => ({
			page: searchParams.get("page") || 1,
			search: searchParams.get("search") || "",
			role: searchParams.get("role") || "",
			sort: searchParams.get("sort") || "-createdAt",
			limit: 10,
		}),
		[searchParams]
	);

	// Calculate statistics
	const stats = useMemo(() => {
		if (!users.length) return null;

		const roleCounts = users.reduce((acc, user) => {
			acc[user.role] = (acc[user.role] || 0) + 1;
			return acc;
		}, {});

		return {
			total: users.length,
			admins: roleCounts.admin || 0,
			customers: roleCounts.customer || 0,
			sellers: roleCounts.seller || 0,
		};
	}, [users]);

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		const validParams = Object.entries(params).reduce(
			(acc, [key, value]) => {
				if (value) acc[key] = value;
				return acc;
			},
			{}
		);

		const res = await apiGetAllUsers(validParams);
		if (res.success) {
			setUsers(res.data);
			setPagination(res.pagination);
		} else {
			toast.error(res.message || "Tải dữ liệu thất bại");
		}
		setLoading(false);
	}, [params]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

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

	const handleUpdateRole = async (user, newRole) => {
		if (user.role === newRole) return;

		showConfirm(
			`Bạn có chắc muốn đổi vai trò của "${user.name}" thành "${
				newRole.charAt(0).toUpperCase() + newRole.slice(1)
			}"?`
		).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const res = await apiUpdateUserRole(user._id, newRole);
					if (res.success) {
						toast.success("Cập nhật vai trò thành công!");
						fetchUsers();
					} else {
						toast.error(res.message || "Cập nhật thất bại");
					}
				} catch (err) {
					console.log(err);
					toast.error("Lỗi máy chủ");
				}
			}
		});
	};

	const handleDeleteUser = (user) => {
		showConfirm(
			`Bạn có chắc muốn xóa vĩnh viễn người dùng "${user.name}"?`
		).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const res = await apiDeleteUser(user._id);
					if (res.success) {
						toast.success("Xóa người dùng thành công!");
						fetchUsers();
						if (selectedUser?._id === user._id) {
							setSelectedUser(null);
						}
					} else {
						toast.error(res.message || "Xóa thất bại");
					}
				} catch (err) {
					console.log(err);
					toast.error("Lỗi máy chủ");
				}
			}
		});
	};

	const getRoleInfo = (role) => {
		const roles = {
			admin: {
				icon: Crown,
				label: "Admin",
				color: "bg-purple-100 text-purple-700 border-purple-200",
				gradient: "from-purple-400 to-pink-500",
			},
			seller: {
				icon: Store,
				label: "Seller",
				color: "bg-green-100 text-green-700 border-green-200",
				gradient: "from-green-400 to-emerald-500",
			},
			customer: {
				icon: UserCircle,
				label: "Customer",
				color: "bg-blue-100 text-blue-700 border-blue-200",
				gradient: "from-blue-400 to-cyan-500",
			},
		};
		return roles[role] || roles.customer;
	};

	if (loading && users.length === 0) {
		return (
			<div className="flex flex-col justify-center items-center h-screen">
				<Leaf className="w-16 h-16 animate-spin text-green-600 mb-4" />
				<p className="text-gray-600 font-medium">
					Đang tải người dùng...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="flex justify-between items-start mb-4">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
								Quản lý Người dùng
							</h1>
							<p className="text-gray-600">
								Quản lý và phân quyền người dùng trong hệ thống
							</p>
						</div>
						<div className="flex gap-3">
							<button
								onClick={fetchUsers}
								className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-purple-500 hover:text-purple-600 transition-all shadow-sm">
								<RefreshCw className="w-5 h-5" />
								Làm mới
							</button>
							<button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/30">
								<Download className="w-5 h-5" />
								Xuất Excel
							</button>
						</div>
					</div>

					{/* Statistics Cards */}
					{stats && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-sm text-gray-600 mb-1">
											Tổng người dùng
										</p>
										<p className="text-3xl font-bold text-gray-900">
											{stats.total}
										</p>
									</div>
									<div className="bg-gray-100 p-3 rounded-lg">
										<Users className="w-6 h-6 text-gray-600" />
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-sm text-gray-600 mb-1">
											Quản trị viên
										</p>
										<p className="text-3xl font-bold text-purple-600">
											{stats.admins}
										</p>
									</div>
									<div className="bg-purple-100 p-3 rounded-lg">
										<Crown className="w-6 h-6 text-purple-600" />
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-green-100 hover:shadow-xl transition-all">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-sm text-gray-600 mb-1">
											Nhà bán hàng
										</p>
										<p className="text-3xl font-bold text-green-600">
											{stats.sellers}
										</p>
									</div>
									<div className="bg-green-100 p-3 rounded-lg">
										<Store className="w-6 h-6 text-green-600" />
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl p-5 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-sm text-gray-600 mb-1">
											Khách hàng
										</p>
										<p className="text-3xl font-bold text-blue-600">
											{stats.customers}
										</p>
									</div>
									<div className="bg-blue-100 p-3 rounded-lg">
										<ShoppingBag className="w-6 h-6 text-blue-600" />
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Filters */}
				<div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Search */}
						<div className="relative">
							<Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder="Tìm theo tên, email..."
								defaultValue={params.search}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleFilterChange(
											"search",
											e.target.value
										);
									}
								}}
								className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
							/>
						</div>

						{/* Role Filter */}
						<div className="relative">
							<select
								value={params.role}
								onChange={(e) =>
									handleFilterChange("role", e.target.value)
								}
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white appearance-none cursor-pointer transition-colors">
								<option value="">Tất cả vai trò</option>
								<option value="admin">Admin</option>
								<option value="seller">Seller</option>
								<option value="customer">Customer</option>
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
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white appearance-none cursor-pointer transition-colors">
								<option value="-createdAt">Mới nhất</option>
								<option value="createdAt">Cũ nhất</option>
								<option value="name">Tên (A-Z)</option>
								<option value="-name">Tên (Z-A)</option>
							</select>
							<ArrowUpDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>
				</div>

				{/* Users Table */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
					<div className="overflow-x-auto relative">
						{loading && (
							<div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
								<Leaf className="w-10 h-10 animate-spin text-purple-600" />
							</div>
						)}

						<table className="min-w-full">
							<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										Người dùng
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4" />
											Liên hệ
										</div>
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										<div className="flex items-center gap-2">
											<Shield className="w-4 h-4" />
											Vai trò
										</div>
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4" />
											Ngày tham gia
										</div>
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
										Hành động
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{users.length === 0 ? (
									<tr>
										<td
											colSpan="5"
											className="px-6 py-12 text-center">
											<Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
											<p className="text-gray-500 text-lg">
												Không tìm thấy người dùng nào
											</p>
										</td>
									</tr>
								) : (
									users.map((user) => {
										const roleInfo = getRoleInfo(user.role);
										const RoleIcon = roleInfo.icon;
										return (
											<tr
												key={user._id}
												className="hover:bg-gray-50 transition-colors">
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														{user.avatar ? (
															<img
																src={
																	user.avatar
																}
																alt={user.name}
																className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
															/>
														) : (
															<div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-xl">
																{user.name
																	.charAt(0)
																	.toUpperCase()}
															</div>
														)}
														<div>
															<div className="text-sm font-semibold text-gray-900">
																{user.name}
															</div>
															<div className="text-xs text-gray-500 flex items-center gap-1">
																<Mail className="w-3 h-3" />
																{user.email}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="space-y-1">
														<div className="text-sm text-gray-900 flex items-center gap-2">
															<Phone className="w-4 h-4 text-gray-400" />
															{user.phone ||
																"Chưa cập nhật"}
														</div>
														{user.address && (
															<div className="text-xs text-gray-500 flex items-center gap-2">
																<MapPin className="w-3 h-3 text-gray-400" />
																{user.address}
															</div>
														)}
													</div>
												</td>
												<td className="px-6 py-4">
													<select
														value={user.role}
														onChange={(e) =>
															handleUpdateRole(
																user,
																e.target.value
															)
														}
														onClick={(e) =>
															e.stopPropagation()
														}
														className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center gap-2 ${roleInfo.color}`}>
														<option value="customer">
															Customer
														</option>
														<option value="seller">
															Seller
														</option>
														<option value="admin">
															Admin
														</option>
													</select>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{new Date(
															user.createdAt
														).toLocaleDateString(
															"vi-VN"
														)}
													</div>
													<div className="text-xs text-gray-500">
														{new Date(
															user.createdAt
														).toLocaleTimeString(
															"vi-VN",
															{
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="flex gap-2">
														<button
															onClick={() =>
																setSelectedUser(
																	user
																)
															}
															className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
															title="Xem chi tiết">
															<Eye className="w-5 h-5" />
														</button>
														<button
															onClick={() =>
																handleDeleteUser(
																	user
																)
															}
															className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
															title="Xóa người dùng">
															<UserX className="w-5 h-5" />
														</button>
													</div>
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
									người dùng
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

			{/* User Detail Modal */}
			{selectedUser && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
							<div className="flex justify-between items-start">
								<div className="flex items-center gap-4">
									{selectedUser.avatar ? (
										<img
											src={selectedUser.avatar}
											alt={selectedUser.name}
											className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
										/>
									) : (
										<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white shadow-lg">
											{selectedUser.name
												.charAt(0)
												.toUpperCase()}
										</div>
									)}
									<div>
										<h2 className="text-2xl font-bold">
											{selectedUser.name}
										</h2>
										<p className="text-purple-100">
											{
												getRoleInfo(selectedUser.role)
													.label
											}
										</p>
									</div>
								</div>
								<button
									onClick={() => setSelectedUser(null)}
									className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
									<X className="w-6 h-6" />
								</button>
							</div>
						</div>

						{/* Modal Body */}
						<div className="p-6 space-y-6">
							{/* Contact Information */}
							<div className="bg-gray-50 rounded-xl p-5">
								<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
									<Mail className="w-5 h-5 text-purple-600" />
									Thông tin liên hệ
								</h3>
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
											<Mail className="w-5 h-5 text-purple-600" />
										</div>
										<div>
											<p className="text-xs text-gray-500">
												Email
											</p>
											<p className="text-sm font-medium text-gray-900">
												{selectedUser.email}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
											<Phone className="w-5 h-5 text-green-600" />
										</div>
										<div>
											<p className="text-xs text-gray-500">
												Số điện thoại
											</p>
											<p className="text-sm font-medium text-gray-900">
												{selectedUser.phone ||
													"Chưa cập nhật"}
											</p>
										</div>
									</div>
									{selectedUser.address && (
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
												<MapPin className="w-5 h-5 text-blue-600" />
											</div>
											<div>
												<p className="text-xs text-gray-500">
													Địa chỉ
												</p>
												<p className="text-sm font-medium text-gray-900">
													{selectedUser.address}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Account Information */}
							<div className="bg-gray-50 rounded-xl p-5">
								<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
									<Shield className="w-5 h-5 text-purple-600" />
									Thông tin tài khoản
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">
											ID người dùng
										</span>
										<span className="text-sm font-mono bg-gray-200 px-3 py-1 rounded">
											{selectedUser._id}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">
											Vai trò
										</span>
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold ${
												getRoleInfo(selectedUser.role)
													.color
											}`}>
											{
												getRoleInfo(selectedUser.role)
													.label
											}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">
											Ngày tham gia
										</span>
										<span className="text-sm font-medium text-gray-900">
											{new Date(
												selectedUser.createdAt
											).toLocaleString("vi-VN")}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">
											Đăng nhập Google
										</span>
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold ${
												selectedUser.googleId
													? "bg-green-100 text-green-700"
													: "bg-gray-100 text-gray-700"
											}`}>
											{selectedUser.googleId
												? "Có"
												: "Không"}
										</span>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-3">
								<button
									onClick={() => {
										setSelectedUser(null);
									}}
									className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-colors font-semibold">
									Đóng
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManageUsers;
