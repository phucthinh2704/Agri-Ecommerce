const path = {
	PUBLIC: "/",
	LOGIN: "login",
	HOME: "",
	PRODUCTS: "products",
	PRODUCT_DETAIL: "product/:slug",
	CATEGORY: "category/:slug",
	ACCOUNT: "account",
	FAVORITE: "favorites",
	CHECKOUT: "checkout",

	// Admin Routes
	ADMIN: "admin",
	DASHBOARD: "dashboard",
	MANAGE_USERS: "manage-users",
	MANAGE_PRODUCTS: "manage-products",
	MANAGE_ORDERS: "manage-orders",
	MANAGE_CATEGORIES: "manage-categories",
	CREATE_PRODUCT: "create-product",

	// Member Routes
	MEMBER: "member",
	PERSONAL: "personal",
	MY_CART: "my-cart",
	ORDER_HISTORY: "order-history",
	WISHLIST: "wishlist",
};

export default path;
