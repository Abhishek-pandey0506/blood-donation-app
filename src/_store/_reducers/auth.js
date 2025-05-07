import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    _id : '',
    isLoggedIn: false,
    email: "",
    name: "",
    role: "",
    token: "",
    userData: {}
  },
};

const profileSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    // Set full user data on login
    setLogin(state, action) {
      state.user = {
        isLoggedIn: true,
        _id: action.payload._id,
        email: action.payload.email,
        name: action.payload.name,
        role: action.payload.role,
        token: action.payload.token,
        userData: action.payload.user 
      };
    },

    // Partially update fields inside user
    updateUser(state, action) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    // Clear user on logout
    logout(state) {
      state.user = initialState.user;
    },
  },
});

export const { setLogin, updateUser, logout } = profileSlice.actions;
export default profileSlice.reducer;
