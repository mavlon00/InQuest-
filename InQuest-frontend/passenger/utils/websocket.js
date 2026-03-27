import { useBookingStore } from '../store/bookingStore';

let socket = null;
let reconnectTimer = null;

export const connectWebSocket = (token) => {
  if (socket) return;

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  socket = new WebSocket(`${wsUrl}?token=${token}`);

  socket.onopen = () => {
    console.log('Connected to WebSocket');
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
    console.log('WebSocket disconnected');
    socket = null;
    // Attempt reconnect every 5 seconds
    if (!reconnectTimer) {
      reconnectTimer = setInterval(() => connectWebSocket(token), 5000);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

const handleSocketMessage = (message) => {
  const { type, data } = message;
  const store = useBookingStore.getState();

  switch (type) {
    case 'trip_accepted':
      store.setBooking(data.tripId, 'ACCEPTED');
      store.setActiveDriver(data.driver);
      store.setETA(data.eta);
      break;

    case 'ride_status_update':
      if (data.rideId === store.bookingId) {
        store.updateBookingStatus(data.status);
      }
      break;

    case 'driver_location':
      if (data.tripId === store.bookingId) {
        store.setDriverLocation({
          lat: data.lat,
          lng: data.lng,
          heading: data.heading
        });
      }
      break;

    case 'pong':
      // Heartbeat
      break;

    default:
      console.log('Unknown socket message type:', type);
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
