# Technology Stack

## Backend

### Core Framework
- Node.js (v14+)
- Express.js 4.18.2
- JavaScript (ES6+)

### Key Dependencies
- `twilio` (4.10.0) - SMS/WhatsApp notifications
- `@aws-sdk/client-sns` (3.948.0) - AWS SNS integration
- `mongoose` (9.0.1) - MongoDB ODM (optional, JSON files used by default)
- `razorpay` (2.9.6) - Payment processing
- `multer` (2.0.2) - File upload handling
- `uuid` (9.0.1) - Unique ID generation
- `cors` (2.8.5) - Cross-origin resource sharing
- `body-parser` (1.20.2) - Request body parsing
- `dotenv` (16.6.1) - Environment variable management

### Development Tools
- `nodemon` (3.0.2) - Auto-reload during development

## Frontend

### Core Framework
- React 18.2.0
- React DOM 18.2.0
- JavaScript (ES6+)

### Key Dependencies
- `axios` (1.6.2) - HTTP client for API calls
- `react-router-dom` (6.20.0) - Client-side routing
- `react-scripts` (5.0.1) - Create React App build tools

### Browser APIs Used
- Geolocation API - Real-time location detection
- LocalStorage API - Session and data persistence
- Fetch API - HTTP requests

## Data Storage

### Development/MVP
- JSON file-based storage (users.json, contacts.json, alerts.json)
- Located in `backend/data/` directory
- Simple read/write operations via custom models

### Production Ready
- MongoDB support available via Mongoose models
- Models exist for both JSON and MongoDB implementations

## External Services

### Twilio
- SMS notifications
- WhatsApp notifications
- Requires: Account SID, Auth Token, Phone Number

### AWS SNS (Optional)
- Alternative notification service
- Configured but not primary method

### Razorpay (Optional)
- Payment processing for premium features
- Subscription management

## Common Commands

### Backend

```bash
# Install dependencies
npm install

# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Default port: 5000
```

### Frontend

```bash
# Install dependencies
npm install

# Development server
npm start

# Production build
npm run build

# Run tests
npm test

# Default port: 3000
```

### Full Stack Development

```bash
# Terminal 1 - Backend
cd "women safety project/backend"
npm run dev

# Terminal 2 - Frontend
cd "women safety project/frontend"
npm start
```

## Environment Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
FRONTEND_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your_key
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
```

## Code Style Conventions

### JavaScript
- Use `const` and `let`, avoid `var`
- Async/await for asynchronous operations
- Arrow functions for callbacks
- Destructuring for cleaner code
- Template literals for strings

### Error Handling
- Try-catch blocks in controllers
- Consistent error response format: `{ success: false, message: string, error?: string }`
- Console logging for debugging
- HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

### API Response Format
```javascript
// Success
{ success: true, message: string, data: object }

// Error
{ success: false, message: string, error?: string }
```

## Architecture Patterns

### Backend: MVC Pattern
- **Models**: Data operations (CRUD)
- **Controllers**: Business logic
- **Routes**: Endpoint definitions
- **Middleware**: Authentication, logging
- **Config**: External service setup

### Frontend: Component-Based
- Functional components with hooks
- Service layer for API calls
- Separation of concerns (components, services, data, styles)

## Testing

Currently no automated tests configured. Manual testing via:
- Postman collection included
- Browser DevTools
- Backend console logs
