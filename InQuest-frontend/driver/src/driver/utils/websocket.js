import { useDriverStore } from '../app/driverStore';

let socket = null;
let reconnectTimer = null;

export const connectWebSocket = (token) => {
  if (socket) return;

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  socket = new WebSocket(`${wsUrl}?token=${token}`);

  socket.onopen = () => {
    console.log('Driver connected to WebSocket');
    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleSocketMessage(message);
  };

  socket.onclose = () => {
    console.log('Driver WebSocket disconnected');
    socket = null;
    if (!reconnectTimer) {
      reconnectTimer = setInterval(() => connectWebSocket(token), 5000);
    }
  };

  socket.onerror = (error) => {
    console.error('Driver WebSocket error:', error);
  };
};

const handleSocketMessage = (message) => {
  const { type, data } = message;
  const store = useDriverStore.getState();

  switch (type) {
    case 'trip_request':
      // Show incoming request if online and not on a trip
      if (store.isOnline && !store.activeTrip) {
        store.setIncomingRequest(data);
        store.setRequestCountdown(data.timeoutSecs || 30);
      }
      break;

    case 'trip_cancelled':
      if (store.activeTrip && data.tripId === store.activeTrip.id) {
        store.setActiveTrip(null);
        store.setTripStatus(null);
        // show toast or alert in UI
      }
      break;

    case 'pong':
      break;

    default:
      console.log('Unknown driver socket message type:', type);
  }
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimer) {
    clearInterval(reconnectTimer);
    reconnectTimer = null;
  }
};

export const sendSocketMessage = (message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};

// Periodically send location if online
setInterval(() => {
  const store = useDriverStore.getState();
  if (store.isOnline && store.currentLocation && socket && socket.readyState === WebSocket.OPEN) {
    sendSocketMessage({
      type: 'location_update',
      lat: store.currentLocation.lat,
      lon: store.currentLocation.lng,
      heading: store.currentLocation.heading
    });
  }
}, 5000);
