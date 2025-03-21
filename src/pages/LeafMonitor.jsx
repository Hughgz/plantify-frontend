import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";

function LeafMonitor() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [label, setLabel] = useState('');
    const [advice, setAdvice] = useState('');

    useEffect(() => {
        const socket = io('http://127.0.0.1:5000');

        socket.on('image', (data) => {
            setImageSrc(`data:image/jpeg;base64,${data.image}`);
            setLabel(data.label);
            setAdvice(data.advice);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="flex h-screen overflow-hidden">
                    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <main className="grow">
                            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                                    Giám sát lá cây
                                </h1>
                                <div className="bg-gray-300 p-6 rounded-lg shadow-lg flex justify-center items-center">
                                    {imageSrc ? (
                                        <img src={imageSrc} alt="Leaf Detection" className="rounded-lg shadow-lg" />
                                    ) : (
                                        <p className="text-gray-700">Đang tải hình ảnh từ camera...</p>
                                    )}
                                </div>
                                {label && (
                                    <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                                        <h2 className="text-xl font-bold">Trạng thái lá: {label}</h2>
                                        <p className="text-gray-700 mt-2">{advice}</p>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeafMonitor;
