import { useState } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [gameConfig, setGameConfig] = useState(null);

  const handleStartGame = (mode, playerName, gameId = null) => {
    setGameConfig({
      mode,
      playerName,
      gameId
    });
    setCurrentScreen('game');
  };

  const handleExitGame = () => {
    setCurrentScreen('home');
    setGameConfig(null);
  };

  return (
    <div className="app">
      {currentScreen === 'home' && (
        <Home onStartGame={handleStartGame} />
      )}

      {currentScreen === 'game' && gameConfig && (
        <Game
          gameMode={gameConfig.mode}
          gameId={gameConfig.gameId}
          playerName={gameConfig.playerName}
          onExit={handleExitGame}
        />
      )}
    </div>
  );
}

export default App;
