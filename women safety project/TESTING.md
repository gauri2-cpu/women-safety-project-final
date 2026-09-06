# 🧪 Testing Guide

Complete guide to test all features of the Women Safety Website locally and in production.

## 📋 Pre-Testing Requirements

- ✅ Backend running on `http://localhost:5000`
- ✅ Frontend running on `http://localhost:3000`
- ✅ `.env` files properly configured
- ✅ Browser with location services enabled
- ✅ Twilio account set up with test credentials (optional)

---

## 🔐 Part 1: Authentication Testing

### Test 1.1: Guest Login

**Steps:**
1. Open app at `http://localhost:3000`
2. Click "Continue as Guest" button
3. Should redirect to main app interface

**Expected Results:**
- ✅ User ID generated
- ✅ "Guest Mode" label shown in header
- ✅ Can proceed without signup
- ✅ Session stored in localStorage

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/users/guest-login
```

### Test 1.2: User Signup

**Steps:**
1. Click "Sign Up" tab
2. Enter:
   - Email: `test@example.com`
   - Name: `Test User`
   - Phone: `+91 9876543210`
3. Click "Create Account"

**Expected Results:**
- ✅ Account created successfully
- ✅ Redirected to main interface
- ✅ User name shown in header
- ✅ Token stored in localStorage

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+91 9876543210"
  }'
```

### Test 1.3: User Login

**Steps:**
1. Logout (if already logged in)
2. Click "Login" tab
3. Enter email: `test@example.com`
4. Click "Login"

**Expected Results:**
- ✅ Account logged in successfully
- ✅ Same user data displayed
- ✅ Access to all features
- ✅ Logout button appears

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test 1.4: Duplicate Email Prevention

**Steps:**
1. Try to signup with same email again
2. System should reject

**Expected Results:**
- ✅ Error message: "User already exists"
- ✅ Account not created

---

## 👥 Part 2: Trusted Contacts Testing

### Test 2.1: Add Contact

**Steps:**
1. Login with a user account
2. Click "➕ Add Contact"
3. Enter:
   - Name: `Mom`
   - Phone: `+91 9876543211`
4. Click "✓ Add Contact"

**Expected Results:**
- ✅ Contact added to list
- ✅ Form cleared
- ✅ Contact visible in card format
- ✅ Backend saves contact

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "x-user-id: user-uuid" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mom", "phone": "+91 9876543211"}'
```

### Test 2.2: Add Multiple Contacts

**Steps:**
1. Add 3-5 different contacts
2. Verify all appear in list

**Contacts to add:**
- Mom: `+91 9876543211`
- Sister: `+91 9876543212`
- Friend: `+91 9876543213`
- Police: `100`
- Hospital: `102`

**Expected Results:**
- ✅ All contacts displayed
- ✅ Contact count correct
- ✅ All data persisted

### Test 2.3: Edit Contact

**Steps:**
1. Click ✏️ (edit) on a contact
2. Change name to "Mother"
3. Change phone to `+91 9876543220`
4. Click "✓ Update"

**Expected Results:**
- ✅ Contact updated successfully
- ✅ List refreshes
- ✅ Changes persisted

**Test Command:**
```bash
curl -X PUT http://localhost:5000/api/contacts/contact-uuid \
  -H "x-user-id: user-uuid" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mother", "phone": "+91 9876543220"}'
```

### Test 2.4: Delete Contact

**Steps:**
1. Click 🗑️ (delete) on a contact
2. Confirm deletion

**Expected Results:**
- ✅ Contact removed from list
- ✅ Confirmation message shown
- ✅ Change persisted in backend

**Test Command:**
```bash
curl -X DELETE http://localhost:5000/api/contacts/contact-uuid \
  -H "x-user-id: user-uuid"
```

### Test 2.5: Phone Number Validation

**Steps:**
1. Try adding contact with invalid phone:
   - Empty phone
   - Invalid format
   - Letters instead of numbers

**Expected Results:**
- ✅ Validation error shown
- ✅ Contact not added
- ✅ Error message displayed

**Invalid Inputs to Test:**
- `abc123def`
- `12345` (too short)
- `(555)` (incomplete)
- Empty string

---

## 🚨 Part 3: SOS Alert Testing

### Test 3.1: Trigger SOS with Mock Twilio

**Setup:**
1. Add at least 2 contacts first
2. Enable location in browser permissions

**Steps:**
1. Position mouse over SOS button
2. Hold for 1.5 seconds
3. Confirmation modal appears
4. Optional: Add message
5. Select notification method (SMS/WhatsApp/Both)
6. Click "✓ Send Alert"

**Expected Results:**
- ✅ Modal appears after 1.5 second press
- ✅ Location requested from browser
- ✅ Contact list preview shown
- ✅ Maps link generated
- ✅ Alert triggered message shown
- ✅ Confirmation with contact count

**Backend Console Output:**
```
[Time] POST /api/sos/trigger
Alert triggered for user: uuid
Location: 28.7041, 77.1025
Contacts notified: 2
```

### Test 3.2: SOS with Custom Message

**Steps:**
1. Trigger SOS again
2. In message field, enter: `Help! I'm at Delhi station`
3. Select notification method
4. Send alert

**Expected Results:**
- ✅ Character count updates (max 200)
- ✅ Custom message sent to contacts
- ✅ Message includes location link
- ✅ Alert logged with message

**Test Message:**
```
⚠️ EMERGENCY ALERT!

Help! I'm at Delhi station

Location: https://maps.google.com/?q=28.7041,77.1025

Please contact me or emergency services.
```

### Test 3.3: SOS Without Contacts

**Steps:**
1. Delete all contacts
2. Try to trigger SOS

**Expected Results:**
- ✅ SOS button works
- ✅ Location retrieved
- ✅ Warning: "No trusted contacts to notify"
- ✅ Send Alert button disabled in modal

**Error Message:**
```
⚠️ No trusted contacts added. Please add contacts first.
```

### Test 3.4: Notification Method Selection

**Test SMS Only:**
1. Trigger SOS
2. Select "📱 SMS Only"
3. Send alert
4. Check backend logs for SMS only

**Test WhatsApp Only:**
1. Trigger SOS
2. Select "💬 WhatsApp Only"
3. Send alert
4. Check logs for WhatsApp only

**Test Both:**
1. Trigger SOS
2. Select "📱💬 Both (SMS + WhatsApp)"
3. Send alert
4. Check logs for both methods

**Expected Results:**
- ✅ Only selected method used
- ✅ Correct notification logs
- ✅ All contacts notified
- ✅ No unselected methods triggered

### Test 3.5: View SOS History

**Steps:**
1. Click on "View Alerts" or similar
2. See list of previous SOS alerts
3. Click on alert for details

**Expected Results:**
- ✅ Alert history displayed
- ✅ Latest alerts first
- ✅ Show location, time, message
- ✅ Show contacts notified

**Test Command:**
```bash
curl http://localhost:5000/api/sos/alerts \
  -H "x-user-id: user-uuid" \
  -H "Content-Type: application/json"
```

### Test 3.6: Resolve Alert

**Steps:**
1. View an active alert
2. Click "Resolve" or "Cancel"
3. Confirm resolution

**Expected Results:**
- ✅ Alert status changed
- ✅ No longer active
- ✅ Timestamp recorded

---

## 📞 Part 4: Helpline Numbers Testing

### Test 4.1: View All Helplines

**Steps:**
1. Scroll to "Emergency Helpline Numbers" section
2. See 10+ helplines listed
3. Each should have name, number, hours

**Expected Results:**
- ✅ All helplines displayed
- ✅ India-specific numbers (various states)
- ✅ 24/7 availability marked
- ✅ Categories shown

### Test 4.2: Filter by Category

**Steps:**
1. Click "🚨 Emergency" filter
2. Should show only emergency services
3. Click "👩 Women Safety"
4. Should show women helplines
5. Click "All Helplines"
6. Should show all again

**Expected Results:**
- ✅ Filter works correctly
- ✅ Right helplines shown
- ✅ Active filter highlighted
- ✅ Count updates

### Test 4.3: Call Helpline

**Steps:**
1. Find "National Women Helpline"
2. Click "Call Now" button
3. Phone dialer should open

**Expected Results:**
- ✅ Tel: link opens dialer
- ✅ Number formatted correctly
- ✅ Works on mobile and desktop

**On Desktop:** Shows dial prompt  
**On Mobile:** Opens phone dialer  

### Test 4.4: WhatsApp Message

**Steps:**
1. Find helpline with WhatsApp number
2. Click WhatsApp button
3. Should open WhatsApp with pre-filled message

**Expected Results:**
- ✅ WhatsApp opens (if installed)
- ✅ Number pre-filled
- ✅ Message template included
- ✅ Ready to send

---

## 🏃 Part 5: Quick Exit Testing

### Test 5.1: Quick Exit Button

**Steps:**
1. Click "⬅️ Close" button in top-left
2. Should redirect to neutral page

**Expected Destinations:**
- Google Search
- Wikipedia
- Weather.com
- Google News

**Expected Results:**
- ✅ Page redirects (random neutral site)
- ✅ History shows exit page, not app
- ✅ Quick escape possible
- ✅ Non-suspicious browsing history

### Test 5.2: Quick Exit on Mobile

**Steps:**
1. On mobile device
2. Click Close button
3. Should still work

**Expected Results:**
- ✅ Works on all screen sizes
- ✅ Visible and accessible
- ✅ Quick to tap

---

## 🌍 Part 6: Responsive Design Testing

### Test 6.1: Desktop (1920x1080)

**Steps:**
1. Open app on desktop browser
2. Test all features
3. Check layout

**Expected Results:**
- ✅ Multi-column layout
- ✅ Readable text
- ✅ Proper spacing
- ✅ All buttons accessible

### Test 6.2: Tablet (768x1024)

**Steps:**
1. Resize browser to 768px width
2. Test all features
3. Scroll should work

**Expected Results:**
- ✅ Single column
- ✅ Touch-friendly buttons
- ✅ Readable on smaller screen
- ✅ No horizontal scroll

### Test 6.3: Mobile (375x667)

**Steps:**
1. Resize to iPhone size
2. Test on actual mobile if possible
3. Test touch interactions

**Expected Results:**
- ✅ Full-width responsive
- ✅ Large touch targets (44px+)
- ✅ Font size 16px+ (readable)
- ✅ No overflow
- ✅ Forms fill width
- ✅ Buttons stacked vertically

### Test 6.4: Mobile Landscape (667x375)

**Steps:**
1. Rotate device
2. Test SOS button placement
3. Test modal layout

**Expected Results:**
- ✅ Adapts to landscape
- ✅ All content visible
- ✅ No cutoff
- ✅ Modal still usable

---

## 🔌 Part 7: Browser Compatibility Testing

### Test 7.1: Chrome/Chromium

```
✅ Full support expected
- Geolocation: ✅
- LocalStorage: ✅
- Fetch API: ✅
```

### Test 7.2: Firefox

```
✅ Full support expected
- Geolocation: ✅
- LocalStorage: ✅
- Fetch API: ✅
```

### Test 7.3: Safari (iOS)

```
✅ Mostly supported
- Geolocation: ✅ (requires HTTPS + user permission)
- LocalStorage: ✅
- Fetch API: ✅
- Note: May require explicit HTTPS
```

### Test 7.4: Edge

```
✅ Full support expected
- Chromium-based, same as Chrome
```

---

## 🧪 Part 8: Error Handling Testing

### Test 8.1: Backend Down

**Steps:**
1. Stop backend server (`Ctrl+C`)
2. Try to add contact or trigger SOS
3. Restart backend

**Expected Results:**
- ✅ Error message shown
- ✅ User notified
- ✅ No crash
- ✅ Works again when backend up

**Error Message:**
```
❌ Error: Backend server is not responding
```

### Test 8.2: Network Error

**Steps:**
1. Disable internet
2. Try API call
3. Re-enable internet

**Expected Results:**
- ✅ Timeout error shown
- ✅ User can retry
- ✅ No hang/freeze

### Test 8.3: Location Permission Denied

**Steps:**
1. Block location in browser
2. Trigger SOS
3. Allow location

**Expected Results:**
- ✅ Error message: "Location permission denied"
- ✅ User can retry
- ✅ Can change permissions and try again

### Test 8.4: Invalid Phone Number

**Steps:**
1. Try adding contact with:
   - `abc123`
   - `12345`
   - Special characters
   - Empty field

**Expected Results:**
- ✅ Validation error
- ✅ Contact not added
- ✅ Clear error message

---

## 📊 Part 9: Performance Testing

### Test 9.1: Load Time

**Measurement:**
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Check load time

**Expected:**
- ✅ Initial load: < 3 seconds
- ✅ API response: < 1 second
- ✅ Location request: < 2 seconds

### Test 9.2: Memory Usage

**Steps:**
1. Open DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Trigger SOS multiple times
5. Take another snapshot

**Expected:**
- ✅ No memory leaks
- ✅ Memory stable
- ✅ Cleanup after operations

### Test 9.3: With Many Contacts

**Steps:**
1. Add 20+ contacts
2. Test list rendering
3. Test SOS with many contacts

**Expected:**
- ✅ Still responsive
- ✅ No lag
- ✅ Proper scrolling
- ✅ All contacts notified

---

## 🚀 Part 10: Production Testing

### Test 10.1: Deploy to Test Server

**Steps:**
1. Deploy backend to Render/Replit
2. Deploy frontend to Vercel
3. Run full test suite
4. Check SSL certificate

**Expected:**
- ✅ HTTPS working
- ✅ All features functional
- ✅ No console errors
- ✅ Geolocation working (HTTPS required)

### Test 10.2: Real Twilio Integration

**Steps:**
1. Configure real Twilio account
2. Add your real phone number as contact
3. Trigger SOS
4. Verify SMS/WhatsApp received

**Expected:**
- ✅ SMS received within 10 seconds
- ✅ Message includes location
- ✅ WhatsApp link works
- ✅ Maps link opens correctly

### Test 10.3: Cross-Browser Testing (Production)

**Browsers to test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome (Android)

**Steps:**
1. Test each browser
2. Test on actual mobile devices
3. Verify all features work
4. Check console for errors

---

## 📋 Testing Checklist

### Authentication ✅
- [ ] Guest login
- [ ] User signup
- [ ] User login
- [ ] Duplicate email prevention
- [ ] Session persistence
- [ ] Logout

### Contacts ✅
- [ ] Add contact
- [ ] View contacts
- [ ] Edit contact
- [ ] Delete contact
- [ ] Phone validation
- [ ] Multiple contacts
- [ ] No contacts error

### SOS Alerts ✅
- [ ] Trigger SOS (hold 1.5s)
- [ ] Location detection
- [ ] Custom message
- [ ] SMS notification
- [ ] WhatsApp notification
- [ ] Both notifications
- [ ] Alert history
- [ ] Resolve alert
- [ ] Maps link generation

### Helplines ✅
- [ ] Display all helplines
- [ ] Filter by category
- [ ] Call functionality
- [ ] WhatsApp messaging
- [ ] 24/7 info display

### UI/UX ✅
- [ ] Quick exit button
- [ ] Responsive design
- [ ] Mobile optimized
- [ ] Animations smooth
- [ ] Error messages clear
- [ ] Loading states shown

### Technical ✅
- [ ] HTTPS in production
- [ ] CORS working
- [ ] LocalStorage saves
- [ ] Geolocation working
- [ ] API calls successful
- [ ] No console errors

---

## 🎯 Test Results Template

```markdown
# Test Results - [Date]

## Environment
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Browser: Chrome 121.0
- Device: [Desktop/Mobile/Tablet]

## Results Summary
- Total Tests: 50
- Passed: 50
- Failed: 0
- Issues: None

## Feature Status
- Authentication: ✅ PASS
- Contacts: ✅ PASS
- SOS Alerts: ✅ PASS
- Helplines: ✅ PASS
- Quick Exit: ✅ PASS
- Responsive: ✅ PASS

## Issues Found
None

## Notes
All features working as expected.
```

---

## 📞 Support

If tests fail:
1. Check backend logs
2. Check browser console
3. Verify .env configuration
4. Clear browser cache
5. Restart servers
6. Check troubleshooting section in main README

---

**Last Updated**: December 14, 2024  
**Test Version**: 1.0.0
