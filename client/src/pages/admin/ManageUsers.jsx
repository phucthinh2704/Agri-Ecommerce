import { useState, useEffect } from "react";
import { apiGetAllUsers } from "../../api/user"; // Cần tạo hàm này
import { Leaf, UserCheck, UserX } from "lucide-react";

const ManageUsers = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			const res = await apiGetAllUsers(); // Cần tạo hàm này
			if (res.success) {
				setUsers(res.data);
			}
			setLoading(false);
		};
		fetchUsers();
	}, []);
	
	// TODO: Thêm hàm handleUpdateRole và handleDeleteUser

	if (loading) {
		return <div className="flex justify-center items-center h-full"><Leaf className="w-10 h-10 animate-spin text-green-600"/></div>;
	}

	return (
		<div className="p-6 bg-white rounded-xl shadow-lg">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tham gia</th>
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{users.map(user => (
							<tr key={user._id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
											{user.name.charAt(0).toUpperCase()}
										</div>
										<div>
											<div className="text-sm font-medium text-gray-900">{user.name}</div>
											<div className="text-sm text-gray-500">{user.email}</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className={`px-3 py-1 rounded-full text-xs font-medium ${
										user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
									}`}>
										{user.role}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
								<td className="px-6 py-4 whitespace-nowrap text-right">
									<div className="flex justify-end gap-4">
										<button className="text-blue-600 hover:text-blue-900" title="Cấp quyền Admin">
											<UserCheck className="w-5 h-5" />
										</button>
										<button className="text-red-600 hover:text-red-900" title="Xóa người dùng">
											<UserX className="w-5 h-5" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ManageUsers;