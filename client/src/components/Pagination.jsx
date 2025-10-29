import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	// 1. Thêm logic tạo mảng số trang từ component mẫu
	const getPageNumbers = () => {
		const pages = [];
		const showEllipsis = totalPages > 7;

		if (!showEllipsis) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) pages.push(i);
				pages.push("...");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push("...");
				for (let i = totalPages - 3; i <= totalPages; i++)
					pages.push(i);
			} else {
				pages.push(1);
				pages.push("...");
				for (let i = currentPage - 1; i <= currentPage + 1; i++)
					pages.push(i);
				pages.push("...");
				pages.push(totalPages);
			}
		}
		return pages;
	};

	// 2. Giữ lại điều kiện return null
	if (totalPages <= 1) return null;

	// 3. Sử dụng JSX và styling từ component mẫu, thay thế SVG bằng icon
	return (
		<div className="flex justify-center items-center gap-2 mt-12">
			{/* Nút Previous */}
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="p-2 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
				<ChevronLeft className="w-5 h-5" />
			</button>

			{/* Các nút số trang */}
			{getPageNumbers().map((page, index) =>
				page === "..." ? (
					<span
						key={`ellipsis-${index}`}
						className="px-3 py-2 text-gray-400">
						...
					</span>
				) : (
					<button
						key={page}
						onClick={() => onPageChange(page)}
						className={`min-w-[40px] px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
							currentPage === page
								? "bg-green-600 text-white shadow-lg scale-110"
								: "border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-700"
						}`}>
						{page}
					</button>
				)
			)}

			{/* Nút Next */}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="p-2 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
				<ChevronRight className="w-5 h-5" />
			</button>
		</div>
	);
};

export default Pagination;