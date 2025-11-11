import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { GOOGLE_MAPS_API_KEY } from '@/config/api';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

interface LocationContextType {
  currentLocation: Location | null;
  locationPermission: boolean | null;
  isTracking: boolean;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: (callback?: (location: Location | null, error?: any) => void) => void;
  startLocationTracking: (onLocationUpdate?: (location: Location) => void, interval?: number) => boolean;
  stopLocationTracking: () => boolean;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  calculateETA: (distance: number, averageSpeed?: number) => number;
  getAddressFromCoordinates: (latitude: number, longitude: number) => Promise<string | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<string | null>(null);

  useEffect(() => {
    checkLocationPermission();
    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, []);

  const checkLocationPermission = async () => {
    try {
      const permission = await Geolocation.checkPermissions();
      const granted = permission.location === 'granted';
      setLocationPermission(granted);
      
      if (granted) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setLocationPermission(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = await Geolocation.requestPermissions();
      const granted = permission.location === 'granted';
      setLocationPermission(granted);
      
      if (granted) {
        getCurrentLocation();
      }
      
      return granted;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const getCurrentLocation = (callback?: (location: Location | null, error?: any) => void) => {
    Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    })
      .then((position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        
        setCurrentLocation(location);
        
        if (callback) {
          callback(location);
        }
      })
      .catch((error) => {
        console.error('Location error:', error);
        if (callback) {
          callback(null, error);
        }
      });
  };

  const startLocationTracking = (onLocationUpdate?: (location: Location) => void, interval: number = 5000) => {
    if (!locationPermission) {
      console.error('Location permission not granted');
      return false;
    }

    if (isTracking) {
      console.log('Location tracking already active');
      return true;
    }

    Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      },
      (position, err) => {
        if (err) {
          console.error('Location tracking error:', err);
          return;
        }

        if (position) {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          
          setCurrentLocation(location);
          
          if (onLocationUpdate) {
            onLocationUpdate(location);
          }
        }
      }
    ).then((id) => {
      setWatchId(id);
      setIsTracking(true);
    });

    return true;
  };

  const stopLocationTracking = () => {
    if (watchId) {
      Geolocation.clearWatch({ id: watchId });
      setWatchId(null);
      setIsTracking(false);
      return true;
    }
    return false;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateETA = (distance: number, averageSpeed: number = 30) => {
    return Math.ceil((distance / averageSpeed) * 60);
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      if (!GOOGLE_MAPS_API_KEY) return null;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      locationPermission,
      isTracking,
      requestLocationPermission,
      getCurrentLocation,
      startLocationTracking,
      stopLocationTracking,
      calculateDistance,
      calculateETA,
      getAddressFromCoordinates
    }}>
      {children}
    </LocationContext.Provider>
  );
};
