import React, { useState, useEffect } from 'react';
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Notification, { notify } from '../components/Notification'

function ControlCenter() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState("manual");
    const [manualControls, setManualControls] = useState(() => {
        const savedState = localStorage.getItem("manualControls");
        return savedState ? JSON.parse(savedState) : {
            "Đèn sợi đốt": false,
            "Máy bơm nước": false,
            "Máy phun sương": false,
            "Camera": false,
        };
    });
    const [sensorData, setSensorData] = useState({
        temperature: 0,
        humidity: 0,
        soilMoisture: 0,
    });
    const [motorStatus, setMotorStatus] = useState({
        "Đèn sợi đốt": false,
        "Máy bơm nước": false,
        "Máy phun sương": false,
        "Camera": false,
    });
    const [schedule, setSchedule] = useState(() => {
        const savedSchedule = localStorage.getItem("schedule");
        return savedSchedule ? JSON.parse(savedSchedule) : {
            "Đèn sợi đốt": { on: "08:42", off: "23:46" },
            "Máy bơm nước": { on: "16:31", off: "18:29" },
            "Máy phun sương": { on: "04:00", off: "05:00" },
            "Camera": { on: "12:00", off: "23:59" },
        };
    });

    const deviceToLedMap = {
        "Đèn sợi đốt": "led1",
        "Máy bơm nước": "led2",
        "Máy phun sương": "led3",
        "Camera": "led4"
    };

    const ledToDeviceMap = {
        "led1": "Đèn sợi đốt",
        "led2": "Máy bơm nước",
        "led3": "Máy phun sương",
        "led4": "Camera"
    };

    const modeMap = {
        0: "manual",
        1: "schedule",
        2: "sensor"
    };

    // Lưu trạng thái trước đó để so sánh
    const [prevMotorStatus, setPrevMotorStatus] = useState(motorStatus);

    useEffect(() => {
        fetchDeviceStatus();
        fetchModeSetting();
        fetchLedControlSchedule();

        const interval = setInterval(() => {
            fetchDeviceStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        Object.keys(motorStatus).forEach(device => {
            if (prevMotorStatus[device] !== motorStatus[device]) {
                const modeLabel = mode === 'schedule' ? 'Lịch trình' : mode === 'sensor' ? 'Cảm biến' : 'Thủ công';
                notify.info(`[${modeLabel}] Đã ${motorStatus[device] ? 'bật' : 'tắt'} ${device}!`);
            }
        });
        setPrevMotorStatus(motorStatus);
    }, [motorStatus, mode]);

    const fetchLedControlSchedule = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/ledControl', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            
            const newSchedule = {};
            data.forEach(item => {
                const deviceName = ledToDeviceMap[item.ledName];
                const onTime = `${String(item.turnOnTime[0]).padStart(2, '0')}:${String(item.turnOnTime[1]).padStart(2, '0')}`;
                const offTime = `${String(item.turnOffTime[0]).padStart(2, '0')}:${String(item.turnOffTime[1]).padStart(2, '0')}`;
                newSchedule[deviceName] = { on: onTime, off: offTime };
            });
            
            setSchedule(newSchedule);
            localStorage.setItem("schedule", JSON.stringify(newSchedule));
        } catch (error) {
            console.error('Error fetching LED control schedule:', error);
            notify.error("Lỗi khi lấy lịch trình thiết bị!");
        }
    };

    const fetchDeviceStatus = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/ledStatus', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            
            const newControls = {
                "Đèn sợi đốt": data.led1 === 1,
                "Máy bơm nước": data.led2 === 1,
                "Máy phun sương": data.led3 === 1,
                "Camera": data.led4 === 1,
            };
            
            setManualControls(newControls);
            setMotorStatus(newControls);
            localStorage.setItem("manualControls", JSON.stringify(newControls));
        } catch (error) {
            console.error('Error fetching device status:', error);
            notify.error("Lỗi khi lấy trạng thái thiết bị!");
        }
    };

    const fetchModeSetting = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/modeSetting', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            const currentMode = modeMap[data.mode] || "manual";
            setMode(currentMode);
        } catch (error) {
            console.error('Error fetching mode setting:', error);
            notify.error("Lỗi khi lấy chế độ hoạt động!");
        }
    };

    const updateModeSetting = async (newMode) => {
        const modeValue = Object.keys(modeMap).find(key => modeMap[key] === newMode);
        try {
            const response = await fetch(
                `http://localhost:8080/api/modeSetting/updateMode?mode=${modeValue}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                setMode(newMode);
                notify.success(`Đã chuyển sang chế độ: ${
                    newMode === 'manual' ? 'Thủ công' : 
                    newMode === 'sensor' ? 'Tự động (cảm biến)' : 
                    'Tự động (thời gian)'
                }`);
            } else {
                notify.error("Không thể cập nhật chế độ hoạt động!");
            }
        } catch (error) {
            console.error('Error updating mode setting:', error);
            notify.error("Lỗi khi cập nhật chế độ hoạt động!");
        }
    };

    const toggleManualControl = async (device) => {
        const newStatus = !manualControls[device];
        const ledName = deviceToLedMap[device];
        const statusValue = newStatus ? 1 : 0;

        try {
            const response = await fetch(
                `http://localhost:8080/api/ledStatus/update?led=${ledName}&status=${statusValue}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const newControls = {
                    ...manualControls,
                    [device]: newStatus
                };
                setManualControls(newControls);
                setMotorStatus(newControls);
                localStorage.setItem("manualControls", JSON.stringify(newControls));
                notify.success(`Đã ${newStatus ? 'bật' : 'tắt'} ${device}!`);
                
                // If the device is the Camera, also toggle the Python camera
                if (device === "Camera") {
                    try {
                        const pythonResponse = await fetch('http://127.0.0.1:5000/toggle_camera', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: newStatus }),
                        });
                        
                        if (pythonResponse.ok) {
                            const result = await pythonResponse.json();
                            console.log('Python camera toggle response:', result);
                        } else {
                            console.error('Failed to toggle Python camera:', await pythonResponse.text());
                        }
                    } catch (pythonError) {
                        console.error('Error connecting to Python server:', pythonError);
                        notify.warning('Kết nối tới máy chủ camera thất bại, nhưng trạng thái đã được cập nhật.');
                    }
                }
            } else {
                notify.error(`Không thể cập nhật trạng thái ${device}!`);
            }
        } catch (error) {
            console.error('Error updating device status:', error);
            notify.error(`Lỗi khi cập nhật trạng thái ${device}!`);
        }
    };

    const saveSchedule = () => {
        localStorage.setItem("schedule", JSON.stringify(schedule));
        notify.success("Đã lưu lịch trình thành công!");
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Điều khiển thiết bị</h1>

                    <div className="flex gap-4 mb-6">
                        {['manual', 'sensor', 'schedule'].map((type) => (
                            <button
                                key={type}
                                className={`px-4 py-2 rounded text-white transition-all duration-200 ${
                                    mode === type 
                                        ? 'bg-blue-600 scale-105 shadow-lg' 
                                        : 'bg-gray-500 hover:bg-gray-600'
                                }`}
                                onClick={() => updateModeSetting(type)}
                            >
                                {type === 'manual' ? 'Thủ công' : type === 'sensor' ? 'Tự động (cảm biến)' : 'Tự động (thời gian)'}
                            </button>
                        ))}
                    </div>

                    {mode === "manual" && (
                        <div className="p-4 bg-white dark:bg-gray-800 rounded">
                            <h2 className="text-xl font-bold mb-4">Điều khiển thủ công</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.keys(manualControls).map((device, index) => (
                                    <label key={index} className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={manualControls[device]} 
                                            onChange={() => toggleManualControl(device)} 
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{device}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === "sensor" && (
                        <div className="p-4 bg-white dark:bg-gray-800 rounded">
                            <h2 className="text-xl font-bold mb-4">Thông số cảm biến và trạng thái thiết bị</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="flex items-center">
                                    <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">Nhiệt độ:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{sensorData.temperature} °C</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">Độ ẩm:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{sensorData.humidity} %</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">Độ ẩm đất:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{sensorData.soilMoisture} %</span>
                                </div>
                                {Object.keys(motorStatus).map((device, index) => (
                                    <div key={index} className="flex items-center">
                                        <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{device}:</span>
                                        <span className={`text-sm font-medium ${motorStatus[device] ? 'text-green-500' : 'text-red-500'}`}>
                                            {motorStatus[device] ? 'Đang chạy' : 'Tắt'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === "schedule" && (
                        <div className="p-4 bg-white dark:bg-gray-800 rounded">
                            <h2 className="text-xl font-bold mb-4">Thiết lập lịch trình</h2>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2 border">Thiết bị</th>
                                        <th className="p-2 border">Giờ bật</th>
                                        <th className="p-2 border">Giờ tắt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(schedule).map((device, index) => (
                                        <tr key={index}>
                                            <td className="p-2 border">{device}</td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="time" 
                                                    className="p-1 border rounded" 
                                                    value={schedule[device].on} 
                                                    onChange={(e) => setSchedule(prev => ({ 
                                                        ...prev, 
                                                        [device]: { ...prev[device], on: e.target.value } 
                                                    }))} 
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="time" 
                                                    className="p-1 border rounded" 
                                                    value={schedule[device].off} 
                                                    onChange={(e) => setSchedule(prev => ({ 
                                                        ...prev, 
                                                        [device]: { ...prev[device], off: e.target.value } 
                                                    }))} 
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <button 
                                                    onClick={saveSchedule} 
                                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                                >
                                                    Thiết lập
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
            <Notification />
        </div>
    );
}

export default ControlCenter;