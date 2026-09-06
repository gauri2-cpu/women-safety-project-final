import React, { useState } from 'react';
import { getCurrentLocation, getGoogleMapsLink } from '../services/geolocation';
import '../styles/PanicButton.css';

function PanicButton({ contacts }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePanicClick = async () => {
    if (contacts.length === 0) {
      setError('Please add trusted contacts first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get current location
      const location = await getCurrentLocation();
      const mapsLink = getGoogleMapsLink(location.latitude, location.longitude);
      
      // Prepare WhatsApp message
      const message = `🚨 EMERGENCY! I need help immediately!\n\nMy current location:\n${mapsLink}\n\nPlease contact me or emergency services right away!`;
      const encodedMessage = encodeURIComponent(message);

      // Send to all contacts via WhatsApp
      contacts.forEach((contact, index) => {
        // Remove spaces and special characters from phone number
        const cleanPhone = contact.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        
        // Open WhatsApp for each contact with a slight delay
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, index * 500);
      });

    } catch (err) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panic-button-container">
      {error && <div className="panic-error">{error}</div>}
      
      <button
        className={`panic-button ${loading ? 'loading' : ''}`}
        onClick={handlePanicClick}
        disabled={loading}
      >
        <div className="panic-icon">🚨</div>
        <div className="panic-text">
          <span className="panic-title">Emergency SOS</span>
          <span className="panic-subtitle">
            {loading ? 'Getting location...' : 'Send WhatsApp Alert'}
          </span>
        </div>
      </button>
    </div>
  );
}

export default PanicButton;
