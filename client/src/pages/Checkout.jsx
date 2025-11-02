import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import {
	AlertCircle,
	Check,
	CreditCard,
	Leaf,
	MapPin,
	Package,
	Phone,
	Truck,
	User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiCreateOrder } from "../api/order";
import useAlert from "../hooks/useAlert";
import {
	clearCartState,
	selectCartItems,
	selectCartSubtotal,
} from "../store/cart/cartSlice";

// Loading Spinner cho PayPal
const PayPalSpinner = () => {
	return (
		<div className="flex justify-center items-center p-4">
			<Leaf className="w-8 h-8 text-green-600 animate-spin" />
		</div>
	);
};

const CheckoutPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const cartItems = useSelector(selectCartItems);
	const subtotal = useSelector(selectCartSubtotal);
	const { user } = useSelector((state) => state.auth);
	const [paypalError, setPaypalError] = useState(null);

	// State cho form thông tin giao hàng
	const [name, setName] = useState(user?.name || "");
	const [phone, setPhone] = useState(user?.phone || "");
	const [address, setAddress] = useState(user?.address || "");
	const [paymentMethod, setPaymentMethod] = useState("paypal");

	// State của PayPal
	const [{ isPending }] = usePayPalScriptReducer();
	const { showSuccess } = useAlert();

	// Tính phí vận chuyển
	const FREE_SHIP_THRESHOLD =
		+import.meta.env.VITE_FREE_SHIP_THRESHOLD || 300000;
	const SHIPPING_FEE = +import.meta.env.VITE_SHIPPING_FEE || 30000;
	const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
	const totalAmount = subtotal + shippingFee;

	// Redirect nếu giỏ hàng trống
	useEffect(() => {
		if (cartItems.length === 0) {
			navigate("/my-cart");
		}
	}, [cartItems, navigate]);

	// Validate form
	const isFormValid = name.trim() && phone.trim() && address.trim();

	// Hàm này được gọi khi PayPal cần tạo đơn hàng
	const createOrder = useCallback(
		(data, actions) => {
			if (!isFormValid) {
				toast.error("Vui lòng điền đầy đủ thông tin nhận hàng.");
				return;
			}
			const subtotalInUSD = (totalAmount / 25000).toFixed(2);
			if (subtotalInUSD < 0.01) {
				setPaypalError("Tổng tiền quá nhỏ để thanh toán.");
				return;
			}
			setPaypalError(null);
			return actions.order.create({
				purchase_units: [
					{
						description: "Thanh toán đơn hàng FarmFresh",
						amount: {
							currency_code: "USD",
							value: subtotalInUSD,
						},
					},
				],
			});
		},
		[totalAmount, isFormValid]
	);

	// Hàm này được gọi khi thanh toán thành công
	const onApprove = useCallback(
		(data, actions) => {
			return actions.order.capture().then(async (details) => {
				const orderData = {
					shipping_address: address,
					recipientInfo: { name: name, mobile: phone },
					payment_method: "banking",
				};

				try {
					const res = await apiCreateOrder(orderData);
					if (res.success) {
						showSuccess("Thanh toán thành công.");
						dispatch(clearCartState());
						// navigate("/orders");
					} else {
						toast.error(
							`Lỗi tạo đơn hàng: ${res.message}. Vui lòng liên hệ CSKH.`
						);
						console.error(
							"PAYMENT SUCCESSFUL BUT ORDER FAILED:",
							details,
							orderData,
							res.message
						);
					}
				} catch (err) {
					toast.error("Lỗi hệ thống. Vui lòng liên hệ CSKH.");
					console.error("FATAL ERROR ONAPPROVE:", err);
				}
			});
		},
		[name, phone, address, showSuccess, dispatch]
	);

	// Hàm này được gọi khi có lỗi thanh toán
	const onError = useCallback((err) => {
		console.error("Lỗi PayPal Checkout:", err);
		setPaypalError("Đã xảy ra lỗi. Vui lòng thử lại.");
		toast.error("Thanh toán thất bại.");
	}, []);

	const handlePhoneChange = (e) => {
		const value = e.target.value;

		// Regex: /^[0-9]*$/
		// ^     : Bắt đầu chuỗi
		// [0-9]*: Cho phép bất kỳ ký tự nào từ 0 đến 9, lặp lại 0 hoặc nhiều lần
		// $     : Kết thúc chuỗi

		// Nếu giá trị là rỗng HOẶC chỉ chứa số, thì cập nhật state
		if (value === "" || /^[0-9]*$/.test(value)) {
			setPhone(value);
		}
		// Nếu giá trị chứa chữ (hoặc ký tự đặc biệt), hàm sẽ không làm gì cả
		// (ngăn không cho ký tự đó xuất hiện trong ô input)
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Form & Payment */}
					<div className="lg:col-span-2 space-y-6">
						{/* Shipping Information */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
								<h2 className="text-xl font-semibold text-white flex items-center gap-2">
									<MapPin className="w-6 h-6" />
									Thông tin nhận hàng
								</h2>
							</div>
							<div className="p-6 space-y-5">
								<div className="group">
									<label className="text-sm font-semibold text-gray-700 mb-2 block">
										Tên người nhận{" "}
										<span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-green-600 transition-colors" />
										<input
											type="text"
											value={name}
											onChange={(e) =>
												setName(e.target.value)
											}
											className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
											placeholder="Nguyễn Văn A"
										/>
									</div>
								</div>
								<div className="group">
									<label className="text-sm font-semibold text-gray-700 mb-2 block">
										Số điện thoại{" "}
										<span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-green-600 transition-colors" />
										<input
											type="tel"
											value={phone}
											onChange={handlePhoneChange}
											className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
											placeholder="0987654321"
										/>
									</div>
								</div>
								<div className="group">
									<label className="text-sm font-semibold text-gray-700 mb-2 block">
										Địa chỉ nhận hàng{" "}
										<span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<Truck className="w-5 h-5 text-gray-400 absolute left-3 top-4 group-focus-within:text-green-600 transition-colors" />
										<textarea
											value={address}
											onChange={(e) =>
												setAddress(e.target.value)
											}
											className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
											placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
											rows="3"
										/>
									</div>
								</div>
								{!isFormValid && (
									<div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
										<AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
										<p className="text-sm text-amber-800">
											Vui lòng điền đầy đủ thông tin để
											tiếp tục
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Payment Method */}
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
								<h2 className="text-xl font-semibold text-white flex items-center gap-2">
									<CreditCard className="w-6 h-6" />
									Phương thức thanh toán
								</h2>
							</div>
							<div className="p-6 space-y-4">
								{/* COD Option */}
								<div className="relative p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all cursor-not-allowed opacity-60">
									<label className="flex items-start cursor-not-allowed">
										<input
											type="radio"
											name="payment"
											className="mt-1 h-4 w-4"
											disabled
										/>
										<div className="ml-3 flex-1">
											<div className="flex items-center justify-between">
												<span className="font-semibold text-gray-500">
													Thanh toán khi nhận hàng
													(COD)
												</span>
												<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
													Sắp ra mắt
												</span>
											</div>
											<p className="text-sm text-gray-400 mt-1">
												Thanh toán bằng tiền mặt khi
												nhận hàng
											</p>
										</div>
									</label>
								</div>

								{/* PayPal Option */}
								<div
									className={`relative p-4 border-2 rounded-xl transition-all ${
										paymentMethod === "paypal"
											? "border-green-500 bg-green-50"
											: "border-gray-200 hover:border-green-300"
									}`}>
									<label className="flex items-start cursor-pointer">
										<input
											type="radio"
											name="payment"
											className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
											checked={paymentMethod === "paypal"}
											onChange={() =>
												setPaymentMethod("paypal")
											}
										/>
										<div className="ml-3 flex-1">
											<div className="flex items-center justify-between">
												<span className="font-semibold text-gray-800">
													Thanh toán qua PayPal
												</span>
												<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
													Bảo mật cao
												</span>
											</div>
											<p className="text-sm text-gray-600 mt-1">
												Thanh toán nhanh chóng và an
												toàn qua PayPal
											</p>
										</div>
									</label>

									{paymentMethod === "paypal" && (
										<div className="mt-4 pt-4 border-t border-green-200">
											{!isFormValid && (
												<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
													<p className="text-sm text-amber-800 text-center">
														Vui lòng điền đầy đủ
														thông tin giao hàng
														trước khi thanh toán
													</p>
												</div>
											)}
											<div
												className={
													isFormValid
														? "block"
														: "hidden"
												}>
												{isPending && <PayPalSpinner />}
												<div
													style={{
														display: isPending
															? "none"
															: "block",
													}}>
													<PayPalButtons
														style={{
															layout: "vertical",
															shape: "pill",
															label: "pay",
														}}
														createOrder={
															createOrder
														}
														onApprove={onApprove}
														onError={onError}
														forceReRender={[
															totalAmount,
														]}
													/>
												</div>
												{paypalError && (
													<div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
														<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
														<p className="text-sm text-red-800">
															{paypalError}
														</p>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Order Summary */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
							<div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
								<h2 className="text-xl font-semibold text-white flex items-center gap-2">
									<Package className="w-6 h-6" />
									Đơn hàng của bạn
								</h2>
							</div>
							<div className="p-6">
								{/* Order Items */}
								<div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
									{cartItems.map((item) => (
										<div
											key={item.product_id._id}
											className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
											<img
												src={item.product_id.images[0]}
												alt={item.product_id.name}
												className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
											/>
											<div className="flex-1 min-w-0">
												<p className="font-semibold text-gray-800 line-clamp-2">
													{item.product_id.name}
												</p>
												<div className="flex items-center justify-between mt-1">
													<span className="text-sm font-medium  text-gray-600 bg-white px-1 py-1 rounded">
														SL: {item.quantity}
													</span>
													<span className="text-sm font-bold text-green-600">
														{(
															item.price *
															item.quantity
														).toLocaleString(
															"vi-VN"
														)}
														đ
													</span>
												</div>
											</div>
										</div>
									))}
								</div>

								{/* Price Summary */}
								<div className="border-t border-gray-200 pt-4 space-y-3">
									<div className="flex justify-between text-gray-600">
										<span className="text-sm">
											Tạm tính:
										</span>
										<span className="font-semibold">
											{subtotal.toLocaleString("vi-VN")}đ
										</span>
									</div>
									<div className="flex justify-between text-gray-600">
										<span className="text-sm">
											Phí vận chuyển:
										</span>
										<span className="font-semibold">
											{shippingFee === 0 ? (
												<span className="text-green-600">
													Miễn phí
												</span>
											) : (
												`${shippingFee.toLocaleString(
													"vi-VN"
												)}đ`
											)}
										</span>
									</div>
									{subtotal < FREE_SHIP_THRESHOLD && (
										<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
											<p className="text-xs text-amber-800">
												Mua thêm{" "}
												{(
													FREE_SHIP_THRESHOLD -
													subtotal
												).toLocaleString("vi-VN")}
												đ để được miễn phí vận chuyển
											</p>
										</div>
									)}
									<div className="flex justify-between items-center pt-3 border-t border-gray-200">
										<span className="text-base font-bold text-gray-900">
											Tổng cộng:
										</span>
										<span className="text-2xl font-bold text-green-600">
											{totalAmount.toLocaleString(
												"vi-VN"
											)}
											đ
										</span>
									</div>
								</div>

								{/* Trust Badges */}
								<div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
									<div className="flex items-center gap-2 text-xs text-gray-600">
										<Check className="w-4 h-4 text-green-600" />
										<span>
											Bảo mật thông tin thanh toán
										</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-gray-600">
										<Check className="w-4 h-4 text-green-600" />
										<span>Giao hàng nhanh chóng</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-gray-600">
										<Check className="w-4 h-4 text-green-600" />
										<span>Hỗ trợ 24/7</span>
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

export default CheckoutPage;
