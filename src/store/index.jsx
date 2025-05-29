import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sensorReadingReducer from "./sensorReadingSlice";
import plantReducer from "./plantSlice";


const store = configureStore({
    reducer: {
        auth: authReducer,
        sensorReading: sensorReadingReducer,
        plants: plantReducer
    },
});

export default store;
