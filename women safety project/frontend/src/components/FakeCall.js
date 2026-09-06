import React, { useState, useEffect, useRef } from 'react';
import '../styles/FakeCall.css';

function FakeCall() {
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerName, setCallerName] = useState('Mom');
  const [callerNumber, setCallerNumber] = useState('+91 98765 43210');
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const delayTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      stopRingtone();
    };
  }, []);

  const playRingtone = () => {
    // Create audio context for ringtone
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    
    audioRef.current = { oscillator, audioContext };
    setIsRinging(true);
  };

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.oscillator.stop();
      audioRef.current.audioContext.close();
      audioRef.current = null;
    }
    setIsRinging(false);
  };

  const startFakeCall = () => {
    if (delaySeconds > 0) {
      // Delayed call
      delayTimerRef.current = setTimeout(() => {
        initiateCall();
      }, delaySeconds * 1000);
      alert(`Fake call scheduled in ${delaySeconds} seconds!`);
    } else {
      // Immediate call
      initiateCall();
    }
  };

  const initiateCall = () => {
    setShowCallScreen(true);
    playRingtone();
    
    // Vibrate if supported
    if (navigator.vibrate) {
      const vibratePattern = [500, 200, 500, 200, 500];
      navigator.vibrate(vibratePattern);
    }
  };

  const answerCall = () => {
    stopRingtone();
    setCallDuration(0);
    
    // Start call timer
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    stopRingtone();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setShowCallScreen(false);
    setCallDuration(0);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presetContacts = [
    { name: 'Mom', number: '+91 98765 43210' },
    { name: 'Dad', number: '+91 98765 43211' },
    { name: 'Friend', number: '+91 98765 43212' },
    { name: 'Office', number: '+91 98765 43213' },
    { name: 'Doctor', number: '+91 98765 43214' }
  ];

  return (
    <div className="fake-call-container">
      {!showCallScreen ? (
        <>
          <div className="fake-call-header">
            <h2>🎭 Fake Call</h2>
            <p>Escape uncomfortable situations safely</p>
          </div>

          <div className="fake-call-setup">
            <div className="setup-section">
              <label>Caller Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="Enter caller name"
              />
            </div>

            <div className="setup-section">
              <label>Caller Number</label>
              <input
                type="tel"
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="setup-section">
              <label>Delay (seconds)</label>
              <input
                type="number"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0 for immediate"
                min="0"
              />
              <small>Set delay for scheduled call (0 = immediate)</small>
            </div>

            <div className="preset-contacts">
              <label>Quick Presets</label>
              <div className="preset-buttons">
                {presetContacts.map((contact, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCallerName(contact.name);
                      setCallerNumber(contact.number);
                    }}
                    className="preset-btn"
                  >
                    {contact.name}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startFakeCall} className="btn-start-call">
              {delaySeconds > 0 ? `Schedule Call (${delaySeconds}s)` : 'Start Fake Call Now'}
            </button>
          </div>

          <div className="fake-call-info">
            <h3>💡 How to Use</h3>
            <ul>
              <li>Set caller name and number</li>
              <li>Choose immediate or delayed call</li>
              <li>Phone will ring like a real call</li>
              <li>Answer to start fake conversation</li>
              <li>Use as excuse to leave uncomfortable situations</li>
            </ul>

            <h3>⚠️ Safety Tips</h3>
            <ul>
              <li>Keep your phone volume up</li>
              <li>Act naturally when "answering"</li>
              <li>Use realistic caller names</li>
              <li>Have a prepared excuse ready</li>
              <li>Leave the situation calmly</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="call-screen">
          <div className="call-screen-content">
            <div className="call-status">
              {callDuration === 0 ? 'Incoming Call...' : 'Call in Progress'}
            </div>

            <div className="caller-info">
              <div className="caller-avatar">
                {callerName.charAt(0).toUpperCase()}
              </div>
              <h2 className="caller-name">{callerName}</h2>
              <p className="caller-number">{callerNumber}</p>
            </div>

            {callDuration > 0 && (
              <div className="call-duration">
                {formatDuration(callDuration)}
              </div>
            )}

            <div className="call-actions">
              {callDuration === 0 ? (
                <>
                  <button onClick={answerCall} className="btn-answer">
                    <span className="btn-icon">📞</span>
                    <span>Answer</span>
                  </button>
                  <button onClick={endCall} className="btn-decline">
                    <span className="btn-icon">📵</span>
                    <span>Decline</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-mute">
                    <span className="btn-icon">🔇</span>
                    <span>Mute</span>
                  </button>
                  <button className="btn-speaker">
                    <span className="btn-icon">🔊</span>
                    <span>Speaker</span>
                  </button>
                  <button onClick={endCall} className="btn-end-call">
                    <span className="btn-icon">📵</span>
                    <span>End Call</span>
                  </button>
                </>
              )}
            </div>

            {isRinging && (
              <div className="ringing-indicator">
                <div className="ring-wave"></div>
                <div className="ring-wave"></div>
                <div className="ring-wave"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FakeCall;
