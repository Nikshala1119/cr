import { ref, set, onValue, push, update, remove, onDisconnect } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { database, auth } from '../config/firebase';

export class MultiplayerManager {
  constructor() {
    this.gameId = null;
    this.playerId = null;
    this.playerNumber = null;
    this.isHost = false;
    this.gameRef = null;
    this.listeners = [];
  }

  async initialize() {
    // Sign in anonymously
    try {
      const userCredential = await signInAnonymously(auth);
      this.playerId = userCredential.user.uid;
      return this.playerId;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async createGame(playerName) {
    await this.initialize();

    // Create a new game
    const gamesRef = ref(database, 'games');
    const newGameRef = push(gamesRef);
    this.gameId = newGameRef.key;
    this.gameRef = newGameRef;
    this.isHost = true;
    this.playerNumber = 1;

    const gameData = {
      hostId: this.playerId,
      status: 'waiting', // waiting, playing, finished
      currentTurn: 1,
      players: {
        1: {
          id: this.playerId,
          name: playerName,
          score: 0,
          isReady: true
        }
      },
      createdAt: Date.now()
    };

    await set(newGameRef, gameData);

    // Setup disconnect handler
    const playerRef = ref(database, `games/${this.gameId}/players/1`);
    onDisconnect(playerRef).remove();

    return this.gameId;
  }

  async joinGame(gameId, playerName) {
    await this.initialize();

    this.gameId = gameId;
    this.gameRef = ref(database, `games/${gameId}`);
    this.playerNumber = 2;

    // Check if game exists and has space
    return new Promise((resolve, reject) => {
      onValue(this.gameRef, (snapshot) => {
        const game = snapshot.val();

        if (!game) {
          reject(new Error('Game not found'));
          return;
        }

        if (game.players && game.players[2]) {
          reject(new Error('Game is full'));
          return;
        }

        // Join the game
        const player2Ref = ref(database, `games/${gameId}/players/2`);
        set(player2Ref, {
          id: this.playerId,
          name: playerName,
          score: 0,
          isReady: true
        });

        // Update game status to playing
        const statusRef = ref(database, `games/${gameId}/status`);
        set(statusRef, 'playing');

        // Setup disconnect handler
        onDisconnect(player2Ref).remove();

        resolve(gameId);
      }, { onlyOnce: true });
    });
  }

  listenToGameState(callback) {
    if (!this.gameRef) return;

    const unsubscribe = onValue(this.gameRef, (snapshot) => {
      const gameData = snapshot.val();
      if (gameData) {
        callback(gameData);
      }
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async updateTurn(nextPlayer) {
    if (!this.gameRef) return;

    const turnRef = ref(database, `games/${this.gameId}/currentTurn`);
    await set(turnRef, nextPlayer);
  }

  async updateScore(player, score) {
    if (!this.gameRef) return;

    const scoreRef = ref(database, `games/${this.gameId}/players/${player}/score`);
    await set(scoreRef, score);
  }

  async sendShot(shotData) {
    if (!this.gameRef) return;

    const shotRef = ref(database, `games/${this.gameId}/lastShot`);
    await set(shotRef, {
      player: this.playerNumber,
      force: shotData.force,
      position: shotData.position,
      timestamp: Date.now()
    });
  }

  listenToShots(callback) {
    if (!this.gameRef) return;

    const shotRef = ref(database, `games/${this.gameId}/lastShot`);
    const unsubscribe = onValue(shotRef, (snapshot) => {
      const shotData = snapshot.val();
      if (shotData && shotData.player !== this.playerNumber) {
        callback(shotData);
      }
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async updateGameState(stateData) {
    if (!this.gameRef) return;

    const stateRef = ref(database, `games/${this.gameId}/gameState`);
    await set(stateRef, {
      ...stateData,
      timestamp: Date.now()
    });
  }

  listenToGameStateUpdates(callback) {
    if (!this.gameRef) return;

    const stateRef = ref(database, `games/${this.gameId}/gameState`);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const stateData = snapshot.val();
      if (stateData) {
        callback(stateData);
      }
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async endGame(winnerId) {
    if (!this.gameRef) return;

    await update(this.gameRef, {
      status: 'finished',
      winnerId: winnerId,
      endedAt: Date.now()
    });
  }

  async leaveGame() {
    if (this.gameRef && this.playerNumber) {
      const playerRef = ref(database, `games/${this.gameId}/players/${this.playerNumber}`);
      await remove(playerRef);
    }

    // Remove all listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];

    this.gameId = null;
    this.playerNumber = null;
    this.gameRef = null;
  }

  isMyTurn(currentTurn) {
    return currentTurn === this.playerNumber;
  }

  getOpponentNumber() {
    return this.playerNumber === 1 ? 2 : 1;
  }
}
