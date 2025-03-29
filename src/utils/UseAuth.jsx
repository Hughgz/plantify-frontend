import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { refreshToken } from "../store/authSlice"; // Import refreshToken action

const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(refreshToken());
    }, [dispatch]);

    return children;
};

export default AuthProvider;
