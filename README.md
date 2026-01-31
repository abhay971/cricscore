# 🏏 CricScore - Live Cricket Scoring Platform

A professional cricket scoring platform for local tournaments with real-time updates, custom rules support, and beautiful modern UI.

## ✨ Features

### 🎯 Unique Features
- **"Declare 1 Run" Custom Rule** - Unique scoring rule where strike doesn't change until the over ends
- **Variable Overs Support** - Any number of overs (1-50), not limited to T20/ODI
- **Real-time Updates** - WebSocket-powered live scoring
- **Complete Match Flow** - From tournament creation to match completion with beautiful transitions

### 📱 Core Functionality
- Tournament management with custom rules
- Match creation wizard with teams and players
- Professional scorer interface with:
  - Ball-by-ball input
  - Wicket recording modal
  - Extras recording modal
  - Undo functionality
  - Real-time updates
- Live viewer interface with:
  - Real-time scoreboard
  - Ball-by-ball commentary
  - Current stats
  - Match flow screens
- Live matches tracking
- Mobile-responsive PWA

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << 'ENVFILE'
MONGODB_URI=mongodb://localhost:27017/cricscore
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
CORS_ORIGIN=http://localhost:5173
ENVFILE

# Start backend server
npm start
```

### Frontend Setup

```bash
cd cricscore
npm install

# Create .env file
cat > .env << 'ENVFILE'
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENV=development
ENVFILE

# Start development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📦 Production Deployment

### Backend Deployment

**Environment Variables Required:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cricscore
JWT_SECRET=your_production_secret_key
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

**Deploy to:**
- Railway / Render / Heroku / DigitalOcean
- Ensure MongoDB Atlas or managed MongoDB
- Enable WebSocket support (Socket.io)

### Frontend Deployment

**Build for production:**
```bash
cd cricscore
npm run build
```

**Deploy `dist` folder to:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

**Environment Variables Required:**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_ENV=production
```

## 🏗️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB + Mongoose** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool
- **Tailwind CSS 4.1.18** - Styling
- **Framer Motion** - Animations
- **React Router v6** - Routing
- **Zustand** - State management
- **Socket.io-client** - WebSocket client

## 📁 Project Structure

```
Cricscore/
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Cricket calculations
│   └── server.js           # Express + Socket.io server
│
├── cricscore/              # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API & WebSocket services
│   │   └── store/          # Zustand stores
│   └── public/             # Static assets + PWA files
│
├── README.md               # This file
└── FINAL_SUMMARY.md        # Complete documentation
```

## 🎮 Usage Guide

### Creating a Tournament
1. Navigate to Home → "Create Tournament"
2. Enter tournament name and organizer
3. Enable "Declare 1 Run" rule if needed
4. Click "Create Tournament"

### Setting up a Match
1. From tournament page, click "Add Match"
2. Set number of overs and match type
3. Add teams and players (minimum 2 per team)
4. Set toss details
5. Click "Start Match"

### Scoring a Match
1. You'll be redirected to scorer interface with authentication token
2. Select striker, non-striker, and bowler
3. Enable "Declare 1 Run" toggle if needed for specific balls
4. Click ball buttons to record runs/wickets/extras
5. Use modals for detailed wicket/extras recording
6. Click "Submit Ball" to record
7. Use "Undo" if you make a mistake

### Viewing Live Matches
1. Navigate to "Live Matches" from home
2. Click any match card to watch live
3. View real-time scores and commentary
4. Navigate between Match/Stats/Commentary/Teams tabs

## 🔧 Development

### Code Structure Guidelines
- **Components** - Small, reusable, single-responsibility
- **Pages** - Route-level components
- **Services** - API calls and WebSocket logic
- **Store** - Global state management
- **Hooks** - Reusable React logic

### Performance Optimizations
- ✅ Lazy loading for routes
- ✅ Code splitting
- ✅ Memoized components
- ✅ Service worker caching
- ✅ WebSocket connection pooling

### PWA Features
- ✅ Installable on mobile/desktop
- ✅ Offline support via service worker
- ✅ App shortcuts
- ✅ Splash screen
- ✅ Theme colors

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists with correct values
- Check port 5000 is not already in use

### Frontend can't connect to backend
- Verify backend is running
- Check CORS settings in backend
- Verify `VITE_API_URL` and `VITE_SOCKET_URL` in frontend `.env`

### WebSocket not connecting
- Ensure Socket.io is enabled on backend
- Check firewall/proxy settings
- Verify WebSocket URL is correct

### PWA not installing
- Must be served over HTTPS (or localhost)
- Check manifest.json is accessible
- Verify service worker registration

## 📝 API Documentation

### Authentication
All scorer endpoints require JWT token:
```
Authorization: Bearer <token>
```

### Key Endpoints

**Tournaments**
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/:id` - Get tournament
- `GET /api/tournaments` - List all tournaments

**Matches**
- `POST /api/tournaments/:id/matches` - Create match
- `GET /api/matches/:id` - Get match details
- `GET /api/matches/live/all` - Get live matches

**Scoring (Protected)**
- `POST /api/scorer/ball` - Record ball
- `DELETE /api/scorer/ball/undo` - Undo last ball
- `POST /api/scorer/innings/end` - End innings
- `POST /api/scorer/match/end` - End match

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Cricket scoring rules and regulations
- React and Vite communities
- Tailwind CSS and Framer Motion teams

## 📞 Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Built with ❤️ for cricket lovers**

🏏 Happy Scoring! 🏏
