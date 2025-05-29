import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { variables } from "../utils/variables";

export const fetchPlantInfo = createAsyncThunk(
    "plants/fetchPlantInfo",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${variables.PLANT}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Không thể lấy thông tin cây trồng!");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Fetch Plant Info Error:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

// Slice cho Plant Info
const plantSlice = createSlice({
    name: "plants",
    initialState: {
        plants: [],
        currentPlant: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentPlant: (state, action) => {
            state.currentPlant = action.payload;
        },
        resetPlants: (state) => {
            state.plants = [];
            state.currentPlant = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlantInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlantInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.plants = action.payload;
                if (action.payload.length > 0 && !state.currentPlant) {
                    state.currentPlant = action.payload[0];
                }
            })
            .addCase(fetchPlantInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setCurrentPlant, resetPlants } = plantSlice.actions;
export default plantSlice.reducer; 