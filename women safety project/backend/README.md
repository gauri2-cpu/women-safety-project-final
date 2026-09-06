# Backend - Women Safety API

Node.js + Express backend for Women Safety emergency alert system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Twilio credentials
nano .env

# Start development server
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── server.js              # Main application entry point
├── config/
│   ├── database.js        # JSON file-based storage
│   └── twilio.js          # Twilio SMS/WhatsApp service
├── controllers/
│   ├── userController.js  # User auth and profile
│   ├── contactController.js # Trusted contacts CRUD
│   └── sosController.js   # SOS alert handling
├── models/
│   ├── userModel.js       # User data operations
│   ├── contactModel.js    # Contact data operations
│   └── alertModel.js      # Alert logging and retrieval
├── middleware/
│   └── auth.js            # Authentication middleware
└── routes/
    ├── userRoutes.js      # User endpoints
    ├── contactRoutes.js   # Contact endpoints
    ├── sosRoutes.js       # SOS alert endpoints
    └── healthRoutes.js    # Health check endpoints
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Twilio API Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Getting Twilio Credentials

1. **Sign up at [Twilio.com](https://www.twilio.com)**
2. **Get Account SID** and **Auth Token** from Dashboard
3. **Get Phone Number** from Twilio Console
4. **Enable WhatsApp** (in Twilio Sandbox)
5. **Add to `.env`**

## 📡 API Endpoints

### User Management

#### Guest Login
```http
POST /api/users/guest-login
Content-Type: application/json

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "isGuest": true,
    "createdAt": "2024-12-14T10:00:00Z"
  },
  "token": "uuid"
}
```

#### User Signup
```http
POST /api/users/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "phone": "+91 9876543210"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+91 9876543210",
    "isGuest": false,
    "createdAt": "2024-12-14T10:00:00Z"
  },
  "token": "uuid"
}
```

#### User Login
```http
POST /api/users/login
Content-Type: application/json
x-user-id: user-uuid

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "user": { ... },
  "token": "uuid"
}
```

#### Get Profile
```http
GET /api/users/profile
x-user-id: user-uuid

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Update Profile
```http
PUT /api/users/profile
x-user-id: user-uuid
Content-Type: application/json

{
  "name": "New Name",
  "phone": "+91 9876543210"
}
```

### Trusted Contacts

#### Add Contact
```http
POST /api/contacts
x-user-id: user-uuid
Content-Type: application/json

{
  "name": "Contact Name",
  "phone": "+91 9876543210"
}
```

#### Get All Contacts
```http
GET /api/contacts
x-user-id: user-uuid

Response:
{
  "success": true,
  "count": 3,
  "contacts": [
    {
      "id": "contact-uuid",
      "userId": "user-uuid",
      "name": "Contact Name",
      "phone": "+91 9876543210",
      "createdAt": "2024-12-14T10:00:00Z"
    }
  ]
}
```

#### Update Contact
```http
PUT /api/contacts/contact-uuid
x-user-id: user-uuid
Content-Type: application/json

{
  "name": "New Name",
  "phone": "+91 9876543211"
}
```

#### Delete Contact
```http
DELETE /api/contacts/contact-uuid
x-user-id: user-uuid
```

### SOS Alerts

#### Trigger SOS
```http
POST /api/sos/trigger
x-user-id: user-uuid
Content-Type: application/json

{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "message": "Emergency - Help needed!",
  "notificationMethod": "both"  // "sms" | "whatsapp" | "both"
}

Response:
{
  "success": true,
  "message": "SOS alert triggered and notifications sent",
  "alert": {
    "id": "alert-uuid",
    "userId": "user-uuid",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "message": "Emergency - Help needed!",
    "contactsNotified": ["contact-id-1", "contact-id-2"],
    "status": "active",
    "timestamp": "2024-12-14T10:00:00Z"
  },
  "contactsNotified": 2,
  "mapsLink": "https://maps.google.com/?q=28.7041,77.1025"
}
```

#### Get Alert History
```http
GET /api/sos/alerts?limit=50
x-user-id: user-uuid

Response:
{
  "success": true,
  "count": 5,
  "alerts": [ ... ]
}
```

#### Get Alert Details
```http
GET /api/sos/alerts/alert-uuid
x-user-id: user-uuid
```

#### Resolve Alert
```http
PUT /api/sos/alerts/alert-uuid/resolve
x-user-id: user-uuid
Content-Type: application/json

{
  "status": "resolved"  // "resolved" | "cancelled"
}
```

### Health Check
```http
GET /api/health

Response:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-14T10:00:00Z"
}
```

## 🔐 Authentication

The API uses header-based authentication:

```javascript
// Client sends user ID in header
headers: {
  'x-user-id': 'user-uuid'
}
```

Guest users get a UUID that works for one session.
Authenticated users get their user UUID from signup/login.

## 💾 Data Storage

By default, data is stored in JSON files in the `data/` directory:

- **users.json** - User accounts
- **contacts.json** - Trusted contacts
- **alerts.json** - SOS alert logs

### Migrate to MongoDB (Optional)

```bash
npm install mongoose mongodb
```

Replace database.js implementation with MongoDB:

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

// Create schemas and models
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  phone: String,
  isGuest: Boolean,
  createdAt: Date
});
```

## 🧪 Testing

### Test with cURL

```bash
# Guest login
curl -X POST http://localhost:5000/api/users/guest-login

# Signup
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test User","phone":"+91 9876543210"}'

# Add contact
curl -X POST http://localhost:5000/api/contacts \
  -H "x-user-id: user-uuid" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mom","phone":"+91 9876543210"}'

# Trigger SOS
curl -X POST http://localhost:5000/api/sos/trigger \
  -H "x-user-id: user-uuid" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.7041,"longitude":77.1025,"message":"Help!","notificationMethod":"sms"}'
```

### Test with Postman

1. Create a new collection
2. Add requests for each endpoint
3. Set environment variable for `user-uuid`
4. Test each endpoint

## 📝 Code Structure

### userController.js
Handles user registration, login, and profile management.

```javascript
// Functions:
guestLogin()      // Create temporary guest user
signup()          // Register new user
login()           // Authenticate user
getProfile()      // Fetch user details
updateProfile()   // Update user info
```

### contactController.js
CRUD operations for trusted contacts.

```javascript
// Functions:
addContact()      // Add new contact
getContacts()     // List all contacts
updateContact()   // Edit contact details
deleteContact()   // Remove contact
```

### sosController.js
Trigger alerts and manage SOS requests.

```javascript
// Functions:
triggerSOS()      // Send alert to contacts
getAlerts()       // Alert history
getAlertDetails() // Single alert info
resolveAlert()    // Mark as resolved/cancelled
```

## 🐛 Debugging

### Enable Detailed Logging

Edit `server.js`:

```javascript
// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  next();
});
```

### Check Twilio Logs

In Twilio Console:
- Monitor section shows all SMS/WhatsApp sent
- Check delivery status
- View error messages

### Common Errors

| Error | Solution |
|-------|----------|
| `TWILIO_ACCOUNT_SID not defined` | Add to .env file |
| `Cannot find module 'twilio'` | Run `npm install` |
| `Port 5000 already in use` | Use different port or kill process |
| `SMS not sent` | Check phone format, Twilio balance |
| `CORS error` | Update FRONTEND_URL in .env |

## 🚀 Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for production deployment instructions.

### Pre-deployment Checklist

- [ ] Test all endpoints locally
- [ ] Verify Twilio credentials
- [ ] Add production environment variables
- [ ] Enable HTTPS
- [ ] Set up error monitoring
- [ ] Test with real SMS (if possible)

## 📚 Dependencies

- **express** - Web framework
- **cors** - Cross-origin requests
- **body-parser** - Parse request bodies
- **dotenv** - Environment variables
- **twilio** - SMS/WhatsApp service
- **uuid** - Generate unique IDs

## 🔗 Related Files

- [Frontend README](../frontend/README.md)
- [Main README](../README.md)
- [Deployment Guide](../DEPLOYMENT.md)

---

**Version**: 1.0.0  
**Node Version**: 14+  
**Last Updated**: December 14, 2024
