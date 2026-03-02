
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './src/context/AppContext';
import Home from './src/pages/Home';
import AdminDashboard from './src/pages/AdminDashboard';
import PlayerContract from './src/pages/PlayerContract';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'admin' | 'player' }) => {
  const { currentUser } = useAppContext();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  if (currentUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contract" 
        element={
          <ProtectedRoute allowedRole="player">
            <PlayerContract />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="font-sans antialiased text-white bg-agency-black min-h-screen">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
