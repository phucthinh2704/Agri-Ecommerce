import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
	apiGetCart,
	apiAddToCart,
	apiUpdateCartItem,
	apiRemoveCartItem,
	apiClearCart,
} from "../../api/cart";

// Async thunk to fetch the cart
export const fetchCart = createAsyncThunk(
	"cart/fetchCart",
	async (_, { rejectWithValue }) => {
		const response = await apiGetCart();
		if (!response.success) {
			return rejectWithValue(response.message);
		}
		// The actual cart data is nested under response.data
		// Calculate count based on items array length or sum of quantities
		const cartData = response.data || { items: [], subtotal: 0 };
		console.log(response)
		const count = cartData.items.reduce(
			(sum, item) => sum + item.quantity,
			0
		); // Sum quantities
		return { ...cartData, count };
	}
);

// Async thunk to add an item to the cart
export const addToCart = createAsyncThunk(
	"cart/addToCart",
	async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
		const response = await apiAddToCart({
			product_id: productId,
			quantity,
		});
		if (!response.success) {
			return rejectWithValue(response.message || "Failed to add item");
		}
		// After successfully adding, fetch the updated cart to refresh the state
		dispatch(fetchCart());
		return response.data; // Return the raw response from addToCart if needed
	}
);

// Async thunk to update item quantity
export const updateCartItem = createAsyncThunk(
	"cart/updateCartItem",
	async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
		const response = await apiUpdateCartItem({
			product_id: productId,
			quantity,
		});
		if (!response.success) {
			return rejectWithValue(response.message || "Failed to update item");
		}
		dispatch(fetchCart()); // Refresh cart
		return response.data;
	}
);

// Async thunk to remove an item
export const removeCartItem = createAsyncThunk(
	"cart/removeCartItem",
	async (productId, { dispatch, rejectWithValue }) => {
		const response = await apiRemoveCartItem(productId);
		if (!response.success) {
			return rejectWithValue(response.message || "Failed to remove item");
		}
		dispatch(fetchCart()); // Refresh cart
		return response.data;
	}
);

// Async thunk to clear the cart
export const clearCart = createAsyncThunk(
	"cart/clearCart",
	async (_, { dispatch, rejectWithValue }) => {
		const response = await apiClearCart();
		if (!response.success) {
			return rejectWithValue(response.message || "Failed to clear cart");
		}
		dispatch(fetchCart()); // Refresh cart (will result in an empty cart)
		return response.data;
	}
);

const initialState = {
	items: [],
	count: 0, // Total number of items (sum of quantities)
	subtotal: 0,
	isLoading: false,
	error: null,
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		// Reducer to clear cart on logout, for example
		clearCartState: (state) => {
			state.items = [];
			state.count = 0;
			state.subtotal = 0;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch Cart
			.addCase(fetchCart.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchCart.fulfilled, (state, action) => {
				state.isLoading = false;
				state.items = action.payload.items;
				state.count = action.payload.count;
				state.subtotal = action.payload.subtotal;
			})
			.addCase(fetchCart.rejected, (state, action) => {
				state.isLoading = false;
				// Keep existing cart data but show error? Or clear it?
				// state.items = []; state.count = 0; state.subtotal = 0;
				state.error = action.payload || "Could not fetch cart";
			})
			// Add To Cart (Doesn't directly update state, relies on fetchCart)
			.addCase(addToCart.pending, (state) => {
				// Optionally show a specific loading state for adding
				// state.isAdding = true;
			})
			.addCase(addToCart.fulfilled, (state) => {
				// state.isAdding = false;
				// State will be updated by the subsequent fetchCart call
			})
			.addCase(addToCart.rejected, (state, action) => {
				// state.isAdding = false;
				state.error = action.payload || "Could not add item to cart";
				// Optionally show a toast here directly or handle in component
			})
			.addCase(updateCartItem.pending, (state) => {
				// Optional: Indicate specific item is updating
			})
			.addCase(updateCartItem.rejected, (state, action) => {
				state.error = action.payload || "Could not update item";
			})
			// Remove Item (Chỉ xử lý lỗi)
			.addCase(removeCartItem.pending, (state) => {
				// Optional: Indicate specific item is being removed
			})
			.addCase(removeCartItem.rejected, (state, action) => {
				state.error = action.payload || "Could not remove item";
			})
			// Clear Cart (Chỉ xử lý lỗi)
			.addCase(clearCart.pending, (state) => {
				state.isLoading = true; // Show general loading for clear
			})
			.addCase(clearCart.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload || "Could not clear cart";
			});
	},
});

export const { clearCartState } = cartSlice.actions;

// Selectors
export const selectCartCount = (state) => state.cart.count;
export const selectCartItems = (state) => state.cart.items;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
