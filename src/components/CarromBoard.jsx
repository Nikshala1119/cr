import { useEffect, useRef, useState, useCallback } from 'react';
import { CarromPhysics } from '../utils/physics';
import { SoundManager } from '../utils/soundManager';
import './CarromBoard.css';

const CarromBoard = ({ multiplayerManager, gameState, onScoreUpdate, onTurnEnd }) => {
  const canvasContainerRef = useRef(null);
  const physicsRef = useRef(null);
  const soundManagerRef = useRef(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState(null);
  const [aimCurrent, setAimCurrent] = useState(null);
  const [strikerPosition, setStrikerPosition] = useState({ x: 300, y: 550 });
  const [gameReady, setGameReady] = useState(false);
  const [canShoot, setCanShoot] = useState(true);
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(0);
  const animationFrameRef = useRef(null);

  // Initialize physics and sound
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Clear container
    canvasContainerRef.current.innerHTML = '';

    // Initialize physics
    physicsRef.current = new CarromPhysics(canvasContainerRef.current);

    // Initialize sound manager
    soundManagerRef.current = new SoundManager();

    // Setup coins
    physicsRef.current.setupCoins();

    // Create initial striker
    physicsRef.current.createStriker(strikerPosition);

    // Setup collision callbacks
    physicsRef.current.onCollision = (speed) => {
      if (soundManagerRef.current && speed > 2) {
        soundManagerRef.current.playCollisionSound(Math.min(speed / 20, 1));
      }
    };

    physicsRef.current.onPocket = (coinType) => {
      if (soundManagerRef.current) {
        if (coinType === 'queen') {
          soundManagerRef.current.playQueenPocketSound();
        } else {
          soundManagerRef.current.playPocketSound();
        }
      }

      // Update score
      if (onScoreUpdate) {
        onScoreUpdate(coinType);
      }
    };

    setGameReady(true);

    // Animation loop to check if pieces stopped moving
    const checkMovement = () => {
      if (physicsRef.current && !physicsRef.current.isAnyMoving()) {
        if (!canShoot) {
          // Create new striker for next turn
          physicsRef.current.createStriker(strikerPosition);
          setCanShoot(true);
          if (onTurnEnd) {
            onTurnEnd();
          }
        }
      } else {
        setCanShoot(false);
      }
      animationFrameRef.current = requestAnimationFrame(checkMovement);
    };

    animationFrameRef.current = requestAnimationFrame(checkMovement);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (physicsRef.current) {
        physicsRef.current.cleanup();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle touch/mouse start
  const handleStart = useCallback((clientX, clientY) => {
    if (!canShoot || !physicsRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check if starting near the striker
    const strikerPos = physicsRef.current.getStrikerPosition();
    if (strikerPos) {
      const distance = Math.sqrt(
        Math.pow(x - strikerPos.x, 2) + Math.pow(y - strikerPos.y, 2)
      );

      if (distance < 50) {
        setIsAiming(true);
        setAimStart({ x, y });
        setAimCurrent({ x, y });
      }
    }
  }, [canShoot]);

  // Handle touch/mouse move
  const handleMove = useCallback((clientX, clientY) => {
    if (!isAiming) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setAimCurrent({ x, y });

    // Calculate power and angle
    const dx = x - aimStart.x;
    const dy = y - aimStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const calculatedPower = Math.min(distance / 100, 1);
    const calculatedAngle = Math.atan2(dy, dx);

    setPower(calculatedPower);
    setAngle(calculatedAngle);
  }, [isAiming, aimStart]);

  // Handle touch/mouse end (shoot)
  const handleEnd = useCallback(() => {
    if (!isAiming || !physicsRef.current) return;

    const dx = aimCurrent.x - aimStart.x;
    const dy = aimCurrent.y - aimStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      // Calculate force (opposite direction of drag)
      const forceMagnitude = Math.min(distance / 100, 1) * 0.015;
      const force = {
        x: -dx * forceMagnitude,
        y: -dy * forceMagnitude
      };

      // Apply force to striker
      physicsRef.current.shootStriker(force);

      // Play shoot sound
      if (soundManagerRef.current) {
        soundManagerRef.current.playShootSound(forceMagnitude * 50);
      }

      // Send shot to multiplayer if enabled
      if (multiplayerManager) {
        multiplayerManager.sendShot({
          force,
          position: physicsRef.current.getStrikerPosition()
        });
      }

      setCanShoot(false);
    }

    setIsAiming(false);
    setAimStart(null);
    setAimCurrent(null);
    setPower(0);
  }, [isAiming, aimStart, aimCurrent, multiplayerManager]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    handleEnd();
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleEnd();
  };

  // Reset striker position for new turn
  const resetStriker = useCallback(() => {
    if (physicsRef.current) {
      physicsRef.current.createStriker(strikerPosition);
      setCanShoot(true);
    }
  }, [strikerPosition]);

  useEffect(() => {
    if (gameState?.shouldResetStriker) {
      resetStriker();
    }
  }, [gameState, resetStriker]);

  return (
    <div className="carrom-container">
      <div className="game-info">
        <div className="power-meter">
          <div className="power-label">Power</div>
          <div className="power-bar">
            <div
              className="power-fill"
              style={{ width: `${power * 100}%` }}
            />
          </div>
          <div className="power-value">{Math.round(power * 100)}%</div>
        </div>

        {!canShoot && (
          <div className="status-message">
            Waiting for pieces to stop...
          </div>
        )}

        {canShoot && (
          <div className="status-message active">
            Drag striker to aim and shoot!
          </div>
        )}
      </div>

      <div
        ref={canvasContainerRef}
        className="carrom-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Aim guide overlay */}
        {isAiming && aimStart && aimCurrent && (
          <svg className="aim-guide">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#00ff00" />
              </marker>
            </defs>

            {/* Aim line (opposite direction of drag) */}
            <line
              x1={aimStart.x}
              y1={aimStart.y}
              x2={aimStart.x - (aimCurrent.x - aimStart.x) * 1.5}
              y2={aimStart.y - (aimCurrent.y - aimStart.y) * 1.5}
              stroke="#00ff00"
              strokeWidth="3"
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
              opacity="0.8"
            />

            {/* Power indicator circle */}
            <circle
              cx={aimStart.x}
              cy={aimStart.y}
              r={power * 50 + 20}
              fill="none"
              stroke="#00ff00"
              strokeWidth="2"
              opacity="0.5"
            />
          </svg>
        )}
      </div>

      <div className="controls">
        <button
          className="control-btn"
          onClick={() => soundManagerRef.current?.toggle()}
        >
          🔊 Sound
        </button>
        <button
          className="control-btn"
          onClick={resetStriker}
          disabled={!canShoot}
        >
          🔄 Reset Striker
        </button>
      </div>
    </div>
  );
};

export default CarromBoard;
