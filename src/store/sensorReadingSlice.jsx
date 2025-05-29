import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { variables } from "../utils/variables";

export const fetchSensorReadings = createAsyncThunk(
    "sensorReading/fetchSensorReadings",
    async (_, { rejectWithValue }) => {
        try {
            // Thử truy cập endpoint để lấy dữ liệu mới nhất
            let response = await fetch(`${variables.SENSOR_READING_LATEST}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            // Nếu endpoint latest không tồn tại, sử dụng endpoint gốc và sắp xếp
            if (!response.ok) {
                console.log("Latest endpoint not available, fetching all readings...");
                response = await fetch(`${variables.SENSOR_READING}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Không thể lấy dữ liệu cảm biến!");
                }

                // Lấy tất cả dữ liệu và sắp xếp
                const allData = await response.json();
                console.log("All sensor data fetched:", allData);

                if (!allData || !Array.isArray(allData) || allData.length === 0) {
                    return [];
                }

                // Sắp xếp theo sensor_reading_id giảm dần (mới nhất đầu tiên)
                allData.sort((a, b) => {
                    const idA = a.sensor_reading_id || a.id || 0;
                    const idB = b.sensor_reading_id || b.id || 0;
                    return idB - idA;
                });

                // Chỉ lấy bản ghi mới nhất
                const latestData = [allData[0]];
                console.log("Latest data by sorting:", latestData);
                
                // Xử lý chuyển đổi kiểu dữ liệu
                return latestData.map(item => processItemValues(item));
            }

            // Nếu endpoint latest hoạt động, xử lý dữ liệu từ endpoint này
            const data = await response.json();
            console.log("Latest sensor data from API:", data);
            
            // Xử lý dữ liệu để đảm bảo cấu trúc chính xác
            // Nếu dữ liệu là mảng rỗng, trả về mảng rỗng
            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log("No sensor data returned");
                return [];
            }
            
            // Nếu không phải mảng, bọc nó trong mảng
            if (!Array.isArray(data)) {
                console.log("Converting single object to array:", data);
                return [processItemValues(data)];
            }
            
            // Xử lý các thuộc tính số trong mỗi item của mảng
            console.log("Processing array of sensor data items");
            return data.map(item => processItemValues(item));
        } catch (error) {
            console.error("Fetch Latest Sensor Readings Error:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

// Hàm riêng để xử lý chuyển đổi giá trị
const processItemValues = (item) => {
    const processed = { ...item };
    // Chuyển đổi các chuỗi số thành số
    Object.keys(processed).forEach(key => {
        const value = processed[key];
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            processed[key] = parseFloat(value);
        }
    });
    return processed;
};

// Thêm thunk để lấy dữ liệu từ ID cụ thể nếu cần
export const fetchSensorReadingById = createAsyncThunk(
    "sensorReading/fetchSensorReadingById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${variables.SENSOR_READING}/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Không thể lấy dữ liệu cảm biến với ID ${id}!`);
            }

            const data = await response.json();
            console.log(`Sensor data for ID ${id}:`, data);
            
            if (!data) {
                return null;
            }
            
            return processItemValues(data);
        } catch (error) {
            console.error(`Fetch Sensor Reading ID ${id} Error:`, error.message);
            return rejectWithValue(error.message);
        }
    }
);

// Slice cho Sensor Readings
const sensorReadingSlice = createSlice({
    name: "sensorReading",
    initialState: {
        readings: [],
        selectedReading: null,
        loading: false,
        error: null,
    },
    reducers: {
        resetReadings: (state) => {
            state.readings = [];
            state.selectedReading = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Xử lý fetchSensorReadings
            .addCase(fetchSensorReadings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSensorReadings.fulfilled, (state, action) => {
                state.loading = false;
                state.readings = action.payload;
            })
            .addCase(fetchSensorReadings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Xử lý fetchSensorReadingById
            .addCase(fetchSensorReadingById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSensorReadingById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedReading = action.payload;
            })
            .addCase(fetchSensorReadingById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetReadings } = sensorReadingSlice.actions;
export default sensorReadingSlice.reducer;
