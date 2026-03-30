import React, { useEffect } from 'react';
import AppRouter from './AppRouter';
import { connectWebSocket } from './utils/websocket';
import { useStore } from './store';
import api from './utils/api';

export default function App() {
  const login = useStore((state) => state.login);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    // ── Handle token passed from landing page via URL query param ──────────
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      // Strip token from URL without page reload
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);

      // Fetch the user profile and log them in
      api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.data.status === 'success') {
          login(res.data.data);
        }
      }).catch(console.error);
    }

    // ── Connect WebSocket if already authenticated ─────────────────────────
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      connectWebSocket(storedToken);
    }
  }, []);

  return <AppRouter />;
}
