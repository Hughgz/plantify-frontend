import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

import SidebarLinkGroup from "./SidebarLinkGroup";

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
        className={`flex lg:!flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-sm'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-center items-center h-40 mb-10 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink
            end
            to="/"
            className="flex items-center justify-center"
          >
            <img
              src="src/images/Plantify_no_background.png"
              alt="Plantify Logo"
              className="w-50 h-auto"
            />
          </NavLink>

        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <ul className="mt-3">
              {/* Dashboard */}
              <li className="mb-3">
                <NavLink
                  end
                  to="/"
                  className={({ isActive }) =>
                    `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${isActive
                      ? "text-violet-500"
                      : "hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center">
                    <svg className={`shrink-0 fill-current ${pathname === "/" ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                      <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                    </svg>
                    <span className="text-sm font-medium ml-4">
                      Trang chủ
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Recommendations */}
              <li className="mb-3">
                <NavLink
                  end
                  to="/recomendation"
                  className={({ isActive }) =>
                    `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${isActive
                      ? "text-violet-500"
                      : "hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center">
                    <svg fill="#000000" width="16" height="16" viewBox="0 0 101.38 101.379" xmlns="http://www.w3.org/2000/svg">
                      <g>
                        <g>
                          <path d="M100.622,70.318L80.839,50.535c6.242-8.051,5.687-19.706-1.703-27.095c-8.01-8.01-21.044-8.01-29.054,0c-8.01,8.011-8.01,21.044,0,29.055c7.389,7.389,19.043,7.944,27.095,1.703L96.96,73.98c1.013,1.012,2.651,1.012,3.662,0.001C101.633,72.969,101.633,71.331,100.622,70.318z M75.473,48.832c-5.99,5.991-15.738,5.992-21.729,0c-5.991-5.99-5.991-15.738,0-21.729c5.99-5.99,15.738-5.992,21.729,0C81.464,33.093,81.464,42.841,75.473,48.832z" />
                          <path d="M5,66.071V12.403h89v48.086l5,5V11.903c0-2.48-2.02-4.5-4.5-4.5h-90c-2.481,0-4.5,2.02-4.5,4.5v54.668c0,2.48,2.019,4.5,4.5,4.5h36.012v14.254c0,1.721,1.398,3.119,3.117,3.119h9.741c1.719,0,3.116-1.398,3.116-3.119V71.071H91.6l-5-5H5z M43.629,85.325V71.071h9.741l0.002,14.256L43.629,85.325z" />
                          <path d="M64.49,82.077v3c-0.213,0-0.387-0.174-0.387-0.387v6.287H32.896V84.69c0,0.213-0.174,0.387-0.387,0.387v-3c-1.441,0-2.613,1.172-2.613,2.613v6.674c0,1.441,1.172,2.613,2.613,2.613H64.49c1.441,0,2.613-1.172,2.613-2.613V84.69C67.104,83.249,65.932,82.077,64.49,82.077z" />
                          <path d="M38.279,60.799h7.656c0.312,0,0.564-0.252,0.564-0.563v-9.399c-1.578-2.267-2.687-4.754-3.337-7.341l-5.448,5.67v11.071C37.714,60.547,37.967,60.799,38.279,60.799z" />
                          <path d="M59.613,60.799c0.312,0,0.565-0.252,0.565-0.563v-0.264c-3.19-0.687-6.173-2.064-8.785-4.048v4.312c0,0.312,0.253,0.563,0.564,0.563H59.613z" />
                          <path d="M59.613,47.749h-3.711c1.26,1.172,2.707,2.076,4.276,2.68v-2.114C60.179,48.002,59.926,47.749,59.613,47.749z" />
                          <path d="M72.541,60.799c0.312,0,0.564-0.252,0.564-0.563v-1.269c-2.582,0.996-5.349,1.524-8.142,1.524c-0.2,0-0.396-0.022-0.593-0.028c0.088,0.197,0.283,0.336,0.514,0.336H72.541z" />
                          <path d="M72.061,36.082c-0.48,0-0.949-0.17-1.317-0.478l-1.392-1.163L64.32,39.93v11.363c0.222,0.011,0.441,0.031,0.666,0.031c2.98,0,5.801-0.978,8.119-2.758V35.791c-0.031,0.019-0.06,0.04-0.092,0.058C72.721,36.001,72.391,36.082,72.061,36.082z" />
                          <path d="M57.697,44.815l11.611-12.667l2.717,2.271c0.133,0.11,0.319,0.131,0.473,0.051c0.152-0.08,0.242-0.244,0.229-0.417l-0.59-6.585c-0.021-0.235-0.229-0.409-0.463-0.388l-6.585,0.589c-0.172,0.016-0.317,0.133-0.37,0.298c-0.017,0.055-0.021,0.11-0.018,0.166c0.01,0.11,0.062,0.216,0.152,0.289l2.721,2.275L56.544,42.73L52,41.058c0.227,0.96,0.557,1.888,0.986,2.77l3.488,1.283C56.906,45.269,57.389,45.153,57.697,44.815z" />
                          <path d="M42.486,38.646l-7.456,7.76c-0.433,0.45-0.418,1.165,0.032,1.597c0.219,0.211,0.501,0.315,0.782,0.315c0.297,0,0.593-0.116,0.814-0.347l6.112-6.36C42.61,40.628,42.516,39.638,42.486,38.646z" />
                        </g>
                      </g>
                    </svg>
                    <span className="text-sm font-medium ml-4">
                      Khuyến nghị cây trồng
                    </span>
                  </div>
                </NavLink>
              </li>
              <li className="mb-3">
                <NavLink
                  end
                  to="/plantInfo"
                  className={({ isActive }) =>
                    `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${isActive
                      ? "text-violet-500"
                      : "hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M12 2C9.239 2 7 4.239 7 7c0 .914.244 1.771.672 2.516C6.063 10.066 5 11.82 5 14c0 2.635 2.258 4 5 4v3h-2a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3c2.742 0 5-1.365 5-4 0-2.18-1.063-3.934-2.672-4.484A5.963 5.963 0 0 0 17 7c0-2.761-2.239-5-5-5zm0 2c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zM9 14c0-1.654 1.346-3 3-3s3 1.346 3 3-1.346 3-3 3-3-1.346-3-3z" />
                    </svg>

                    <span className="text-sm font-medium ml-4">
                      Thông tin cây
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Control */}
              <li className="mb-3">
                <NavLink
                  end
                  to="/control"
                  className={({ isActive }) =>
                    `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${isActive
                      ? "text-violet-500"
                      : "hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center">
                    <svg fill="#000000" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 2a2 2 0 0 0-2 2v4h2V4h12v4h2V4a2 2 0 0 0-2-2H6zm0 18a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4h-2v4H8v-4H6v4zm16-9h-5V8h-2v3h-6V8H7v3H2v2h5v3h2v-3h6v3h2v-3h5v-2z" />
                    </svg>
                    <span className="text-sm font-medium ml-4">
                      Điều khiển
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Analysis */}
              <li className="mb-3">
                <NavLink
                  end
                  to="/analysis"
                  className={({ isActive }) =>
                    `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${isActive
                      ? "text-violet-500"
                      : "hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center">
                    <svg fill="#000000" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM9 9h2v6H9V9zm4 0h2v6h-2V9z" />
                    </svg>
                    <span className="text-sm font-medium ml-4">
                      Phân tích
                    </span>
                  </div>
                </NavLink>
              </li>
              {/* Leaf Monitoring */}
              <li className="mb-3">
                <NavLink
                  end
                  to="/leafMonitor"
                  className={({ isActive }) =>
                    `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${isActive
                      ? "text-violet-500"
                      : "hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center">
                    <svg fill="#000000" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4Z" />
                    </svg>
                    <span className="text-sm font-medium ml-4">
                      Giám sát lá cây
                    </span>
                  </div>
                </NavLink>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
