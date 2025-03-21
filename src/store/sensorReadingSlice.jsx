import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { variables } from "../utils/variables";


export const fetchSensorReadings = createAsyncThunk(
    "sensorReading/fetchSensorReadings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${variables.SENSOR_READING}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể lấy dữ liệu cảm biến!");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Fetch Sensor Readings Error:", error.message);
            return rejectWithValue(error.message);
        }
    }
);


// Slice cho Sensor Readings
const sensorReadingSlice = createSlice({
    name: "sensorReading",
    initialState: {
        readings: [],
        loading: false,
        error: null,
    },
    reducers: {
        resetReadings: (state) => {
            state.readings = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
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
            });
    },
});

export const { resetReadings } = sensorReadingSlice.actions;
export default sensorReadingSlice.reducer;
