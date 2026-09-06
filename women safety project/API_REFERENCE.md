# 📡 API Reference Guide

Complete API endpoint documentation for Women Safety Backend.

## 🌐 Base URL

**Development**: `http://localhost:5000/api`  
**Production**: `https://your-backend-url.com/api`

---

## 🔑 Authentication Header

All endpoints require the user ID in the header:

```http
x-user-id: user-uuid-here
Content-Type: application/json
```

**Exception**: Guest login and health check endpoints don't require authentication.

---

## 👤 User Endpoints

### 1. Guest Login
Create temporary guest user session without authentication.

```http
POST /users/guest-login
Content-Type: application/json

Response: 200 OK
{
  "success": true,
  "message": "Guest login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "isGuest": true,
    "createdAt": "2024-12-14T10:00:00Z"
  },
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. User Signup
Register new user with email and phone.

```http
POST /users/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "phone": "+91 9876543210"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+91 9876543210",
    "isGuest": false,
    "createdAt": "2024-12-14T10:00:00Z"
  },
  "token": "550e8400-e29b-41d4-a716-446655440001"
}

Error Response: 400 Bad Request
{
  "success": false,
  "message": "Email, name, and phone are required"
}
```

### 3. User Login
Login with registered email.

```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+91 9876543210",
    "isGuest": false,
    "createdAt": "2024-12-14T10:00:00Z"
  },
  "token": "550e8400-e29b-41d4-a716-446655440001"
}
```

### 4. Get User Profile
Retrieve current logged-in user's profile.

```http
GET /users/profile
x-user-id: user-uuid

Response: 200 OK
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+91 9876543210",
    "isGuest": false,
    "createdAt": "2024-12-14T10:00:00Z"
  }
}
```

### 5. Update User Profile
Update name and phone number.

```http
PUT /users/profile
x-user-id: user-uuid
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+91 9876543220"
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "user@example.com",
    "name": "Updated Name",
    "phone": "+91 9876543220",
    "isGuest": false,
    "createdAt": "2024-12-14T10:00:00Z",
    "updatedAt": "2024-12-14T11:00:00Z"
  }
}
```

---

## 👥 Trusted Contacts Endpoints

### 1. Add Contact
Add a new trusted contact.

```http
POST /contacts
x-user-id: user-uuid
Content-Type: application/json

{
  "name": "Mom",
  "phone": "+91 9876543211"
}

Response: 201 Created
{
  "success": true,
  "message": "Contact added successfully",
  "contact": {
    "id": "contact-uuid-1",
    "userId": "user-uuid",
    "name": "Mom",
    "phone": "+91 9876543211",
    "createdAt": "2024-12-14T10:00:00Z"
  }
}

Error Response: 400 Bad Request
{
  "success": false,
  "message": "Invalid phone number format"
}
```

### 2. Get All Contacts
Retrieve all trusted contacts for user.

```http
GET /contacts
x-user-id: user-uuid

Response: 200 OK
{
  "success": true,
  "count": 3,
  "contacts": [
    {
      "id": "contact-uuid-1",
      "userId": "user-uuid",
      "name": "Mom",
      "phone": "+91 9876543211",
      "createdAt": "2024-12-14T10:00:00Z"
    },
    {
      "id": "contact-uuid-2",
      "userId": "user-uuid",
      "name": "Sister",
      "phone": "+91 9876543212",
      "createdAt": "2024-12-14T10:05:00Z"
    },
    {
      "id": "contact-uuid-3",
      "userId": "user-uuid",
      "name": "Friend",
      "phone": "+91 9876543213",
      "createdAt": "2024-12-14T10:10:00Z"
    }
  ]
}
```

### 3. Update Contact
Update contact information.

```http
PUT /contacts/contact-uuid-1
x-user-id: user-uuid
Content-Type: application/json

{
  "name": "Mother",
  "phone": "+91 9876543220"
}

Response: 200 OK
{
  "success": true,
  "message": "Contact updated successfully",
  "contact": {
    "id": "contact-uuid-1",
    "userId": "user-uuid",
    "name": "Mother",
    "phone": "+91 9876543220",
    "createdAt": "2024-12-14T10:00:00Z",
    "updatedAt": "2024-12-14T11:00:00Z"
  }
}
```

### 4. Delete Contact
Remove a trusted contact.

```http
DELETE /contacts/contact-uuid-1
x-user-id: user-uuid

Response: 200 OK
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## 🚨 SOS Alert Endpoints

### 1. Trigger SOS Alert
Send emergency alert to all trusted contacts.

```http
POST /sos/trigger
x-user-id: user-uuid
Content-Type: application/json

{
  "latitude": 28.7041,
  "longitude": 77.1025,
  "message": "Emergency! Help needed!",
  "notificationMethod": "both"
}

Response: 200 OK
{
  "success": true,
  "message": "SOS alert triggered and notifications sent",
  "alert": {
    "id": "alert-uuid-1",
    "userId": "user-uuid",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "message": "Emergency! Help needed!",
    "contactsNotified": ["contact-uuid-1", "contact-uuid-2"],
    "status": "active",
    "timestamp": "2024-12-14T10:00:00Z"
  },
  "contactsNotified": 2,
  "mapsLink": "https://maps.google.com/?q=28.7041,77.1025"
}

Error Response: 400 Bad Request
{
  "success": false,
  "message": "Location (latitude and longitude) is required"
}
```

**Notification Methods:**
- `"sms"` - Send SMS only
- `"whatsapp"` - Send WhatsApp only
- `"both"` - Send both SMS and WhatsApp

**Message Format Sent to Contacts:**
```
⚠️ EMERGENCY ALERT!

[User's custom message]

Location: [Google Maps link]

Please contact me or emergency services.
```

### 2. Get Alert History
Retrieve all SOS alerts for user.

```http
GET /sos/alerts?limit=50
x-user-id: user-uuid

Response: 200 OK
{
  "success": true,
  "count": 5,
  "alerts": [
    {
      "id": "alert-uuid-5",
      "userId": "user-uuid",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "message": "Help needed at location",
      "contactsNotified": ["contact-uuid-1", "contact-uuid-2"],
      "status": "resolved",
      "timestamp": "2024-12-14T10:40:00Z",
      "updatedAt": "2024-12-14T10:45:00Z"
    },
    {
      "id": "alert-uuid-4",
      "userId": "user-uuid",
      "latitude": 28.7050,
      "longitude": 77.1030,
      "message": "Emergency alert",
      "contactsNotified": ["contact-uuid-1"],
      "status": "cancelled",
      "timestamp": "2024-12-14T10:30:00Z",
      "updatedAt": "2024-12-14T10:35:00Z"
    }
  ]
}

Query Parameters:
- limit: Number of alerts to fetch (default: 50, max: 100)
```

### 3. Get Alert Details
Retrieve specific alert information.

```http
GET /sos/alerts/alert-uuid-1
x-user-id: user-uuid

Response: 200 OK
{
  "success": true,
  "alert": {
    "id": "alert-uuid-1",
    "userId": "user-uuid",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "message": "Emergency! Help needed!",
    "contactsNotified": [
      "contact-uuid-1",
      "contact-uuid-2"
    ],
    "status": "active",
    "timestamp": "2024-12-14T10:00:00Z"
  }
}
```

### 4. Resolve Alert
Update alert status (resolve or cancel).

```http
PUT /sos/alerts/alert-uuid-1/resolve
x-user-id: user-uuid
Content-Type: application/json

{
  "status": "resolved"
}

Response: 200 OK
{
  "success": true,
  "message": "Alert resolved successfully",
  "alert": {
    "id": "alert-uuid-1",
    "userId": "user-uuid",
    "latitude": 28.7041,
    "longitude": 77.1025,
    "message": "Emergency! Help needed!",
    "contactsNotified": ["contact-uuid-1", "contact-uuid-2"],
    "status": "resolved",
    "timestamp": "2024-12-14T10:00:00Z",
    "updatedAt": "2024-12-14T10:10:00Z"
  }
}

Valid Statuses:
- "resolved" - Alert handled/resolved
- "cancelled" - False alarm, user cancelled
- "active" - Ongoing alert
```

---

## 🏥 Health Check Endpoints

### 1. Health Check
Check if backend server is running.

```http
GET /health

Response: 200 OK
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-14T10:00:00Z"
}
```

### 2. API Status
Get API operational status and version.

```http
GET /status

Response: 200 OK
{
  "success": true,
  "message": "API is operational",
  "version": "1.0.0",
  "timestamp": "2024-12-14T10:00:00Z"
}
```

---

## 🔧 Request/Response Examples

### cURL Examples

**Guest Login:**
```bash
curl -X POST http://localhost:5000/api/users/guest-login
```

**Add Contact:**
```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "x-user-id: user-uuid" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mom","phone":"+91 9876543211"}'
```

**Trigger SOS:**
```bash
curl -X POST http://localhost:5000/api/sos/trigger \
  -H "x-user-id: user-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.7041,
    "longitude": 77.1025,
    "message": "Help needed!",
    "notificationMethod": "both"
  }'
```

**Get Contacts:**
```bash
curl http://localhost:5000/api/contacts \
  -H "x-user-id: user-uuid"
```

### JavaScript/Fetch Examples

**Guest Login:**
```javascript
const response = await fetch('http://localhost:5000/api/users/guest-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();
```

**Add Contact:**
```javascript
const response = await fetch('http://localhost:5000/api/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId
  },
  body: JSON.stringify({
    name: 'Mom',
    phone: '+91 9876543211'
  })
});
```

---

## 📊 Phone Number Formats

**Valid International Formats:**
- `+91 9876543210` (India with country code)
- `+1 (555) 123-4567` (US with parentheses)
- `+44-20-7946-0958` (UK with dashes)
- `+1234567890` (Any country without formatting)

**Invalid Formats:**
- `9876543210` (Missing country code)
- `+91 98765432` (Too short)
- `+91 (98) 765 43210` (Mixed format)
- `abc123def` (Non-numeric)

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## 📝 Data Validation Rules

| Field | Type | Required | Format | Max Length |
|-------|------|----------|--------|------------|
| email | String | Yes | Valid email | 255 |
| name | String | Yes | Any text | 255 |
| phone | String | Yes | International | 20 |
| message | String | No | Any text | 200 |
| latitude | Number | Yes | -90 to 90 | - |
| longitude | Number | Yes | -180 to 180 | - |
| status | String | Yes | resolved\|cancelled | - |
| notificationMethod | String | Yes | sms\|whatsapp\|both | - |

---

## 🔐 Security Notes

- **All endpoints** except guest-login and health check require authentication
- **Phone numbers** are validated for international format
- **Input sanitization** applied to all user inputs
- **CORS** configured to allow frontend requests only
- **Rate limiting** can be added for production
- **HTTPS** recommended for production deployment

---

## 🧪 Testing with Postman

1. **Create Environment**:
   - Variable: `base_url` = `http://localhost:5000/api`
   - Variable: `user_id` = `your-user-uuid`

2. **Sample Requests**:
   - Import provided Postman collection (can be created)
   - Set variables in each request
   - Test all endpoints

3. **Authentication**:
   - Add header `x-user-id: {{user_id}}`
   - Update user_id after login/signup

---

## 📚 Related Documentation

- [Backend README](../backend/README.md) - Full backend guide
- [Frontend README](../frontend/README.md) - Frontend implementation
- [Main README](../README.md) - Project overview
- [Deployment Guide](../DEPLOYMENT.md) - Production deployment

---

**API Version**: 1.0.0  
**Last Updated**: December 14, 2024  
**Status**: ✅ Production Ready
