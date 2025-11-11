import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/config/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinTripRoom: (tripId: string) => void;
  leaveTripRoom: (tripId: string) => void;
  updateDriverLocation: (tripId: string, location: { latitude: number; longitude: number }) => void;
  updateTripStatus: (tripId: string, status: string, additionalData?: any) => void;
  acceptTripRequest: (tripId: string) => void;
  rejectTripRequest: (tripId: string, reason?: string) => void;
  sendMessage: (tripId: string, message: string) => void;
  onTripRequest: (callback: (data: any) => void) => (() => void) | undefined;
  onTripStatusUpdate: (callback: (data: any) => void) => (() => void) | undefined;
  onDriverLocationUpdate: (callback: (data: any) => void) => (() => void) | undefined;
  onMessageReceived: (callback: (data: any) => void) => (() => void) | undefined;
  onTripCancelled: (callback: (data: any) => void) => (() => void) | undefined;
  onDriverArrived: (callback: (data: any) => void) => (() => void) | undefined;
  onPaymentRequested: (callback: (data: any) => void) => (() => void) | undefined;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [token, user]);

  const initializeSocket = () => {
    try {
      const newSocket = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        
        if (user) {
          newSocket.emit('join-room', `user-${user.id}`);
          newSocket.emit('join-room', `${user.userType}s`);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setIsConnected(false);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Socket initialization error:', error);
      setIsConnected(false);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const joinTripRoom = (tripId: string) => {
    if (socket && isConnected) {
      socket.emit('join-room', `trip-${tripId}`);
    }
  };

  const leaveTripRoom = (tripId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-room', `trip-${tripId}`);
    }
  };

  const updateDriverLocation = (tripId: string, location: { latitude: number; longitude: number }) => {
    if (socket && isConnected) {
      socket.emit('location-update', {
        tripId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      });
    }
  };

  const updateTripStatus = (tripId: string, status: string, additionalData = {}) => {
    if (socket && isConnected) {
      socket.emit('trip-status-update', {
        tripId,
        status,
        timestamp: new Date().toISOString(),
        ...additionalData
      });
    }
  };

  const acceptTripRequest = (tripId: string) => {
    if (socket && isConnected && user) {
      socket.emit('accept-trip', { tripId, driverId: user.id });
    }
  };

  const rejectTripRequest = (tripId: string, reason = '') => {
    if (socket && isConnected && user) {
      socket.emit('reject-trip', { tripId, driverId: user.id, reason });
    }
  };

  const sendMessage = (tripId: string, message: string) => {
    if (socket && isConnected && user) {
      socket.emit('send-message', {
        tripId,
        userId: user.id,
        message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const onTripRequest = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('trip-request', callback);
      return () => socket.off('trip-request', callback);
    }
  };

  const onTripStatusUpdate = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('trip-status', callback);
      return () => socket.off('trip-status', callback);
    }
  };

  const onDriverLocationUpdate = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('driver-location', callback);
      return () => socket.off('driver-location', callback);
    }
  };

  const onMessageReceived = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('new-message', callback);
      return () => socket.off('new-message', callback);
    }
  };

  const onTripCancelled = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('trip-cancelled', callback);
      return () => socket.off('trip-cancelled', callback);
    }
  };

  const onDriverArrived = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('driver-arrived', callback);
      return () => socket.off('driver-arrived', callback);
    }
  };

  const onPaymentRequested = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('payment-request', callback);
      return () => socket.off('payment-request', callback);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinTripRoom,
      leaveTripRoom,
      updateDriverLocation,
      updateTripStatus,
      acceptTripRequest,
      rejectTripRequest,
      sendMessage,
      onTripRequest,
      onTripStatusUpdate,
      onDriverLocationUpdate,
      onMessageReceived,
      onTripCancelled,
      onDriverArrived,
      onPaymentRequested
    }}>
      {children}
    </SocketContext.Provider>
  );
};
