# 🧪 Test New Features - Quick Guide

## Prerequisites

Make sure your app is running:

```bash
# Terminal 1 - Backend
cd "women safety project/backend"
npm run dev

# Terminal 2 - Frontend
cd "women safety project/frontend"
npm start
```

App should open at: http://localhost:3000

---

## Test 1: AI Chatbot (2 minutes)

### Steps:
1. Login to the app
2. Look for floating 💬 button (bottom-right corner)
3. Click the button
4. Chat window opens

### Test Interactions:
```
Type: "emergency"
Expected: Emergency procedures and helpline numbers

Type: "how to use"
Expected: App features explanation

Type: "safety tips"
Expected: Safety tips and recommendations

Type: "self defense"
Expected: Self defense guidance

Click: "🚨 Emergency" quick action button
Expected: Emergency information
```

### Verify:
- ✅ Chat window opens/closes smoothly
- ✅ Messages appear instantly
- ✅ Quick action buttons work
- ✅ Scroll works in message area
- ✅ Can type and send messages
- ✅ Bot responses are relevant

---

## Test 2: Fake Call (3 minutes)

### Steps:
1. Click "📞 Fake Call" in navigation
2. Fake Call page opens

### Test Immediate Call:
```
1. Set caller name: "Mom"
2. Set caller number: "+91 98765 43210"
3. Keep delay at: 0
4. Click: "Start Fake Call Now"
```

### Expected Behavior:
- ✅ Full-screen call screen appears
- ✅ Shows "Incoming Call..."
- ✅ Displays caller name and number
- ✅ Ringtone plays (beeping sound)
- ✅ Phone vibrates (on mobile)
- ✅ Ringing animation visible

### Test Answer Call:
```
1. Click "Answer" button
2. Call screen changes
```

### Expected:
- ✅ Shows "Call in Progress"
- ✅ Timer starts (00:00, 00:01, 00:02...)
- ✅ Shows Mute, Speaker, End Call buttons
- ✅ Ringtone stops

### Test End Call:
```
1. Click "End Call" button
```

### Expected:
- ✅ Returns to Fake Call setup page
- ✅ Timer resets

### Test Delayed Call:
```
1. Set delay: 5 seconds
2. Click "Schedule Call (5s)"
3. Wait 5 seconds
```

### Expected:
- ✅ Alert shows "Fake call scheduled in 5 seconds!"
- ✅ After 5 seconds, call screen appears
- ✅ Ringtone plays

### Test Presets:
```
1. Click "Mom" preset button
```

### Expected:
- ✅ Name changes to "Mom"
- ✅ Number auto-fills

---

## Test 3: Crime Heatmap (3 minutes)

### Steps:
1. Click "🗺️ Crime Map" in navigation
2. Crime Heatmap page opens
3. Allow location permission if prompted

### Verify Map Display:
- ✅ Map background visible
- ✅ Multiple crime markers visible (colored circles with emojis)
- ✅ "📍 You" marker shows your location
- ✅ Legend shows: High Risk (red), Medium Risk (yellow), Low Risk (green)

### Test Filters:
```
1. Click "⚠️ Harassment" filter
```

### Expected:
- ✅ Button becomes active (purple background)
- ✅ Only harassment markers visible
- ✅ Other crime types hidden

```
2. Click "All Crimes" filter
```

### Expected:
- ✅ All markers visible again

### Test Marker Click:
```
1. Click any crime marker on map
```

### Expected:
- ✅ Area details panel appears below map
- ✅ Shows area name
- ✅ Shows crime type with icon
- ✅ Shows total incidents
- ✅ Shows risk level (HIGH/MEDIUM/LOW)
- ✅ Shows safety score with colored bar
- ✅ Shows description
- ✅ "View on Google Maps" button visible

```
2. Click "View on Google Maps" button
```

### Expected:
- ✅ Opens Google Maps in new tab
- ✅ Shows location on map

```
3. Click ✕ button in area details
```

### Expected:
- ✅ Area details panel closes

### Verify Statistics:
- ✅ Statistics section shows total areas
- ✅ Shows high risk zones count
- ✅ Shows total incidents
- ✅ Safety tips section visible

---

## Test 4: Navigation Integration (1 minute)

### Verify Navigation Bar:
```
Check that navigation has 7 buttons:
1. 🏠 Home
2. 👥 Contacts
3. 📞 Fake Call (NEW)
4. 🗺️ Crime Map (NEW)
5. 🥋 Self Defense
6. 📍 GPS Tracking
7. 📞 Helplines
```

### Test Navigation:
```
1. Click each button
2. Verify correct page loads
3. Check active button highlights
```

### Expected:
- ✅ All buttons work
- ✅ Active button has different style
- ✅ Content changes correctly

---

## Test 5: Home Page Cards (1 minute)

### Verify Home Page:
```
1. Go to Home tab
2. Scroll down to info cards
```

### Expected Cards:
- ✅ 📱 Trusted Contacts
- ✅ 🥋 Self Defense
- ✅ 📍 GPS Tracking
- ✅ 📞 Fake Call (NEW)
- ✅ 🗺️ Crime Map (NEW)

### Test Card Buttons:
```
1. Click "Setup Call" on Fake Call card
```

### Expected:
- ✅ Navigates to Fake Call tab

```
2. Click "View Map" on Crime Map card
```

### Expected:
- ✅ Navigates to Crime Map tab

---

## Test 6: Mobile Responsiveness (2 minutes)

### Test on Mobile or Resize Browser:
```
1. Open browser DevTools (F12)
2. Click device toolbar icon (phone icon)
3. Select "iPhone 12 Pro" or similar
```

### Verify AI Chatbot:
- ✅ Chat button visible and accessible
- ✅ Chat window fits screen
- ✅ Messages readable
- ✅ Input works on mobile keyboard

### Verify Fake Call:
- ✅ Setup form fits screen
- ✅ Call screen is full-screen
- ✅ Buttons are touch-friendly
- ✅ Text is readable

### Verify Crime Map:
- ✅ Map fits screen
- ✅ Filters scroll horizontally
- ✅ Markers are tappable
- ✅ Area details readable

---

## Test 7: Cross-Feature Integration (2 minutes)

### Test Chatbot + Other Features:
```
1. Open AI Chatbot
2. Type: "how do I use fake call"
```

### Expected:
- ✅ Bot explains fake call feature

```
3. Type: "show me crime map"
```

### Expected:
- ✅ Bot explains crime map feature

### Test All Features Together:
```
1. Open Crime Map
2. Click a high-risk area
3. Open AI Chatbot (should stay on Crime Map)
4. Ask: "what should I do in unsafe areas"
5. Close chatbot
6. Navigate to Fake Call
7. Setup a delayed call
8. Go back to Crime Map
9. Wait for fake call to trigger
```

### Expected:
- ✅ All features work independently
- ✅ Chatbot accessible from any page
- ✅ Fake call triggers even on different page
- ✅ No conflicts between features

---

## Common Issues & Solutions

### Issue: Chatbot button not visible
**Solution**: Check z-index in CSS, refresh page

### Issue: Fake call ringtone not playing
**Solution**: Check browser audio permissions, unmute device

### Issue: Crime map markers not showing
**Solution**: Check console for errors, verify data loaded

### Issue: Location permission denied
**Solution**: Allow location in browser settings, refresh page

### Issue: Navigation buttons overlapping
**Solution**: Resize browser, check mobile view

---

## Performance Checklist

- ✅ Page loads in < 3 seconds
- ✅ Chatbot opens instantly
- ✅ Fake call screen appears immediately
- ✅ Crime map renders smoothly
- ✅ No console errors
- ✅ No memory leaks (check DevTools)
- ✅ Smooth animations
- ✅ Responsive on all screen sizes

---

## Browser Compatibility

Test on:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

---

## Final Verification

All features working:
- ✅ AI Chatbot responds correctly
- ✅ Fake Call simulates realistically
- ✅ Crime Map displays and filters work
- ✅ Navigation between features smooth
- ✅ Mobile responsive
- ✅ No errors in console
- ✅ All existing features still work

---

## Report Issues

If you find bugs:
1. Note the feature name
2. Describe what you did
3. What you expected
4. What actually happened
5. Browser and device info
6. Console errors (F12 → Console)

---

## Success Criteria

✅ All 7 tests pass
✅ No console errors
✅ Mobile responsive
✅ Features work independently
✅ Existing features unaffected

If all criteria met: **Features are ready to use!** 🎉
