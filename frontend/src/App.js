import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #dcfce7', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <p style={{ color: '#78716c', fontSize: '.9rem' }}>Loading EcoTrip…</p>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <TripProvider>
            <Navbar />
            <Dashboard />
          </TripProvider>
        </PrivateRoute>
      } />
      <Route path="/trips/:id" element={
        <PrivateRoute>
          <TripProvider>
            <Navbar />
            <TripDetail />
          </TripProvider>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
