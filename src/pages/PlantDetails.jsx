import React from "react";
import { FaTree, FaLeaf, FaCalendarAlt, FaSeedling } from "react-icons/fa";

function PlantDetails() {
  // 🔹 Dữ liệu giả về cây trồng (sau này có thể lấy từ database)
  const plantData = {
    name: "Cây Mít",
    species: "Mangifera indica",
    age: 5,
    numOfPlant: 10, // Số lượng cây trong khu vực
    imageUrl: "https://res.cloudinary.com/dahzoj4fy/image/upload/v1736718381/nydxiabpncjnu54vqyp1.png",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Ảnh cây */}
      <div className="flex justify-center">
        <img src={plantData.imageUrl} alt={plantData.name} className="w-full max-w-md rounded-lg shadow-lg" />
      </div>

      {/* Thông tin cây */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
          {plantData.name}
        </h2>

        <ul className="mt-4 space-y-3 text-gray-600 dark:text-gray-300">
          <li className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow">
            <div className="flex items-center space-x-2">
              <FaLeaf className="text-green-500" />
              <span className="font-semibold">Loài cây:</span>
            </div>
            <span className="text-gray-800 dark:text-gray-100">{plantData.species}</span>
          </li>

          <li className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-blue-500" />
              <span className="font-semibold">Tuổi cây:</span>
            </div>
            <span className="text-gray-800 dark:text-gray-100">{plantData.age} năm</span>
          </li>

          <li className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow">
            <div className="flex items-center space-x-2">
              <FaSeedling className="text-yellow-500" />
              <span className="font-semibold">Số lượng cây:</span>
            </div>
            <span className="text-gray-800 dark:text-gray-100">{plantData.numOfPlant} cây</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PlantDetails;
