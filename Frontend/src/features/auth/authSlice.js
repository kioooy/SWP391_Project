import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import thư viện jwt-decode

// Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Chuyển đổi sang giây
    return decoded.exp < currentTime;
  } catch (error) {
    // Lỗi khi giải mã token (token không hợp lệ)
    return true;
  }
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const payload = {
        citizenNumber: credentials.citizenId,
        password: credentials.password,
      };
      const response = await axios.post(`${API_URL}/User/login`, payload);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/User/register`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Xóa tất cả thông tin liên quan đến người dùng
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isTestUser');
    
    // Xóa token khỏi header của axios
    delete axios.defaults.headers.common['Authorization'];
  }
);

const getInitialState = () => {
  const token = localStorage.getItem('token');
  if (token && !isTokenExpired(token)) {
    try {
      const decoded = jwtDecode(token);
      // Giả định payload của token có các trường userId, fullName, role
      return {
        user: {
          userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.sub,
          fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        },
        token: token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    } catch (error) {
      console.error("Lỗi giải mã token khi khởi tạo:", error);
      // Xóa token không hợp lệ
      localStorage.removeItem('token');
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    }
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

const initialState = getInitialState();


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = { userId: action.payload.userId, fullName: action.payload.fullName, role: action.payload.role };
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = { userId: action.payload.userId, fullName: action.payload.fullName, role: action.payload.role };
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

// Các selector mới để debug
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserId = (state) => state.auth.user?.userId;
export const selectUserFullName = (state) => state.auth.user?.fullName;

export default authSlice.reducer; 