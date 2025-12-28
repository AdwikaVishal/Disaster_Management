import { useState, useEffect, useCallback } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
  } = options;

  const getCurrentPosition = useCallback((): Promise<GeolocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error: GeolocationError = {
          code: 0,
          message: 'Geolocation is not supported by this browser',
        };
        reject(error);
        return;
      }

      const positionOptions: PositionOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          };
          resolve(locationData);
        },
        (positionError) => {
          const error: GeolocationError = {
            code: positionError.code,
            message: getErrorMessage(positionError.code),
          };
          reject(error);
        },
        positionOptions
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const locationData = await getCurrentPosition();
      setLocation(locationData);
      return locationData;
    } catch (err) {
      const error = err as GeolocationError;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCurrentPosition]);

  useEffect(() => {
    if (watch) {
      getLocation();
    }
  }, [watch, getLocation]);

  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Location access denied by user';
      case 2:
        return 'Location information unavailable';
      case 3:
        return 'Location request timed out';
      default:
        return 'An unknown error occurred while retrieving location';
    }
  };

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    error,
    loading,
    getLocation,
    getCurrentPosition,
    clearLocation,
    isSupported: !!navigator.geolocation,
  };
};