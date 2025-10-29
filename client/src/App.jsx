import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { PrivateRoute, PublicRoute } from "./components";
import AllProductsPage from "./pages/AllProducts";
import CategoryPage from "./pages/Category";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetailPage from "./pages/ProductDetail";
import PublicLayout from "./pages/PublicLayout";
import path from "./utils/path";
import CartPage from "./pages/Cart";

function App() {
	return (
		<div>
			<Routes>
				<Route
					path={path.LOGIN}
					element={
						<PublicRoute>
							<Login />
						</PublicRoute>
					}
				/>

				<Route
					path={path.HOME}
					element={<PublicLayout />}>
					{/* Trang chủ ("/") sẽ được render bên trong PublicLayout */}
					<Route
						index
						element={<Home />}
					/>
					<Route
						path={path.CATEGORY}
						element={<CategoryPage />}
					/>
					<Route
						path={path.PRODUCT_DETAIL}
						element={<ProductDetailPage />}
					/>
					<Route
						path={path.PRODUCTS} // "/products"
						element={<AllProductsPage />}
					/>

					<Route
						path={path.MY_CART}
						element={
							<PrivateRoute>
								<CartPage />
							</PrivateRoute>
						}
					/>

					{/* Ví dụ: Thêm các trang khác ở đây, chúng sẽ tự động có Header/Footer
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} /> 
            */}
				</Route>

				{/* Thêm các route cho Admin/Seller (có thể dùng layout khác) ở đây */}
			</Routes>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</div>
	);
}

export default App;
