import React, { useState, useEffect, useRef } from 'react';
import { getCurrentLocation, formatLocation } from '../services/geolocation';
import '../styles/GPSTracking.css';

function GPSTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const updateLocation = async () => {
    try {
      const newLocation = await getCurrentLocation();
      setLocation(newLocation);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      setError(err.message);
      setIsTracking(false);
    }
  };

  const startTracking = async () => {
    setIsTracking(true);
    setError('');
    
    // Get initial location
    await updateLocation();
    
    // Update every 10 seconds
    intervalRef.current = setInterval(updateLocation, 10000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getMapEmbedUrl = () => {
    if (!location) return '';
    return `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${location.latitude},${location.longitude}&zoom=15`;
  };

  const openInGoogleMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
    }
  };

  return (
    <div className="gps-tracking-container">
      <div className="gps-header">
        <h2>📍 GPS Location Tracking</h2>
        <p className="subtitle">Track your real-time location for safety</p>
      </div>

      {error && <div className="gps-error">{error}</div>}

      <div className="tracking-controls">
        {!isTracking ? (
          <button className="btn-start-tracking" onClick={startTracking}>
            🎯 Start Tracking
          </button>
        ) : (
          <button className="btn-stop-tracking" onClick={stopTracking}>
            ⏹️ Stop Tracking
          </button>
        )}
      </div>

      {isTracking && (
        <div className="tracking-status">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <span>Tracking Active</span>
          </div>
          {lastUpdate && (
            <span className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {location && (
        <>
          <div className="location-info">
            <div className="info-card">
              <div className="info-label">Latitude</div>
              <div className="info-value">{location.latitude.toFixed(6)}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Longitude</div>
              <div className="info-value">{location.longitude.toFixed(6)}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Accuracy</div>
              <div className="info-value">{Math.round(location.accuracy)}m</div>
            </div>
          </div>

          <div className="map-container">
            <div className="map-header">
              <h3>Your Current Location</h3>
              <button className="btn-open-maps" onClick={openInGoogleMaps}>
                🗺️ Open in Google Maps
              </button>
            </div>
            
            {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
              <iframe
                title="Location Map"
                src={getMapEmbedUrl()}
                className="map-iframe"
                allowFullScreen
                loading="lazy"
              ></iframe>
            ) : (
              <div className="map-placeholder">
                <p>📍 Location: {formatLocation(location.latitude, location.longitude)}</p>
                <p className="map-note">
                  Add REACT_APP_GOOGLE_MAPS_API_KEY to .env to see embedded map
                </p>
                <button className="btn-view-map" onClick={openInGoogleMaps}>
                  View on Google Maps
                </button>
              </div>
            )}
          </div>

          <div className="share-location">
            <h3>Share Your Location</h3>
            <div className="share-buttons">
              <button
                className="btn-share"
                onClick={() => {
                  const text = `My current location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                  navigator.clipboard.writeText(text);
                  alert('Location link copied to clipboard!');
                }}
              >
                📋 Copy Link
              </button>
              <button
                className="btn-share"
                onClick={() => {
                  const text = encodeURIComponent(`My current location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
              >
                💬 Share via WhatsApp
              </button>
            </div>
          </div>
        </>
      )}

      {!location && !isTracking && (
        <div className="no-location">
          <div className="no-location-icon">📍</div>
          <p>Click "Start Tracking" to begin monitoring your location</p>
          <p className="hint">Location updates every 10 seconds while tracking is active</p>
        </div>
      )}
    </div>
  );
}

export default GPSTracking;
