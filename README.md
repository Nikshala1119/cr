# 🎯 Carrom Pool Game - React

A realistic and feature-rich **Carrom Pool game** built with React, featuring realistic physics, mobile support, and real-time multiplayer functionality using Firebase.

## ✨ Features

### 🎮 Gameplay
- **Realistic Physics**: Powered by Matter.js for authentic carrom disc movement
- **Smooth Controls**: Drag-aim-release mechanism with adjustable power and direction
- **Realistic Rebounds**: Accurate collision detection and physics
- **Visual Effects**: Aim guide, power meter, and visual feedback
- **Sound Effects**: Dynamic collision, shooting, and pocketing sounds

### 📱 Platform Support
- **Mobile Optimized**: Full touch support for smartphones and tablets
- **Responsive Design**: Works seamlessly on all screen sizes
- **Cross-Platform**: Play on any modern web browser

### 👥 Game Modes
- **Single Player**: Practice your skills solo
- **Multiplayer**: Real-time multiplayer using Firebase Realtime Database
- **Create/Join Games**: Easy game creation and joining with Game IDs

### 🎨 Design
- Beautiful gradient UI with glassmorphism effects
- Smooth animations and transitions
- Intuitive controls and feedback

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for multiplayer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (Required for multiplayer)

   a. Go to [Firebase Console](https://console.firebase.google.com/)

   b. Create a new project or use an existing one

   c. Enable **Realtime Database**:
      - Go to "Build" → "Realtime Database"
      - Click "Create Database"
      - Start in test mode (update rules later for production)

   d. Get your Firebase configuration:
      - Go to Project Settings (gear icon)
      - Scroll down to "Your apps"
      - Click the web icon (</>)
      - Copy the config object

   e. Update `src/config/firebase.js` with your credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🎮 How to Play

### Controls

#### Desktop:
- **Aim**: Click and drag from the striker
- **Power**: Drag farther for more power
- **Shoot**: Release to shoot in the opposite direction of drag

#### Mobile:
- **Aim**: Touch and drag from the striker
- **Power**: Drag farther for more power
- **Shoot**: Release to shoot

### Game Rules

- **Objective**: Score points by pocketing coins
- **Scoring**:
  - 👑 Queen (Red) = 5 points
  - ⚫ Black Coin = 2 points
  - ⚪ White Coin = 1 point
- **Turns**: Players alternate turns
- **Win**: Player with the highest score when all coins are pocketed

### Multiplayer

1. **Create a Game**:
   - Click "Create Game"
   - Enter your name
   - Share the Game ID with your friend

2. **Join a Game**:
   - Click "Join Game"
   - Enter your name
   - Enter the Game ID shared by your friend
   - Click "Start Game"

## 🏗️ Project Structure

```
cr/
├── src/
│   ├── components/
│   │   ├── CarromBoard.jsx    # Main game board component
│   │   ├── CarromBoard.css    # Board styles
│   │   ├── Game.jsx           # Game manager component
│   │   ├── Game.css           # Game styles
│   │   ├── Home.jsx           # Home/menu component
│   │   └── Home.css           # Home styles
│   ├── config/
│   │   └── firebase.js        # Firebase configuration
│   ├── utils/
│   │   ├── physics.js         # Matter.js physics engine
│   │   ├── multiplayerManager.js  # Firebase multiplayer logic
│   │   └── soundManager.js    # Web Audio API sound system
│   ├── App.jsx                # Main App component
│   ├── App.css                # Global app styles
│   ├── main.jsx               # Entry point
│   └── index.css              # Base styles
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Technologies Used

- **React** (v19) - UI framework
- **Vite** - Build tool and dev server
- **Matter.js** - 2D physics engine
- **Firebase** - Real-time database and authentication
- **Web Audio API** - Sound effects

## 📱 Mobile Deployment

### For Testing on Mobile Devices:

1. **Local Network Testing**:
   ```bash
   npm run dev -- --host
   ```
   Then access the game from your mobile device using your computer's IP address (e.g., `http://192.168.1.100:5173`)

2. **Build for Production**:
   ```bash
   npm run build
   ```
   This creates an optimized build in the `dist/` folder

3. **Deploy to Hosting** (Choose one):

   **Firebase Hosting**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

   **Netlify**:
   - Drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

   **Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

## 🎨 Customization

### Adjusting Physics

Edit `src/utils/physics.js`:
- `friction`: Surface friction (default: 0.05)
- `restitution`: Bounciness (default: 0.8)
- `linearDamping`: Speed decay (default: 0.05)
- Coin and striker sizes
- Board dimensions

### Changing Visuals

- Board appearance: `src/utils/physics.js` (render options)
- UI colors: Component CSS files
- Gradients and effects: CSS files in `src/components/`

### Sound Customization

Edit `src/utils/soundManager.js`:
- Adjust frequencies, durations, and volumes
- Add custom sound files

## 🔧 Troubleshooting

### Firebase Connection Issues
- Verify your Firebase configuration in `src/config/firebase.js`
- Check that Realtime Database is enabled
- Ensure database rules allow read/write (for testing)

### Performance Issues
- Reduce board size in `src/utils/physics.js`
- Disable sound effects if needed
- Check browser console for errors

### Mobile Touch Issues
- Ensure you're not zooming while playing
- Try refreshing the page
- Clear browser cache

## 📝 Firebase Security Rules

For production, update your Firebase Realtime Database rules:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- [ ] AI opponent for single player
- [ ] Tournament mode
- [ ] Leaderboards
- [ ] More game variations
- [ ] Custom board themes
- [ ] Replay system
- [ ] Chat functionality in multiplayer
- [ ] Sound on/off toggle persistence

## 💡 Tips for Best Experience

- Play in fullscreen mode on mobile
- Use headphones for better sound experience
- Stable internet connection for multiplayer
- Modern browser (Chrome, Firefox, Safari, Edge)

---

**Enjoy playing Carrom Pool! 🎯**
