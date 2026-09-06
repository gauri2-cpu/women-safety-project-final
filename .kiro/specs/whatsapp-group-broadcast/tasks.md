# Implementation Plan: WhatsApp Group Broadcast

## Overview

This implementation plan breaks down the WhatsApp group broadcast feature into discrete coding tasks. The feature enables users to send emergency alerts to all trusted contacts through sequential WhatsApp link opening, with SMS fallback via Twilio. Implementation follows the existing React + Node.js architecture with JSON file storage.

## Tasks

- [x] 1. Set up phone number validation utility
  - Create `backend/src/utils/phoneValidation.js` with validation and normalization functions
  - Implement E.164 format conversion with +91 default for India
  - Add validation regex for international phone numbers
  - Export functions: `validatePhoneNumber`, `normalizePhoneNumber`, `filterValidContacts`
  - _Requirements: 1.6, 5.1, 7.2_

- [ ]* 1.1 Write property test for phone number normalization
  - **Property 12: Phone number E.164 formatting**
  - **Validates: Requirements 5.1**
  - Generate random phone numbers in various formats (with/without country code, spaces, dashes)
  - Verify all outputs match E.164 format pattern: `+[digits only]`
  - Test with fast-check library (100+ iterations)

- [ ]* 1.2 Write unit tests for phone validation edge cases
  - Test empty string, null, undefined inputs
  - Test invalid formats (letters, special characters only)
  - Test boundary cases (too short, too long)
  - Test valid Indian numbers (10 digits) get +91 prefix
  - _Requirements: 1.6, 7.2_

- [x] 2. Create WhatsApp broadcast service module
  - Create `frontend/src/services/whatsappBroadcast.js`
  - Implement `generateWhatsAppLink(phoneNumber, message)` function
  - Implement `formatPhoneNumber(phone)` function for frontend validation
  - Implement `isValidPhoneNumber(phone)` function
  - Implement `composeEmergencyMessage(location, customMessage)` function
  - _Requirements: 2.4, 3.1, 3.2, 3.4, 3.5, 5.2, 5.3_

- [ ]* 2.1 Write property test for location in message
  - **Property 3: Location included in message**
  - **Validates: Requirements 2.4, 3.1**
  - Generate random valid GPS coordinates (lat: -90 to 90, lon: -180 to 180)
  - Verify generated message contains Google Maps link with coordinates
  - Test with fast-check library (100+ iterations)

- [ ]* 2.2 Write property test for distress signal
  - **Property 9: Distress signal in message**
  - **Validates: Requirements 3.2**
  - Generate random location and custom message combinations
  - Verify all generated messages contain "⚠️ EMERGENCY ALERT" text
  - Test with fast-check library (100+ iterations)

- [ ]* 2.3 Write property test for custom message appending
  - **Property 10: Custom message appended**
  - **Validates: Requirements 3.5**
  - Generate random custom message strings
  - Verify generated message contains both distress signal and custom text
  - Test with fast-check library (100+ iterations)

- [ ]* 2.4 Write property test for URL encoding
  - **Property 13: URL encoding for special characters**
  - **Validates: Requirements 5.2**
  - Generate messages with special characters (emojis, punctuation, spaces)
  - Verify wa.me URL has properly encoded message parameter
  - Test with fast-check library (100+ iterations)

- [ ]* 2.5 Write property test for wa.me URL format
  - **Property 14: Valid wa.me URL format**
  - **Validates: Requirements 5.3**
  - Generate random phone numbers and messages
  - Verify all generated URLs match pattern: `https://wa.me/[phone]?text=[encoded_message]`
  - Test with fast-check library (100+ iterations)

- [x] 3. Implement sequential broadcast function
  - Add `broadcastToContacts(phoneNumbers, message, callbacks)` to `whatsappBroadcast.js`
  - Implement sequential link opening with 2-second intervals
  - Add popup blocker detection and handling
  - Implement progress callbacks (onProgress, onComplete, onError)
  - Add duplicate broadcast prevention (debounce within 1 second)
  - _Requirements: 2.1, 2.3, 4.1, 4.2, 6.1, 6.2, 6.5_

- [ ]* 3.1 Write property test for all contacts included
  - **Property 2: All contacts included in broadcast**
  - **Validates: Requirements 2.1, 2.3**
  - Generate random non-empty contact lists (1-20 contacts)
  - Verify number of generated WhatsApp links equals contact list length
  - Test with fast-check library (100+ iterations)

- [ ]* 3.2 Write unit tests for sequential broadcast
  - Test 2-second interval timing between link openings
  - Test popup blocker handling (window.open returns null)
  - Test progress callback invocation with correct indices
  - Test error callback on exceptions
  - Mock window.open and setTimeout
  - _Requirements: 4.1, 4.2, 6.1, 6.2_

- [ ]* 3.3 Write property test for duplicate prevention
  - **Property 15: Duplicate broadcast prevention**
  - **Validates: Requirements 6.5**
  - Call broadcast function multiple times rapidly (within 1 second)
  - Verify only one broadcast execution occurs
  - Test with fast-check library (100+ iterations)

- [x] 4. Create broadcast progress modal component
  - Create `frontend/src/components/BroadcastProgressModal.js`
  - Implement modal with progress bar and status text
  - Show current contact index and total count
  - Display status: detecting-location, broadcasting, complete, error
  - Add cancel button (stops remaining broadcasts)
  - Add close button (appears on complete/error)
  - _Requirements: 6.3, 6.4_

- [x] 5. Create broadcast progress modal styles
  - Create `frontend/src/styles/BroadcastProgress.css`
  - Style modal overlay and container
  - Style progress bar with animation
  - Style status messages with appropriate colors (success: green, error: red, warning: yellow)
  - Ensure mobile-responsive design
  - _Requirements: 6.3_

- [x] 6. Checkpoint - Test frontend broadcast service
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Enhance backend SOS controller with broadcast endpoints
  - Modify `backend/src/controllers/sosController.js`
  - Add `prepareWhatsAppBroadcast` function for POST `/api/sos/prepare-whatsapp-broadcast`
  - Add `logWhatsAppBroadcast` function for POST `/api/sos/log-whatsapp-broadcast`
  - Implement contact validation using phone validation utility
  - Return formatted message, valid contacts, and alert ID
  - _Requirements: 1.2, 2.5, 7.1, 7.2, 7.5, 9.3_

- [ ]* 7.1 Write property test for empty contact list validation
  - **Property 1: Empty contact list validation**
  - **Validates: Requirements 2.5, 7.1**
  - Test prepare broadcast endpoint with user having zero contacts
  - Verify error response returned and no broadcast data generated
  - Test with fast-check library (100+ iterations)

- [ ]* 7.2 Write property test for invalid contacts filtered
  - **Property 16: Invalid contacts filtered**
  - **Validates: Requirements 7.2**
  - Generate contact lists with mix of valid and invalid phone numbers
  - Verify filtered list contains only valid phone numbers
  - Test with fast-check library (100+ iterations)

- [ ]* 7.3 Write property test for invalid contacts don't block broadcast
  - **Property 17: Invalid contacts don't block broadcast**
  - **Validates: Requirements 7.5**
  - Generate contact lists with at least one valid and some invalid contacts
  - Verify broadcast proceeds with valid contacts
  - Verify no complete failure occurs
  - Test with fast-check library (100+ iterations)

- [ ]* 7.4 Write unit tests for broadcast endpoints
  - Test prepare endpoint with valid location and contacts
  - Test prepare endpoint with missing user ID (401 error)
  - Test log endpoint with valid alert ID and broadcast results
  - Test log endpoint with invalid alert ID (404 error)
  - Mock contact model and alert model
  - _Requirements: 9.3_

- [x] 8. Enhance alert model for broadcast tracking
  - Modify `backend/src/models/alertModel.js`
  - Add `whatsappBroadcast` field to alert schema
  - Add `smsFallback` field to alert schema
  - Update `createAlert` function to accept broadcast details
  - Update `updateAlert` function to support broadcast logging
  - _Requirements: 9.3, 9.4_

- [ ]* 8.1 Write property test for broadcast attempts logged
  - **Property 19: Broadcast attempts logged**
  - **Validates: Requirements 9.3**
  - Create alerts with various broadcast attempt data
  - Verify alert records contain broadcast details (contacts attempted, timestamp)
  - Test both successful and failed broadcasts
  - Test with fast-check library (100+ iterations)

- [x] 9. Add backend routes for broadcast endpoints
  - Modify `backend/src/routes/sosRoutes.js`
  - Add POST route for `/prepare-whatsapp-broadcast` endpoint
  - Add POST route for `/log-whatsapp-broadcast` endpoint
  - Apply auth middleware to both routes
  - _Requirements: 9.3_

- [x] 10. Checkpoint - Test backend broadcast endpoints
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Enhance SOS button component with WhatsApp broadcast
  - Modify `frontend/src/components/SOSButton.js`
  - Add broadcast progress state management
  - Add `handleWhatsAppBroadcast` function
  - Integrate location detection with 10-second timeout
  - Call prepare broadcast API endpoint
  - Trigger sequential broadcast using whatsappBroadcast service
  - Call log broadcast API endpoint after completion
  - Show BroadcastProgressModal during broadcast
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 4.1, 4.2, 4.3, 6.3, 6.4_

- [ ]* 11.1 Write unit tests for SOS button broadcast integration
  - Test location detection success flow
  - Test location detection timeout (10 seconds)
  - Test location detection failure (permissions denied)
  - Test API call error handling
  - Test progress modal display during broadcast
  - Mock geolocation API, broadcast service, and API calls
  - _Requirements: 3.3, 4.3_

- [x] 12. Add WhatsApp broadcast button to SOS UI
  - Modify `frontend/src/components/SOSButton.js` UI
  - Add "WhatsApp Broadcast" button alongside existing SOS button
  - Style button with WhatsApp green color (#25D366)
  - Add WhatsApp icon or emoji (💬)
  - Ensure mobile-friendly touch target (min 44x44px)
  - _Requirements: 2.2, 6.3_

- [x] 13. Implement error handling for location unavailable
  - In `SOSButton.js`, handle location detection errors
  - Generate fallback message with "Location unavailable" text
  - Continue broadcast with fallback message
  - Display user-friendly error notification
  - Log location detection failure
  - _Requirements: 3.3, 4.3, 7.3_

- [ ]* 13.1 Write unit tests for location error handling
  - Test broadcast continues when location unavailable
  - Test fallback message contains "Location unavailable" text
  - Test error notification displays to user
  - Mock geolocation API to return errors
  - _Requirements: 3.3, 4.3, 7.3_

- [x] 14. Implement SMS fallback preservation
  - Verify existing Twilio SMS functionality in `sosController.js` remains intact
  - Ensure SMS notifications trigger in parallel with WhatsApp broadcast
  - Add SMS fallback tracking to alert model
  - Test SMS sends even if WhatsApp broadcast fails
  - _Requirements: 8.1, 8.2, 8.3, 9.5_

- [ ]* 14.1 Write property test for SMS functionality preserved
  - **Property 18: SMS functionality preserved**
  - **Validates: Requirements 8.3, 9.5**
  - Trigger SOS alerts with various WhatsApp broadcast states (success, failure, not attempted)
  - Verify SMS notifications always sent via Twilio
  - Test with fast-check library (100+ iterations)

- [ ]* 14.2 Write integration tests for SMS fallback
  - Test SMS sends when WhatsApp broadcast succeeds
  - Test SMS sends when WhatsApp broadcast fails
  - Test SMS sends when WhatsApp broadcast not attempted
  - Mock Twilio service
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 15. Add contact CRUD property tests
  - **Property 4: Contact data isolation**
  - **Property 5: Contact CRUD round-trip**
  - **Property 6: Contact update persistence**
  - **Property 7: Contact deletion removes contact**
  - **Property 8: Invalid phone numbers rejected**

- [ ]* 15.1 Write property test for contact data isolation
  - **Property 4: Contact data isolation**
  - **Validates: Requirements 1.2**
  - Create two users with separate contact lists
  - Fetch contacts for user A
  - Verify response contains only user A's contacts, none from user B
  - Test with fast-check library (100+ iterations)

- [ ]* 15.2 Write property test for contact CRUD round-trip
  - **Property 5: Contact CRUD round-trip**
  - **Validates: Requirements 1.1, 1.3**
  - Generate random valid contact data (name, phone)
  - Add contact, then retrieve user's contact list
  - Verify list includes contact with matching name and phone
  - Test with fast-check library (100+ iterations)

- [ ]* 15.3 Write property test for contact update persistence
  - **Property 6: Contact update persistence**
  - **Validates: Requirements 1.4**
  - Create contact, then update with new data
  - Retrieve contact and verify updated fields match
  - Test with fast-check library (100+ iterations)

- [ ]* 15.4 Write property test for contact deletion
  - **Property 7: Contact deletion removes contact**
  - **Validates: Requirements 1.5**
  - Create contact, then delete it
  - Retrieve contact list and verify deleted contact not present
  - Test with fast-check library (100+ iterations)

- [ ]* 15.5 Write property test for invalid phone rejection
  - **Property 8: Invalid phone numbers rejected**
  - **Validates: Requirements 1.6**
  - Generate invalid phone numbers (letters, special chars only, wrong length)
  - Attempt to add as contact
  - Verify validation error returned
  - Test with fast-check library (100+ iterations)

- [x] 16. Implement rate limiting for broadcasts
  - Add rate limiting logic to `sosController.js` prepare endpoint
  - Limit to 3 broadcasts per 60 seconds per user
  - Track broadcast timestamps in memory or alert model
  - Return 429 error with retry-after header when limit exceeded
  - _Requirements: 6.5_

- [ ]* 16.1 Write unit tests for rate limiting
  - Test 3 broadcasts within 60 seconds succeed
  - Test 4th broadcast within 60 seconds fails with 429 error
  - Test broadcasts after 60 seconds succeed again
  - Mock timestamp functions
  - _Requirements: 6.5_

- [x] 17. Add message formatting property test
  - **Property 11: Message formatting for WhatsApp**

- [ ]* 17.1 Write property test for message formatting
  - **Property 11: Message formatting for WhatsApp**
  - **Validates: Requirements 3.4**
  - Generate random emergency messages
  - Verify messages contain line breaks separating distress signal, custom text, and location
  - Verify proper formatting (distress signal on first line)
  - Test with fast-check library (100+ iterations)

- [x] 18. Final integration and wiring
  - Import BroadcastProgressModal in SOSButton component
  - Import whatsappBroadcast service in SOSButton component
  - Ensure all API endpoints properly wired in backend routes
  - Verify phone validation utility imported in SOS controller
  - Test end-to-end flow: button click → location → API → broadcast → logging
  - _Requirements: All_

- [ ]* 18.1 Write end-to-end integration tests
  - Test complete broadcast flow from button click to completion
  - Test error recovery (location fails, API fails, popup blocked)
  - Test SMS fallback triggers correctly
  - Test alert logging with all details
  - Use mocks for external services (Twilio, geolocation)
  - _Requirements: All_

- [x] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify backward compatibility with existing SMS functionality
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Verify mobile responsiveness
  - Check console for errors or warnings

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library with 100+ iterations minimum
- All property tests tagged with format: "Feature: whatsapp-group-broadcast, Property {N}: {description}"
- Sequential broadcast uses 2-second intervals to avoid popup blockers
- SMS via Twilio remains as reliable fallback mechanism
- Phone validation defaults to +91 (India) country code
- Location detection has 10-second timeout with fallback message
- Rate limiting prevents abuse (3 broadcasts per 60 seconds)
