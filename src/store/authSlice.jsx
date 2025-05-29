import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { variables } from "../utils/variables";

const API_URL = variables.USER;

// Async Thunk để đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const formattedData = {
        phone_number: userData.phoneNumber,
        password: userData.password,
      };

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại!");
      }

      const data = await response.json();
      if (!data.token || !data.user) {
        throw new Error("Dữ liệu phản hồi không hợp lệ từ server.");
      }

      // Lưu access token vào localStorage, không lưu refreshToken
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Trả về cả refreshToken để sử dụng trong Redux state tạm thời
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk để làm mới access token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshToken, { rejectWithValue }) => {
    try {
      if (!refreshToken) {
        throw new Error("Không có refresh token để làm mới!");
      }

      const response = await fetch(`${API_URL}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || "Làm mới token thất bại!");
      }

      const data = await response.json();
      if (!data.accessToken) {
        throw new Error("Không nhận được access token mới!");
      }

      // Lưu access token mới vào localStorage
      localStorage.setItem("userToken", data.accessToken);
      return { token: data.accessToken };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk để đăng ký
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng ký thất bại!");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk để đăng xuất
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (refreshToken, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("userToken");
      if (!accessToken || !refreshToken) {
        throw new Error("Không tìm thấy token để đăng xuất!");
      }

      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || "Đăng xuất thất bại!");
      }

      // Xóa access token và user khỏi localStorage
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");

      return { message: "Đăng xuất thành công" };
    } catch (error) {
      // Xóa localStorage ngay cả khi API thất bại để đảm bảo logout phía client
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("userData")) || null,
    token: localStorage.getItem("userToken") || null,
    refreshToken: null, // Lưu tạm refreshToken trong state, không lưu vào localStorage
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý đăng nhập
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken; // Lưu tạm vào state
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý đăng ký
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý làm mới token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;