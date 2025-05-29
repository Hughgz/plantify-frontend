import React from "react";
import { useSelector } from "react-redux";
import { FaTree, FaLeaf, FaCalendarAlt, FaSeedling, FaSun, FaTint, FaMapMarkerAlt, FaExclamationTriangle } from "react-icons/fa";

function PlantDetails() {
  const { currentPlant, loading, error } = useSelector((state) => state.plants);

  // Fallback nếu không có dữ liệu
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Đang tải thông tin cây trồng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <p className="text-red-500 font-medium">Lỗi: {error}</p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Không thể tải thông tin cây trồng</p>
        </div>
      </div>
    );
  }

  if (!currentPlant) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <FaTree className="text-gray-400 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Không có thông tin cây trồng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Ảnh cây */}
      <div className="flex justify-center px-6">
        <img 
          src={currentPlant.imageUrl || "https://res.cloudinary.com/dahzoj4fy/image/upload/v1736718381/nydxiabpncjnu54vqyp1.png"} 
          alt={currentPlant.name} 
          className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white object-cover shadow-lg" 
        />
      </div>

      {/* Thông tin cây */}
      <div className="p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {currentPlant.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 italic">{currentPlant.species}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center">
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-3">
              <FaLeaf className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loài</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{currentPlant.species}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center">
            <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-3">
              <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tuổi cây</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{currentPlant.age || 0} năm</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded-full mr-3">
              <FaSeedling className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Số lượng</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{currentPlant.numOfPlant || 0} cây</p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg flex items-center">
            <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded-full mr-3">
              <FaMapMarkerAlt className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vị trí</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{currentPlant.location || "Khu vườn chính"}</p>
            </div>
          </div>
        </div>

        {currentPlant.description && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Mô tả</h3>
            <p className="text-gray-600 dark:text-gray-400">{currentPlant.description}</p>
          </div>
        )}

        {currentPlant.careInstructions && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Hướng dẫn chăm sóc</h3>
            <p className="text-gray-600 dark:text-gray-400">{currentPlant.careInstructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantDetails;
