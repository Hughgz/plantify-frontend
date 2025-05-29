import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Recomendation from './pages/Recomendation';
import PlantInfo from './pages/PlantInfo';
import UserInfo from './pages/UserInfo';
import ControlCenter from './pages/ControlCenter';
import LeafMonitor from './pages/LeafMonitor';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthProvider from './utils/UseAuth';
import Analysis from './pages/Analysis';
function App() {
  const location = useLocation();
  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]);

  return (
    <>
      <AuthProvider>
        <Routes>
          <Route exact path="/" element={<Dashboard />} />
          <Route exact path="/recomendation" element={<Recomendation />} />
          <Route exact path="/plantInfo" element={<PlantInfo />} />
          <Route path="/userInfo" element={<UserInfo />} />
          <Route path="/control" element={<ControlCenter />} />
          <Route path="/leafMonitor" element={<LeafMonitor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analysis" element={<Analysis />} />

        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
