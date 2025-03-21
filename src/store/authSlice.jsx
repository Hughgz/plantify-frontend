import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { variables } from '../utils/variables';

// API Endpoints
const API_URL = variables.USER;

// Async Thunk để đăng nhập
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData, { rejectWithValue }) => {
        try {
            const formattedData = {
                phone_number: userData.phoneNumber, 
                password: userData.password
            };

            console.log("Sending request with data:", formattedData);

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedData),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Đăng nhập thất bại!");
            }

            const data = await response.json();
            if (!data || !data.token || !data.user) {
                throw new Error("Dữ liệu phản hồi không hợp lệ từ server.");
            }

            // **Lưu token và user vào LocalStorage**
            localStorage.setItem("userToken", data.token);
            localStorage.setItem("x", JSON.stringify(data.user));

            return data;
        } catch (error) {
            console.error("Login error:", error.message);
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
                const errorText = await response.text();
                throw new Error(errorText || "Đăng ký thất bại!");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: JSON.parse(localStorage.getItem("userData")) || null,
        token: localStorage.getItem("userToken") || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
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
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
