import { useEffect, useRef } from 'react';
import { useDriverStore } from '../app/driverStore';
import toast from 'react-hot-toast';

export function useDriverLocation() {
  const isOnline = useDriverStore(state => state.isOnline);
  const socket = useDriverStore(state => state.socket);
  const setCurrentLocation = useDriverStore(state => state.setCurrentLocation);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!isOnline) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          accuracy: position.coords.accuracy,
        };
        setCurrentLocation(loc);
        if (socket) socket.emit('driver:location_update', { ...loc, isAvailable: true });
      },
      (error) => {
        console.error('GPS error:', error);
        toast.error('Location unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isOnline, socket, setCurrentLocation]);
}
