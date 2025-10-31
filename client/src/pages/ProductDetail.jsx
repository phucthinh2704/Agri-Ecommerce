import {
	ArrowLeft,
	Check,
	Heart,
	Leaf,
	Minus,
	Plus,
	Share2,
	ShieldCheck,
	ShoppingCart,
	Star,
	Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiGetProductBySlug } from "../api/product";
import { AutoFormatRenderer } from "../components";
import { addToCart } from "../store/cart/cartSlice";
import formatUnit from "../utils/formatUnit";

// Component Loading với animation đẹp hơn
const LoadingSpinner = () => (
	<div className="min-h-[60vh] flex items-center justify-center">
		<div className="relative">
			<Leaf className="w-16 h-16 text-green-600 animate-spin" />
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-12 h-12 bg-green-100 rounded-full animate-ping"></div>
			</div>
		</div>
	</div>
);

const ProductDetailPage = () => {
	const { slug } = useParams();
	const [product, setProduct] = useState({});

	const [loading, setLoading] = useState(true);
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.auth);

	useEffect(() => {
		const fetchProduct = async () => {
			if (!slug) return;
			setLoading(true);
			try {
				const res = await apiGetProductBySlug(slug);
				if (res.success) {
					setProduct(res.data);
					setSelectedImage(0);
					setQuantity(1);
				} else {
					console.error(res.message || "Không tìm thấy sản phẩm.");
				}
			} catch (err) {
				console.error("Error fetching product details:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [slug]);

	const formatCategoryName = (category) => {
		switch (category) {
			case "vegetables":
				return "Rau củ";
			case "tubers":
				return "Củ, khoai, sắn";
			case "fruits":
				return "Trái cây";
			case "herbs":
				return "Rau thơm & thảo mộc";
			case "mushrooms":
				return "Nấm các loại";
			case "grains":
				return "Ngũ cốc & hạt";
			case "eggs":
				return "Trứng";
		}
	};

	const handleQuantityChange = (amount) => {
		setQuantity((prev) => {
			const newQuantity = prev + amount;
			if (newQuantity < 1) return 1;
			if (newQuantity > product.stock) return product.stock;
			return newQuantity;
		});
	};

	const handleAddToCart = async () => {
		// Kiểm tra đăng nhập
		if (!user) {
			toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng.");
			navigate("/login", { state: { from: `/product/${slug}` } });
			return;
		}

		if (product.stock === 0) return;

		try {
			// Gọi async thunk với productId VÀ quantity
			await dispatch(
				addToCart({ productId: product._id, quantity: quantity })
			).unwrap(); // .unwrap() để bắt lỗi từ rejectWithValue

			// Hiển thị thông báo thành công
			toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
		} catch (error) {
			toast.error(error || "Thêm vào giỏ hàng thất bại.");
			console.error("Add to cart failed:", error);
		}
	};
	const handleBack = () => {
		window.history.back();
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	const mainImageUrl =
		product.images?.[selectedImage] ||
		"https://res.cloudinary.com/ddfi4fdao/image/upload/v1717904573/no-image_h316pe.png";
	const rating = 4.5;
	const reviewCount = 127;

	if (!product) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
				<Leaf className="w-24 h-24 text-gray-300 mb-4" />
				<h2 className="text-2xl font-bold text-gray-700 mb-2">
					Không tìm thấy sản phẩm
				</h2>
				<p className="text-gray-500 mb-6">
					Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn
					tại.
				</p>
				<Link
					to="/"
					className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
					Quay về Trang chủ
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
			<div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
				{/* Breadcrumb */}
				<button
					className="flex items-center text-gray-600 hover:text-green-600 mb-6 transition-colors"
					onClick={handleBack}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					<span>Quay lại</span>
				</button>

				{/* Breadcrumb */}
				<nav className="flex items-center space-x-2 text-sm mb-6">
					<Link
						to="/"
						className="text-gray-600 hover:text-green-600 transition-colors">
						Trang chủ
					</Link>
					<span className="text-gray-400">/</span>
					<Link
						to={`/category/${product.category}`}
						className="text-gray-600 hover:text-green-600 transition-colors">
						{formatCategoryName(product.category)}
					</Link>
					<span className="text-gray-400">/</span>
					<span className="text-gray-900 font-medium">
						{product.name}
					</span>
				</nav>
				<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
					{/* === COLUMN LEFT: IMAGES === */}
					<div className="space-y-4">
						{/* Main Image with enhanced styling */}
						<div className="relative group">
							<div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-xl">
								<img
									src={mainImageUrl}
									alt={product.name}
									className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
								/>
							</div>

							{/* Image overlay badges */}
							<div className="absolute top-4 left-4 flex flex-col space-y-2">
								<span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
									100% Organic
								</span>
								{product.sold > 100 && (
									<span className="bg-orange-500 text-white text-center text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
										Bán chạy
									</span>
								)}
							</div>

							{/* Action buttons */}
							<div className="absolute top-4 right-4 flex flex-col space-y-2">
								<button
									onClick={() => setIsLiked(!isLiked)}
									className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all ${
										isLiked
											? "bg-red-500 text-white"
											: "bg-white/90 text-gray-700 hover:bg-red-50"
									}`}>
									<Heart
										className={`w-5 h-5 ${
											isLiked ? "fill-current" : ""
										}`}
									/>
								</button>
								<button className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition-all">
									<Share2 className="w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Thumbnail gallery */}
						{product.images && product.images.length > 1 && (
							<div className="flex justify-around space-x-3 overflow-x-auto p-2">
								{product.images.map((img, index) => (
									<button
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`flex-shrink-0 w-26 h-26 rounded-xl overflow-hidden border-3 transition-all ${
											index === selectedImage
												? "border-green-600 shadow-lg scale-105"
												: "border-gray-200 hover:border-green-300 opacity-60 hover:opacity-100"
										}`}>
										<img
											src={img}
											alt={`${product.name} ${index + 1}`}
											className="w-full h-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* === COLUMN RIGHT: INFO & PURCHASE === */}
					<div className="space-y-6">
						{/* Product name */}
						<div>
							<h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
								{product.name}
							</h1>
							<p className="text-green-700 font-medium text-lg">
								{formatCategoryName(product.category)}
							</p>
						</div>

						{/* Rating */}
						<div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
							<div className="flex items-center space-x-1">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`w-5 h-5 ${
											i < Math.floor(rating)
												? "text-yellow-400 fill-current"
												: "text-gray-300"
										}`}
									/>
								))}
							</div>
							<span className="text-gray-600 font-medium">
								{rating}
							</span>
							<span className="text-gray-400">
								({reviewCount} đánh giá)
							</span>
							<span className="text-gray-400">•</span>
							<span className="text-gray-600 font-medium">
								{product.sold} đã bán
							</span>
						</div>

						{/* Price */}
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
							<div className="flex items-baseline space-x-3 mb-2">
								<span className="text-5xl font-bold text-green-600">
									{product.price.toLocaleString("vi-VN")}đ
								</span>
								<span className="text-xl text-gray-600 font-medium">
									/ {formatUnit(product.unit)}
								</span>
							</div>
							{product.stock > 0 ? (
								<div className="flex items-center space-x-2">
									<Check className="w-5 h-5 text-green-600" />
									<span className="text-green-700 font-medium">
										Còn hàng ({product.stock}{" "}
										{formatUnit(product.unit)})
									</span>
								</div>
							) : (
								<span className="text-red-600 font-medium">
									Hết hàng
								</span>
							)}
						</div>

						{/* Quantity selector & Add to cart */}
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<span className="text-gray-700 font-semibold">
									Số lượng:
								</span>
								<div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
									<button
										onClick={() => handleQuantityChange(-1)}
										className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										disabled={quantity === 1}>
										<Minus className="w-5 h-5 text-gray-600" />
									</button>
									<span className="px-8 py-3 font-bold text-xl min-w-[80px] text-center">
										{quantity}
									</span>
									<button
										onClick={() => handleQuantityChange(1)}
										className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										disabled={quantity === product.stock}>
										<Plus className="w-5 h-5 text-gray-600" />
									</button>
								</div>
							</div>

							<button
								onClick={handleAddToCart}
								disabled={product.stock === 0}
								className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none">
								<ShoppingCart className="w-6 h-6" />
								<span>Thêm vào giỏ hàng</span>
							</button>
						</div>

						{/* Trust badges */}
						<div className="grid grid-cols-3 gap-4 pt-4">
							<div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
								<Truck className="w-8 h-8 text-green-600 mb-2" />
								<span className="text-xs font-medium text-gray-700">
									Giao hàng nhanh
								</span>
							</div>
							<div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
								<ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
								<span className="text-xs font-medium text-gray-700">
									Đảm bảo chất lượng
								</span>
							</div>
							<div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
								<Leaf className="w-8 h-8 text-green-600 mb-2" />
								<span className="text-xs font-medium text-gray-700">
									100% Organic
								</span>
							</div>
						</div>

						{/* Description */}
						<div className="bg-white p-6 rounded-2xl shadow-sm">
							<h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
								<div className="w-1 h-6 bg-green-600 mr-3 rounded-full"></div>
								Mô tả sản phẩm
							</h3>
							<AutoFormatRenderer content={product.description} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetailPage;
