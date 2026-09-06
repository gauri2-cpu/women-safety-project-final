/**
 * Geolocation Service
 * Browser geolocation utilities and Google Maps integration
 */

/**
 * Get current location using browser Geolocation API
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Generate Google Maps link from coordinates
 */
export const getGoogleMapsLink = (latitude, longitude) => {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
};

/**
 * Format location for display
 */
export const formatLocation = (latitude, longitude) => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Check if geolocation is available
 */
export const isGeolocationAvailable = () => {
  return 'geolocation' in navigator;
};
