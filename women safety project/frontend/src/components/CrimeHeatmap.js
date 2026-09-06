import React, { useState, useEffect } from 'react';
import '../styles/CrimeHeatmap.css';

function CrimeHeatmap() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [filter, setFilter] = useState('all');

  // Sample crime data (in production, this would come from a real API)
  const crimeData = [
    { id: 1, lat: 28.7041, lng: 77.1025, type: 'harassment', severity: 'high', area: 'Connaught Place', incidents: 15, description: 'High harassment reports' },
    { id: 2, lat: 28.6139, lng: 77.2090, type: 'theft', severity: 'medium', area: 'Nehru Place', incidents: 8, description: 'Moderate theft cases' },
    { id: 3, lat: 28.5355, lng: 77.3910, type: 'assault', severity: 'high', area: 'Noida Sector 18', incidents: 12, description: 'High assault reports' },
    { id: 4, lat: 28.4595, lng: 77.0266, type: 'stalking', severity: 'medium', area: 'Gurgaon Cyber City', incidents: 6, description: 'Stalking incidents' },
    { id: 5, lat: 28.6692, lng: 77.4538, type: 'harassment', severity: 'low', area: 'Ghaziabad', incidents: 3, description: 'Low harassment reports' },
    { id: 6, lat: 28.7196, lng: 77.0369, type: 'theft', severity: 'high', area: 'Rohini', incidents: 14, description: 'High theft cases' },
    { id: 7, lat: 28.5494, lng: 77.2501, type: 'assault', severity: 'medium', area: 'Saket', incidents: 7, description: 'Moderate assault cases' },
    { id: 8, lat: 28.6517, lng: 77.2219, type: 'harassment', severity: 'low', area: 'Karol Bagh', incidents: 4, description: 'Low harassment reports' }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Delhi center
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#888';
    }
  };

  const getCrimeIcon = (type) => {
    switch (type) {
      case 'harassment': return '⚠️';
      case 'theft': return '💰';
      case 'assault': return '🚨';
      case 'stalking': return '👁️';
      default: return '📍';
    }
  };

  const filteredData = filter === 'all' 
    ? crimeData 
    : crimeData.filter(crime => crime.type === filter);

  const getSafetyScore = (incidents) => {
    if (incidents >= 10) return { score: 'Unsafe', color: '#ff4444', percentage: 30 };
    if (incidents >= 5) return { score: 'Moderate', color: '#ffaa00', percentage: 60 };
    return { score: 'Safe', color: '#44ff44', percentage: 90 };
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2>🗺️ Crime Heatmap</h2>
        <p>View safety zones and crime statistics in your area</p>
      </div>

      <div className="heatmap-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Crimes
        </button>
        <button 
          className={filter === 'harassment' ? 'active' : ''}
          onClick={() => setFilter('harassment')}
        >
          ⚠️ Harassment
        </button>
        <button 
          className={filter === 'theft' ? 'active' : ''}
          onClick={() => setFilter('theft')}
        >
          💰 Theft
        </button>
        <button 
          className={filter === 'assault' ? 'active' : ''}
          onClick={() => setFilter('assault')}
        >
          🚨 Assault
        </button>
        <button 
          className={filter === 'stalking' ? 'active' : ''}
          onClick={() => setFilter('stalking')}
        >
          👁️ Stalking
        </button>
      </div>

      <div className="heatmap-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ff4444' }}></span>
          <span>High Risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ffaa00' }}></span>
          <span>Medium Risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#44ff44' }}></span>
          <span>Low Risk</span>
        </div>
      </div>

      <div className="heatmap-map">
        <div className="map-placeholder">
          {userLocation && (
            <div className="user-marker" title="Your Location">
              📍 You
            </div>
          )}
          
          {filteredData.map((crime) => (
            <div
              key={crime.id}
              className="crime-marker"
              style={{
                background: getSeverityColor(crime.severity),
                left: `${(crime.lng - 77) * 100 + 20}%`,
                top: `${(28.8 - crime.lat) * 100 + 20}%`
              }}
              onClick={() => setSelectedArea(crime)}
              title={crime.area}
            >
              {getCrimeIcon(crime.type)}
            </div>
          ))}
        </div>
      </div>

      {selectedArea && (
        <div className="area-details">
          <div className="area-details-header">
            <h3>{selectedArea.area}</h3>
            <button onClick={() => setSelectedArea(null)}>✕</button>
          </div>
          
          <div className="area-stats">
            <div className="stat-item">
              <span className="stat-label">Crime Type</span>
              <span className="stat-value">
                {getCrimeIcon(selectedArea.type)} {selectedArea.type.charAt(0).toUpperCase() + selectedArea.type.slice(1)}
              </span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Total Incidents</span>
              <span className="stat-value">{selectedArea.incidents}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Risk Level</span>
              <span 
                className="stat-value"
                style={{ color: getSeverityColor(selectedArea.severity) }}
              >
                {selectedArea.severity.toUpperCase()}
              </span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Safety Score</span>
              <div className="safety-score">
                <div className="safety-bar">
                  <div 
                    className="safety-fill"
                    style={{ 
                      width: `${getSafetyScore(selectedArea.incidents).percentage}%`,
                      background: getSafetyScore(selectedArea.incidents).color
                    }}
                  ></div>
                </div>
                <span style={{ color: getSafetyScore(selectedArea.incidents).color }}>
                  {getSafetyScore(selectedArea.incidents).score}
                </span>
              </div>
            </div>
          </div>

          <p className="area-description">{selectedArea.description}</p>

          <div className="area-actions">
            <button 
              onClick={() => window.open(`https://www.google.com/maps?q=${selectedArea.lat},${selectedArea.lng}`, '_blank')}
              className="btn-view-map"
            >
              View on Google Maps
            </button>
          </div>
        </div>
      )}

      <div className="heatmap-stats">
        <h3>📊 Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{crimeData.length}</div>
            <div className="stat-label">Total Areas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{crimeData.filter(c => c.severity === 'high').length}</div>
            <div className="stat-label">High Risk Zones</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{crimeData.reduce((sum, c) => sum + c.incidents, 0)}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>
      </div>

      <div className="heatmap-tips">
        <h3>💡 Safety Tips</h3>
        <ul>
          <li>Avoid high-risk areas, especially at night</li>
          <li>Stay in well-lit, populated areas</li>
          <li>Share your location with trusted contacts</li>
          <li>Use GPS tracking when traveling through risky zones</li>
          <li>Report any suspicious activity to authorities</li>
          <li>Trust your instincts - if something feels wrong, leave</li>
        </ul>
      </div>
    </div>
  );
}

export default CrimeHeatmap;
