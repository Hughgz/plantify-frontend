import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaSeedling, 
  FaLeaf, 
  FaTools, 
  FaChartBar, 
  FaMicroscope, 
  FaSignOutAlt, 
  FaCog, 
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close if the escape key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  // Menu items configuration
  const menuItems = [
    {
      path: '/',
      label: 'Trang chủ',
      icon: <FaHome size={18} />,
      activeColor: 'text-blue-500',
    },
    {
      path: '/recomendation',
      label: 'Khuyến nghị cây trồng',
      icon: <FaSeedling size={18} />,
      activeColor: 'text-green-500',
    },
    {
      path: '/plantInfo',
      label: 'Thông tin cây',
      icon: <FaLeaf size={18} />,
      activeColor: 'text-emerald-500',
    },
    {
      path: '/control',
      label: 'Điều khiển',
      icon: <FaTools size={18} />,
      activeColor: 'text-violet-500',
    },
    {
      path: '/analysis',
      label: 'Phân tích',
      icon: <FaChartBar size={18} />,
      activeColor: 'text-orange-500',
    },
    {
      path: '/leafMonitor',
      label: 'Giám sát lá cây',
      icon: <FaMicroscope size={18} />,
      activeColor: 'text-yellow-500',
    },
  ];

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-72 lg:w-20 lg:sidebar-expanded:!w-72 2xl:!w-72 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-72"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'shadow-lg rounded-r-xl'}`}
      >
        {/* Sidebar header */}
        <div className="flex flex-col items-center mb-8">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <FaChevronLeft size={20} />
          </button>
          
          {/* Logo */}
          <div className="flex justify-center py-6">
            <NavLink end to="/" className="flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dahzoj4fy/image/upload/v1748493089/fnhpnwys1umtpfrxatp0.png"
                alt="Plantify Logo"
                className="w-40 h-auto"
              />
            </NavLink>
          </div>
        </div>

        {/* Sidebar toggle button */}
        <div className="hidden lg:inline-flex justify-end mt-0 mb-4">
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
            <span className="sr-only">Expand / collapse sidebar</span>
            <svg className="w-6 h-6 fill-current text-gray-400" viewBox="0 0 24 24">
              <path
                d="M16.59 7.41L10 14l6.59 6.59L18 19l-8-8 8-8z"
                fill={sidebarExpanded ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3 pl-2">Menu chính</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              end
              to={item.path}
              className={({ isActive }) =>
                `flex items-center py-3 px-3 rounded-lg transition duration-200 ${
                  isActive
                    ? `${item.activeColor} bg-gray-50 dark:bg-gray-700/30`
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`
              }
            >
              <div className={`flex items-center ${pathname === item.path ? item.activeColor : ''}`}>
                {item.icon}
                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                  {item.label}
                </span>
              </div>
              {pathname === item.path && (
                <div className="ml-auto h-2 w-2 rounded-full bg-current"></div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/60">
          <div className="space-y-1">
            <NavLink
              to="/settings"
              className={`flex items-center py-3 px-3 rounded-lg transition duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/30`}
            >
              <div className="flex items-center">
                <FaCog size={18} />
                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                  Cài đặt
                </span>
              </div>
            </NavLink>
            
            <button
              className="w-full flex items-center py-3 px-3 rounded-lg transition duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/30"
              onClick={() => console.log('Đăng xuất')}
            >
              <div className="flex items-center">
                <FaSignOutAlt size={18} />
                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100">
                  Đăng xuất
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
