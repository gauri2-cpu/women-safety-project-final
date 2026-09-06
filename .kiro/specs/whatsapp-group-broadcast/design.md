# Technical Design Document: WhatsApp Group Broadcast

## Overview

This design document specifies the technical implementation for enabling users to send emergency messages to all saved contacts through a single WhatsApp action. The feature addresses the current limitation where the system opens multiple browser tabs (one per contact) by implementing a sequential WhatsApp broadcast approach that works within WhatsApp Web API constraints.

### Problem Statement

The current implementation opens individual `wa.me` links for each contact, resulting in:
- Multiple browser tabs/popups (often blocked by browsers)
- Poor user experience during emergencies
- Potential for incomplete notifications if popups are blocked

### Solution Approach

Since WhatsApp Web API (`wa.me`) only supports single-recipient links, we implement a **sequential broadcast pattern** where:
1. Frontend generates individual WhatsApp links for each contact
2. Links are opened sequentially with controlled timing to avoid popup blockers
3. User confirms each message send in WhatsApp (required by WhatsApp's design)
4. SMS fallback via Twilio remains available for automated notifications

This approach balances WhatsApp's single-recipient limitation with user experience requirements while maintaining the existing SMS notification system as a reliable fallback.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SOS Button   │  │  Broadcast   │  │  Location    │      │
│  │  Component   │─▶│   Service    │◀─│   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         │                  ▼                  │              │
│         │          ┌──────────────┐           │              │
│         │          │  WhatsApp    │           │              │
│         │          │  Link Gen    │           │              │
│         │          └──────────────┘           │              │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │ API Call         │ wa.me links      │
          ▼                  ▼                  │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Express)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     SOS      │  │   Contact    │  │    Alert     │      │
│  │  Controller  │─▶│    Model     │─▶│    Model     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │    Twilio    │  (SMS Fallback)                           │
│  │   Service    │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
├─────────────────────────────────────────────────────────────┤
│  WhatsApp Web (wa.me)  │  Twilio SMS  │  Browser Geolocation│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User triggers SOS**: User long-presses SOS button
2. **Location detection**: Frontend requests GPS coordinates (10s timeout)
3. **Contact retrieval**: Frontend fetches user's contact list from backend
4. **Validation**: Frontend validates contacts and filters invalid numbers
5. **Message composition**: Frontend generates emergency message with location
6. **Link generation**: Frontend creates individual `wa.me` links for each contact
7. **Sequential broadcast**: Frontend opens WhatsApp links with 2-second intervals
8. **Alert logging**: Backend logs the broadcast attempt
9. **SMS fallback**: Backend sends SMS notifications via Twilio (parallel operation)

## Components and Interfaces

### Frontend Components

#### 1. WhatsApp Broadcast Service (`whatsappBroadcast.js`)

New service module for handling WhatsApp broadcast logic.

```javascript
/**
 * WhatsApp Broadcast Service
 * Handles sequential WhatsApp link generation and opening
 */

/**
 * Generate WhatsApp link for single recipient
 * @param {string} phoneNumber - Phone number in international format
 * @param {string} message - Pre-formatted emergency message
 * @returns {string} - wa.me URL
 */
function generateWhatsAppLink(phoneNumber, message);

/**
 * Format phone number to international format
 * @param {string} phone - Phone number (various formats)
 * @returns {string} - E.164 format (+[country][number])
 */
function formatPhoneNumber(phone);

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhoneNumber(phone);

/**
 * Open WhatsApp links sequentially
 * @param {Array<string>} phoneNumbers - List of recipient phone numbers
 * @param {string} message - Emergency message
 * @param {Function} onProgress - Progress callback (index, total)
 * @param {Function} onComplete - Completion callback
 * @param {Function} onError - Error callback
 * @returns {Promise<Object>} - Broadcast result
 */
async function broadcastToContacts(phoneNumbers, message, callbacks);

/**
 * Compose emergency message with location
 * @param {Object} location - {latitude, longitude}
 * @param {string} customMessage - Optional custom message
 * @returns {string} - Formatted emergency message
 */
function composeEmergencyMessage(location, customMessage);
```

#### 2. Enhanced SOS Button Component

Modifications to existing SOS button to support WhatsApp broadcast.

```javascript
// New state management
const [broadcastProgress, setBroadcastProgress] = useState({
  current: 0,
  total: 0,
  status: 'idle' // 'idle' | 'detecting-location' | 'broadcasting' | 'complete' | 'error'
});

// New handler for WhatsApp broadcast
const handleWhatsAppBroadcast = async () => {
  // 1. Detect location
  // 2. Fetch contacts
  // 3. Validate contacts
  // 4. Compose message
  // 5. Initiate sequential broadcast
  // 6. Log alert
  // 7. Trigger SMS fallback
};
```

#### 3. Broadcast Progress Modal

New component to show broadcast progress to user.

```javascript
/**
 * BroadcastProgressModal Component
 * Displays real-time progress during WhatsApp broadcast
 */
function BroadcastProgressModal({ 
  isOpen, 
  progress, 
  onCancel, 
  onComplete 
});
```

### Backend Components

#### 1. Enhanced SOS Controller

Modifications to existing `sosController.js`.

```javascript
/**
 * New endpoint: Prepare WhatsApp broadcast
 * @route POST /api/sos/prepare-whatsapp-broadcast
 * @body {latitude, longitude, message}
 * @returns {contacts, formattedMessage, alertId}
 */
async function prepareWhatsAppBroadcast(req, res);

/**
 * New endpoint: Log WhatsApp broadcast attempt
 * @route POST /api/sos/log-whatsapp-broadcast
 * @body {alertId, contactsAttempted, contactsSuccessful}
 * @returns {alert}
 */
async function logWhatsAppBroadcast(req, res);
```

#### 2. Contact Validation Utility

New utility module for phone number validation.

```javascript
/**
 * Phone Number Validation Utility
 */

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} - True if valid
 */
function validatePhoneNumber(phone);

/**
 * Normalize phone number to E.164 format
 * @param {string} phone - Phone number
 * @param {string} defaultCountryCode - Default country code (e.g., '+91')
 * @returns {string} - Normalized phone number
 */
function normalizePhoneNumber(phone, defaultCountryCode);

/**
 * Filter valid contacts from list
 * @param {Array<Object>} contacts - Contact list
 * @returns {Array<Object>} - Valid contacts only
 */
function filterValidContacts(contacts);
```

### API Endpoints

#### New Endpoints

**1. Prepare WhatsApp Broadcast**
```
POST /api/sos/prepare-whatsapp-broadcast
Headers: x-user-id: <userId>
Body: {
  latitude: number,
  longitude: number,
  message?: string
}
Response: {
  success: boolean,
  alertId: string,
  contacts: Array<{id, name, phone}>,
  formattedMessage: string,
  validContactCount: number,
  invalidContactCount: number
}
```

**2. Log WhatsApp Broadcast**
```
POST /api/sos/log-whatsapp-broadcast
Headers: x-user-id: <userId>
Body: {
  alertId: string,
  contactsAttempted: number,
  contactsSuccessful: number,
  errors?: Array<string>
}
Response: {
  success: boolean,
  alert: Object
}
```

#### Modified Endpoints

**Existing: Trigger SOS**
```
POST /api/sos/trigger
```
No changes required - continues to handle SMS/Twilio notifications as fallback.

## Data Models

### Alert Model Enhancement

Add new fields to track WhatsApp broadcast attempts:

```javascript
{
  id: string,
  userId: string,
  latitude: number,
  longitude: number,
  message: string,
  contactsNotified: Array<string>, // Contact IDs
  status: 'active' | 'resolved' | 'cancelled',
  createdAt: string,
  // New fields for WhatsApp broadcast
  whatsappBroadcast: {
    attempted: boolean,
    contactsAttempted: number,
    contactsSuccessful: number,
    errors: Array<string>,
    timestamp: string
  },
  smsFallback: {
    triggered: boolean,
    contactsNotified: number,
    timestamp: string
  }
}
```

### Contact Model

No changes required - existing structure supports the feature:

```javascript
{
  id: string,
  userId: string,
  name: string,
  phone: string, // International format preferred
  createdAt: string,
  updatedAt?: string
}
```

### Frontend State Models

**Broadcast State**
```javascript
{
  status: 'idle' | 'detecting-location' | 'validating' | 'broadcasting' | 'complete' | 'error',
  location: {
    latitude: number,
    longitude: number
  } | null,
  contacts: Array<Contact>,
  validContacts: Array<Contact>,
  invalidContacts: Array<Contact>,
  currentIndex: number,
  totalContacts: number,
  errors: Array<string>,
  alertId: string | null
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Criteria 2.5, 7.1: Both test empty contact list validation (consolidated into Property 1)
- Criteria 3.3, 4.3: Both test location unavailable fallback (consolidated into example test)
- Criteria 8.3, 9.5: Both test SMS fallback preservation (consolidated into Property 14)
- Criteria 2.1, 2.3: Both test contact inclusion in broadcast (consolidated into Property 2)

### Property 1: Empty contact list validation

*For any* user with zero trusted contacts, attempting to initiate a WhatsApp broadcast should result in an error response and no broadcast links generated.

**Validates: Requirements 2.5, 7.1**

### Property 2: All contacts included in broadcast

*For any* non-empty contact list, the number of WhatsApp links generated should equal the number of contacts in the list.

**Validates: Requirements 2.1, 2.3**

### Property 3: Location included in message

*For any* valid GPS coordinates (latitude, longitude), the generated emergency message should contain those coordinates formatted as a Google Maps link.

**Validates: Requirements 2.4, 3.1**

### Property 4: Contact data isolation

*For any* two different users with their own contact lists, fetching contacts for user A should return only user A's contacts and none of user B's contacts.

**Validates: Requirements 1.2**

### Property 5: Contact CRUD round-trip

*For any* valid contact data (name, phone), adding the contact then retrieving the user's contact list should include a contact with matching name and phone.

**Validates: Requirements 1.1, 1.3**

### Property 6: Contact update persistence

*For any* existing contact and valid update data, updating the contact then retrieving it should return the contact with the updated fields.

**Validates: Requirements 1.4**

### Property 7: Contact deletion removes contact

*For any* existing contact in a user's contact list, deleting that contact then retrieving the contact list should not include the deleted contact.

**Validates: Requirements 1.5**

### Property 8: Invalid phone numbers rejected

*For any* phone number that doesn't match valid international format patterns, attempting to add it as a contact should be rejected with a validation error.

**Validates: Requirements 1.6**

### Property 9: Distress signal in message

*For any* generated emergency message (with or without custom text), the message should contain the distress signal text (e.g., "⚠️ EMERGENCY ALERT").

**Validates: Requirements 3.2**

### Property 10: Custom message appended

*For any* custom message text provided by the user, the generated emergency message should contain both the standard distress signal and the custom text.

**Validates: Requirements 3.5**

### Property 11: Message formatting for WhatsApp

*For any* generated emergency message, the message should contain line breaks and proper formatting (distress signal on first line, custom message, location link on separate lines).

**Validates: Requirements 3.4**

### Property 12: Phone number E.164 formatting

*For any* phone number in various formats (with/without country code, with spaces or dashes), the formatted output should be in E.164 format (+[country][number] with no spaces or special characters).

**Validates: Requirements 5.1**

### Property 13: URL encoding for special characters

*For any* emergency message containing special characters (emojis, punctuation, spaces), the generated wa.me URL should have the message properly URL-encoded.

**Validates: Requirements 5.2**

### Property 14: Valid wa.me URL format

*For any* phone number and message, the generated WhatsApp link should match the pattern `https://wa.me/[phone]?text=[encoded_message]`.

**Validates: Requirements 5.3**

### Property 15: Duplicate broadcast prevention

*For any* broadcast initiation, calling the broadcast function multiple times in rapid succession (within 1 second) should only result in one actual broadcast execution.

**Validates: Requirements 6.5**

### Property 16: Invalid contacts filtered

*For any* contact list containing both valid and invalid phone numbers, the filtered contact list should contain only contacts with valid phone numbers.

**Validates: Requirements 7.2**

### Property 17: Invalid contacts don't block broadcast

*For any* contact list with at least one valid contact and some invalid contacts, the broadcast should proceed with the valid contacts and not fail entirely.

**Validates: Requirements 7.5**

### Property 18: SMS functionality preserved

*For any* user triggering an SOS alert, the existing SMS notification functionality via Twilio should continue to work regardless of WhatsApp broadcast status.

**Validates: Requirements 8.3, 9.5**

### Property 19: Broadcast attempts logged

*For any* WhatsApp broadcast attempt (successful or failed), an alert record should be created in the system with broadcast details (contacts attempted, timestamp).

**Validates: Requirements 9.3**

## Error Handling

### Location Detection Errors

**Scenario**: GPS location unavailable or timeout
- **Detection**: Geolocation API returns error or exceeds 10-second timeout
- **Handling**: 
  - Display user-friendly error message
  - Generate emergency message with "Location unavailable" text
  - Continue with broadcast using fallback message
  - Log the location detection failure

**Example Message**: 
```
⚠️ EMERGENCY ALERT!
I need help immediately!
Location: Unable to determine location
Please contact me or emergency services.
```

### Contact Validation Errors

**Scenario**: No valid contacts in list
- **Detection**: After filtering, zero contacts remain
- **Handling**:
  - Display error: "No valid contacts found. Please add contacts before using emergency broadcast."
  - Prevent broadcast initiation
  - Suggest adding contacts or using alternative methods (SMS, direct call)

**Scenario**: Some invalid contacts
- **Detection**: Some contacts fail validation
- **Handling**:
  - Log warning for each invalid contact
  - Continue broadcast with valid contacts
  - Display count: "Broadcasting to X valid contacts (Y contacts skipped due to invalid numbers)"

### WhatsApp Link Generation Errors

**Scenario**: Link generation fails
- **Detection**: Exception during URL generation or encoding
- **Handling**:
  - Log error with details
  - Display error: "Unable to generate WhatsApp links. Using SMS fallback."
  - Automatically trigger SMS notification via Twilio
  - Record failure in alert log

### Browser Popup Blocker

**Scenario**: Browser blocks WhatsApp link popup
- **Detection**: `window.open()` returns null or throws exception
- **Handling**:
  - Display message: "Popup blocked. Click below to open WhatsApp manually."
  - Provide clickable links for each contact
  - Show instructions to allow popups for future use
  - Continue with sequential opening for remaining contacts

### Network Errors

**Scenario**: Backend API call fails
- **Detection**: API request timeout or error response
- **Handling**:
  - Retry once with exponential backoff
  - If retry fails, use cached contact data from localStorage
  - Display warning: "Using cached contacts. Some contacts may be outdated."
  - Log the network error

### Rate Limiting

**Scenario**: Too many broadcasts in short time
- **Detection**: More than 3 broadcasts within 60 seconds
- **Handling**:
  - Display warning: "Please wait before sending another alert."
  - Show countdown timer (60 seconds)
  - Allow override for genuine emergencies (confirmation dialog)
  - Log rate limit trigger

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific edge cases (empty contact list, location unavailable)
- Integration points (API endpoints, Twilio service)
- Error conditions (network failures, validation errors)
- UI behavior (progress display, error messages)

**Property-Based Tests** focus on:
- Universal properties across all inputs (phone formatting, message composition)
- Data integrity (CRUD operations, contact isolation)
- Validation logic (phone number patterns, URL encoding)

### Property-Based Testing Configuration

**Library**: `fast-check` (JavaScript/Node.js property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: whatsapp-group-broadcast, Property {N}: {description}`

**Example Property Test Structure**:
```javascript
const fc = require('fast-check');

describe('Feature: whatsapp-group-broadcast, Property 3: Location included in message', () => {
  it('should include GPS coordinates in generated message for any valid coordinates', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90 }),  // latitude
        fc.double({ min: -180, max: 180 }), // longitude
        (lat, lon) => {
          const message = composeEmergencyMessage({ latitude: lat, longitude: lon });
          const expectedLink = `https://maps.google.com/?q=${lat},${lon}`;
          return message.includes(expectedLink);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage

**Frontend Tests** (`whatsappBroadcast.test.js`):
- Phone number formatting edge cases
- URL encoding special characters
- Message composition with/without custom text
- Sequential broadcast timing
- Popup blocker handling

**Backend Tests** (`sosController.test.js`):
- Prepare broadcast endpoint validation
- Contact filtering logic
- Alert logging with broadcast details
- SMS fallback triggering

**Integration Tests**:
- End-to-end broadcast flow
- Location detection timeout handling
- Network error recovery
- Rate limiting enforcement

### Test Data Generators

For property-based tests, we need generators for:

```javascript
// Phone number generator (valid international format)
const phoneNumberArb = fc.string().map(s => '+' + s.replace(/\D/g, '').slice(0, 15));

// Contact generator
const contactArb = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  phone: phoneNumberArb
});

// GPS coordinates generator
const coordinatesArb = fc.record({
  latitude: fc.double({ min: -90, max: 90 }),
  longitude: fc.double({ min: -180, max: 180 })
});

// Emergency message generator
const messageArb = fc.string({ minLength: 0, maxLength: 500 });
```

### Manual Testing Checklist

Due to WhatsApp Web API limitations and browser behavior, manual testing is required for:

1. **WhatsApp Link Opening**:
   - Verify links open in WhatsApp Web on desktop
   - Verify links open in WhatsApp app on mobile
   - Test with popup blockers enabled/disabled
   - Test sequential opening timing (2-second intervals)

2. **Cross-Browser Testing**:
   - Chrome (desktop and mobile)
   - Firefox (desktop and mobile)
   - Safari (desktop and mobile)
   - Edge (desktop)

3. **User Experience**:
   - Progress modal displays correctly
   - Loading indicators appear during location detection
   - Error messages are clear and actionable
   - Success confirmation displays after broadcast

4. **Emergency Scenarios**:
   - Test with poor GPS signal
   - Test with location permissions denied
   - Test with no internet connection
   - Test with WhatsApp not installed

## Implementation Notes

### WhatsApp API Limitation

The `wa.me` API only supports single recipients. The URL format is:
```
https://wa.me/[phone]?text=[message]
```

There is no official way to send to multiple recipients in one action. Our solution:
- Generate individual links for each contact
- Open links sequentially with 2-second delays
- User must confirm/send each message in WhatsApp
- This is a limitation of WhatsApp's design for spam prevention

### Sequential Opening Strategy

```javascript
async function openLinksSequentially(links, delay = 2000) {
  for (let i = 0; i < links.length; i++) {
    // Open link
    const opened = window.open(links[i], '_blank');
    
    // Handle popup blocker
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      // Popup blocked - provide manual link
      showManualLink(links[i], i);
    }
    
    // Update progress
    onProgress(i + 1, links.length);
    
    // Wait before next link (except for last one)
    if (i < links.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Phone Number Normalization

India-focused implementation with +91 default:

```javascript
function normalizePhoneNumber(phone, defaultCountryCode = '+91') {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with country code, add +
  if (cleaned.length > 10) {
    return '+' + cleaned;
  }
  
  // If 10 digits, assume India number
  if (cleaned.length === 10) {
    return defaultCountryCode + cleaned;
  }
  
  // Invalid length
  throw new Error('Invalid phone number length');
}
```

### Performance Considerations

**3-Second Target Breakdown**:
- Location detection: 0-10 seconds (with timeout)
- Contact fetch: ~200ms
- Contact validation: ~100ms
- Message composition: ~50ms
- Link generation: ~50ms
- First link opening: ~100ms

To meet the 3-second target for "broadcast initiation":
- Use cached contacts when available
- Perform validation in parallel with location detection
- Pre-generate message template
- Open first link immediately after location is available

**Optimization**: If location takes >3 seconds, show progress and continue. The 3-second target is for initiating the broadcast (opening first WhatsApp link), not completing all links.

### Security Considerations

**Rate Limiting**: Prevent abuse by limiting broadcasts to 3 per minute per user.

**Input Validation**: 
- Sanitize custom messages (remove script tags, limit length)
- Validate phone numbers server-side
- Verify user owns the contacts being notified

**Privacy**:
- Don't log message content (only metadata)
- Don't expose other users' contacts
- Allow users to delete alert history

**Audit Trail**:
- Log all broadcast attempts with timestamp
- Record success/failure for each contact
- Track rate limit violations

## Deployment Considerations

### Feature Flag

Implement feature flag for gradual rollout:

```javascript
const FEATURE_FLAGS = {
  whatsappGroupBroadcast: process.env.ENABLE_WHATSAPP_BROADCAST === 'true'
};
```

### Backward Compatibility

- Keep existing SMS notification as default
- WhatsApp broadcast is additive feature
- No breaking changes to existing APIs
- Existing contact data works without migration

### Monitoring

Track metrics:
- Broadcast success rate
- Average contacts per broadcast
- Location detection success rate
- Popup blocker encounter rate
- SMS fallback trigger rate

### Rollback Plan

If issues arise:
1. Disable feature flag
2. System reverts to SMS-only notifications
3. No data loss (alerts still logged)
4. Users can still manage contacts

## Future Enhancements

### Potential Improvements

1. **WhatsApp Business API**: If budget allows, integrate official WhatsApp Business API for true multi-recipient messaging
2. **Contact Groups**: Allow users to create contact groups for faster selection
3. **Message Templates**: Pre-defined emergency message templates
4. **Delivery Confirmation**: Track which contacts opened/read the message (requires Business API)
5. **Voice Call Cascade**: Automatically call contacts if WhatsApp fails
6. **Location History**: Show location trail for moving emergencies
7. **Silent Alert**: Send alert without opening WhatsApp (background mode)

### Technical Debt

- Consider migrating from JSON file storage to MongoDB for production
- Implement proper authentication (JWT) instead of header-based auth
- Add comprehensive error tracking (Sentry integration)
- Implement automated E2E tests with Playwright/Cypress
