import {
	ArrowLeft,
	DollarSign,
	FileText,
	Image,
	Leaf,
	Package,
	Save,
	Sparkles,
	Tag,
	UploadCloud,
	X,
	AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiGetAllCategories } from "../../api/category";
import { apiCreateProduct } from "../../api/product";
import { apiUploadImages } from "../../api/upload";
import path from "../../utils/path";

const CreateProduct = () => {
	const [categories, setCategories] = useState([]);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "",
		price: 0,
		unit: "kg",
		stock: 0,
	});
	const [imageFiles, setImageFiles] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingCats, setLoadingCats] = useState(true);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCats(true);
			const res = await apiGetAllCategories();
			if (res.success) {
				setCategories(res.data);
				if (res.data.length > 0) {
					setFormData((prev) => ({
						...prev,
						category: res.data[0].slug,
					}));
				}
			}
			setLoadingCats(false);
		};
		fetchCategories();
	}, []);

	// Validation functions
	const validateField = (name, value) => {
		let error = "";

		switch (name) {
			case "name":
				if (!value.trim()) {
					error = "Tên sản phẩm là bắt buộc";
				} else if (value.trim().length < 3) {
					error = "Tên sản phẩm phải có ít nhất 3 ký tự";
				} else if (value.trim().length > 200) {
					error = "Tên sản phẩm không được vượt quá 200 ký tự";
				}
				break;

			case "description":
				if (value && value.length > 2000) {
					error = "Mô tả không được vượt quá 2000 ký tự";
				}
				break;

			case "category":
				if (!value) {
					error = "Vui lòng chọn danh mục";
				}
				break;

			case "price": {
				const priceNum = Number(value);
				if (isNaN(priceNum)) {
					error = "Giá phải là số";
				} else if (priceNum < 0) {
					error = "Giá không được âm";
				} else if (priceNum === 0) {
					error = "Giá phải lớn hơn 0";
				} else if (priceNum > 1000000000) {
					error = "Giá không được vượt quá 1 tỷ";
				}
				break;
			}

			case "unit":
				if (!value.trim()) {
					error = "Đơn vị tính là bắt buộc";
				}
				break;

			case "stock": {
				const stockNum = Number(value);
				if (isNaN(stockNum)) {
					error = "Tồn kho phải là số";
				} else if (stockNum < 0) {
					error = "Tồn kho không được âm";
				} else if (stockNum > 1000000) {
					error = "Tồn kho không được vượt quá 1 triệu";
				}
				break;
			}

			default:
				break;
		}

		return error;
	};

	const validateAllFields = () => {
		const newErrors = {};

		// Validate text fields
		Object.keys(formData).forEach((key) => {
			const error = validateField(key, formData[key]);
			if (error) {
				newErrors[key] = error;
			}
		});

		// Validate images
		if (imageFiles.length === 0) {
			newErrors.images = "Vui lòng thêm ít nhất 1 hình ảnh sản phẩm";
		}

		return newErrors;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Update form data
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Validate on change if field was touched
		if (touched[name]) {
			const error = validateField(name, value);
			setErrors((prev) => ({
				...prev,
				[name]: error,
			}));
		}
	};

	const handleBlur = (e) => {
		const { name, value } = e.target;

		// Mark field as touched
		setTouched((prev) => ({ ...prev, [name]: true }));

		// Validate on blur
		const error = validateField(name, value);
		setErrors((prev) => ({
			...prev,
			[name]: error,
		}));
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		processFiles(files);
	};

	const processFiles = (files) => {
		if (files.length === 0) return;

		// Validate file types
		const invalidFiles = files.filter(
			(file) => !file.type.startsWith("image/")
		);
		if (invalidFiles.length > 0) {
			toast.error("Chỉ chấp nhận file ảnh (PNG, JPG, GIF)");
			return;
		}

		// Validate file sizes (5MB)
		const oversizedFiles = files.filter(
			(file) => file.size > 5 * 1024 * 1024
		);
		if (oversizedFiles.length > 0) {
			toast.error("Mỗi ảnh không được vượt quá 5MB");
			return;
		}

		const remainingSlots = 5 - imageFiles.length;
		if (files.length > remainingSlots) {
			toast.error(
				`Chỉ có thể thêm ${remainingSlots} ảnh nữa (tối đa 5 ảnh).`
			);
			files = files.slice(0, remainingSlots);
		}

		const newFiles = [...imageFiles, ...files];
		setImageFiles(newFiles);

		const newPreviews = files.map((file) => URL.createObjectURL(file));
		setImagePreviews([...imagePreviews, ...newPreviews]);

		// Clear image error if exists
		if (newFiles.length > 0) {
			setErrors((prev) => {
				// eslint-disable-next-line no-unused-vars
				const { images, ...rest } = prev;
				return rest;
			});
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files).filter((file) =>
			file.type.startsWith("image/")
		);
		processFiles(files);
	};

	const removePreview = (index) => {
		setImageFiles((prev) => prev.filter((_, i) => i !== index));
		setImagePreviews((prev) => prev.filter((_, i) => i !== index));

		// Add error if no images left
		if (imageFiles.length === 1) {
			setErrors((prev) => ({
				...prev,
				images: "Vui lòng thêm ít nhất 1 hình ảnh sản phẩm",
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (loadingCats) return;

		// Mark all fields as touched
		const allTouched = {};
		Object.keys(formData).forEach((key) => {
			allTouched[key] = true;
		});
		setTouched(allTouched);

		// Validate all fields
		const newErrors = validateAllFields();
		setErrors(newErrors);

		// Check if there are any errors
		if (Object.keys(newErrors).length > 0) {
			toast.error("Vui lòng kiểm tra lại thông tin");
			// Scroll to first error
			const firstErrorField = Object.keys(newErrors)[0];
			const errorElement = document.querySelector(
				`[name="${firstErrorField}"]`
			);
			if (errorElement) {
				errorElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
				errorElement.focus();
			}
			return;
		}

		setIsSubmitting(true);

		try {
			const uploadRes = await apiUploadImages(imageFiles);

			if (!uploadRes.success) {
				throw new Error(uploadRes.message || "Upload ảnh thất bại.");
			}

			const imagesArray = uploadRes.data;

			const productData = {
				...formData,
				images: imagesArray,
				price: Number(formData.price),
				stock: Number(formData.stock),
			};

			const res = await apiCreateProduct(productData);
			if (res.success) {
				toast.success("Tạo sản phẩm thành công!");
				navigate(`/${path.ADMIN}/${path.MANAGE_PRODUCTS}`);
			} else {
				toast.error(res.message || "Tạo sản phẩm thất bại.");
			}
		} catch (err) {
			console.error(err);
			toast.error(err.message || "Lỗi máy chủ.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 p-4 md:p-8">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4 transition-colors group">
						<ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
						<span className="font-medium">Quay lại</span>
					</button>
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
							<Sparkles className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
								Tạo sản phẩm mới
							</h1>
							<p className="text-gray-600 mt-1">
								Thêm sản phẩm mới vào cửa hàng của bạn
							</p>
						</div>
					</div>
				</div>

				{loadingCats ? (
					<div className="flex justify-center items-center h-96 bg-white rounded-2xl shadow-sm">
						<div className="text-center">
							<Leaf className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
							<p className="text-gray-600">Đang tải dữ liệu...</p>
						</div>
					</div>
				) : (
					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2 space-y-6">
								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
											<FileText className="w-5 h-5 text-blue-600" />
										</div>
										<h2 className="text-xl font-bold text-gray-800">
											Thông tin cơ bản
										</h2>
									</div>

									<div className="space-y-5">
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												Tên sản phẩm{" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												onBlur={handleBlur}
												placeholder="VD: Cà chua bi hữu cơ"
												className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
													errors.name
														? "border-red-500 focus:ring-red-200"
														: "border-gray-200 focus:ring-green-500 focus:border-transparent"
												}`}
												required
											/>
											{errors.name && (
												<div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
													<AlertCircle className="w-4 h-4" />
													<span>{errors.name}</span>
												</div>
											)}
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												Mô tả sản phẩm
											</label>
											<textarea
												name="description"
												value={formData.description}
												onChange={handleChange}
												onBlur={handleBlur}
												placeholder="Mô tả chi tiết về sản phẩm của bạn..."
												rows={6}
												className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
													errors.description
														? "border-red-500 focus:ring-red-200"
														: "border-gray-200 focus:ring-green-500 focus:border-transparent"
												}`}
											/>
											{errors.description && (
												<div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
													<AlertCircle className="w-4 h-4" />
													<span>
														{errors.description}
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
											<Image className="w-5 h-5 text-purple-600" />
										</div>
										<div className="flex-1">
											<h2 className="text-xl font-bold text-gray-800">
												Hình ảnh sản phẩm
											</h2>
											<p className="text-sm text-gray-500 mt-0.5">
												Tối đa 5 ảnh
											</p>
										</div>
										<span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
											{imageFiles.length}/5
										</span>
									</div>

									<div
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
											isDragging
												? "border-green-500 bg-green-50"
												: errors.images
												? "border-red-500 bg-red-50"
												: "border-gray-300 hover:border-green-400 bg-gray-50"
										}`}>
										<input
											id="file-upload"
											type="file"
											className="hidden"
											multiple
											accept="image/*"
											onChange={handleFileChange}
											disabled={imageFiles.length >= 5}
										/>
										<label
											htmlFor="file-upload"
											className={`cursor-pointer ${
												imageFiles.length >= 5
													? "opacity-50 cursor-not-allowed"
													: ""
											}`}>
											<div className="space-y-3">
												<div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto">
													<UploadCloud className="w-8 h-8 text-green-600" />
												</div>
												<div>
													<p className="text-base font-semibold text-gray-700">
														{imageFiles.length >= 5
															? "Đã đủ 5 ảnh"
															: "Kéo thả ảnh vào đây"}
													</p>
													<p className="text-sm text-gray-500 mt-1">
														hoặc{" "}
														<span className="text-green-600 font-medium">
															chọn từ máy tính
														</span>
													</p>
												</div>
												<p className="text-xs text-gray-400">
													PNG, JPG, GIF (tối đa
													5MB/ảnh)
												</p>
											</div>
										</label>
									</div>
									{errors.images && (
										<div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
											<AlertCircle className="w-4 h-4" />
											<span>{errors.images}</span>
										</div>
									)}

									{imagePreviews.length > 0 && (
										<div className="mt-6">
											<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
												{imagePreviews.map(
													(previewUrl, index) => (
														<div
															key={index}
															className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-green-500 transition-all">
															<img
																src={previewUrl}
																alt={`Preview ${
																	index + 1
																}`}
																className="w-full h-full object-cover"
															/>
															{index === 0 && (
																<div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
																	Chính
																</div>
															)}
															<button
																type="button"
																onClick={() =>
																	removePreview(
																		index
																	)
																}
																className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all">
																<X className="w-4 h-4" />
															</button>
														</div>
													)
												)}
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="space-y-6">
								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
									<div className="flex items-center gap-3 mb-5">
										<div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
											<Tag className="w-5 h-5 text-green-600" />
										</div>
										<h2 className="text-xl font-bold text-gray-800">
											Danh mục
										</h2>
									</div>
									<select
										name="category"
										value={formData.category}
										onChange={handleChange}
										onBlur={handleBlur}
										className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white transition-all ${
											errors.category
												? "border-red-500 focus:ring-red-200"
												: "border-gray-200 focus:ring-green-500"
										}`}>
										{categories.map((cat) => (
											<option
												key={cat._id}
												value={cat.slug}>
												{cat.name}
											</option>
										))}
									</select>
									{errors.category && (
										<div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
											<AlertCircle className="w-4 h-4" />
											<span>{errors.category}</span>
										</div>
									)}
								</div>

								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
									<div className="flex items-center gap-3 mb-5">
										<div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
											<DollarSign className="w-5 h-5 text-yellow-600" />
										</div>
										<h2 className="text-xl font-bold text-gray-800">
											Giá & Đơn vị
										</h2>
									</div>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												Giá bán (VNĐ){" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<div className="relative">
												<input
													type="number"
													name="price"
													value={formData.price}
													onChange={handleChange}
													onBlur={handleBlur}
													placeholder="0"
													className={`w-full pl-4 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
														errors.price
															? "border-red-500 focus:ring-red-200"
															: "border-gray-200 focus:ring-green-500 focus:border-transparent"
													}`}
													required
												/>
												<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
													đ
												</span>
											</div>
											{errors.price && (
												<div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
													<AlertCircle className="w-4 h-4" />
													<span>{errors.price}</span>
												</div>
											)}
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												Đơn vị tính
											</label>
											<select
												name="unit"
												value={formData.unit}
												onChange={handleChange}
												onBlur={handleBlur}
												className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white transition-all ${
													errors.unit
														? "border-red-500 focus:ring-red-200"
														: "border-gray-200 focus:ring-green-500"
												}`}>
												<option value="kg">
													Kilogram (kg)
												</option>
												<option value="bunch">
													Bó
												</option>
												<option value="pack">
													Gói
												</option>
												<option value="dozen">
													Tá
												</option>
											</select>
											{errors.unit && (
												<div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
													<AlertCircle className="w-4 h-4" />
													<span>{errors.unit}</span>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
									<div className="flex items-center gap-3 mb-5">
										<div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
											<Package className="w-5 h-5 text-orange-600" />
										</div>
										<h2 className="text-xl font-bold text-gray-800">
											Tồn kho
										</h2>
									</div>

									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Số lượng
										</label>
										<input
											type="number"
											name="stock"
											value={formData.stock}
											onChange={handleChange}
											onBlur={handleBlur}
											placeholder="0"
											className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
												errors.stock
													? "border-red-500 focus:ring-red-200"
													: "border-gray-200 focus:ring-green-500 focus:border-transparent"
											}`}
										/>
										{errors.stock && (
											<div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
												<AlertCircle className="w-4 h-4" />
												<span>{errors.stock}</span>
											</div>
										)}
									</div>
								</div>

								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold text-lg">
									{isSubmitting ? (
										<>
											<Leaf className="w-5 h-5 animate-spin" />
											Đang lưu...
										</>
									) : (
										<>
											<Save className="w-5 h-5" />
											Lưu sản phẩm
										</>
									)}
								</button>
							</div>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default CreateProduct;
