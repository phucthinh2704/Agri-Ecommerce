import { ChevronDown, Leaf, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiGetAllCategories } from "../api/category";
import { apiGetAllProducts } from "../api/product";
import { Pagination, ProductCard } from "../components";
import { useSearchParams } from "react-router-dom";

import CONSTANTS from "../utils/constant";

const LoadingSpinner = () => (
	<div className="min-h-[50vh] flex items-center justify-center col-span-full">
		<div className="text-center">
			<Leaf className="w-16 h-16 text-green-600 animate-bounce" />
			<p className="mt-4 text-gray-500">Đang tải sản phẩm...</p>
		</div>
	</div>
);

// Component Sidebar Filter với Sticky
const FilterSidebar = ({
	categories,
	selected,
	onCategoryChange,
	onClear,
	isSticky,
}) => {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<aside className="md:col-span-1">
			<div
				className={`transition-all duration-300 ${
					isSticky ? "md:sticky md:top-4" : ""
				}`}>
				<div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
					{/* Header */}
					<div className="flex justify-between items-center mb-5">
						<div className="flex items-center gap-2">
							<SlidersHorizontal className="w-5 h-5 text-green-600" />
							<h3 className="text-lg font-bold text-gray-800">
								Bộ lọc
							</h3>
						</div>
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="md:hidden">
							<ChevronDown
								className={`w-5 h-5 text-gray-600 transition-transform ${
									isExpanded ? "rotate-180" : ""
								}`}
							/>
						</button>
					</div>

					{/* Categories */}
					<div
						className={`overflow-hidden transition-all duration-300 ${
							isExpanded
								? "max-h-[1000px] opacity-100"
								: "max-h-0 opacity-0 md:max-h-[1000px] md:opacity-100"
						}`}>
						<div className="flex justify-between items-center mb-4">
							<span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
								Danh mục
							</span>
							{selected.length > 0 && (
								<button
									onClick={onClear}
									className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
									<X className="w-3 h-3" />
									Xóa
								</button>
							)}
						</div>

						<div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
							{categories.map((category, index) => {
								const isSelected = selected.includes(
									category.slug
								);
								return (
									<label
										key={category._id}
										style={{
											animationDelay: `${index * 50}ms`,
										}}
										className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200 animate-fadeIn group">
										<div className="relative">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() =>
													onCategoryChange(
														category.slug
													)
												}
												className="peer sr-only"
											/>
											<div
												className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
													isSelected
														? "bg-green-600 border-green-600"
														: "border-gray-300 group-hover:border-green-400"
												}`}>
												{isSelected && (
													<svg
														className="w-3 h-3 text-white"
														fill="none"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="3"
														viewBox="0 0 24 24"
														stroke="currentColor">
														<path d="M5 13l4 4L19 7"></path>
													</svg>
												)}
											</div>
										</div>
										<span
											className={`text-sm transition-colors ${
												isSelected
													? "text-green-700 font-semibold"
													: "text-gray-700 group-hover:text-gray-900"
											}`}>
											{category.name}
										</span>
										{isSelected && (
											<span className="ml-auto w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
										)}
									</label>
								);
							})}
						</div>

						{/* Selected count badge */}
						{selected.length > 0 && (
							<div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
								<p className="text-sm text-green-700">
									<span className="font-semibold">
										{selected.length}
									</span>{" "}
									danh mục đã chọn
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</aside>
	);
};

// Component thanh Search/Sort
// const TopBar = ({
// 	sort,
// 	onSortChange,
// 	onSearchSubmit,
// 	totalProducts,
// 	initialQuery = "",
// }) => {
// 	const [query, setQuery] = useState(initialQuery);
// 	const [isFocused, setIsFocused] = useState(false);

// 	useEffect(() => {
// 		setQuery(initialQuery);
// 	}, [initialQuery]);

// 	const handleSubmit = (e) => {
// 		e.preventDefault();
// 		onSearchSubmit(query);
// 	};

// 	return (
// 		<div className="mb-8 space-y-4">
// 			{/* Search Bar */}
// 			<form
// 				onSubmit={handleSubmit}
// 				className="relative group">
// 				<div
// 					className={`relative transition-all duration-300 ${
// 						isFocused ? "scale-[1.02]" : ""
// 					}`}>
// 					<input
// 						type="text"
// 						value={query}
// 						onChange={(e) => setQuery(e.target.value)}
// 						onFocus={() => setIsFocused(true)}
// 						onBlur={() => setIsFocused(false)}
// 						placeholder="Tìm kiếm sản phẩm organic, rau củ, trái cây..."
// 						className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md"
// 					/>
// 					<button
// 						type="submit"
// 						className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-green-50 rounded-lg transition-colors">
// 						<Search className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
// 					</button>
// 					{query && (
// 						<button
// 							type="button"
// 							onClick={() => {
// 								setQuery("");
// 								onSearchSubmit("");
// 							}}
// 							className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
// 							<X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
// 						</button>
// 					)}
// 				</div>
// 			</form>

// 			{/* Sort & Info Bar */}
// 			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
// 				<div className="text-sm text-gray-600">
// 					Hiển thị{" "}
// 					<span className="font-semibold text-gray-900">
// 						{totalProducts}
// 					</span>{" "}
// 					sản phẩm
// 				</div>

// 				<div className="flex items-center gap-2">
// 					<span className="text-sm text-gray-600 font-medium">
// 						Sắp xếp:
// 					</span>
// 					<select
// 						id="sort"
// 						value={sort}
// 						onChange={(e) => onSortChange(e.target.value)}
// 						className="border-2 border-gray-200 rounded-xl py-2 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors bg-white shadow-sm">
// 						{CONSTANTS.sortOptions.map((opt) => (
// 							<option
// 								key={opt.value}
// 								value={opt.value}>
// 								{opt.label}
// 							</option>
// 						))}
// 					</select>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
const TopBar = ({ sort, onSortChange, onSearchSubmit, totalProducts, initialQuery = "" }) => {
	const [query, setQuery] = useState(initialQuery);
	const [isFocused, setIsFocused] = useState(false);

	// Cập nhật input nếu initialQuery từ URL thay đổi
	useEffect(() => {
		setQuery(initialQuery);
	}, [initialQuery]);

	const handleSubmit = (e) => {
		e.preventDefault();
		onSearchSubmit(query); // Gọi callback để cập nhật URL
	};

	return (
		<div className="mb-8 space-y-4">
			{/* Search Bar */}
			<form onSubmit={handleSubmit} className="relative group">
				<div
					className={`relative transition-all duration-300 ${
						isFocused ? "scale-[1.02]" : ""
					}`}>
					<input
						type="text"
						value={query} // Giá trị từ state nội bộ
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder="Tìm kiếm sản phẩm organic, rau củ, trái cây..."
						className="w-full pl-12 pr-10 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md"
					/>
					<button
						type="submit"
						className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-green-50 rounded-lg transition-colors">
						<Search className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
					</button>
					{query && (
						<button
							type="button"
							onClick={() => {
								setQuery(""); // Xóa input
								onSearchSubmit(""); // Gọi callback với chuỗi rỗng để xóa param
							}}
							className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
							<X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
						</button>
					)}
				</div>
			</form>

			{/* Sort & Info Bar - Giữ nguyên */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			 	<div className="text-sm text-gray-600">
			 		Hiển thị{" "}
			 		<span className="font-semibold text-gray-900">
			 			{totalProducts}
			 		</span>{" "}
			 		sản phẩm
			 	</div>
			 	<div className="flex items-center gap-2">
			 		<span className="text-sm text-gray-600 font-medium">
			 			Sắp xếp:
			 		</span>
			 		<select
			 			id="sort"
			 			value={sort}
			 			onChange={(e) => onSortChange(e.target.value)}
			 			className="border-2 border-gray-200 rounded-xl py-2 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors bg-white shadow-sm">
			 			{CONSTANTS.sortOptions.map((opt) => (
			 				<option key={opt.value} value={opt.value}>
			 					{opt.label}
			 				</option>
			 			))}
			 		</select>
			 	</div>
			</div>
		</div>
	);
};

// Main Component
const AllProductsPage = () => {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState(null);

	const topRef = useRef(null);

	const [searchParams, setSearchParams] = useSearchParams();
	const urlSearchTerm = searchParams.get("search") || ""; // Lấy giá trị từ URL

	// State cho filters
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [sortOption, setSortOption] = useState("-createdAt");
	const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		// Nếu giá trị 'search' trên URL khác với state hiện tại, cập nhật state
		if (urlSearchTerm !== searchTerm) {
			setSearchTerm(urlSearchTerm);
			// Có thể cần reset trang về 1 nếu bạn muốn
			setCurrentPage(1);
		}
		// Effect này chạy khi giá trị search trên URL thay đổi
	}, [searchTerm, urlSearchTerm]);

	// Effect để tải Categories (chỉ 1 lần)
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await apiGetAllCategories();
				if (res.success) {
					setCategories(res.data);
				}
			} catch (err) {
				console.error("Failed to fetch categories:", err);
			}
		};
		fetchCategories();
	}, []);

	// Effect để tải Products (khi filter thay đổi)
	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			setError(null);
			try {
				// Biến mảng ['slug1', 'slug2'] thành string "slug1,slug2"
				const categoryQuery = selectedCategories.join(",");

				const apiParams = {
					category: categoryQuery,
					limit: 9,
					page: currentPage,
					sort: sortOption,
					search: searchTerm, // Dùng state searchTerm đã được đồng bộ
				};
				Object.keys(apiParams).forEach(
					(key) => apiParams[key] === undefined && delete apiParams[key]
				);

				const res = await apiGetAllProducts(apiParams);

				if (res.success) {
					setProducts(res.data);
					setPagination(res.pagination);
				} else {
					setError("Không thể tải sản phẩm.");
				}
			} catch (err) {
				console.error("Failed to fetch products:", err);
				setError("Lỗi máy chủ, vui lòng thử lại.");
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [selectedCategories, sortOption, searchTerm, currentPage]);

	// Scroll to top when page changes
	useEffect(() => {
		if (topRef.current) {
			topRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, [currentPage]);

	// Handlers
	const handleCategoryChange = (slug) => {
		setSelectedCategories((prev) => {
			const isSelected = prev.includes(slug);
			if (isSelected) {
				return prev.filter((s) => s !== slug);
			} else {
				return [...prev, slug];
			}
		});
		setCurrentPage(1);
	};

	const handleClearCategories = () => {
		setSelectedCategories([]);
		setCurrentPage(1);
	};

	const handleSortChange = (value) => {
		setSortOption(value);
		setCurrentPage(1);
	};

	const handleSearchSubmit = (query) => {
		const newSearchParams = {};
		if (query) {
			newSearchParams.search = query;
		}
		setSearchParams(newSearchParams, { replace: true });
		setSearchTerm(query);
		setCurrentPage(1);
	};

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
			<div
				className="max-w-7xl mx-auto px-4 py-8"
				ref={topRef}>
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold text-gray-900 mb-2 animate-fadeIn">
						🌿 Tất cả sản phẩm
					</h1>
					<p
						className="text-gray-600 animate-fadeIn"
						style={{ animationDelay: "100ms" }}>
						Khám phá những sản phẩm organic tươi ngon nhất
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Sidebar - Sticky on desktop */}
					<FilterSidebar
						categories={categories}
						selected={selectedCategories}
						onCategoryChange={handleCategoryChange}
						onClear={handleClearCategories}
						isSticky={true}
					/>

					{/* Main Content */}
					<main className="md:col-span-3">
						<TopBar
							sort={sortOption}
							onSortChange={handleSortChange}
							onSearchSubmit={handleSearchSubmit}
							totalProducts={pagination?.total || 0}
							initialQuery={searchTerm}
						/>

						{/* Products Grid */}
						{loading ? (
							<LoadingSpinner />
						) : error ? (
							<div className="text-center py-16">
								<p className="text-red-500 mb-4">{error}</p>
								<button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
									Thử lại
								</button>
							</div>
						) : products.length > 0 ? (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{products.map((product, index) => (
										<ProductCard
											key={product._id}
											product={product}
											index={index}
										/>
									))}
								</div>

								<Pagination
									currentPage={pagination.page}
									totalPages={pagination.totalPages}
									onPageChange={handlePageChange}
								/>
							</>
						) : (
							<div className="text-center py-16 bg-white rounded-2xl shadow-lg">
								<Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-500 text-lg">
									Không tìm thấy sản phẩm nào phù hợp.
								</p>
								<button
									onClick={handleClearCategories}
									className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
									Xóa bộ lọc
								</button>
							</div>
						)}
					</main>
				</div>
			</div>

			<style>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-fadeIn {
					animation: fadeIn 0.6s ease-out forwards;
				}

				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}

				.custom-scrollbar::-webkit-scrollbar-track {
					background: #f1f1f1;
					border-radius: 10px;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #10b981;
					border-radius: 10px;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #059669;
				}
			`}</style>
		</div>
	);
};

export default AllProductsPage;
