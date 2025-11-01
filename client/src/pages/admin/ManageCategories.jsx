import {
	Leaf,
	Plus,
	Edit,
	Trash2,
	UploadCloud,
	X,
	Save,
	XCircle,
	Search,
	Grid3x3,
	List,
	ImageOff,
	AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
	apiGetAllCategories,
	apiCreateCategory,
	apiUpdateCategory,
	apiDeleteCategory,
} from "../../api/category";
import { apiUploadSingleImage } from "../../api/upload";
import useAlert from "../../hooks/useAlert";

const ManageCategories = () => {
	const [categories, setCategories] = useState([]);
	const [filteredCategories, setFilteredCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
	const { showConfirm } = useAlert();

	// Form validation errors
	const [errors, setErrors] = useState({});

	// State cho form
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [existingImageUrl, setExistingImageUrl] = useState(null);

	const fetchCategories = async () => {
		setLoading(true);
		const res = await apiGetAllCategories();
		if (res.success) {
			setCategories(res.data);
			setFilteredCategories(res.data);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	// Search filter
	useEffect(() => {
		const filtered = categories.filter(
			(cat) =>
				cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				cat.description
					?.toLowerCase()
					.includes(searchQuery.toLowerCase())
		);
		setFilteredCategories(filtered);
	}, [searchQuery, categories]);

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Tên danh mục là bắt buộc";
		} else if (formData.name.length < 2) {
			newErrors.name = "Tên danh mục phải có ít nhất 2 ký tự";
		} else if (formData.name.length > 50) {
			newErrors.name = "Tên danh mục không được quá 50 ký tự";
		}

		if (!formData.description.trim()) {
			newErrors.description = "Mô tả là bắt buộc";
		} else if (formData.description.length < 10) {
			newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
		} else if (formData.description.length > 200) {
			newErrors.description = "Mô tả không được quá 200 ký tự";
		}

		if (!isEditing && !imageFile) {
			newErrors.image = "Vui lòng chọn ảnh đại diện";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user types
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("Vui lòng chọn file ảnh hợp lệ");
				e.target.value = null;
				return;
			}

			// Validate file size
			if (file.size > 5 * 1024 * 1024) {
				toast.error("File quá lớn, vui lòng chọn ảnh dưới 5MB");
				e.target.value = null;
				return;
			}

			setImageFile(file);
			if (imagePreview) URL.revokeObjectURL(imagePreview);
			setImagePreview(URL.createObjectURL(file));
			setExistingImageUrl(null);

			// Clear image error
			if (errors.image) {
				setErrors((prev) => ({ ...prev, image: "" }));
			}
		}
		e.target.value = null;
	};

	const removePreview = () => {
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		setImageFile(null);
		setImagePreview(null);
		setExistingImageUrl(null);
	};

	const resetForm = () => {
		setIsEditing(false);
		setEditingId(null);
		setFormData({ name: "", description: "" });
		setImageFile(null);
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		setImagePreview(null);
		setExistingImageUrl(null);
		setErrors({});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Vui lòng kiểm tra lại thông tin");
			return;
		}

		setIsSubmitting(true);
		try {
			let imageUrl = existingImageUrl;

			if (imageFile) {
				const uploadRes = await apiUploadSingleImage(imageFile);
				if (!uploadRes.success) {
					throw new Error(uploadRes.message || "Upload ảnh thất bại");
				}
				imageUrl = uploadRes.data;
			}

			const categoryData = {
				name: formData.name.trim(),
				description: formData.description.trim(),
				image: imageUrl,
			};

			let res;
			if (isEditing) {
				res = await apiUpdateCategory(editingId, categoryData);
			} else {
				res = await apiCreateCategory(categoryData);
			}

			if (res.success) {
				toast.success(
					isEditing ? "Cập nhật thành công!" : "Tạo mới thành công!"
				);
				resetForm();
				fetchCategories();
			} else {
				toast.error(res.message || "Thao tác thất bại");
			}
		} catch (err) {
			console.log(err);
			toast.error(err.message || "Lỗi máy chủ");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteCategory = (category) => {
		showConfirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`).then(
			async (result) => {
				if (result.isConfirmed) {
					try {
						const res = await apiDeleteCategory(category._id);
						if (res.success) {
							toast.success("Xóa danh mục thành công!");
							fetchCategories();
							if (editingId === category._id) {
								resetForm();
							}
						} else {
							toast.error(res.message || "Xóa thất bại");
						}
					} catch (err) {
						console.log(err);
						toast.error("Lỗi máy chủ");
					}
				}
			}
		);
	};

	const handleSelectForEdit = (category) => {
		setIsEditing(true);
		setEditingId(category._id);
		setFormData({
			name: category.name,
			description: category.description,
		});
		setExistingImageUrl(category.image);
		setImageFile(null);
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		setImagePreview(null);
		setErrors({});

		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (loading) {
		return (
			<div className="flex flex-col justify-center items-center h-screen">
				<Leaf className="w-16 h-16 animate-spin text-green-600 mb-4" />
				<p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
						Quản lý Danh mục
					</h1>
					<p className="text-gray-600">
						Tạo và quản lý các danh mục sản phẩm của bạn
					</p>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					{/* Form Column */}
					<div className="xl:col-span-1">
						<form
							onSubmit={handleSubmit}
							className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border border-gray-100">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
									{isEditing ? (
										<>
											<Edit className="w-6 h-6 text-blue-600" />
											Cập nhật
										</>
									) : (
										<>
											<Plus className="w-6 h-6 text-green-600" />
											Thêm mới
										</>
									)}
								</h2>
								{isEditing && (
									<button
										type="button"
										onClick={resetForm}
										className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
										<XCircle className="w-4 h-4" />
										Hủy
									</button>
								)}
							</div>

							<div className="space-y-5">
								{/* Name Input */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Tên danh mục{" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleChange}
										className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${
											errors.name
												? "border-red-300 focus:border-red-500 bg-red-50"
												: "border-gray-200 focus:border-green-500 focus:bg-green-50"
										}`}
										placeholder="VD: Trái cây tươi"
										maxLength={50}
									/>
									{errors.name && (
										<p className="mt-1 text-sm text-red-600 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{errors.name}
										</p>
									)}
									<p className="mt-1 text-xs text-gray-500">
										{formData.name.length}/50 ký tự
									</p>
								</div>

								{/* Description Input */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Mô tả{" "}
										<span className="text-red-500">*</span>
									</label>
									<textarea
										name="description"
										value={formData.description}
										onChange={handleChange}
										className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all resize-none ${
											errors.description
												? "border-red-300 focus:border-red-500 bg-red-50"
												: "border-gray-200 focus:border-green-500 focus:bg-green-50"
										}`}
										rows="4"
										placeholder="Mô tả ngắn gọn về danh mục..."
										maxLength={200}
									/>
									{errors.description && (
										<p className="mt-1 text-sm text-red-600 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{errors.description}
										</p>
									)}
									<p className="mt-1 text-xs text-gray-500">
										{formData.description.length}/200 ký tự
									</p>
								</div>

								{/* Image Upload */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Ảnh đại diện{" "}
										<span className="text-red-500">*</span>
									</label>
									<div
										className={`border-2 border-dashed rounded-xl p-6 transition-all ${
											errors.image
												? "border-red-300 bg-red-50"
												: "border-gray-300 hover:border-green-400 bg-gray-50"
										}`}>
										{imagePreview || existingImageUrl ? (
											<div className="relative group">
												<img
													src={
														imagePreview ||
														existingImageUrl
													}
													alt="Preview"
													className="w-full h-full object-cover rounded-lg shadow-md"
												/>
												<button
													type="button"
													onClick={removePreview}
													className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
													<X className="w-4 h-4" />
												</button>
											</div>
										) : (
											<div className="text-center">
												<UploadCloud className="mx-auto h-16 w-16 text-gray-400 mb-3" />
												<p className="text-sm text-gray-600 mb-2">
													Kéo thả ảnh vào đây hoặc
												</p>
												<label
													htmlFor="file-upload"
													className="cursor-pointer inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
													<UploadCloud className="w-4 h-4" />
													Chọn ảnh
													<input
														id="file-upload"
														name="image"
														type="file"
														className="sr-only"
														accept="image/*"
														onChange={
															handleFileChange
														}
													/>
												</label>
												<p className="text-xs text-gray-500 mt-2">
													PNG, JPG, GIF (tối đa 5MB)
												</p>
											</div>
										)}
									</div>
									{errors.image && (
										<p className="mt-1 text-sm text-red-600 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{errors.image}
										</p>
									)}
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={isSubmitting}
									className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all transform ${
										isSubmitting
											? "bg-gray-400 cursor-not-allowed"
											: isEditing
											? "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-500/30"
											: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 shadow-lg shadow-green-500/30"
									} text-white`}>
									{isSubmitting ? (
										<>
											<Leaf className="w-5 h-5 animate-spin" />
											{isEditing
												? "Đang cập nhật..."
												: "Đang thêm..."}
										</>
									) : (
										<>
											{isEditing ? (
												<Save className="w-5 h-5" />
											) : (
												<Plus className="w-5 h-5" />
											)}
											{isEditing
												? "Lưu thay đổi"
												: "Thêm danh mục"}
										</>
									)}
								</button>
							</div>
						</form>
					</div>

					{/* Categories List Column */}
					<div className="xl:col-span-2">
						<div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
							{/* Toolbar */}
							<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-800">
									Danh sách danh mục
									<span className="ml-2 text-sm font-normal text-gray-500">
										({filteredCategories.length})
									</span>
								</h2>

								<div className="flex gap-3 w-full sm:w-auto">
									{/* Search */}
									<div className="relative flex-1 sm:flex-initial">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
										<input
											type="text"
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											placeholder="Tìm kiếm..."
											className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 transition-colors w-full sm:w-64"
										/>
									</div>

									{/* View Toggle */}
									<div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
										<button
											onClick={() => setViewMode("grid")}
											className={`p-2 transition-colors ${
												viewMode === "grid"
													? "bg-green-600 text-white"
													: "bg-white text-gray-600 hover:bg-gray-100"
											}`}>
											<Grid3x3 className="w-5 h-5" />
										</button>
										<button
											onClick={() => setViewMode("list")}
											className={`p-2 transition-colors ${
												viewMode === "list"
													? "bg-green-600 text-white"
													: "bg-white text-gray-600 hover:bg-gray-100"
											}`}>
											<List className="w-5 h-5" />
										</button>
									</div>
								</div>
							</div>

							{/* Empty State */}
							{filteredCategories.length === 0 ? (
								<div className="text-center py-16">
									<ImageOff className="w-20 h-20 text-gray-300 mx-auto mb-4" />
									<p className="text-gray-500 text-lg">
										{searchQuery
											? "Không tìm thấy danh mục nào"
											: "Chưa có danh mục nào"}
									</p>
								</div>
							) : viewMode === "grid" ? (
								/* Grid View */
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{filteredCategories.map((cat) => (
										<div
											key={cat._id}
											className={`group relative bg-white border-2 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${
												editingId === cat._id
													? "border-green-500 shadow-lg shadow-green-500/20"
													: "border-gray-200 hover:border-green-300"
											}`}>
											{/* Image */}
											<div className="relative h-48 overflow-hidden bg-gray-100">
												<img
													src={
														cat.image ||
														"https://res.cloudinary.com/ddfi4fdao/image/upload/v1717904573/no-image_h316pe.png"
													}
													alt={cat.name}
													className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
												/>
												{editingId === cat._id && (
													<div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
														Đang sửa
													</div>
												)}
											</div>

											{/* Content */}
											<div className="p-4">
												<h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
													{cat.name}
												</h3>
												<p className="text-sm text-gray-600 mb-2 line-clamp-2">
													{cat.description ||
														"Chưa có mô tả"}
												</p>
												<p className="text-xs text-gray-400 mb-3">
													Slug: {cat.slug}
												</p>

												{/* Actions */}
												<div className="flex gap-2">
													<button
														onClick={() =>
															handleSelectForEdit(
																cat
															)
														}
														className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
														<Edit className="w-4 h-4" />
														Sửa
													</button>
													<button
														onClick={() =>
															handleDeleteCategory(
																cat
															)
														}
														className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
														<Trash2 className="w-4 h-4" />
														Xóa
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								/* List View */
								<div className="overflow-x-auto">
									<table className="min-w-full">
										<thead className="bg-gray-50 border-b-2 border-gray-200">
											<tr>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Ảnh
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Tên
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Mô tả
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Slug
												</th>
												<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Thao tác
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{filteredCategories.map((cat) => (
												<tr
													key={cat._id}
													className={`hover:bg-gray-50 transition-colors ${
														editingId === cat._id
															? "bg-green-50"
															: ""
													}`}>
													<td className="px-6 py-4">
														<img
															src={
																cat.image ||
																"https://res.cloudinary.com/ddfi4fdao/image/upload/v1717904573/no-image_h316pe.png"
															}
															alt={cat.name}
															className="w-full h-full rounded-lg object-cover shadow-sm"
														/>
													</td>
													<td className="px-6 py-4">
														<div className="font-semibold text-gray-900">
															{cat.name}
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="text-sm text-gray-600 max-w-xs truncate">
															{cat.description ||
																"Chưa có mô tả"}
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="text-sm text-gray-500">
															{cat.slug}
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="flex gap-2 justify-end">
															<button
																onClick={() =>
																	handleSelectForEdit(
																		cat
																	)
																}
																className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
																title="Sửa">
																<Edit className="w-5 h-5" />
															</button>
															<button
																onClick={() =>
																	handleDeleteCategory(
																		cat
																	)
																}
																className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
																title="Xóa">
																<Trash2 className="w-5 h-5" />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ManageCategories;
