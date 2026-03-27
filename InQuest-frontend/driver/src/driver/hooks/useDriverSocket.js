import { useEffect } from 'react';
import { useDriverStore } from '../app/driverStore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export function useDriverSocket() {
  const { 
    isOnline, 
    setSocket, 
    setIsConnected, 
    setIncomingRequest, 
    setRequestCountdown,
    wallets,
    setWallets,
    setSettlement,
    iotDevice,
    setIotDevice,
    setActiveCashTrip,
  } = useDriverStore();

  useEffect(() => {
    if (!isOnline) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No token available for WebSocket connection.");
      return;
    }

    const wsUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000")
                    .replace('http:', 'ws:').replace('https:', 'wss:')
                    .replace('/api/v1', '') 
                    + '/ws?token=' + encodeURIComponent(`Bearer ${token}`);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Driver WebSocket Connected');
      setIsConnected(true);
      setSocket(ws);
      
      // We can send location updates based on Geolocation API periodically
      navigator.geolocation.getCurrentPosition((pos) => {
        ws.send(JSON.stringify({
           type: 'location_update',
           lat: pos.coords.latitude,
           lon: pos.coords.longitude
        }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("WebSocket message received:", msg);
        
        switch (msg.type) {
           case 'trip_request':
             // New ride request received
             setIncomingRequest(msg.data);
             setRequestCountdown(msg.data.timeoutSecs || 25);
             if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
             break;
           case 'wallet:working_credited':
             handleWorkingCredited(msg.data);
             break;
           case 'wallet:settlement_complete':
             handleSettlementComplete(msg.data);
             break;
           case 'iot:status_update':
             handleIotStatusUpdate(msg.data);
             break;
           case 'iot:trip_verified':
             handleIotTripVerified(msg.data);
             break;
           case 'iot:trip_flagged':
             handleIotTripFlagged(msg.data);
             break;
           case 'iot:cash_distance_update':
             handleIotCashDistanceUpdate(msg.data);
             break;
           default:
             console.log("Unknown msg type:", msg.type);
        }
      } catch (e) {
         console.error("Error parsing websocket message", e);
      }
    };

    ws.onclose = () => {
      console.log('Driver WebSocket Disconnected');
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('Driver WebSocket Error:', error);
    };

    return () => {
      // Cleanup WebSocket connection on unmount
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [isOnline, setSocket, setIsConnected, setIncomingRequest, setRequestCountdown, wallets, setWallets, setSettlement, iotDevice, setIotDevice, setActiveCashTrip]);
}
