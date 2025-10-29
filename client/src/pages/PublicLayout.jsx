import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiGetAllCategories } from "../api/category";
import { Footer, Header, ScrollToTop } from "../components";
import useAlert from "../hooks/useAlert";
import { logoutUser } from "../store/auth";
import {
	clearCartState,
	fetchCart,
	selectCartCount,
} from "../store/cart/cartSlice";

const PublicLayout = () => {
	const [categories, setCategories] = useState([]);
	// const [cartCount, setCartCount] = useState(12); // Tạm thời
	const cartCount = useSelector(selectCartCount);
	const { user } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { showConfirm } = useAlert();

	useEffect(() => {
		const loadLayoutData = async () => {
			const catRes = await apiGetAllCategories();
			if (catRes.success) {
				setCategories(catRes.data);
			}
			// TODO: Viết logic lấy cartCount thực tế ở đây
		};
		loadLayoutData();
	}, []);

	useEffect(() => {
		if (user) {
			dispatch(fetchCart());
		} else {
			// Optional: Clear cart state in Redux when user logs out
			dispatch(clearCartState());
		}
	}, [user, dispatch]);

	const handleLogout = () => {
		showConfirm("Bạn có chắc chắn muốn đăng xuất?").then((result) => {
			if (result.isConfirmed) {
				dispatch(logoutUser());
				toast.success("Đăng xuất thành công.");
				setTimeout(() => {
					navigate("/login");
				}, 300);
			}
		});
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header luôn hiển thị */}
			<Header
				cartCount={cartCount}
				user={user}
				onLogout={handleLogout}
				categories={categories}
			/>

			<ScrollToTop />

			{/* Đây là nơi nội dung các trang con (Home, ProductDetail,...) được render */}
			<main>
				<Outlet />
			</main>

			{/* Footer luôn hiển thị */}
			<Footer />
		</div>
	);
};

export default PublicLayout;
