import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../store/authSlice";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        password: "",
        status: "Active",
        roleId: 1,
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerUser(formData))
            .unwrap()
            .then(() => {
                alert("Đăng ký thành công!");
                navigate("/login");
            })
            .catch(() => {});
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Đăng Ký</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    <button type="submit" disabled={loading}>{loading ? "Đang đăng ký..." : "Đăng ký"}</button>
                </form>
                <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
            </div>
        </div>
    );
};

export default Register;
