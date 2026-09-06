# Women Safety Website - Complete Project

A comprehensive emergency alert system for women's safety featuring:
- Emergency SOS button with location sharing
- Trusted contacts management
- SMS/WhatsApp notifications via Twilio
- India-focused emergency helpline database
- User authentication (Email/Phone signup + Guest login)
- Responsive mobile-first design

## 📁 Project Structure

```
women-safety-project/
│
├── backend/                           # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js                 # Main server entry point
│   │   ├── config/
│   │   │   ├── database.js           # JSON file storage config
│   │   │   └── twilio.js             # SMS/WhatsApp service
│   │   ├── controllers/
│   │   │   ├── userController.js     # User auth logic
│   │   │   ├── contactController.js  # Contacts CRUD
│   │   │   └── sosController.js      # SOS alert logic
│   │   ├── models/
│   │   │   ├── userModel.js          # User data operations
│   │   │   ├── contactModel.js       # Contact data operations
│   │   │   └── alertModel.js         # Alert logging
│   │   ├── middleware/
│   │   │   └── auth.js               # Authentication middleware
│   │   └── routes/
│   │       ├── userRoutes.js         # User endpoints
│   │       ├── contactRoutes.js      # Contact endpoints
│   │       ├── sosRoutes.js          # SOS endpoints
│   │       └── healthRoutes.js       # Health check endpoints
│   ├── data/                          # JSON data storage
│   │   ├── users.json                # User records
│   │   ├── contacts.json             # Trusted contacts
│   │   └── alerts.json               # Alert logs
│   ├── package.json                  # Dependencies
│   ├── .env.example                  # Environment variables template
│   └── README.md                      # Backend setup guide
│
├── frontend/                          # React Frontend
│   ├── public/
│   │   └── index.html                # HTML template
│   ├── src/
│   │   ├── index.js                  # React entry point
│   │   ├── App.js                    # Main app component
│   │   ├── components/
│   │   │   ├── Auth.js               # Login/Signup component
│   │   │   ├── SOSButton.js          # Emergency SOS button
│   │   │   ├── TrustedContacts.js    # Contacts management
│   │   │   ├── HelplineNumbers.js    # Helplines display
│   │   │   └── QuickExit.js          # Quick exit button
│   │   ├── services/
│   │   │   ├── api.js                # API calls (axios)
│   │   │   ├── geolocation.js        # Location services
│   │   │   └── storage.js            # LocalStorage management
│   │   ├── data/
│   │   │   └── helplines.js          # India helpline database
│   │   └── styles/
│   │       ├── index.css             # Global styles
│   │       ├── Auth.css              # Auth component styles
│   │       ├── SOSButton.css         # SOS button styles
│   │       ├── Contacts.css          # Contacts component styles
│   │       ├── Helplines.css         # Helplines component styles
│   │       └── QuickExit.css         # Exit button styles
│   ├── package.json                  # Dependencies
│   ├── .env.example                  # Environment variables template
│   └── README.md                      # Frontend setup guide
│
├── DEPLOYMENT.md                      # Deployment instructions
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Git

### Backend Setup (5 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Twilio credentials
# TWILIO_ACCOUNT_SID=your_sid
# TWILIO_AUTH_TOKEN=your_token
# TWILIO_PHONE_NUMBER=+your_number

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup (5 minutes)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend URL
# REACT_APP_API_BASE_URL=http://localhost:5000/api

# Start React development server
npm start
# App opens on http://localhost:3000
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Server Config
PORT=5000
NODE_ENV=development

# Twilio SMS/WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google Maps API
GOOGLE_MAPS_API_KEY=your_api_key
```

### Frontend Environment Variables (.env)

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Google Maps (optional - for future map embedding)
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
```

## 📱 API Endpoints

### User Authentication
- `POST /api/users/guest-login` - Guest login
- `POST /api/users/signup` - User signup
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Trusted Contacts
- `POST /api/contacts` - Add contact
- `GET /api/contacts` - Get all contacts
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### SOS Alerts
- `POST /api/sos/trigger` - Trigger SOS alert
- `GET /api/sos/alerts` - Get alert history
- `GET /api/sos/alerts/:id` - Get alert details
- `PUT /api/sos/alerts/:id/resolve` - Resolve alert

### Health Check
- `GET /api/health` - Server health status

## 🧪 Testing SOS Alerts Locally

### Option 1: Use Twilio Test SMS (No Real SMS Sent)
1. Get a Twilio test number from Twilio Console
2. In your .env, use test credentials
3. Send to Twilio test phone numbers

### Option 2: Use Real Twilio Account
1. Sign up at [Twilio](https://www.twilio.com)
2. Get your Account SID, Auth Token, and phone number
3. Upgrade account to send real SMS
4. Add contacts with valid phone numbers
5. Trigger SOS to send real SMS/WhatsApp

### Option 3: Use Mock Service (Development Only)
Edit `sosController.js` and replace:
```javascript
// Replace real Twilio calls with mock
async function mockSendSMS(phone, message) {
  console.log(`[MOCK SMS] To: ${phone} - ${message}`);
  return { success: true };
}
```

### Step-by-Step Test
1. **Create User Account**
   - Sign up with email, name, phone

2. **Add Trusted Contacts**
   - Add contact name and phone number
   - Format: +[country code][number] (e.g., +91 9876543210)

3. **Trigger SOS**
   - Hold SOS button for 1.5 seconds
   - Add optional message
   - Select notification method (SMS/WhatsApp/Both)
   - Confirm alert

4. **Check Backend Logs**
   - Backend console shows alert triggered
   - Twilio/SMS messages logged
   - Check alert in history

## 🌐 Features Overview

### 1. Emergency SOS Button
- **Long-press activation** (1.5 seconds) to prevent accidental triggers
- **Location detection** using browser geolocation API
- **Contact notification** via SMS/WhatsApp
- **Google Maps link** sharing for precise location

### 2. Trusted Contacts
- **Add/Edit/Delete** contacts
- **Store locally** in browser and backend
- **Validate phone numbers** (international format support)

### 3. Emergency Helplines
- **10+ India-specific helplines**
- **Categories**: Emergency, Women Safety, Mental Health
- **Call or WhatsApp** directly from app
- **24/7 availability** information

### 4. Authentication
- **Email/Phone signup** with validation
- **Guest mode** for quick access
- **Session management** with localStorage

### 5. Security Features
- **Quick Exit button** to hide app instantly
- **HTTPS support** for deployment
- **Data validation** on frontend and backend
- **CORS protection** for API

## 🎨 UI/UX Features

- **Mobile-first responsive design**
- **Dark mode support** (can be added)
- **Accessible colors** for visibility
- **Large touch targets** for mobile users
- **Clear visual feedback** for actions
- **Error messages** for failed operations
- **Loading states** for async operations

## 📊 Data Models

### User
```json
{
  "id": "uuid",
  "email": "user@email.com",
  "name": "User Name",
  "phone": "+91 9876543210",
  "isGuest": false,
  "createdAt": "2024-12-14T10:00:00Z"
}
```

### Contact
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Contact Name",
  "phone": "+91 9876543210",
  "createdAt": "2024-12-14T10:00:00Z"
}
```

### Alert
```json
{
  "id": "uuid",
  "userId": "uuid",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "message": "Help needed",
  "contactsNotified": ["contact1", "contact2"],
  "status": "active",
  "timestamp": "2024-12-14T10:00:00Z"
}
```

## 🚨 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Use different port
PORT=5001 npm run dev
```

### Twilio SMS Not Sending
1. Check Twilio credentials in .env
2. Verify phone number format (+country_code number)
3. Ensure Twilio account is upgraded (trial accounts have restrictions)
4. Check Twilio Console for error messages

### Frontend Can't Connect to Backend
1. Verify backend is running on port 5000
2. Check CORS configuration in server.js
3. Ensure `REACT_APP_API_BASE_URL` points to correct backend URL
4. Check browser console for error messages

### Location Not Working
1. Enable location in browser permissions
2. Use HTTPS (required for production)
3. Check browser console for geolocation errors
4. Try incognito mode (private window)

## 📚 Additional Resources

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Google Maps Embed](https://developers.google.com/maps)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)

## 📝 License

This project is provided for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve this project for your needs.

## ⚠️ Disclaimer

This is a college project for educational purposes. Ensure all necessary permissions and consents are in place before collecting user location data or sending messages.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response messages
3. Check browser and backend console logs
4. Refer to documentation of used libraries

---

**Last Updated**: December 14, 2024
**Version**: 1.0.0
