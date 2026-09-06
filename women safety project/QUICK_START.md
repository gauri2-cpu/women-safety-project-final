# ⚡ Quick Start Guide

Get the Women Safety Website running in 10 minutes!

## 🎯 5-Minute Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies (2 min)
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env file (get Twilio credentials from https://www.twilio.com)
# Edit these lines:
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# 5. Start server (1 min)
npm run dev

# ✅ Backend ready on http://localhost:5000
```

## 🎯 5-Minute Frontend Setup

```bash
# 1. Open new terminal, navigate to frontend
cd frontend

# 2. Install dependencies (2 min)
npm install

# 3. Create environment file
cp .env.example .env

# 4. .env already has correct backend URL
# No changes needed unless backend on different port

# 5. Start React app (1 min)
npm start

# ✅ App ready on http://localhost:3000
# Browser should open automatically
```

## 🧪 Test It in 30 Seconds

1. **Click "Continue as Guest"** ✓
2. **Click "➕ Add Contact"** and add your phone number ✓
3. **Hold SOS button for 1.5 seconds** ✓
4. **Confirm the alert** ✓
5. **Check backend console** - alert should be logged ✓

## 📋 Files You MUST Edit

### Backend (.env)
```bash
# File: backend/.env

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=auth_token_xxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
# File: frontend/.env
# Already correct for local development!
# REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## 🚨 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| **Backend won't start** | Port 5000 in use? Run `npm run dev` with `PORT=5001 npm run dev` |
| **"Cannot find module"** | Run `npm install` in both folders |
| **Frontend can't connect** | Verify backend is running: `curl http://localhost:5000/api/health` |
| **SOS button not working** | Check browser console (F12 → Console tab) |
| **Location not requested** | Check if HTTP (need HTTPS for production) |

## 📚 Project Structure at a Glance

```
women-safety-project/
├── backend/                  # Node.js API server
│   ├── src/server.js        # Main server file
│   ├── package.json         # Dependencies (npm install reads this)
│   └── .env                 # Secret credentials (EDIT THIS!)
│
├── frontend/                # React web app
│   ├── src/App.js           # Main component
│   ├── package.json         # Dependencies
│   └── .env                 # Config (already correct)
│
├── README.md               # Full documentation
├── DEPLOYMENT.md          # Deploy to production
├── TESTING.md             # Detailed testing guide
└── QUICK_START.md         # This file!
```

## 🎨 Key Features to Try

### 1. **Add Trusted Contact**
   - Name: Mom
   - Phone: +91 9876543210 (format: +country_code number)

### 2. **Trigger SOS**
   - Hold SOS button 1.5 seconds
   - Add message (optional)
   - Choose SMS/WhatsApp/Both
   - Confirm

### 3. **View Helplines**
   - 10+ India emergency numbers
   - Click category filters
   - Call directly or send WhatsApp

### 4. **Quick Exit**
   - Red "Close" button in top-left
   - Redirects to random neutral page

## 🔐 Get Twilio Credentials (5 min)

1. Go to https://www.twilio.com/console
2. Sign up (free trial with $15 credit)
3. Copy **Account SID** and **Auth Token**
4. Get a **Phone Number** from Twilio
5. Paste into `backend/.env`

**Note:** Trial accounts work but may have restrictions. Upgrade for production.

## 📱 Test on Mobile

```bash
# Find your computer IP address
# Windows: ipconfig (look for IPv4 Address)
# Mac/Linux: ifconfig

# Then access from mobile:
# http://YOUR_IP:3000

# Or use ngrok for HTTPS:
npm install -g ngrok
ngrok http 3000
# Use ngrok URL on any device
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend terminal shows: "Server running on http://localhost:5000"
- [ ] Frontend automatically opens browser with app
- [ ] Can add contacts without errors
- [ ] SOS button modal appears (hold 1.5s)
- [ ] No red errors in browser console (F12)
- [ ] Backend console logs SOS request

## 🚀 Next Steps

### Want to Deploy?
See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Deploy to Render (free)
- Deploy to Vercel (free)
- Deploy to Replit (free)

### Want to Test Everything?
See [TESTING.md](TESTING.md) for:
- Complete test scenarios
- 50+ test cases
- Mobile testing
- Production testing

### Want Full Details?
See [README.md](README.md) for:
- Architecture overview
- Complete API documentation
- Configuration guide
- Troubleshooting

## 📞 Need Help?

### Check These First:
1. **Backend logs** - Terminal running backend
2. **Frontend console** - Browser F12 → Console
3. **Network tab** - Browser F12 → Network (watch API calls)
4. **Twilio console** - Check SMS/WhatsApp delivery

### Common Errors:

**"Cannot GET /api/contacts"**
→ Backend not running

**"TWILIO_ACCOUNT_SID not defined"**
→ .env file not created or incomplete

**"geolocation not available"**
→ Browser location permission denied

## 🎓 College Project Tips

- ✅ This is a complete, working project
- ✅ Includes all requested features
- ✅ Production-ready deployment guide
- ✅ Comprehensive documentation
- ✅ Easy to present and demo
- ✅ Can be enhanced with more features

## 🎯 One-Line Commands to Remember

```bash
# Backend: Install and start
cd backend && npm install && npm run dev

# Frontend: Install and start (new terminal)
cd frontend && npm install && npm start

# Check if backend is running
curl http://localhost:5000/api/health

# Check if frontend is running
# Just open http://localhost:3000 in browser
```

## 📊 Test Data Ready to Use

Copy-paste these for quick testing:

```
Email: test@example.com
Name: Test User
Phone: +91 9876543210

Contact Name: Emergency
Contact Phone: +91 9876543211

SOS Message: Help! Emergency situation!
Location: Auto-detected from browser
```

## 🎉 You're Ready!

Everything is set up. Now:

1. **Start Backend** → Terminal 1
2. **Start Frontend** → Terminal 2
3. **Open Browser** → http://localhost:3000
4. **Test Features** → See TESTING.md
5. **Deploy** → See DEPLOYMENT.md

---

**Got stuck?** Check:
- README.md (comprehensive guide)
- TESTING.md (step-by-step tests)
- DEPLOYMENT.md (deploy to production)

**Happy coding!** 🚀

---

**Last Updated**: December 14, 2024
