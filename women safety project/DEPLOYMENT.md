# 🚀 Deployment Guide

Complete instructions for deploying the Women Safety Website to production.

## 📋 Pre-Deployment Checklist

- [ ] Backend configured with environment variables
- [ ] Twilio account set up with API credentials
- [ ] Frontend API URL points to backend
- [ ] HTTPS enabled (required for geolocation)
- [ ] All dependencies installed and tested locally

---

## 🔷 Option 1: Deploy on Render (Recommended - Free Tier Available)

### Step 1: Prepare Backend for Render

1. **Create a `Procfile` in the backend directory**:
```
web: node src/server.js
```

2. **Update `package.json` scripts**:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

3. **Test locally**:
```bash
npm run start
# Should run on specified port
```

### Step 2: Deploy Backend to Render

1. **Sign up at [Render.com](https://render.com)**

2. **Connect GitHub repository** (or push your code to GitHub)

3. **Create New Web Service**:
   - Choose "Node" runtime
   - Set start command: `npm start`
   - Set build command: `npm install`

4. **Add Environment Variables**:
   - Go to Environment tab
   - Add all variables from `.env`:
     ```
     PORT=10000
     NODE_ENV=production
     TWILIO_ACCOUNT_SID=your_sid
     TWILIO_AUTH_TOKEN=your_token
     TWILIO_PHONE_NUMBER=+your_number
     TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number
     FRONTEND_URL=https://your-frontend-url.vercel.app
     GOOGLE_MAPS_API_KEY=your_key
     ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy backend URL (e.g., `https://women-safety-api.onrender.com`)

6. **Note**: Free tier on Render spins down after 15 minutes of inactivity
   - Upgrade to paid tier for continuous operation ($7/month)

### Step 3: Deploy Frontend to Vercel

1. **Sign up at [Vercel.com](https://vercel.com)**

2. **Create `.env.production` in frontend**:
```env
REACT_APP_API_BASE_URL=https://women-safety-api.onrender.com/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
```

3. **Deploy from GitHub**:
   - Import project from GitHub
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Add environment variables

4. **Deploy**:
   - Click "Deploy"
   - Wait for completion (2-3 minutes)
   - Get your Vercel URL

5. **Update Backend FRONTEND_URL**:
   - Go back to Render backend
   - Update environment variable `FRONTEND_URL` with your Vercel URL
   - Redeploy backend

---

## 🌐 Option 2: Deploy on Replit (Quick & Easy)

### Step 1: Upload to Replit

1. **Sign up at [Replit.com](https://replit.com)**

2. **Create new Repl**:
   - Choose "Import from GitHub"
   - Select your repository
   - Or upload files manually

3. **Manage Environment Variables**:
   - Click "Secrets" (lock icon)
   - Add all environment variables

### Step 2: Configure Backend

1. **Update `server.js`** to use Replit port:
```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

2. **Create `.replit` file**:
```
run = "npm install && npm start"
```

3. **Click Run** button to start server

4. **Get Replit URL** from browser tab (e.g., `https://project-name.username.repl.co`)

### Step 3: Deploy Frontend on Replit

1. **Create separate Repl for frontend**:
   - Choose "React" template
   - Replace code with your React app

2. **Install dependencies**:
```bash
npm install
```

3. **Update `.env`**:
```env
REACT_APP_API_BASE_URL=https://women-safety-backend.username.repl.co/api
```

4. **Run frontend**:
```bash
npm start
```

---

## ☁️ Option 3: Deploy on Azure (Free Tier Available)

### Backend Deployment

1. **Sign up at [Azure.com](https://azure.com)**

2. **Create App Service**:
   - Resource group: Create new
   - Name: women-safety-api
   - Runtime: Node.js
   - Region: Nearest to you

3. **Deploy via Git**:
```bash
# Install Azure CLI
# Login
az login

# Deploy from local repo
az webapp up --name women-safety-api --resource-group myResourceGroup
```

4. **Set Environment Variables**:
   - Go to App Service > Configuration
   - Add connection strings and app settings
   - Save and restart app

### Frontend Deployment

1. **Create Static Web App**:
   - Resource: Static Web Apps
   - Name: women-safety-app

2. **Deploy React build**:
```bash
npm run build
# Deploy the 'build' folder to Static Web Apps
```

---

## 🔒 Post-Deployment Security

### 1. Enable HTTPS Everywhere
```javascript
// Add to server.js
const express = require('express');
const app = express();

// Force HTTPS in production
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});
```

### 2. Secure CORS Headers
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 3. Set Security Headers
```javascript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
```

### 4. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitor Deployed Applications

### Render Monitoring
- View logs in Render dashboard
- Check CPU, memory, bandwidth usage
- Set up email alerts for failures

### Vercel Monitoring
- View deployment logs
- Check performance analytics
- Monitor function execution

### Error Tracking (Optional)
```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
app.use(Sentry.Handlers.errorHandler());
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Render & Vercel**: Automatically rebuild and deploy when you push to GitHub

**Steps**:
1. Connect your GitHub repository
2. Any push to main branch triggers build
3. Automatic redeploy on success

### Environment Variables Management

**Best Practices**:
- Never commit `.env` files
- Use platform secrets/environment variables
- Rotate API keys regularly
- Different credentials for dev/prod

---

## 💾 Database Backup (Important!)

### Backup JSON Data Files

**Option 1: Manual Backup**
```bash
# Download data files from backend
# Keep weekly backups locally
```

**Option 2: Auto Backup (MongoDB Alternative)**
```javascript
// For production, consider migrating to MongoDB:
// npm install mongoose
// Replace JSON storage with MongoDB
```

**Option 3: Cloud Backup**
- Use cloud storage (AWS S3, Google Cloud Storage)
- Backup data files daily
- Version control backups

---

## 📈 Scaling Guide

### Increase Performance
1. **Enable Caching**:
   - CloudFlare CDN for frontend
   - Redis for backend session storage

2. **Database Optimization**:
   - Migrate from JSON to MongoDB
   - Add indexing for faster queries
   - Implement pagination

3. **API Optimization**:
   - Enable gzip compression
   - Implement request caching
   - Rate limiting to prevent abuse

### Increase Capacity
1. **Vertical Scaling**:
   - Upgrade to higher tier
   - Increase RAM and CPU

2. **Horizontal Scaling**:
   - Multiple backend instances
   - Load balancer
   - Distributed database

---

## 🧪 Testing Deployment

### Test SOS Alert in Production
1. **Create test account**
2. **Add test contact with your number**
3. **Trigger SOS alert**
4. **Verify SMS/WhatsApp received**
5. **Check location accuracy**

### Performance Testing
```bash
npm install -g artillery

# Create artillery-config.yml
artillery quick --count 100 --num 10 https://your-api-url.com/api/health
```

---

## 🆘 Common Deployment Issues

### Issue: Backend responds with 502/503
**Solution**:
- Check backend logs in platform dashboard
- Verify environment variables are set
- Ensure database files have correct permissions

### Issue: Frontend can't connect to backend
**Solution**:
- Verify backend API URL in frontend `.env`
- Check CORS configuration
- Ensure both are HTTPS in production

### Issue: Twilio SMS not sending
**Solution**:
- Verify Twilio credentials in backend env vars
- Check phone number format
- Ensure Twilio account is upgraded

### Issue: Geolocation not working
**Solution**:
- Must use HTTPS (not HTTP)
- Check browser location permissions
- Verify browser supports Geolocation API

---

## 📞 Support URLs

After deployment, you'll have:
- **Backend API**: `https://your-backend-url.com/api`
- **Frontend App**: `https://your-frontend-url.com`

**Health Check**:
```bash
curl https://your-backend-url.com/api/health
```

---

## 🎯 Final Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] HTTPS enabled everywhere
- [ ] SOS alert tested with real SMS
- [ ] Contacts feature working
- [ ] Helplines displaying correctly
- [ ] Quick exit button functional
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Monitoring/logging set up

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Replit Docs](https://docs.replit.com)
- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service)

---

**Estimated Deployment Time**: 20-30 minutes  
**Cost**: Free tier available on most platforms ($0-7/month for production)

**Last Updated**: December 14, 2024
