# Frontend - Women Safety App

React.js frontend for Women Safety emergency alert system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with backend URL
nano .env

# Start development server
npm start

# Build for production
npm run build
```

App runs on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── index.js                    # React entry point
├── App.js                      # Main app component
├── components/
│   ├── Auth.js                # Login/Signup/Guest login
│   ├── SOSButton.js           # Emergency SOS button
│   ├── TrustedContacts.js     # Contacts management
│   ├── HelplineNumbers.js     # Emergency helplines
│   └── QuickExit.js           # Quick exit button
├── services/
│   ├── api.js                 # Axios API wrapper
│   ├── geolocation.js         # Browser geolocation
│   └── storage.js             # LocalStorage management
├── data/
│   └── helplines.js           # India helpline database
└── styles/
    ├── index.css              # Global styles
    ├── Auth.css               # Auth component
    ├── SOSButton.css          # SOS button styles
    ├── Contacts.css           # Contacts component
    ├── Helplines.css          # Helplines component
    └── QuickExit.css          # Quick exit button
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Backend API URL
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Google Maps (optional - for future features)
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Production Build (.env.production)

```env
# Production Backend URL
REACT_APP_API_BASE_URL=https://your-backend-api.com/api

# Production Google Maps API
REACT_APP_GOOGLE_MAPS_API_KEY=your_production_key
```

## 🎯 Features

### 1. Authentication

#### Components: `Auth.js`

**Features:**
- Email/Phone signup
- Email login
- Guest mode (no authentication required)
- Session persistence (localStorage)

```javascript
// Usage in App.js
<Auth onAuthSuccess={handleAuthSuccess} />

// User data structure
{
  id: 'uuid',
  email: 'user@example.com',
  name: 'User Name',
  phone: '+91 9876543210',
  isGuest: false
}
```

### 2. Emergency SOS Button

#### Component: `SOSButton.js`

**Features:**
- Long-press activation (1.5 seconds)
- Geolocation retrieval
- Message customization
- SMS/WhatsApp notification selection
- Contact list preview
- Visual feedback and animations

```javascript
// Usage
<SOSButton contacts={contacts} />

// On trigger:
POST /api/sos/trigger
{
  latitude: 28.7041,
  longitude: 77.1025,
  message: "Emergency alert message",
  notificationMethod: "both"  // sms, whatsapp, or both
}
```

### 3. Trusted Contacts

#### Component: `TrustedContacts.js`

**Features:**
- Add new contacts
- Edit existing contacts
- Delete contacts
- Phone number validation
- Real-time list updates
- Cache in localStorage

```javascript
// Usage
<TrustedContacts onContactsUpdated={handleContactsUpdated} />

// Contact data
{
  id: 'contact-uuid',
  name: 'Contact Name',
  phone: '+91 9876543210'
}
```

### 4. Helpline Numbers

#### Component: `HelplineNumbers.js`

**Features:**
- 10+ India-specific helplines
- Category filtering
- Direct calling (tel: protocol)
- WhatsApp messaging
- 24/7 availability info
- Emergency and specialized categories

```javascript
// Helpline data structure
{
  id: 1,
  name: 'National Women Helpline',
  number: '1800 233 1415',
  whatsapp: '+91 8376987887',
  description: 'All India Helpline for women in distress',
  hours: '24/7',
  type: 'women-safety'
}
```

### 5. Quick Exit

#### Component: `QuickExit.js`

**Features:**
- Hide app instantly
- Redirect to neutral webpage
- Non-suspicious exit
- Button in top-left corner

```javascript
// Usage
<QuickExit />

// On click: Redirects to random neutral site
// (Google, Wikipedia, Weather, News)
```

## 🔌 API Integration

### API Service (`api.js`)

Axios-based wrapper for all backend calls:

```javascript
// Import
import * as api from './services/api';

// User endpoints
api.guestLogin()
api.signup(email, name, phone)
api.login(email)
api.getUserProfile()
api.updateUserProfile(name, phone)

// Contact endpoints
api.addContact(name, phone)
api.getContacts()
api.updateContact(id, name, phone)
api.deleteContact(id)

// SOS endpoints
api.triggerSOS(lat, lon, message, method)
api.getAlerts(limit)
api.getAlertDetails(alertId)
api.resolveAlert(alertId, status)

// Utility
api.checkHealth()
```

**Features:**
- Automatic header injection (x-user-id)
- Error handling
- Timeout management (10 seconds)
- Response interceptors

## 📍 Geolocation Service

### Service: `geolocation.js`

```javascript
import * as geo from './services/geolocation';

// Get current location
const location = await geo.getCurrentLocation();
// { latitude: 28.7041, longitude: 77.1025, accuracy: 10 }

// Generate Maps link
const link = geo.generateMapsLink(28.7041, 77.1025);
// https://maps.google.com/?q=28.7041,77.1025

// Watch location (continuous tracking)
const watchId = geo.watchLocation((location) => {
  console.log('Current location:', location);
});

// Stop watching
geo.clearLocationWatch(watchId);
```

**Requirements:**
- HTTPS (required in production)
- Browser geolocation permission
- Works on mobile and desktop

## 💾 Storage Service

### Service: `storage.js`

LocalStorage wrapper for session management:

```javascript
import * as storage from './services/storage';

// Save user
storage.saveUser(userData);
storage.getStoredUser()
storage.getUserId()
storage.isGuest()
storage.clearSession()

// Cache contacts
storage.saveContacts(contactsList);
storage.getCachedContacts()
```

**Cached Data:**
- userId
- User profile
- Guest status
- Contacts list

## 🎨 Styling

### Color Scheme

```css
--primary-color: #d4145a      /* Hot pink */
--primary-dark: #a80d47       /* Dark pink */
--secondary-color: #f7931e    /* Orange */
--success-color: #4caf50      /* Green */
--danger-color: #f44336       /* Red */
--light-bg: #f5f5f5           /* Light gray */
--dark-text: #333333          /* Dark gray */
```

### Responsive Design

**Breakpoints:**
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: Below 768px

**Mobile Optimizations:**
- Touch-friendly buttons
- Readable font sizes (16px minimum)
- Full-width inputs
- Vertical stacking on mobile

## 🔒 Security Features

### Data Protection

```javascript
// User data stored in localStorage (client-side)
// Access control via x-user-id header
// HTTPS required for geolocation in production
// No sensitive data in frontend code
```

### CORS & Headers

```javascript
// API requests include user ID
headers: {
  'x-user-id': userId,
  'Content-Type': 'application/json'
}

// Backend validates all requests
```

## 🧪 Testing

### Manual Testing Checklist

```
[ ] Signup with email/name/phone
[ ] Login with email
[ ] Guest login
[ ] Add trusted contact
[ ] Edit contact
[ ] Delete contact
[ ] View helplines
[ ] Call helpline (tel: link)
[ ] WhatsApp helpline
[ ] Add contacts before SOS
[ ] Trigger SOS (hold 1.5s)
[ ] Check location sharing
[ ] View alert message
[ ] Select SMS/WhatsApp method
[ ] Resolve alert
[ ] Quick exit works
[ ] Mobile responsiveness
[ ] Error handling
```

### Test with Chrome DevTools

**Mobile Simulation:**
1. Press F12 to open DevTools
2. Click device toolbar icon
3. Select mobile device
4. Test touch interactions

**Geolocation Testing:**
1. Go to Settings in DevTools
2. Set fake location
3. Test SOS with different coordinates

## 🚀 Building for Production

```bash
# Create optimized build
npm run build

# Build folder contains:
# - Minified JS/CSS
# - Optimized images
# - Source maps (for debugging)

# Serve locally
npx serve -s build

# Deploy to Vercel/Render
# (See DEPLOYMENT.md for details)
```

### Build Optimization

```javascript
// React automatically does:
// - Code splitting
// - Tree shaking
// - Minification
// - CSS optimization

// For better performance:
npm install --save lodash-es  // Import only needed functions
npm install --save-dev terser   // JS minifier
```

## 🐛 Debugging

### Enable Detailed Logging

Edit `App.js`:

```javascript
// Log all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args[0], args[1]);
  return originalFetch.apply(this, args);
};
```

### Browser Console Tips

```javascript
// Check localStorage
localStorage.getItem('userId')
JSON.parse(localStorage.getItem('user'))

// Check API responses
await fetch('/api/contacts').then(r => r.json())

// Test geolocation
navigator.geolocation.getCurrentPosition(pos => console.log(pos))
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to backend" | Check REACT_APP_API_BASE_URL in .env |
| "Geolocation not working" | Enable HTTPS, check permissions |
| "Blank screen" | Check browser console for errors |
| "Contacts not loading" | Verify backend is running |
| "SMS not sent" | Check backend logs, Twilio credentials |

## 📦 Dependencies

```json
{
  "react": "^18.2.0",           // React library
  "react-dom": "^18.2.0",       // React DOM rendering
  "react-router-dom": "^6.20.0",// Routing (optional)
  "axios": "^1.6.2",            // HTTP client
  "react-scripts": "5.0.1"      // Build tool
}
```

## 🔄 State Management

### App.js (Main State)

```javascript
const [user, setUser] = useState(null);          // Logged-in user
const [contacts, setContacts] = useState([]);    // Trusted contacts
const [loading, setLoading] = useState(true);    // Loading state
const [serverHealth, setServerHealth] = useState('checking');
```

### Component State

**TrustedContacts.js:**
```javascript
const [contacts, setContacts] = useState([]);
const [showAddForm, setShowAddForm] = useState(false);
const [formData, setFormData] = useState({ name: '', phone: '' });
```

**SOSButton.js:**
```javascript
const [location, setLocation] = useState(null);
const [loading, setLoading] = useState(false);
const [showModal, setShowModal] = useState(false);
const [sosTriggered, setSosTriggered] = useState(false);
```

## 🔗 Related Files

- [Backend README](../backend/README.md)
- [Main README](../README.md)
- [Deployment Guide](../DEPLOYMENT.md)

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Axios Documentation](https://axios-http.com/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Version**: 1.0.0  
**React Version**: 18.2.0  
**Last Updated**: December 14, 2024
