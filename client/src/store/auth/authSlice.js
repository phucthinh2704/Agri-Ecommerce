import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    refreshTokenSuccess: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
  },
});

export const { loginSuccess, logout, setUser, refreshTokenSuccess } = authSlice.actions;
export default authSlice.reducer;
