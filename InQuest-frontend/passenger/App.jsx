import React, { useEffect } from 'react';
import AppRouter from './AppRouter';
import { connectWebSocket } from './utils/websocket';

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      connectWebSocket(token);
    }
  }, []);

  return <AppRouter />;
}
