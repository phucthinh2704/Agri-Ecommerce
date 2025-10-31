import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AdminRoute, PrivateRoute, PublicRoute } from "./components";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageUsers from "./pages/admin/ManageUsers";
import AllProductsPage from "./pages/AllProducts";
import CartPage from "./pages/Cart";
import CategoryPage from "./pages/Category";
import CheckoutPage from "./pages/Checkout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyOrdersPage from "./pages/MyOrders";
import ProductDetailPage from "./pages/ProductDetail";
import PublicLayout from "./pages/PublicLayout";
import path from "./utils/path";
import CreateProduct from "./pages/admin/CreateProduct";
import UpdateProduct from "./pages/admin/UpdateProduct";

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

					<Route
						path={path.CHECKOUT} // "checkout"
						element={
							<PrivateRoute>
								<CheckoutPage />
							</PrivateRoute>
						}
					/>

					<Route
						path={path.MY_ORDERS} // "my-orders"
						element={
							<PrivateRoute>
								<MyOrdersPage />
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
				<Route element={<AdminRoute />}>
					<Route
						path={path.ADMIN}
						element={<AdminLayout />}>
						<Route
							index
							element={
								<Navigate
									to={path.DASHBOARD}
									replace
								/>
							}
						/>
						<Route
							path={path.DASHBOARD}
							element={<Dashboard />}
						/>
						<Route
							path={path.MANAGE_PRODUCTS}
							element={<ManageProducts />}
						/>
						<Route
							path={path.MANAGE_ORDERS}
							element={<ManageOrders />}
						/>
						<Route
							path={path.MANAGE_USERS}
							element={<ManageUsers />}
						/>
						<Route
							path={path.MANAGE_CATEGORIES}
							element={<ManageCategories />}
						/>
						<Route path={path.CREATE_PRODUCT} element={<CreateProduct />} />
						<Route path={path.EDIT_PRODUCT} element={<UpdateProduct />} />
					</Route>
				</Route>
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
