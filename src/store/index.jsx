import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sensorReadingReducer from "./sensorReadingSlice";


const store = configureStore({
    reducer: {
        auth: authReducer,
        sensorReading: sensorReadingReducer
    },
});

export default store;
