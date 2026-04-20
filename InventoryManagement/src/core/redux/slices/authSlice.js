
// authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user; 
      state.token = action.payload.token;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      
    
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('user_id');
    },
    setAuthError: (state, action) => {
      state.error = action.payload; 
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  loginSuccess, 
  logout, 
  setAuthError, 
  setLoading,
  clearAuthError 
} = authSlice.actions;

export default authSlice.reducer;