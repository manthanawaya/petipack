import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import ShopkeeperDashboard from './components/ShopkeeperDashboard/Dashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={!user ? <Auth onLogin={setUser} /> : (user.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} 
        />
        <Route 
          path="/dashboard/*" 
          element={user && !user.isAdmin ? <ShopkeeperDashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/*" 
          element={user && user.isAdmin ? <AdminDashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
