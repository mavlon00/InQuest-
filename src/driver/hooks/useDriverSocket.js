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

    // Mock socket connection for now
    const mockSocket = {
      emit: (event, data) => console.log('Mock emit:', event, data),
      on: (event, callback) => {
        console.log('Mock on:', event);
        // We can simulate receiving events here if needed
      },
      off: (event) => console.log('Mock off:', event),
      disconnect: () => console.log('Mock disconnect')
    };

    setSocket(mockSocket);
    setIsConnected(true);

    // Simulate incoming request after 5 seconds of going online
    const timer = setTimeout(() => {
      const mockRequest = {
        tripId: 'trip_abc123',
        passenger: {
          name: 'Destiny Okafor',
          rating: 4.7,
          totalTrips: 23,
          photoUrl: null,
        },
        pickup: { lat: 6.5244, lng: 3.3792, address: '12 Admiralty Way, Lekki Phase 1' },
        destination: { lat: 6.4281, lng: 3.4219, address: 'Ikeja City Mall, Alausa' },
        stops: [],
        distanceToPickup: 0.4,  // km
        estimatedFare: 1050,
        paymentMethod: 'CASH', // Changed to CASH to test live fare
        insurance: true,
        timeoutSecs: 25,
      };
      
      setIncomingRequest(mockRequest);
      setRequestCountdown(25);
      
      // Play sound / vibrate
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }, 5000);

    // Mock event handlers (in a real app, these would be attached to the real socket)
    const handleWorkingCredited = (payload) => {
      const { tripId, amount, newBalance, tripCount, iotVerified } = payload;
      setWallets({
        ...wallets,
        working: {
          ...wallets.working,
          balance: newBalance,
          grossToday: newBalance,
          tripCount,
          lastCreditedAt: new Date().toISOString(),
          lastCreditAmount: amount,
        }
      });
      toast.success(`+NGN ${amount.toLocaleString()}`);
      // Flash glow on wallet bar would be handled by a component listening to lastCreditedAt
    };

    const handleSettlementComplete = (payload) => {
      const { gross, commission, remittance, net, newMainBalance, settledAt } = payload;
      
      // Animate working -> 0, main counts up (handled in components)
      setWallets({
        working: { ...wallets.working, balance: 0, grossToday: 0, tripCount: 0 },
        main: { ...wallets.main, balance: newMainBalance, lastSettlementDate: settledAt, lastSettlementNet: net }
      });
      
      setSettlement({
        lastSettlementDate: settledAt,
        showMorningSummary: true,
        morningSummary: { gross, commission, remittance, net, settledAt }
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Settled! NGN ${net.toLocaleString()} added to your savings.`);
    };

    const handleIotStatusUpdate = (payload) => {
      const { isConnected, batteryPercent, signalStrength, lastPingAt } = payload;
      setIotDevice({
        ...iotDevice,
        isConnected,
        batteryPercent,
        signalStrength,
        lastPingAt
      });
    };

    const handleIotTripVerified = (payload) => {
      const { tripId, verified, finalFare } = payload;
      // Update trip badge and credit working balance if fare changed
      // (Implementation depends on where trip history is stored)
    };

    const handleIotTripFlagged = (payload) => {
      const { tripId, reason } = payload;
      toast('A trip needs review — fare temporarily held.', { icon: '⚠️' });
    };

    const handleIotCashDistanceUpdate = (payload) => {
      const { tripId, distanceKm, currentFare } = payload;
      setActiveCashTrip({
        iotDistanceKm: distanceKm,
        iotCurrentFare: currentFare,
        lastIotPingAt: new Date().toISOString()
      });
    };

    // Attach handlers
    mockSocket.on('wallet:working_credited', handleWorkingCredited);
    mockSocket.on('wallet:settlement_complete', handleSettlementComplete);
    mockSocket.on('iot:status_update', handleIotStatusUpdate);
    mockSocket.on('iot:trip_verified', handleIotTripVerified);
    mockSocket.on('iot:trip_flagged', handleIotTripFlagged);
    mockSocket.on('iot:cash_distance_update', handleIotCashDistanceUpdate);

    return () => {
      clearTimeout(timer);
      mockSocket.off('wallet:working_credited');
      mockSocket.off('wallet:settlement_complete');
      mockSocket.off('iot:status_update');
      mockSocket.off('iot:trip_verified');
      mockSocket.off('iot:trip_flagged');
      mockSocket.off('iot:cash_distance_update');
      mockSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isOnline, setSocket, setIsConnected, setIncomingRequest, setRequestCountdown, wallets, setWallets, setSettlement, iotDevice, setIotDevice, setActiveCashTrip]);
}
