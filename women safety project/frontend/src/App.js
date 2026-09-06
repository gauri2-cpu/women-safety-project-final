import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import SOSButton from './components/SOSButton';
import TrustedContacts from './components/TrustedContacts';
import HelplineNumbers from './components/HelplineNumbers';
import SelfDefense from './components/SelfDefense';
import GPSTracking from './components/GPSTracking';
import QuickExit from './components/QuickExit';
import AIChatbot from './components/AIChatbot';
import FakeCall from './components/FakeCall';
import CrimeHeatmap from './components/CrimeHeatmap';
import { getUser, removeUser } from './services/storage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      // Load contacts immediately when user is loaded
      loadContacts();
    }
  }, []);

  const loadContacts = async () => {
    try {
      const { getContacts } = await import('./services/api');
      const response = await getContacts();
      if (response.success) {
        setContacts(response.contacts);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      removeUser();
      setUser(null);
      setContacts([]);
      setActiveTab('home');
    }
  };

  const handleContactsChange = (newContacts) => {
    setContacts(newContacts);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <QuickExit />
      
      <header className="app-header">
        <h1>Women Safety App</h1>
        <div className="user-info">
          <span>👤 {user.name || 'Guest User'}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'home' ? 'active' : ''}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button
          className={activeTab === 'contacts' ? 'active' : ''}
          onClick={() => setActiveTab('contacts')}
        >
          👥 Contacts
        </button>
        <button
          className={activeTab === 'fakecall' ? 'active' : ''}
          onClick={() => setActiveTab('fakecall')}
        >
          📞 Fake Call
        </button>
        <button
          className={activeTab === 'heatmap' ? 'active' : ''}
          onClick={() => setActiveTab('heatmap')}
        >
          🗺️ Crime Map
        </button>
        <button
          className={activeTab === 'selfdefense' ? 'active' : ''}
          onClick={() => setActiveTab('selfdefense')}
        >
          🥋 Self Defense
        </button>
        <button
          className={activeTab === 'tracking' ? 'active' : ''}
          onClick={() => setActiveTab('tracking')}
        >
          📍 GPS Tracking
        </button>
        <button
          className={activeTab === 'helplines' ? 'active' : ''}
          onClick={() => setActiveTab('helplines')}
        >
          📞 Helplines
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'home' && (
          <div className="home-tab">
            <div className="welcome-section">
              <h2>Welcome, {user.name || 'Guest'}!</h2>
              <p>Your safety is our priority. Use the emergency buttons below in case of danger.</p>
            </div>
            
            <SOSButton contacts={contacts} />
            
            <div className="info-cards">
              <div className="info-card">
                <h3>📱 Trusted Contacts</h3>
                <p>{contacts.length} contact(s) added</p>
                <button onClick={() => setActiveTab('contacts')} className="btn-link">
                  Manage Contacts
                </button>
              </div>
              <div className="info-card">
                <h3>🥋 Self Defense</h3>
                <p>Learn essential safety techniques</p>
                <button onClick={() => setActiveTab('selfdefense')} className="btn-link">
                  Watch Videos
                </button>
              </div>
              <div className="info-card">
                <h3>📍 GPS Tracking</h3>
                <p>Track and share your location</p>
                <button onClick={() => setActiveTab('tracking')} className="btn-link">
                  Start Tracking
                </button>
              </div>
              <div className="info-card">
                <h3>📞 Fake Call</h3>
                <p>Escape uncomfortable situations</p>
                <button onClick={() => setActiveTab('fakecall')} className="btn-link">
                  Setup Call
                </button>
              </div>
              <div className="info-card">
                <h3>🗺️ Crime Map</h3>
                <p>View safety zones near you</p>
                <button onClick={() => setActiveTab('heatmap')} className="btn-link">
                  View Map
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <TrustedContacts onContactsChange={handleContactsChange} />
        )}

        {activeTab === 'fakecall' && (
          <FakeCall />
        )}

        {activeTab === 'heatmap' && (
          <CrimeHeatmap />
        )}

        {activeTab === 'selfdefense' && (
          <SelfDefense />
        )}

        {activeTab === 'tracking' && (
          <GPSTracking />
        )}

        {activeTab === 'helplines' && (
          <HelplineNumbers />
        )}
      </main>

      <footer className="app-footer">
        <p>Women Safety App © 2024 | Emergency: 112</p>
      </footer>

      {/* AI Chatbot - Always available */}
      <AIChatbot />
    </div>
  );
}

export default App;
