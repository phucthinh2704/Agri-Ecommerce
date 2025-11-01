import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import formatUnit from "../utils/formatUnit";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cart/cartSlice";
import { toast } from "react-toastify";
import useAlert from "../hooks/useAlert";

const ProductCard = ({ product, index }) => {
	const imageUrl = product.images[0];

	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const { showConfirm } = useAlert();

	const handleAddToCart = async () => {
		if (!user) {
			const result = await showConfirm(
				"Bạn cần đăng nhập để vào hệ thống để thực hiện hành động này!"
			);
			if (result.isConfirmed) {
				setTimeout(() => {
					navigate("/login");
				}, 200)
			}
			// toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng.");
			return;
		}
		if (product.stock === 0) return; // Should be disabled anyway

		try {
			// Dispatch the async thunk
			await dispatch(
				addToCart({ productId: product._id, quantity: 1 })
			).unwrap(); // Use unwrap to catch potential rejections
			toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
		} catch (error) {
			// Error handling is inside the slice, but you can add more here
			toast.error(error || "Thêm vào giỏ hàng thất bại.");
			console.error("Add to cart failed:", error);
		}
	};

	return (
		<div
			style={{ animationDelay: `${index * 100}ms` }}
			className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-fadeIn border border-gray-100">
			{/* Image Container */}
			<div className="relative overflow-hidden bg-gray-100 aspect-square">
				{/* Gradient Overlay khi Hover */}
				<Link to={`/product/${product.slug}`}>
					<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
				</Link>
				{/* Ảnh sản phẩm (có link) */}
				<img
					src={imageUrl}
					alt={product.name}
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>

				{/* Tag Tình trạng kho */}
				{product.stock < 10 && product.stock > 0 && (
					<span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-20">
						Sắp hết
					</span>
				)}
				{product.stock === 0 && (
					<span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-20">
						Hết hàng
					</span>
				)}

				{/* Nút Yêu thích (hiện khi hover) */}
				<button
					className={`absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg transition-all duration-300 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-red-500 hover:text-white text-red-500 z-20`}>
					<Heart
						className="w-5 h-5"
						fill="currentColor"
					/>
				</button>
			</div>

			{/* Content */}
			<div className="p-4 flex flex-col h-[180px]">
				<Link
					to={`/product/${product.slug}`}
					className="flex-shrink-0">
					<h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
						{product.name}
					</h3>
				</Link>

				{/* Rating & Đã bán */}
				<div className="flex items-center gap-1 mb-2 text-sm text-gray-500 flex-shrink-0">
					<Star className="w-4 h-4 text-yellow-400 fill-current" />
					<span className="text-sm font-medium text-gray-700">
						{product.rating?.toFixed(1) || 4.5}
					</span>
					<span className="mx-1">•</span>
					<span>Đã bán {product.sold || 0}</span>
				</div>

				{/* Giá */}
				<div className="flex-grow flex flex-col justify-end">
					<div className="flex items-baseline justify-between mb-3">
						<div className="flex flex-col">
							<span className="text-2xl font-bold text-green-600">
								{product.price.toLocaleString("vi-VN")}đ
								<span className="text-gray-600 font-medium text-base">
									{" "}
									/ {formatUnit(product.unit)}
								</span>
							</span>
						</div>
					</div>

					{/* Nút Add to Cart */}
					<button
						onClick={handleAddToCart}
						className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 cursor-pointer"
						disabled={product.stock === 0}>
						<ShoppingCart className="w-4 h-4" />
						<span>
							{product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
