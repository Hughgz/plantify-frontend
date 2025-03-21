import React, { useState, useEffect } from "react";
import axios from "axios";
import Tooltip from "../../components/Tooltip";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"; // Import OpenStreetMap
import "leaflet/dist/leaflet.css"; // CSS cho OpenStreetMap
import { tailwindConfig } from "../../utils/Utils";
import { variables } from '../../utils/variables';


function WeatherChart() {
    const API_URL = variables.WEATHER;
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [weatherData, setWeatherData] = useState(null);
    const [address, setAddress] = useState("Đang lấy vị trí...");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy vị trí của người dùng
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Tọa độ người dùng:", position.coords.latitude, position.coords.longitude);
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Lỗi lấy vị trí:", error);
                    setError("Không thể lấy vị trí. Hãy bật GPS.");
                }
            );
        } else {
            setError("Trình duyệt không hỗ trợ Geolocation.");
        }
    }, []);

    // Gọi API khi lấy được vị trí
    useEffect(() => {
        if (location.lat && location.lon) {
            fetchWeatherData();
            fetchAddress();
        }
    }, [location]);

    // Gọi API backend để lấy dữ liệu thời tiết từ OpenWeather
    const fetchWeatherData = async () => {
        if (!location.lat || !location.lon) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/location?lat=${location.lat}&lon=${location.lon}`
            );

            console.log("Dữ liệu thời tiết nhận được:", response.data); // Log dữ liệu API
            setWeatherData(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
            setError("Không thể lấy dữ liệu thời tiết.");
        }
        setLoading(false);
    };


    // Gọi OpenStreetMap Nominatim API để lấy địa chỉ cụ thể
    const fetchAddress = async () => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json`
            );

            if (response.data.display_name) {
                setAddress(response.data.display_name);
            } else {
                setAddress("Không xác định vị trí");
            }
        } catch (error) {
            console.error("Lỗi khi lấy địa chỉ:", error);
            setAddress("Không thể lấy địa chỉ");
        }
    };

    // Dữ liệu cho biểu đồ nhiệt độ và độ ẩm
    const temperatureData = weatherData ? [weatherData.main.temp] : [0];
    const humidityData = weatherData ? [weatherData.main.humidity] : [0];

    const chartData = {
        labels: ["Hiện tại"],
        datasets: [
            {
                label: "Nhiệt độ (°C)",
                data: temperatureData,
                fill: true,
                borderColor: tailwindConfig().theme.colors.blue[500],
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: tailwindConfig().theme.colors.blue[500],
            },
            {
                label: "Độ ẩm (%)",
                data: humidityData,
                fill: true,
                borderColor: tailwindConfig().theme.colors.green[500],
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: tailwindConfig().theme.colors.green[500],
            },
        ],
    };

    return (
        <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                    Thời tiết tại vị trí của bạn
                </h2>
                <Tooltip className="ml-2">
                    <div className="text-xs text-center whitespace-nowrap">
                        Built with{" "}
                        <a
                            className="underline"
                            href="https://www.chartjs.org/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Chart.js
                        </a>
                    </div>
                </Tooltip>
            </header>

            <div className="p-5 text-center">
                {loading ? (
                    <p>Đang tải dữ liệu thời tiết...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : weatherData ? (
                    <>
                        <h3 className="text-lg font-semibold">📍 {address}</h3>
                        <p>Nhiệt độ: <strong>{weatherData.main.temp}°C</strong></p>
                        <p>Độ ẩm: <strong>{weatherData.main.humidity}%</strong></p>
                        <p>Mô tả: <strong>{weatherData.weather[0].description}</strong></p>
                    </>
                ) : (
                    <p>Không có dữ liệu.</p>
                )}
            </div>

            {/* Hiển thị bản đồ từ OpenStreetMap */}
            {location.lat && location.lon && (
                <MapContainer center={[location.lat, location.lon]} zoom={15} style={{ height: "300px", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[location.lat, location.lon]}>
                        <Popup>📍 {address}</Popup>
                    </Marker>
                </MapContainer>
            )}
        </div>
    );
}

export default WeatherChart;
