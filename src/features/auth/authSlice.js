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
      console.log('Sending registration data to API:', userData);
      const response = await axios.post(`${API_URL}/User/register`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
      console.error('Validation errors:', error.response?.data?.errors);
      console.error('Model errors:', error.response?.data?.errors?.model);
      console.error('DateOfBirth errors:', error.response?.data?.errors?.['$.dateOfBirth']);
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

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const response = await axios.get(`${API_URL}/User/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data[0];
      if (userData) {
        dispatch(setAccountType({
          isDonor: userData.isDonor ?? userData.IsDonor ?? false,
          isRecipient: userData.isRecipient ?? userData.IsRecipient ?? false,
        }));
      }
      return userData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Fetch profile failed');
    }
  }
);

const getInitialState = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);
  
  // Tạo tài khoản test nếu chưa có
  if (!localStorage.getItem('testAccountCreated')) {
    localStorage.setItem('testAccountCreated', 'true');
    console.log('Test account created for development');
  }
  
  if (token && !isTokenExpired(token)) {
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      
      // Giả định payload của token có các trường userId, fullName, role
      const user = {
        userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.sub,
        fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      };
      
      console.log('Extracted user info:', user);
      
      return {
        user: user,
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
  
  console.log('No valid token found, returning unauthenticated state');
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
    updateUserLocation(state, action) {
      if (state.user) {
        state.user.latitude = action.payload.latitude;
        state.user.longitude = action.payload.longitude;
      }
    },
    clearError(state) {
      state.error = null;
    },
    createTestAccount(state) {
      // Tạo token giả cho tài khoản test
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      state.user = {
        userId: '1234567890',
        fullName: 'Test User',
        role: 'User'
      };
      state.token = testToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      
      // Lưu vào localStorage
      localStorage.setItem('token', testToken);
      localStorage.setItem('userProfile', JSON.stringify({
        userId: '1234567890',
        fullName: 'Test User',
        role: 'User'
      }));
      
      console.log('Test account logged in successfully');
    },
    setAccountType(state, action) {
      if (state.user) {
        state.user.isDonor = action.payload.isDonor;
        state.user.isRecipient = action.payload.isRecipient;
      }
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


export const { clearError, createTestAccount, updateUserLocation, setAccountType } = authSlice.actions;

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