# Project Structure

## Root Directory

```
women safety project/
├── backend/           # Node.js + Express API server
├── frontend/          # React web application
└── [docs]            # Various markdown documentation files
```

## Backend Structure (`backend/`)

### Directory Layout

```
backend/
├── src/
│   ├── server.js              # Main entry point, Express app setup
│   ├── config/                # External service configurations
│   │   ├── database.js        # JSON file storage operations
│   │   ├── mongodb.js         # MongoDB connection (optional)
│   │   └── twilio.js          # Twilio SMS/WhatsApp setup
│   ├── controllers/           # Business logic and request handlers
│   │   ├── userController.js          # Auth, signup, login, profile
│   │   ├── userControllerMongo.js     # MongoDB version
│   │   ├── contactController.js       # Contacts CRUD
│   │   ├── contactControllerMongo.js  # MongoDB version
│   │   ├── sosController.js           # SOS alert triggering
│   │   ├── adminController.js         # Admin operations
│   │   ├── adminControllerMongo.js    # MongoDB version
│   │   ├── evidenceController.js      # Evidence upload/management
│   │   ├── paymentController.js       # Razorpay integration
│   │   └── riskController.js          # Risk assessment
│   ├── models/                # Data access layer
│   │   ├── userModel.js           # User CRUD (JSON)
│   │   ├── userMongoModel.js      # User schema (MongoDB)
│   │   ├── contactModel.js        # Contact CRUD (JSON)
│   │   ├── contactMongoModel.js   # Contact schema (MongoDB)
│   │   ├── alertModel.js          # Alert logging (JSON)
│   │   ├── alertMongoModel.js     # Alert schema (MongoDB)
│   │   ├── evidenceModel.js       # Evidence storage
│   │   ├── riskLogModel.js        # Risk assessment logs
│   │   └── subscriptionModel.js   # Payment subscriptions
│   ├── middleware/            # Request processing middleware
│   │   └── auth.js            # Authentication (x-user-id header)
│   └── routes/                # API endpoint definitions
│       ├── healthRoutes.js    # Health check endpoints
│       ├── userRoutes.js      # User auth endpoints
│       ├── contactRoutes.js   # Contact management endpoints
│       ├── sosRoutes.js       # SOS alert endpoints
│       ├── adminRoutes.js     # Admin endpoints
│       ├── evidenceRoutes.js  # Evidence endpoints
│       ├── paymentRoutes.js   # Payment endpoints
│       └── riskRoutes.js      # Risk assessment endpoints
├── data/                      # JSON file storage (development)
│   ├── users.json            # User records
│   ├── contacts.json         # Trusted contacts
│   └── alerts.json           # Alert history
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
└── README.md                 # Backend documentation
```

### Backend Conventions

- **Controllers**: Handle HTTP requests, validate input, call models, return responses
- **Models**: Direct data operations (read/write JSON or MongoDB)
- **Routes**: Define endpoints and attach middleware
- **Config**: Initialize external services (Twilio, MongoDB)
- **Middleware**: `auth.js` extracts `x-user-id` header for authentication

### Key Backend Files

- `server.js`: Express setup, middleware, route mounting, error handling
- `database.js`: JSON file read/write utilities
- `auth.js`: Simple user ID extraction (no JWT, uses header-based auth)

## Frontend Structure (`frontend/`)

### Directory Layout

```
frontend/
├── public/
│   └── index.html            # HTML template
├── src/
│   ├── index.js              # React entry point
│   ├── App.js                # Main application component
│   ├── App.css               # Main app styles
│   ├── index.css             # Global styles
│   ├── components/           # React components (if implemented)
│   │   ├── Auth.js           # Login/Signup/Guest
│   │   ├── SOSButton.js      # Emergency SOS button
│   │   ├── TrustedContacts.js # Contact management
│   │   ├── HelplineNumbers.js # Emergency helplines
│   │   └── QuickExit.js      # Quick exit button
│   ├── services/             # API and utility services (if implemented)
│   │   ├── api.js            # Axios wrapper for backend calls
│   │   ├── geolocation.js    # Browser geolocation utilities
│   │   └── storage.js        # LocalStorage management
│   ├── data/                 # Static data (if implemented)
│   │   └── helplines.js      # India emergency helplines
│   └── styles/               # Component-specific CSS (if implemented)
│       ├── Auth.css
│       ├── SOSButton.css
│       ├── Contacts.css
│       ├── Helplines.css
│       └── QuickExit.css
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
└── README.md                 # Frontend documentation
```

### Frontend Conventions

- **Components**: Functional components using React hooks
- **Services**: Abstraction layer for API calls and browser APIs
- **Styles**: Component-specific CSS files, global styles in index.css
- **Data**: Static data files (helplines, constants)

### Key Frontend Files

- `App.js`: Main component, routing, state management
- `api.js`: Centralized API calls with axios
- `geolocation.js`: Location detection and Google Maps link generation
- `storage.js`: LocalStorage wrapper for session management

## API Endpoint Structure

### Naming Convention
- Base URL: `/api`
- Resource-based: `/api/{resource}/{action}`
- RESTful verbs: GET, POST, PUT, DELETE

### Endpoint Groups

1. **Health**: `/api/health`
2. **Users**: `/api/users/*`
3. **Contacts**: `/api/contacts/*`
4. **SOS**: `/api/sos/*`
5. **Admin**: `/api/admin/*`
6. **Evidence**: `/api/evidence/*`
7. **Payments**: `/api/payments/*`
8. **Risk**: `/api/risk/*`

## Authentication Flow

1. User logs in or signs up → Backend returns user object
2. Frontend stores user ID in LocalStorage
3. All subsequent requests include `x-user-id` header
4. Backend middleware (`auth.js`) extracts and validates user ID
5. Controllers use `req.userId` to access authenticated user

## Data Flow

### SOS Alert Flow
1. Frontend: User triggers SOS → Geolocation API gets coordinates
2. Frontend: POST to `/api/sos/trigger` with location and message
3. Backend: `sosController.js` receives request
4. Backend: `alertModel.js` logs alert to `alerts.json`
5. Backend: `contactModel.js` fetches user's contacts
6. Backend: `twilio.js` sends SMS/WhatsApp to each contact
7. Backend: Returns success response with alert details
8. Frontend: Shows confirmation to user

### Contact Management Flow
1. Frontend: User adds contact → POST to `/api/contacts`
2. Backend: `contactController.js` validates phone number
3. Backend: `contactModel.js` writes to `contacts.json`
4. Backend: Returns created contact
5. Frontend: Updates UI and LocalStorage cache

## File Naming Conventions

- **Controllers**: `{resource}Controller.js` (e.g., `userController.js`)
- **Models**: `{resource}Model.js` (e.g., `userModel.js`)
- **Routes**: `{resource}Routes.js` (e.g., `userRoutes.js`)
- **Components**: PascalCase (e.g., `SOSButton.js`)
- **Services**: camelCase (e.g., `geolocation.js`)
- **Styles**: Match component name (e.g., `SOSButton.css`)

## Configuration Files

- `.env`: Environment-specific variables (never commit)
- `.env.example`: Template for required environment variables
- `package.json`: Dependencies, scripts, metadata
- `.gitignore`: Excludes node_modules, .env, data files

## Documentation Files (Root)

- `README.md`: Main project documentation
- `PROJECT_SUMMARY.md`: Completion summary and statistics
- `QUICK_START.md`: 5-minute setup guide
- `DEPLOYMENT.md`: Production deployment instructions
- `TESTING.md`: Manual testing guide
- `API_REFERENCE.md`: API endpoint documentation
- `AWS_SNS_SETUP.md`: AWS SNS configuration guide
- Various other summary/guide files

## Notes

- Frontend components/services may not be fully implemented yet (check `App.js`)
- Dual model system: JSON files for development, MongoDB for production
- Controllers have both JSON and MongoDB versions (e.g., `userController.js` vs `userControllerMongo.js`)
- Switch between storage methods by changing imports in routes
