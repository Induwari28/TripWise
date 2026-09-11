import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { API_BASE_URL } from './config';
import type { Trip } from './types';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import TripDetailsPage from './pages/TripDetailsPage';
import MyTripsPage from './pages/MyTripsPage';
import WalletPage from './pages/WalletPage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';


export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE_URL}/trips/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => { setTrips(response.data); })
        .catch(error => {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem('access_token');
            setToken(null);
            setTrips([]);
            return;
          }
          console.error(error);
        });
    }
  }, [token]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/token/`, { username, password })
      .then(response => {
        const accessToken = response.data.access;
        localStorage.setItem('access_token', accessToken);
        setToken(accessToken);
      })
      .catch(() => alert("Login Failed!"));
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setTrips([]);
  };

  if (!token) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <h1>Log In to TripWise</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: '10px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px' }} />
          <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>Log In</button>
        </form>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout onLogout={handleLogout} />}>
        <Route path="/" element={<HomePage trips={trips} setTrips={setTrips} token={token} />} />
        <Route path="/trip/:id" element={<TripDetailsPage trips={trips} setTrips={setTrips} token={token} />} />
        <Route path="/my-trips" element={<MyTripsPage token={token} />} />
        <Route path="/wallet" element={<WalletPage token={token} />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage token={token} />} />
      </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}