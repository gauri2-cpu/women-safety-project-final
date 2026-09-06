import React, { useState, useRef, useEffect } from 'react';
import '../styles/AIChatbot.css';

function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m your safety assistant. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickResponses = {
    'emergency': 'In case of emergency:\n• Call 112 (National Emergency)\n• Use the SOS button on Home page\n• Share your location with trusted contacts',
    'police': 'Police helplines:\n• Emergency: 100\n• Women Helpline: 1091\n• Child Helpline: 1098',
    'safety tips': 'Safety Tips:\n• Always inform someone about your location\n• Stay in well-lit areas\n• Trust your instincts\n• Keep emergency contacts handy\n• Use the GPS tracking feature',
    'self defense': 'Self Defense:\n• Check our Self Defense section for video tutorials\n• Learn basic techniques like palm strikes and knee kicks\n• Practice situational awareness\n• Carry pepper spray if legal in your area',
    'harassment': 'If facing harassment:\n• Document everything (messages, calls, incidents)\n• Report to police (Women Helpline: 1091)\n• Inform trusted contacts\n• Use our evidence collection feature\n• Block the harasser on all platforms',
    'stalking': 'If being stalked:\n• Call police immediately: 100\n• Vary your routine and routes\n• Inform family, friends, and workplace\n• Document all incidents\n• Use GPS tracking to share location',
    'domestic violence': 'Domestic Violence Help:\n• National Commission for Women: 7827170170\n• Women Helpline: 181\n• Shelter homes available\n• Legal aid available\n• You are not alone - seek help',
    'legal help': 'Legal Assistance:\n• National Commission for Women: 011-26942369\n• Legal Services Authority: 15100\n• Free legal aid available for women\n• Document all evidence',
    'mental health': 'Mental Health Support:\n• NIMHANS Helpline: 080-46110007\n• Vandrevala Foundation: 1860-2662-345\n• iCall: 9152987821\n• Your wellbeing matters',
    'how to use': 'App Features:\n• SOS Button: Quick emergency alert\n• Contacts: Add trusted contacts\n• GPS Tracking: Share live location\n• Self Defense: Learn safety techniques\n• Helplines: Emergency numbers\n• Fake Call: Escape uncomfortable situations\n• Crime Map: View safety zones'
  };

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Check for keywords
    for (const [key, response] of Object.entries(quickResponses)) {
      if (msg.includes(key)) {
        return response;
      }
    }

    // Greetings
    if (msg.match(/^(hi|hello|hey|good morning|good evening)/)) {
      return 'Hello! I\'m here to help with safety information. You can ask me about:\n• Emergency contacts\n• Safety tips\n• Self defense\n• Legal help\n• How to use this app';
    }

    // SOS related
    if (msg.includes('sos') || msg.includes('alert')) {
      return 'To trigger SOS:\n1. Go to Home page\n2. Click the red SOS button\n3. Your location will be shared with all trusted contacts\n4. SMS and WhatsApp alerts will be sent automatically';
    }

    // Contacts
    if (msg.includes('contact') || msg.includes('add')) {
      return 'To add trusted contacts:\n1. Go to Contacts tab\n2. Click "+ Add Contact"\n3. Enter name and phone number (+919876543210)\n4. Save\n\nThese contacts will receive your SOS alerts.';
    }

    // Location
    if (msg.includes('location') || msg.includes('gps') || msg.includes('track')) {
      return 'GPS Tracking:\n1. Go to GPS Tracking tab\n2. Click "Start Tracking"\n3. Your location updates every 10 seconds\n4. Share the link with trusted contacts\n\nYour location is shared during SOS alerts automatically.';
    }

    // Default response
    return 'I can help you with:\n• Emergency procedures\n• Safety tips\n• Self defense guidance\n• Legal assistance info\n• App usage help\n• Mental health support\n\nWhat would you like to know?';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot typing
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: getBotResponse(input),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleQuickAction = (action) => {
    setInput(action);
    handleSend();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className={`chat-float-button ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Chat with Safety Assistant"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <h3>Safety Assistant</h3>
                <span className="chatbot-status">● Online</span>
              </div>
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-actions">
            <button onClick={() => handleQuickAction('emergency')}>🚨 Emergency</button>
            <button onClick={() => handleQuickAction('safety tips')}>💡 Safety Tips</button>
            <button onClick={() => handleQuickAction('how to use')}>❓ How to Use</button>
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;
