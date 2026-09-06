import React, { useState, useRef, useEffect } from 'react';
import { triggerSOS, prepareWhatsAppBroadcast, logWhatsAppBroadcast } from '../services/api';
import { getCurrentLocation } from '../services/geolocation';
import { broadcastToContacts } from '../services/whatsappBroadcast';
import BroadcastProgressModal from './BroadcastProgressModal';
import '../styles/SOSButton.css';

function SOSButton({ contacts }) {
  const [isPressed, setIsPressed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [notificationMethod, setNotificationMethod] = useState('both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQuickAlert, setShowQuickAlert] = useState(false);
  
  // Broadcast progress state
  const [broadcastProgress, setBroadcastProgress] = useState({
    isOpen: false,
    status: 'idle', // 'idle' | 'detecting-location' | 'broadcasting' | 'complete' | 'error'
    current: 0,
    total: 0,
    errorMessage: ''
  });
  
  const pressTimer = useRef(null);
  const pressStartTime = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const broadcastCancelledRef = useRef(false);

  // Initialize audio context
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  // Start panic alarm sound
  const startAlarm = () => {
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Create oscillator for siren sound
      oscillatorRef.current = audioContext.createOscillator();
      gainNodeRef.current = audioContext.createGain();
      
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContext.destination);
      
      // Set initial frequency and volume
      oscillatorRef.current.frequency.value = 800;
      gainNodeRef.current.gain.value = 0.5;
      
      // Create siren effect (alternating frequency)
      oscillatorRef.current.frequency.setValueAtTime(800, audioContext.currentTime);
      
      // Alternate between high and low pitch
      let time = audioContext.currentTime;
      for (let i = 0; i < 20; i++) {
        oscillatorRef.current.frequency.setValueAtTime(800, time);
        oscillatorRef.current.frequency.setValueAtTime(400, time + 0.25);
        time += 0.5;
      }
      
      oscillatorRef.current.start();
    } catch (err) {
      console.error('Failed to start alarm:', err);
    }
  };

  // Stop panic alarm
  const stopAlarm = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch (err) {
      console.error('Failed to stop alarm:', err);
    }
  };

  const handlePressStart = () => {
    console.log('🖱️ Button pressed');
    pressStartTime.current = Date.now();
    setIsPressed(true);
    
    pressTimer.current = setTimeout(() => {
      console.log('⏰ 1.5s elapsed - opening options modal');
      // After 1.5s, show options modal
      setShowModal(true);
      setIsPressed(false);
    }, 1500);
  };

  const handlePressEnd = () => {
    console.log('🖱️ Button released');
    
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    
    const pressDuration = Date.now() - pressStartTime.current;
    console.log(`⏱️ Press duration: ${pressDuration}ms`);
    
    // If released before 1.5s, trigger quick alert
    if (pressDuration < 1500) {
      console.log('⚡ Quick click detected - triggering quick alert');
      setIsPressed(false);
      handleQuickAlert();
    } else {
      console.log('⏳ Long press detected - modal should open');
    }
  };

  // Quick alert (instant WhatsApp + SMS without modal)
  const handleQuickAlert = async () => {
    console.log('🚨 Quick Alert triggered');
    console.log('Contacts:', contacts);
    
    if (contacts.length === 0) {
      setError('Please add trusted contacts first');
      setTimeout(() => setError(''), 3000);
      alert('Please add trusted contacts first in the Contacts tab');
      return;
    }

    // Start WhatsApp broadcast flow
    await handleWhatsAppBroadcast();
  };

  // WhatsApp broadcast handler
  const handleWhatsAppBroadcast = async () => {
    console.log('📱 Starting WhatsApp broadcast...');
    
    // Reset cancellation flag
    broadcastCancelledRef.current = false;
    
    // Show progress modal - detecting location
    setBroadcastProgress({
      isOpen: true,
      status: 'detecting-location',
      current: 0,
      total: contacts.length,
      errorMessage: ''
    });
    
    startAlarm();
    
    let locationData = null;
    let alertId = null;
    
    try {
      // Step 1: Detect location with 10-second timeout
      console.log('📍 Detecting location...');
      try {
        locationData = await Promise.race([
          getCurrentLocation(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location detection timeout')), 10000)
          )
        ]);
        console.log('✅ Location detected:', locationData);
      } catch (locationError) {
        console.warn('⚠️ Location detection failed:', locationError.message);
        // Continue with null location - will use fallback message
        locationData = null;
      }
      
      // Check if cancelled
      if (broadcastCancelledRef.current) {
        console.log('❌ Broadcast cancelled by user');
        stopAlarm();
        return;
      }
      
      // Step 2: Prepare broadcast - get contacts and message from backend
      console.log('🔧 Preparing broadcast...');
      const prepareResponse = await prepareWhatsAppBroadcast({
        latitude: locationData?.latitude || null,
        longitude: locationData?.longitude || null,
        message: '' // Use default message
      });
      
      if (!prepareResponse.success) {
        throw new Error(prepareResponse.message || 'Failed to prepare broadcast');
      }
      
      alertId = prepareResponse.alertId;
      const validContacts = prepareResponse.contacts || [];
      const formattedMessage = prepareResponse.formattedMessage;
      
      console.log(`✅ Broadcast prepared: ${validContacts.length} valid contacts`);
      
      if (validContacts.length === 0) {
        throw new Error('No valid contacts found for broadcast');
      }
      
      // Check if cancelled
      if (broadcastCancelledRef.current) {
        console.log('❌ Broadcast cancelled by user');
        stopAlarm();
        return;
      }
      
      // Step 3: Update progress to broadcasting
      setBroadcastProgress(prev => ({
        ...prev,
        status: 'broadcasting',
        total: validContacts.length
      }));
      
      // Step 4: Execute sequential broadcast
      console.log('📤 Starting sequential broadcast...');
      const phoneNumbers = validContacts.map(c => c.phone);
      
      const broadcastResults = await broadcastToContacts(
        phoneNumbers,
        formattedMessage,
        {
          onProgress: (current, total) => {
            console.log(`📊 Progress: ${current}/${total}`);
            if (!broadcastCancelledRef.current) {
              setBroadcastProgress(prev => ({
                ...prev,
                current,
                total
              }));
            }
          },
          onComplete: (results) => {
            console.log('✅ Broadcast complete:', results);
          },
          onError: (error, index) => {
            console.error(`❌ Error at contact ${index}:`, error.message);
          }
        }
      );
      
      // Check if cancelled
      if (broadcastCancelledRef.current) {
        console.log('❌ Broadcast cancelled by user');
        stopAlarm();
        return;
      }
      
      // Step 5: Log broadcast results
      console.log('📝 Logging broadcast results...');
      await logWhatsAppBroadcast({
        alertId,
        contactsAttempted: validContacts.length,
        contactsSuccessful: broadcastResults.successful,
        errors: broadcastResults.errors.map(e => e.error)
      });
      
      // Step 6: Trigger SMS fallback via existing endpoint
      console.log('📡 Triggering SMS fallback...');
      try {
        await triggerSOS({
          latitude: locationData?.latitude || null,
          longitude: locationData?.longitude || null,
          message: formattedMessage,
          notificationMethod: 'sms' // SMS only as fallback
        });
        console.log('✅ SMS fallback sent');
      } catch (smsError) {
        console.error('⚠️ SMS fallback failed:', smsError.message);
        // Don't fail the whole broadcast if SMS fails
      }
      
      // Step 7: Show success
      setBroadcastProgress({
        isOpen: true,
        status: 'complete',
        current: validContacts.length,
        total: validContacts.length,
        errorMessage: ''
      });
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setBroadcastProgress(prev => ({ ...prev, isOpen: false }));
        stopAlarm();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Broadcast error:', error);
      
      // Show error state
      setBroadcastProgress({
        isOpen: true,
        status: 'error',
        current: 0,
        total: contacts.length,
        errorMessage: error.message || 'Failed to send broadcast'
      });
      
      // Try SMS fallback on error
      try {
        console.log('📡 Attempting SMS fallback after error...');
        await triggerSOS({
          latitude: locationData?.latitude || null,
          longitude: locationData?.longitude || null,
          message: 'Emergency! I need help immediately!',
          notificationMethod: 'sms'
        });
        console.log('✅ SMS fallback sent after error');
      } catch (smsError) {
        console.error('⚠️ SMS fallback also failed:', smsError.message);
      }
      
      stopAlarm();
    }
  };
  
  // Handle broadcast cancellation
  const handleBroadcastCancel = () => {
    console.log('🛑 Cancelling broadcast...');
    broadcastCancelledRef.current = true;
    setBroadcastProgress(prev => ({ ...prev, isOpen: false }));
    stopAlarm();
  };
  
  // Handle broadcast modal close
  const handleBroadcastClose = () => {
    setBroadcastProgress(prev => ({ ...prev, isOpen: false }));
    stopAlarm();
  };

  const closeQuickAlert = () => {
    setShowQuickAlert(false);
    stopAlarm();
  };

  const handleSendSOS = async () => {
    if (contacts.length === 0) {
      setError('Please add trusted contacts first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    startAlarm();

    try {
      const locationData = await getCurrentLocation();

      const response = await triggerSOS({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        message: message || 'Emergency! I need help immediately!',
        notificationMethod
      });

      if (response.success) {
        setSuccess(`SOS alert sent to ${response.contactsNotified} contact(s)`);
        setTimeout(() => {
          setShowModal(false);
          setMessage('');
          setSuccess('');
          stopAlarm();
        }, 3000);
      } else {
        setError(response.message || 'Failed to send SOS');
        stopAlarm();
      }
    } catch (err) {
      setError(err.message || 'Failed to send SOS alert');
      stopAlarm();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setMessage('');
    setError('');
    setSuccess('');
    stopAlarm();
  };

  return (
    <>
      <div className="sos-container">
        <div className="sos-info-text">
          <p className="sos-hint">Click for instant alert • Hold 1.5s for options</p>
        </div>
        
        <button
          className={`sos-button unified ${isPressed ? 'pressed' : ''}`}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          <span className="sos-icon">🚨</span>
          <span className="sos-text">SOS</span>
          <span className="sos-instruction">Emergency Alert</span>
        </button>
        
        {isPressed && (
          <div className="press-indicator">
            <div className="press-progress"></div>
            <span className="press-hint">Keep holding for options...</span>
          </div>
        )}
      </div>

      {/* Broadcast Progress Modal */}
      <BroadcastProgressModal
        isOpen={broadcastProgress.isOpen}
        status={broadcastProgress.status}
        current={broadcastProgress.current}
        total={broadcastProgress.total}
        onCancel={handleBroadcastCancel}
        onClose={handleBroadcastClose}
        errorMessage={broadcastProgress.errorMessage}
      />

      {/* Quick Alert Modal (Legacy - kept for reference) */}
      {showQuickAlert && (
        <div className="sos-modal-overlay">
          <div className="sos-modal quick-alert-modal">
            <h2>🚨 Emergency Alert Sent!</h2>
            
            <div className="alarm-indicator">
              <div className="alarm-wave"></div>
              <div className="alarm-icon">🔊</div>
              <p>Panic alarm is active</p>
            </div>

            <div className="alert-info">
              <p>✅ SMS messages sent to all contacts</p>
              <p>✅ WhatsApp messages sent to all contacts</p>
              <p>✅ Location shared via Google Maps</p>
              <p>✅ Backend alert triggered</p>
            </div>

            <button onClick={closeQuickAlert} className="btn-stop-alarm">
              Stop Alarm & Close
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="sos-modal-overlay">
          <div className="sos-modal">
            <h2>⚠️ Emergency Alert</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {!success && (
              <>
                <p className="modal-info">
                  Your location will be shared with {contacts.length} trusted contact(s)
                </p>

                <textarea
                  placeholder="Optional message (e.g., I'm in danger, please help)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  disabled={loading}
                />

                <div className="notification-options">
                  <label>Send via:</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        value="sms"
                        checked={notificationMethod === 'sms'}
                        onChange={(e) => setNotificationMethod(e.target.value)}
                        disabled={loading}
                      />
                      SMS
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="whatsapp"
                        checked={notificationMethod === 'whatsapp'}
                        onChange={(e) => setNotificationMethod(e.target.value)}
                        disabled={loading}
                      />
                      WhatsApp
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="both"
                        checked={notificationMethod === 'both'}
                        onChange={(e) => setNotificationMethod(e.target.value)}
                        disabled={loading}
                      />
                      Both
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    onClick={handleSendSOS}
                    className="btn-send-sos"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send SOS Alert'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-cancel"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SOSButton;
