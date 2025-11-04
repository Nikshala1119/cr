import { useState } from 'react';
import './Home.css';

const Home = ({ onStartGame }) => {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [gameIdInput, setGameIdInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  const handleSinglePlayer = () => {
    setSelectedMode('single');
    setShowNameDialog(true);
  };

  const handleCreateMultiplayer = () => {
    setSelectedMode('create');
    setShowNameDialog(true);
  };

  const handleJoinMultiplayer = () => {
    setSelectedMode('join');
    setShowNameDialog(true);
  };

  const handleStartGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (selectedMode === 'join') {
      if (!gameIdInput.trim()) {
        alert('Please enter a valid Game ID');
        return;
      }
      onStartGame('multiplayer', playerName, gameIdInput);
    } else if (selectedMode === 'create') {
      onStartGame('multiplayer', playerName);
    } else {
      onStartGame('single', playerName);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-section">
          <h1 className="game-title">🎯 CARROM POOL</h1>
          <p className="game-subtitle">Master the Classic Board Game</p>
        </div>

        <div className="menu-section">
          <button className="menu-btn primary" onClick={handleSinglePlayer}>
            <span className="btn-icon">👤</span>
            <span className="btn-text">Single Player</span>
            <span className="btn-description">Play against yourself</span>
          </button>

          <button className="menu-btn primary" onClick={handleCreateMultiplayer}>
            <span className="btn-icon">🎮</span>
            <span className="btn-text">Create Game</span>
            <span className="btn-description">Start a multiplayer match</span>
          </button>

          <button className="menu-btn secondary" onClick={handleJoinMultiplayer}>
            <span className="btn-icon">🔗</span>
            <span className="btn-text">Join Game</span>
            <span className="btn-description">Join with Game ID</span>
          </button>
        </div>

        <div className="features-section">
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Realistic Physics</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <span className="feature-text">Mobile Optimized</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔥</span>
            <span className="feature-text">Real-time Multiplayer</span>
          </div>
        </div>
      </div>

      {/* Name input dialog */}
      {showNameDialog && (
        <div className="dialog-overlay" onClick={() => setShowNameDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2>Enter Your Name</h2>
            <input
              type="text"
              className="dialog-input"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              autoFocus
            />

            {selectedMode === 'join' && (
              <>
                <h3>Enter Game ID</h3>
                <input
                  type="text"
                  className="dialog-input"
                  placeholder="Game ID"
                  value={gameIdInput}
                  onChange={(e) => setGameIdInput(e.target.value)}
                />
              </>
            )}

            <div className="dialog-actions">
              <button
                className="dialog-btn cancel"
                onClick={() => {
                  setShowNameDialog(false);
                  setPlayerName('');
                  setGameIdInput('');
                  setSelectedMode(null);
                }}
              >
                Cancel
              </button>
              <button className="dialog-btn confirm" onClick={handleStartGame}>
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
