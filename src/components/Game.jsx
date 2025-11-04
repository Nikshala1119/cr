import { useState, useEffect, useCallback } from 'react';
import CarromBoard from './CarromBoard';
import { MultiplayerManager } from '../utils/multiplayerManager';
import './Game.css';

const Game = ({ gameMode, gameId, playerName, onExit }) => {
  const [multiplayerManager] = useState(() =>
    gameMode === 'multiplayer' ? new MultiplayerManager() : null
  );
  const [gameState, setGameState] = useState({
    player1Score: 0,
    player2Score: 0,
    currentTurn: 1,
    player1Name: playerName || 'Player 1',
    player2Name: 'Player 2',
    status: 'playing',
    isMyTurn: true
  });
  const [isConnected, setIsConnected] = useState(gameMode === 'single');
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [myPlayerNumber, setMyPlayerNumber] = useState(1);

  // Initialize multiplayer
  useEffect(() => {
    if (gameMode === 'multiplayer' && multiplayerManager) {
      const initMultiplayer = async () => {
        try {
          if (gameId) {
            // Join existing game
            await multiplayerManager.joinGame(gameId, playerName);
            setMyPlayerNumber(2);
          } else {
            // Create new game
            await multiplayerManager.createGame(playerName);
            setMyPlayerNumber(1);
            setWaitingForPlayer(true);
          }

          // Listen to game state
          multiplayerManager.listenToGameState((data) => {
            setGameState(prev => ({
              ...prev,
              player1Name: data.players[1]?.name || 'Player 1',
              player2Name: data.players[2]?.name || 'Player 2',
              player1Score: data.players[1]?.score || 0,
              player2Score: data.players[2]?.score || 0,
              currentTurn: data.currentTurn,
              status: data.status,
              isMyTurn: data.currentTurn === multiplayerManager.playerNumber
            }));

            if (data.status === 'playing' && waitingForPlayer) {
              setWaitingForPlayer(false);
              setIsConnected(true);
            }
          });

          setIsConnected(true);
        } catch (error) {
          console.error('Error initializing multiplayer:', error);
          alert('Failed to connect to game: ' + error.message);
          onExit();
        }
      };

      initMultiplayer();

      return () => {
        multiplayerManager.leaveGame();
      };
    }
  }, [gameMode, gameId, playerName, multiplayerManager, onExit, waitingForPlayer]);

  // Handle score update
  const handleScoreUpdate = useCallback((coinType) => {
    setGameState(prev => {
      const points = coinType === 'queen' ? 5 : coinType === 'black' ? 2 : 1;
      const currentPlayer = prev.currentTurn;
      const newScore = currentPlayer === 1
        ? prev.player1Score + points
        : prev.player2Score + points;

      const updatedState = {
        ...prev,
        player1Score: currentPlayer === 1 ? newScore : prev.player1Score,
        player2Score: currentPlayer === 2 ? newScore : prev.player2Score
      };

      // Update multiplayer score
      if (multiplayerManager && prev.isMyTurn) {
        multiplayerManager.updateScore(currentPlayer, newScore);
      }

      return updatedState;
    });
  }, [multiplayerManager]);

  // Handle turn end
  const handleTurnEnd = useCallback(() => {
    setGameState(prev => {
      const nextTurn = prev.currentTurn === 1 ? 2 : 1;
      const updatedState = {
        ...prev,
        currentTurn: nextTurn,
        isMyTurn: gameMode === 'single' ? true : nextTurn === myPlayerNumber
      };

      // Update multiplayer turn
      if (multiplayerManager && prev.isMyTurn) {
        multiplayerManager.updateTurn(nextTurn);
      }

      return updatedState;
    });
  }, [gameMode, multiplayerManager, myPlayerNumber]);

  // Handle exit
  const handleExit = useCallback(async () => {
    if (multiplayerManager) {
      await multiplayerManager.leaveGame();
    }
    onExit();
  }, [multiplayerManager, onExit]);

  if (waitingForPlayer) {
    return (
      <div className="game-container">
        <div className="waiting-screen">
          <h2>Waiting for opponent...</h2>
          <p className="game-code">Game ID: <strong>{multiplayerManager.gameId}</strong></p>
          <p className="share-instruction">Share this Game ID with your friend to join!</p>
          <div className="loader"></div>
          <button className="exit-btn" onClick={handleExit}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="game-container">
        <div className="connecting-screen">
          <h2>Connecting...</h2>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="exit-btn" onClick={handleExit}>
          ← Exit
        </button>
        <h1>Carrom Pool</h1>
        <div className="game-mode-badge">
          {gameMode === 'single' ? '👤 Single Player' : '👥 Multiplayer'}
        </div>
      </div>

      <div className="scoreboard">
        <div className={`player-score ${gameState.currentTurn === 1 ? 'active' : ''}`}>
          <div className="player-name">{gameState.player1Name}</div>
          <div className="score">{gameState.player1Score}</div>
          {gameState.currentTurn === 1 && <div className="turn-indicator">▼</div>}
        </div>

        <div className="vs">VS</div>

        <div className={`player-score ${gameState.currentTurn === 2 ? 'active' : ''}`}>
          <div className="player-name">{gameState.player2Name}</div>
          <div className="score">{gameState.player2Score}</div>
          {gameState.currentTurn === 2 && <div className="turn-indicator">▼</div>}
        </div>
      </div>

      {gameMode === 'multiplayer' && !gameState.isMyTurn && (
        <div className="waiting-turn">
          <span>⏳ Waiting for opponent's turn...</span>
        </div>
      )}

      <CarromBoard
        multiplayerManager={multiplayerManager}
        gameState={gameState}
        onScoreUpdate={handleScoreUpdate}
        onTurnEnd={handleTurnEnd}
      />

      <div className="game-info-panel">
        <h3>How to Play</h3>
        <ul>
          <li>🎯 Drag and release the striker to shoot</li>
          <li>💪 Longer drag = More power</li>
          <li>🎱 Pocket coins to score points</li>
          <li>👑 Queen = 5 points</li>
          <li>⚫ Black coin = 2 points</li>
          <li>⚪ White coin = 1 point</li>
        </ul>
      </div>
    </div>
  );
};

export default Game;
