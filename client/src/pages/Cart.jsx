import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
	fetchCart,
	updateCartItem,
	removeCartItem,
	clearCart,
	selectCartItems,
	selectCartSubtotal,
	selectCartLoading,
	selectCartError,
} from "../store/cart/cartSlice";
import {
	Leaf,
	Minus,
	Plus,
	Trash2,
	ShoppingBag,
	ArrowRight,
	Package,
	Sparkles,
	ShoppingCart,
} from "lucide-react";
import { toast } from "react-toastify";
import useAlert from "../hooks/useAlert";
import path from "../utils/path";

// Loading Component với animation đẹp hơn
const LoadingSpinner = () => (
	<div className="min-h-[60vh] flex items-center justify-center">
		<div className="text-center">
			<div className="relative">
				<Leaf className="w-20 h-20 text-green-600 animate-bounce mx-auto" />
				<div className="absolute inset-0 w-20 h-20 mx-auto">
					<Sparkles className="w-8 h-8 text-green-400 absolute top-0 right-0 animate-pulse" />
				</div>
			</div>
			<p className="mt-6 text-lg text-gray-600 font-medium">
				Đang tải giỏ hàng của bạn...
			</p>
		</div>
	</div>
);

// Cart Item Component với thiết kế card hiện đại
const CartItemCard = ({ item, onUpdate, onRemove }) => {
	const product = item.product_id;
	const [isUpdating, setIsUpdating] = useState(false);

	const handleQuantityChange = async (newQuantity) => {
		if (newQuantity >= 1 && newQuantity !== item.quantity) {
			setIsUpdating(true);
			await onUpdate(product._id, newQuantity);
			setIsUpdating(false);
		}
	};

	const handleRemove = () => {
		onRemove(product._id);
	};

	return (
		<div className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
			{/* Badge nếu có */}
			{product.stock < 10 && product.stock > 0 && (
				<div className="absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
					Chỉ còn {product.stock}
				</div>
			)}

			<div className="flex gap-5 items-start">
				{/* Product Image */}
				<Link
					to={`/product/${product.slug}`}
					className="relative flex-shrink-0 group/img">
					<div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 group-hover/img:border-green-400 transition-colors">
						<img
							src={product.images[0]}
							alt={product.name}
							className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
						/>
					</div>
				</Link>

				{/* Product Info */}
				<div className="flex-1 min-w-0">
					<Link to={`/product/${product.slug}`}>
						<h3 className="font-semibold text-gray-900 text-lg mb-2 hover:text-green-600 transition-colors line-clamp-2">
							{product.name}
						</h3>
					</Link>

					<div className="flex items-center gap-2 mb-3">
						<span className="text-2xl font-bold text-green-600">
							{item.price.toLocaleString("vi-VN")}đ
						</span>
						<span className="text-sm text-gray-500">/{product.unit}</span>
					</div>

					{/* Quantity Controls & Remove */}
					<div className="flex items-center justify-between gap-4 flex-wrap">
						{/* Quantity Selector */}
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600 font-medium">
								Số lượng:
							</span>
							<div
								className={`flex items-center border-2 border-gray-200 rounded-lg overflow-hidden transition-all ${
									isUpdating ? "opacity-50" : ""
								}`}>
								<button
									onClick={() => handleQuantityChange(item.quantity - 1)}
									className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
									disabled={item.quantity === 1 || isUpdating}>
									<Minus className="w-4 h-4 text-gray-600" />
								</button>
								<span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center bg-gray-50">
									{item.quantity}
								</span>
								<button
									onClick={() => handleQuantityChange(item.quantity + 1)}
									className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-30"
									disabled={isUpdating}>
									<Plus className="w-4 h-4 text-gray-600" />
								</button>
							</div>
						</div>

						{/* Subtotal */}
						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-600">Thành tiền:</span>
							<span className="text-xl font-bold text-gray-900">
								{(item.price * item.quantity).toLocaleString("vi-VN")}đ
							</span>
						</div>
					</div>

					{/* Remove Button */}
					<button
						onClick={handleRemove}
						className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 group/delete transition-colors">
						<Trash2 className="w-4 h-4 group-hover/delete:animate-pulse" />
						Xóa khỏi giỏ hàng
					</button>
				</div>
			</div>
		</div>
	);
};

// Empty Cart Component
const EmptyCart = () => (
	<div className="min-h-[60vh] flex items-center justify-center">
		<div className="text-center max-w-md mx-auto px-4">
			<div className="relative mb-8">
				<div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center">
					<ShoppingCart className="w-16 h-16 text-green-600" />
				</div>
				<Sparkles className="w-8 h-8 text-green-400 absolute top-0 right-1/3 animate-pulse" />
			</div>
			<h2 className="text-2xl font-bold text-gray-900 mb-3">
				Giỏ hàng trống
			</h2>
			<p className="text-gray-600 mb-8">
				Hãy khám phá các sản phẩm tuyệt vời và thêm chúng vào giỏ hàng nhé!
			</p>
			<Link
				to={`/${path.PRODUCTS}`}
				className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
				<Package className="w-5 h-5" />
				Khám phá sản phẩm
				<ArrowRight className="w-5 h-5" />
			</Link>
		</div>
	</div>
);

// Main Cart Page
const CartPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const items = useSelector(selectCartItems);
	const subtotal = useSelector(selectCartSubtotal);
	const isLoading = useSelector(selectCartLoading);
	const error = useSelector(selectCartError);
	const { showConfirm } = useAlert();

	useEffect(() => {
		dispatch(fetchCart());
	}, [dispatch]);

	const handleUpdateQuantity = async (productId, quantity) => {
		try {
			await dispatch(updateCartItem({ productId, quantity })).unwrap();
		} catch (err) {
			toast.error(err || "Lỗi cập nhật số lượng.");
		}
	};

	const handleRemoveItem = (productId) => {
		showConfirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?").then(
			async (result) => {
				if (result.isConfirmed) {
					try {
						await dispatch(removeCartItem(productId)).unwrap();
						toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
					} catch (err) {
						toast.error(err || "Lỗi xóa sản phẩm.");
					}
				}
			}
		);
	};

	const handleClearCart = () => {
		showConfirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?").then(
			async (result) => {
				if (result.isConfirmed) {
					try {
						await dispatch(clearCart()).unwrap();
						toast.success("Đã xóa toàn bộ giỏ hàng.");
					} catch (err) {
						toast.error(err || "Lỗi xóa giỏ hàng.");
					}
				}
			}
		);
	};

	const handleCheckout = () => {
		navigate("/checkout");
	};

	if (isLoading && items.length === 0) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<div className="text-center py-20">
				<div className="text-red-500 text-lg">{error}</div>
			</div>
		);
	}

	if (items.length === 0) {
		return <EmptyCart />;
	}

	const FREE_SHIP_THRESHOLD = +import.meta.env.VITE_FREE_SHIP_THRESHOLD || 300000;
	const SHIPPING_FEE = +import.meta.env.VITE_SHIPPING_FEE || 30000;
	const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? "Miễn phí" : SHIPPING_FEE.toLocaleString("vi-VN") + "đ";

	const total = subtotal >= FREE_SHIP_THRESHOLD ? subtotal : subtotal + SHIPPING_FEE;

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			<div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
							<ShoppingBag className="w-7 h-7 text-white" />
						</div>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900">
							Giỏ hàng của bạn
						</h1>
					</div>
					<p className="text-gray-600 ml-16">
						Bạn có {items.length} sản phẩm trong giỏ hàng
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-4">
						{items.map((item) => (
							<CartItemCard
								key={item.product_id._id}
								item={item}
								onUpdate={handleUpdateQuantity}
								onRemove={handleRemoveItem}
							/>
						))}

						{/* Clear Cart Button (Mobile & Desktop) */}
						<button
							onClick={handleClearCart}
							className="w-full mt-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-medium border-2 border-red-200 hover:border-red-300">
							<Trash2 className="w-4 h-4 inline mr-2" />
							Xóa toàn bộ giỏ hàng
						</button>
					</div>

					{/* Order Summary - Sticky */}
					<div className="lg:col-span-1">
						<div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							{/* Header với gradient */}
							<div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
								<h2 className="text-xl font-bold flex items-center gap-2">
									<Package className="w-6 h-6" />
									Tổng đơn hàng
								</h2>
							</div>

							<div className="p-6 space-y-4">
								{/* Summary Details */}
								<div className="space-y-3 pb-4 border-b border-gray-200">
									<div className="flex justify-between text-gray-600">
										<span>Tạm tính ({items.length} sản phẩm):</span>
										<span className="font-semibold">
											{subtotal.toLocaleString("vi-VN")}đ
										</span>
									</div>
									<div className="flex justify-between text-gray-600">
										<span>Phí vận chuyển:</span>
										<span className="font-semibold text-green-600">
											{shippingFee}
										</span>
									</div>
								</div>

								{/* Total */}
								<div className="flex justify-between items-center py-4 bg-green-50 rounded-xl px-4">
									<span className="text-lg font-semibold text-gray-700">
										Tổng cộng:
									</span>
									<span className="text-2xl font-bold text-green-600">
										{total.toLocaleString("vi-VN")}đ
									</span>
								</div>

								{/* Checkout Button */}
								<button
									onClick={handleCheckout}
									className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
									Tiến hành thanh toán
									<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
								</button>

								{/* Continue Shopping */}
								<Link
									to={`/${path.PRODUCTS}`}
									className="block w-full text-center py-3 text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-xl transition-colors">
									← Tiếp tục mua sắm
								</Link>

								{/* Trust Badges */}
								<div className="pt-4 border-t border-gray-200">
									<div className="flex items-center justify-center gap-2 text-sm text-gray-600">
										<Leaf className="w-4 h-4 text-green-600" />
										<span>Thanh toán an toàn & bảo mật</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartPage;