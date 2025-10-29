import { useEffect } from "react";
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
import { Leaf, Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import { toast } from "react-toastify";
import useAlert from "../hooks/useAlert"; // Import hook alert
import path from "../utils/path";

// Component Loading
const LoadingSpinner = () => (
	<div className="min-h-[50vh] flex items-center justify-center col-span-full">
		<div className="text-center">
			<Leaf className="w-16 h-16 text-green-600 animate-bounce" />
			<p className="mt-4 text-gray-500">Đang tải giỏ hàng...</p>
		</div>
	</div>
);

// Component Item trong giỏ hàng
const CartItemRow = ({ item, onUpdate, onRemove }) => {
	const product = item.product_id; // Dữ liệu product đã được populate

	const handleQuantityChange = (newQuantity) => {
		if (newQuantity >= 1) {
			onUpdate(product._id, newQuantity);
		} else if (newQuantity === 0) {
			onRemove(product._id); // Xóa nếu số lượng là 0
		}
	};

	return (
		<div className="flex items-center gap-4 py-4 border-b border-gray-200 last:border-b-0 flex-wrap">
			{/* Image & Name */}
			<div className="flex items-center gap-4 w-full sm:w-1/2 lg:w-2/5">
				<Link to={`/product/${product.slug}`}>
					<img
						src={product.images[0]}
						alt={product.name}
						className="w-20 h-20 object-cover rounded-lg border"
					/>
				</Link>
				<div>
					<Link to={`/product/${product.slug}`}>
						<h3 className="font-semibold text-gray-800 hover:text-green-600">
							{product.name}
						</h3>
					</Link>
					<button
						onClick={() => onRemove(product._id)}
						className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1">
						<Trash2 className="w-3 h-3" /> Xóa
					</button>
				</div>
			</div>

			{/* Price */}
			<div className="w-1/3 sm:w-auto lg:w-1/5 text-left sm:text-center">
				<span className="text-gray-600 font-medium">
					{item.price.toLocaleString("vi-VN")}đ
				</span>
			</div>

			{/* Quantity */}
			<div className="w-1/3 sm:w-auto lg:w-1/5 flex justify-center">
				<div className="flex items-center border border-gray-300 rounded-md">
					<button
						onClick={() => handleQuantityChange(item.quantity - 1)}
						className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md disabled:opacity-50"
						disabled={item.quantity === 1}>
						<Minus className="w-4 h-4" />
					</button>
					<span className="px-3 py-1 font-medium w-12 text-center">
						{item.quantity}
					</span>
					<button
						onClick={() => handleQuantityChange(item.quantity + 1)}
						className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md">
						<Plus className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Total */}
			<div className="w-1/3 sm:w-auto lg:w-1/5 text-right sm:text-center font-semibold text-green-700">
				{(item.price * item.quantity).toLocaleString("vi-VN")}đ
			</div>
		</div>
	);
};

// Trang Giỏ Hàng
const CartPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const items = useSelector(selectCartItems);
	const subtotal = useSelector(selectCartSubtotal);
	const isLoading = useSelector(selectCartLoading);
	const error = useSelector(selectCartError);
	const { showConfirm } = useAlert();

	// Fetch giỏ hàng khi component mount (đảm bảo luôn mới)
	useEffect(() => {
		dispatch(fetchCart());
	}, [dispatch]);

	const handleUpdateQuantity = async (productId, quantity) => {
		try {
			await dispatch(updateCartItem({ productId, quantity })).unwrap();
			// toast.success("Cập nhật số lượng thành công!"); // fetchCart đã handle cập nhật
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
		showConfirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?").then(async (result) => {
			if (result.isConfirmed) {
				try {
					await dispatch(clearCart()).unwrap();
					toast.success("Đã xóa toàn bộ giỏ hàng.");
				} catch (err) {
					toast.error(err || "Lỗi xóa giỏ hàng.");
				}
			}
		});
	};

	const handleCheckout = () => {
		// Điều hướng đến trang thanh toán
		navigate("/checkout"); // Hoặc path.CHECKOUT nếu đã định nghĩa
	};

	if (isLoading && items.length === 0) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <div className="text-center py-20 text-red-500">{error}</div>;
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
			<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
				<ShoppingBag className="w-8 h-8 text-green-600" /> Giỏ hàng của bạn
			</h1>

			{items.length === 0 ? (
				<div className="text-center py-16 bg-white rounded-2xl shadow-lg border">
					<Leaf className="w-20 h-20 text-gray-300 mx-auto mb-6" />
					<p className="text-gray-500 text-lg mb-6">
						Giỏ hàng của bạn đang trống.
					</p>
					<Link
						to={path.PRODUCTS}
						className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
						Tiếp tục mua sắm
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Danh sách sản phẩm */}
					<div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border p-6">
						{/* Header Table (optional, for desktop) */}
						<div className="hidden sm:flex text-xs font-semibold text-gray-500 uppercase border-b pb-3 mb-3">
							<div className="w-full sm:w-1/2 lg:w-2/5">Sản phẩm</div>
							<div className="w-1/3 sm:w-auto lg:w-1/5 text-center">Đơn giá</div>
							<div className="w-1/3 sm:w-auto lg:w-1/5 text-center">Số lượng</div>
							<div className="w-1/3 sm:w-auto lg:w-1/5 text-center">Thành tiền</div>
						</div>
						{/* Items */}
						{items.map((item) => (
							<CartItemRow
								key={item.product_id._id} // Sử dụng _id của product
								item={item}
								onUpdate={handleUpdateQuantity}
								onRemove={handleRemoveItem}
							/>
						))}
					</div>

					{/* Tổng kết đơn hàng */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-2xl shadow-lg border p-6 sticky top-24">
							<h2 className="text-xl font-semibold mb-5 border-b pb-3">
								Tổng kết đơn hàng
							</h2>
							<div className="flex justify-between items-center mb-6">
								<span className="text-gray-600">Tổng tiền hàng:</span>
								<span className="text-xl font-bold text-green-700">
									{subtotal.toLocaleString("vi-VN")}đ
								</span>
							</div>
							<button
								onClick={handleCheckout}
								className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors mb-3">
								Tiến hành thanh toán
							</button>
							<button
								onClick={handleClearCart}
								className="w-full text-center text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors">
								Xóa giỏ hàng
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CartPage;