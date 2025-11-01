import {
	Edit,
	Filter,
	Grid,
	Leaf,
	List,
	Package,
	PlusCircle,
	Search,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiGetAllCategories } from "../../api/category";
import { apiDeleteProduct, apiGetAllProducts } from "../../api/product";
import { Pagination } from "../../components";
import useAlert from "../../hooks/useAlert";
import CONSTANTS from "../../utils/constant";
import formatUnit from "../../utils/formatUnit";
import path from "../../utils/path";

const ManageProducts = () => {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState("grid"); // grid or list
	const [showFilters, setShowFilters] = useState(false);

	const [searchParams, setSearchParams] = useSearchParams();
	const { showConfirm } = useAlert();

	const params = useMemo(
		() => ({
			page: searchParams.get("page") || 1,
			search: searchParams.get("search") || "",
			category: searchParams.get("category") || "",
			sort: searchParams.get("sort") || "-createdAt",
			limit: 9,
		}),
		[searchParams]
	);

	useEffect(() => {
		const fetchInitialData = async () => {
			const res = await apiGetAllCategories();
			if (res.success) {
				setCategories(res.data);
			}
		};
		fetchInitialData();
	}, []);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		const validParams = Object.entries(params).reduce(
			(acc, [key, value]) => {
				if (value) acc[key] = value;
				return acc;
			},
			{}
		);

		const res = await apiGetAllProducts(validParams);
		if (res.success) {
			setProducts(res.data);
			setPagination(res.pagination);
		} else {
			toast.error(res.message);
		}
		setLoading(false);
	}, [params]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts, searchParams]);

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

	const handleDeleteProduct = (productId, productName) => {
		showConfirm(`Bạn có chắc muốn xóa sản phẩm "${productName}"?`).then(
			async (result) => {
				if (result.isConfirmed) {
					try {
						const res = await apiDeleteProduct(productId);
						if (res.success) {
							toast.success("Xóa sản phẩm thành công!");
							fetchProducts();
						} else {
							toast.error(res.message || "Xóa thất bại.");
						}
					} catch (err) {
						console.log(err);
						toast.error("Lỗi máy chủ.");
					}
				}
			}
		);
	};

	// Stats calculation
	const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
	const totalSold = products.reduce((sum, p) => sum + p.sold, 0);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 p-4 md:p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="mb-8">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
								Quản lý sản phẩm
							</h1>
							<p className="text-gray-600">
								Quản lý và theo dõi toàn bộ sản phẩm của bạn
							</p>
						</div>
						<Link to={`/${path.ADMIN}/${path.CREATE_PRODUCT}`}>
							<button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 w-full md:w-auto font-medium">
								<PlusCircle className="w-5 h-5" />
								Thêm sản phẩm mới
							</button>
						</Link>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Tổng sản phẩm
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{pagination?.total || 0}
									</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
									<Package className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Tổng kho
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{totalStock}
									</p>
								</div>
								<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
									<Leaf className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>
						<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Đã bán
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{totalSold}
									</p>
								</div>
								<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
									<TrendingUp className="w-6 h-6 text-purple-600" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Filters Section */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
					<div className="flex flex-col md:flex-row gap-4 mb-4">
						{/* Search Bar */}
						<div className="relative flex-1">
							<input
								type="text"
								placeholder="Tìm kiếm sản phẩm..."
								defaultValue={params.search}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleFilterChange(
											"search",
											e.target.value
										);
									}
								}}
								className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
							/>
							<Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
						</div>

						{/* View Toggle & Filter Button */}
						<div className="flex gap-2">
							<button
								onClick={() => setShowFilters(!showFilters)}
								className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
									showFilters
										? "bg-green-50 border-green-500 text-green-700"
										: "bg-white border-gray-200 text-gray-700 hover:border-green-500"
								}`}>
								<Filter className="w-5 h-5" />
								<span className="hidden md:inline">Lọc</span>
							</button>
							<div className="flex bg-gray-100 rounded-xl p-1">
								<button
									onClick={() => setViewMode("grid")}
									className={`p-2 rounded-lg transition-all ${
										viewMode === "grid"
											? "bg-white shadow-sm text-green-600"
											: "text-gray-600 hover:text-green-600"
									}`}>
									<Grid className="w-5 h-5" />
								</button>
								<button
									onClick={() => setViewMode("list")}
									className={`p-2 rounded-lg transition-all ${
										viewMode === "list"
											? "bg-white shadow-sm text-green-600"
											: "text-gray-600 hover:text-green-600"
									}`}>
									<List className="w-5 h-5" />
								</button>
							</div>
						</div>
					</div>

					{/* Advanced Filters */}
					{showFilters && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
							<select
								value={params.category}
								onChange={(e) =>
									handleFilterChange(
										"category",
										e.target.value
									)
								}
								className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition-all">
								<option value="">Tất cả danh mục</option>
								{categories.map((cat) => (
									<option
										key={cat._id}
										value={cat.slug}>
										{cat.name}
									</option>
								))}
							</select>
							<select
								value={params.sort}
								onChange={(e) =>
									handleFilterChange("sort", e.target.value)
								}
								className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition-all">
								{CONSTANTS.sortOptions.map((opt) => (
									<option
										key={opt.value}
										value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{/* Products Display */}
				{loading ? (
					<div className="flex justify-center items-center h-96 bg-white rounded-2xl shadow-sm">
						<div className="text-center">
							<Leaf className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
							<p className="text-gray-600">
								Đang tải sản phẩm...
							</p>
						</div>
					</div>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{products.map((product, index) => (
							<div
								key={product._id}
								className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
								style={{
									animationDelay: `${index * 50}ms`,
								}}>
								<div className="relative overflow-hidden">
									<Link
										key={product._id}
										to={`/product/${product.slug}`}>
										<img
											src={product.images[0]}
											alt={product.name}
											className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
										/>
									</Link>
									<div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-green-600">
										{product.category}
									</div>
								</div>
								<div className="p-5">
									<Link
										key={product._id}
										to={`/product/${product.slug}`}>
										<h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
											{product.name}
										</h3>
									</Link>
									<div className="flex items-center justify-between mb-4">
										<div>
											<p className="text-2xl font-bold text-green-600">
												{product.price.toLocaleString(
													"vi-VN"
												)}
												đ
											</p>
											<p className="text-sm text-gray-500">
												/{formatUnit(product.unit)}
											</p>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3 mb-4 text-sm">
										<div className="bg-blue-50 rounded-lg p-2 text-center">
											<p className="text-gray-600 text-xs mb-1">
												Kho
											</p>
											<p className="font-semibold text-blue-600">
												{product.stock}
											</p>
										</div>
										<div className="bg-purple-50 rounded-lg p-2 text-center">
											<p className="text-gray-600 text-xs mb-1">
												Đã bán
											</p>
											<p className="font-semibold text-purple-600">
												{product.sold}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Link
											to={`/${path.ADMIN}/edit-product/${product._id}`}
											className="flex-1">
											<button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors font-medium">
												<Edit className="w-4 h-4" />
												Sửa
											</button>
										</Link>
										<button
											onClick={() =>
												handleDeleteProduct(
													product._id,
													product.name
												)
											}
											className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors font-medium">
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gradient-to-r from-gray-50 to-green-50">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Sản phẩm
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Danh mục
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Giá
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Kho
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Đã bán
										</th>
										<th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Hành động
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{products.map((product) => (
										<tr
											key={product._id}
											className="hover:bg-green-50 transition-colors">
											<td className="px-6 py-4">
												<div className="flex items-center gap-4">
													<Link
														key={product._id}
														to={`/product/${product.slug}`}>
														<img
															src={
																product
																	.images[0]
															}
															alt={product.name}
															className="w-14 h-14 rounded-xl object-cover shadow-sm"
														/>
													</Link>
													<Link
														key={product._id}
														to={`/product/${product.slug}`}>
														<span className="font-medium text-gray-900 line-clamp-2 hover:text-green-600">
															{product.name}
														</span>
													</Link>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
													{product.category}
												</span>
											</td>
											<td className="px-6 py-4">
												<div>
													<p className="font-semibold text-gray-900">
														{product.price.toLocaleString(
															"vi-VN"
														)}
														đ
													</p>
													<p className="text-sm text-gray-500">
														/
														{formatUnit(
															product.unit
														)}
													</p>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="font-medium text-gray-700">
													{product.stock}
												</span>
											</td>
											<td className="px-6 py-4">
												<span className="font-medium text-gray-700">
													{product.sold}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="flex justify-end gap-2">
													<Link
														to={`/${path.ADMIN}/edit-product/${product._id}`}>
														<button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
															<Edit className="w-5 h-5" />
														</button>
													</Link>
													<button
														onClick={() =>
															handleDeleteProduct(
																product._id,
																product.name
															)
														}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
														<Trash2 className="w-5 h-5" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Pagination */}
				{pagination && (
					<div className="mt-6">
						<Pagination
							currentPage={pagination.page}
							totalPages={pagination.totalPages}
							onPageChange={handlePageChange}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default ManageProducts;
