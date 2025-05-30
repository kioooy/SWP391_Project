import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockUsers } from './mockData';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      // Tạo token giả
      const token = 'mock_token_' + Math.random();
      localStorage.setItem('token', token);

      // Loại bỏ password trước khi trả về
      const { password, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kiểm tra email đã tồn tại
      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error('Email đã được sử dụng');
      }

      // Tạo user mới
      const newUser = {
        id: mockUsers.length + 1,
        ...userData
      };
      mockUsers.push(newUser);

      // Tạo token giả
      const token = 'mock_token_' + Math.random();
      localStorage.setItem('token', token);

      // Loại bỏ password trước khi trả về
      const { password, ...userWithoutPassword } = newUser;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Đăng ký thất bại');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { auth } = getState();
      const userIndex = mockUsers.findIndex(u => u.id === auth.user.id);
      
      if (userIndex === -1) {
        throw new Error('Không tìm thấy người dùng');
      }

      // Cập nhật thông tin người dùng
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...userData
      };

      return {
        ...mockUsers[userIndex],
        password: undefined // Không trả về mật khẩu
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Cập nhật thông tin thất bại');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

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
        state.user = action.payload.user;
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
        state.user = action.payload.user;
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
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer; 