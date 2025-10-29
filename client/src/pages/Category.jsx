import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGetAllProducts } from "../api/product";
import { apiGetCategoryBySlug } from "../api/category";
import { ProductCard, Pagination } from "../components"; // Thêm Pagination
import {
	Leaf,
	Search,
	ListFilter,
	ArrowUpDown,
	SlidersHorizontal,
} from "lucide-react";
import CONSTANTS from "../utils/constant";

const LoadingSpinner = () => (
	<div className="min-h-[50vh] flex items-center justify-center">
		<div className="text-center">
			<Leaf className="w-16 h-16 text-green-600 animate-bounce mx-auto mb-4" />
			<p className="text-gray-600">Đang tải sản phẩm...</p>
		</div>
	</div>
);

const CategoryPage = () => {
	const { slug } = useParams();
	const [products, setProducts] = useState([]);
	const [categoryName, setCategoryName] = useState("");
	const [categoryDescription, setCategoryDescription] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// State cho filter, sort, và pagination
	const [pagination, setPagination] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOption, setSortOption] = useState("-createdAt"); // Mặc định là mới nhất
	const [searchQuery, setSearchQuery] = useState(""); // State cho input
	const [searchTerm, setSearchTerm] = useState(""); // State cho API call

	// 1. useEffect để lấy tên danh mục (chỉ chạy khi slug thay đổi)
	useEffect(() => {
		const fetchCategoryInfo = async () => {
			if (!slug) return;
			try {
				const catRes = await apiGetCategoryBySlug(slug);
				if (catRes.success) {
					setCategoryName(catRes.data.name);
					setCategoryDescription(catRes.data.description);
					setError(null);
				} else {
					setError("Không tìm thấy danh mục này.");
					setCategoryName("");
				}
			} catch (err) {
				console.error("Error fetching category info:", err);
				setError("Lỗi khi tải thông tin danh mục.");
			}
		};
		fetchCategoryInfo();
	}, [slug]);

	// 2. useEffect để lấy danh sách sản phẩm (chạy khi slug, sort, page, hoặc search thay đổi)
	useEffect(() => {
		const fetchProducts = async () => {
			if (!slug || error) return; // Không chạy nếu slug rỗng hoặc đang có lỗi

			setLoading(true);
			try {
				const productRes = await apiGetAllProducts({
					category: slug,
					limit: 12, // Đặt limit 12 sản phẩm/trang
					page: currentPage,
					sort: sortOption,
					search: searchTerm,
				});

				if (productRes.success) {
					setProducts(productRes.data);
					setPagination(productRes.pagination); // Lưu thông tin phân trang
				} else {
					setError("Không thể tải sản phẩm.");
					setProducts([]);
					setPagination(null);
				}
			} catch (err) {
				console.error("Error fetching products:", err);
				setError("Lỗi khi tải sản phẩm.");
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [slug, currentPage, sortOption, searchTerm, error]); // Thêm dependencies

	// useEffect để RESET state khi slug thay đổi
	useEffect(() => {
		// Khi người dùng chuyển sang danh mục mới, hãy reset lại mọi thứ về mặc định.
		setSearchQuery(""); // Xóa chữ trong ô input
		setSearchTerm(""); // Xóa param tìm kiếm của API
		setCurrentPage(1); // Đưa về trang 1
		// Bạn cũng có thể reset cả sort nếu muốn:
		// setSortOption("-createdAt");
	}, [slug]);

	// 3. Handlers cho UI
	const handleSortChange = (e) => {
		setSortOption(e.target.value);
		setCurrentPage(1); // Reset về trang 1 khi đổi sort
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		setSearchTerm(searchQuery);
		setCurrentPage(1); // Reset về trang 1 khi search
	};

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
	};
	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSearchSubmit(e);
		}
	};

	if (error && !loading) {
		return <div className="text-center py-10 text-red-500">{error}</div>;
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					{categoryName || "Đang tải..."}
				</h1>
				<p className="text-gray-600">
					{categoryDescription || "Đang tải..."}
				</p>
			</div>

			{/* Filter & Sort Card */}
			<div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-md border border-green-100 overflow-hidden mb-8">
				<div className="p-6">
					<div className="flex flex-col lg:flex-row items-stretch gap-4">
						{/* Search Box */}
						<div className="flex-1">
							<div className="relative group">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<Search className="w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
								</div>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									onKeyPress={handleKeyPress}
									placeholder="Tìm kiếm sản phẩm trong danh mục..."
									className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-gray-700 placeholder-gray-400"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => {
											setSearchQuery(""); // Xóa chữ trong input
											setSearchTerm(""); //  Reset API param
											setCurrentPage(1); // Reset về trang 1
										}}
										className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 text-2xl">
										×
									</button>
								)}
							</div>
						</div>

						{/* Divider */}
						<div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

						{/* Sort Dropdown */}
						<div className="lg:w-80">
							<div className="relative group">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<SlidersHorizontal className="w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
								</div>
								<select
									value={sortOption}
									onChange={handleSortChange}
									className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-gray-700 appearance-none cursor-pointer">
									{CONSTANTS.sortOptions.map((opt) => (
										<option
											key={opt.value}
											value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
								<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
									<ArrowUpDown className="w-4 h-4 text-gray-400" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Hiển thị sản phẩm */}
			{loading ? (
				<LoadingSpinner />
			) : (
				<>
					{products.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
							{products.map((product) => (
								<ProductCard
									key={product._id}
									product={product}
								/>
							))}
						</div>
					) : (
						<p className="col-span-full text-center text-gray-500 py-10">
							Không tìm thấy sản phẩm nào phù hợp.
						</p>
					)}

					{/* Phân trang */}
					{pagination && (
						<Pagination
							currentPage={pagination.page}
							totalPages={pagination.totalPages}
							onPageChange={handlePageChange}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default CategoryPage;
