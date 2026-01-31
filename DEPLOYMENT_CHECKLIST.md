# 🚀 CricScore Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All features implemented and tested
- [x] No console.errors in production build
- [x] All TypeScript/ESLint errors resolved
- [x] Code formatted and linted
- [x] Unused imports removed
- [x] Dead code eliminated

### ✅ Performance
- [x] Lazy loading implemented for routes
- [x] Code splitting configured
- [x] Images optimized
- [x] Bundle size analyzed
- [x] Service worker configured
- [x] Caching strategy implemented

### ✅ Security
- [x] Environment variables configured
- [x] API keys not exposed
- [x] JWT secrets secure
- [x] CORS properly configured
- [x] Input validation on all forms
- [x] SQL injection prevention (using Mongoose)
- [x] XSS protection

### ✅ PWA Requirements
- [x] manifest.json configured
- [x] Service worker registered
- [x] Icons (192x192, 512x512)
- [x] Offline support
- [x] Theme colors set
- [x] Meta tags configured

---

## Backend Deployment

### 1. Choose Hosting Platform
Options:
- **Railway** (Recommended - Easy WebSocket support)
- **Render** (Good for Node.js + MongoDB)
- **Heroku** (Classic choice)
- **DigitalOcean App Platform**
- **AWS EC2** (More control)

### 2. MongoDB Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Whitelist hosting platform IP
- [ ] Create database user
- [ ] Get connection string
- [ ] Test connection

### 3. Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cricscore
JWT_SECRET=generate_random_32_char_string
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### 4. Deploy Steps
```bash
# 1. Connect git repository to platform
# 2. Set build command: npm install
# 3. Set start command: npm start
# 4. Add environment variables
# 5. Enable automatic deployments
# 6. Deploy!
```

### 5. Post-Deployment
- [ ] Test API endpoints
- [ ] Test WebSocket connection
- [ ] Verify MongoDB connection
- [ ] Check logs for errors
- [ ] Test scorer authentication

---

## Frontend Deployment

### 1. Choose Hosting Platform
Options:
- **Vercel** (Recommended - Best for React/Vite)
- **Netlify** (Great for static sites)
- **Cloudflare Pages** (Fast global CDN)
- **AWS S3 + CloudFront** (Scalable)
- **Firebase Hosting** (Good with Google services)

### 2. Environment Variables
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_ENV=production
```

### 3. Build Optimization
```bash
# Build for production
cd cricscore
npm run build

# Preview build locally
npm run preview

# Check bundle size
npm run build -- --mode production
```

### 4. Deploy Steps (Vercel Example)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd cricscore
vercel --prod

# Or use GitHub integration
# Connect repo → Configure → Deploy
```

### 5. Post-Deployment
- [ ] Test all pages load
- [ ] Test API connectivity
- [ ] Test WebSocket connection
- [ ] Test PWA installation
- [ ] Test offline functionality
- [ ] Test on mobile devices
- [ ] Check Lighthouse scores

---

## SSL/HTTPS Setup

### Both frontend and backend MUST use HTTPS for:
- Service Worker registration
- PWA installation
- Secure WebSocket (wss://)
- Production security

Most platforms provide automatic SSL:
- ✅ Vercel - Automatic
- ✅ Netlify - Automatic
- ✅ Railway - Automatic
- ✅ Render - Automatic

---

## DNS Configuration

### If using custom domain:

1. **Frontend (Vercel/Netlify)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

2. **Backend (Railway/Render)**
```
Type: CNAME
Name: api
Value: your-app.railway.app
```

3. **Update Environment Variables**
```env
# Frontend
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com

# Backend
CORS_ORIGIN=https://www.yourdomain.com
```

---

## Testing Checklist

### Functional Testing
- [ ] Create tournament
- [ ] Create match
- [ ] Score a complete match
- [ ] View live match
- [ ] Check commentary updates
- [ ] Test "Declare 1 Run" feature
- [ ] Test wicket modal
- [ ] Test extras modal
- [ ] Test undo functionality
- [ ] Test innings break
- [ ] Test match completion

### Cross-Browser Testing
- [ ] Chrome/Edge (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop & iOS)
- [ ] Chrome (Android)
- [ ] Samsung Internet

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad)
- [ ] Mobile (iPhone)
- [ ] Mobile (Android)

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] WebSocket latency < 100ms
- [ ] No memory leaks

---

## Monitoring Setup

### 1. Error Tracking
Options:
- **Sentry** - React error boundaries
- **LogRocket** - Session replay
- **Rollbar** - Error monitoring

### 2. Analytics
- **Google Analytics 4**
- **Plausible** (Privacy-focused)
- **Mixpanel** (Events tracking)

### 3. Uptime Monitoring
- **UptimeRobot** (Free)
- **Pingdom**
- **Better Uptime**

### 4. Performance Monitoring
- **Google Lighthouse CI**
- **Web Vitals**
- **New Relic** (APM)

---

## Post-Launch Checklist

### Week 1
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on real usage

### Week 2-4
- [ ] Analyze user behavior
- [ ] Identify UX improvements
- [ ] Plan feature enhancements
- [ ] Set up automated backups
- [ ] Create disaster recovery plan

---

## Rollback Plan

### If deployment fails:

**Frontend:**
```bash
# Vercel - Revert to previous deployment
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push origin main
```

**Backend:**
```bash
# Most platforms allow rollback in dashboard
# Or redeploy previous version
git revert HEAD
git push origin main
```

---

## Maintenance Schedule

### Daily
- Check error logs
- Monitor uptime
- Review user feedback

### Weekly
- Database backup
- Security updates
- Performance review

### Monthly
- Dependency updates
- Security audit
- Feature planning
- Cost optimization

---

## Success Metrics

### Technical Metrics
- ✅ 99.9% uptime
- ✅ < 2s page load time
- ✅ < 100ms API response time
- ✅ Zero critical errors
- ✅ Lighthouse score > 90

### User Metrics
- ✅ Active tournaments
- ✅ Matches scored
- ✅ Concurrent viewers
- ✅ User retention
- ✅ PWA installations

---

## Emergency Contacts

```
Developer: [Your Name]
Email: [your-email]
Phone: [your-phone]

Hosting Support:
- Vercel: support@vercel.com
- Railway: help@railway.app
- MongoDB Atlas: support@mongodb.com
```

---

## Final Pre-Launch Checklist

- [ ] All environment variables set
- [ ] SSL certificates active
- [ ] Domain configured
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Backups scheduled
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Team trained
- [ ] Launch announcement ready

---

**🎉 Ready to Launch!**

Once all items are checked, you're ready for production deployment!

Good luck! 🏏
