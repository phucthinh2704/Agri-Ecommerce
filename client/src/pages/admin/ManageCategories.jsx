import { useState, useEffect } from "react";
import { apiGetAllCategories, apiCreateCategory } from "../../api/category"; // Tạo apiCreateCategory
import { Leaf, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const ManageCategories = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	// State cho form tạo mới
	const [newName, setNewName] = useState("");
	const [newDescription, setNewDescription] = useState("");

	const fetchCategories = async () => {
		setLoading(true);
		const res = await apiGetAllCategories();
		if (res.success) {
			setCategories(res.data);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleCreateCategory = async (e) => {
		e.preventDefault();
		if (!newName) {
			toast.error("Vui lòng nhập tên danh mục.");
			return;
		}
		setIsSubmitting(true);
		try {
			const res = await apiCreateCategory({ name: newName, description: newDescription });
			if (res.success) {
				toast.success("Tạo danh mục thành công!");
				setNewName("");
				setNewDescription("");
				fetchCategories(); // Tải lại danh sách
			} else {
				toast.error(res.message || "Tạo danh mục thất bại.");
			}
		} catch (err) {
      console.log(err);
			toast.error("Lỗi máy chủ.");
		} finally {
			setIsSubmitting(false);
		}
	};
	
	// TODO: Thêm hàm handleUpdateCategory và handleDeleteCategory

	if (loading) {
		return <div className="flex justify-center items-center h-full"><Leaf className="w-10 h-10 animate-spin text-green-600"/></div>;
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Cột 1: Form Tạo Mới */}
			<div className="lg:col-span-1">
				<form onSubmit={handleCreateCategory} className="p-6 bg-white rounded-xl shadow-lg sticky top-6">
					<h2 className="text-xl font-bold text-gray-800 mb-4">Thêm danh mục mới</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
							<input 
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
								placeholder="Ví dụ: Trái cây"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
							<textarea
								value={newDescription}
								onChange={(e) => setNewDescription(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
								rows="4"
								placeholder="Mô tả ngắn..."
							></textarea>
						</div>
						<button 
							type="submit"
							disabled={isSubmitting}
							className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
							<Plus className="w-5 h-5" />
							{isSubmitting ? "Đang xử lý..." : "Thêm mới"}
						</button>
					</div>
				</form>
			</div>

			{/* Cột 2: Danh sách */}
			<div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-lg">
				<h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách danh mục</h2>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{categories.map(cat => (
								<tr key={cat._id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.slug}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex gap-4">
											<button className="text-blue-600 hover:text-blue-900"><Edit className="w-5 h-5" /></button>
											<button className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default ManageCategories;