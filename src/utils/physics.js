import Matter from 'matter-js';

export class CarromPhysics {
  constructor(canvasRef) {
    const { Engine, Render, World, Bodies, Events, Runner } = Matter;

    // Create engine
    this.engine = Engine.create({
      gravity: { x: 0, y: 0 } // No gravity for top-down carrom
    });

    // Board dimensions (scaled for responsive design)
    this.boardSize = 600;
    this.pocketRadius = 25;
    this.coinRadius = 12;
    this.strikerRadius = 18;

    // Create renderer
    this.render = Render.create({
      element: canvasRef,
      engine: this.engine,
      options: {
        width: this.boardSize,
        height: this.boardSize,
        wireframes: false,
        background: '#f4e4c1'
      }
    });

    // Physics properties
    this.friction = 0.05;
    this.restitution = 0.8; // Bounciness
    this.linearDamping = 0.05; // Slow down over time

    this.coins = [];
    this.striker = null;
    this.pockets = [];
    this.walls = [];

    this.initializeBoard();

    // Start the engine
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    Render.run(this.render);

    // Setup collision detection
    this.setupCollisionEvents();
  }

  initializeBoard() {
    const { Bodies, World } = Matter;
    const wallThickness = 30;
    const wallColor = '#8B4513';

    // Create walls
    const walls = [
      // Top wall
      Bodies.rectangle(
        this.boardSize / 2,
        wallThickness / 2,
        this.boardSize,
        wallThickness,
        { isStatic: true, render: { fillStyle: wallColor }, friction: this.friction, restitution: this.restitution }
      ),
      // Bottom wall
      Bodies.rectangle(
        this.boardSize / 2,
        this.boardSize - wallThickness / 2,
        this.boardSize,
        wallThickness,
        { isStatic: true, render: { fillStyle: wallColor }, friction: this.friction, restitution: this.restitution }
      ),
      // Left wall
      Bodies.rectangle(
        wallThickness / 2,
        this.boardSize / 2,
        wallThickness,
        this.boardSize,
        { isStatic: true, render: { fillStyle: wallColor }, friction: this.friction, restitution: this.restitution }
      ),
      // Right wall
      Bodies.rectangle(
        this.boardSize - wallThickness / 2,
        this.boardSize / 2,
        wallThickness,
        this.boardSize,
        { isStatic: true, render: { fillStyle: wallColor }, friction: this.friction, restitution: this.restitution }
      )
    ];

    this.walls = walls;
    World.add(this.engine.world, walls);

    // Create pockets (4 corners)
    const pocketOffset = wallThickness + this.pocketRadius;
    const pocketPositions = [
      { x: pocketOffset, y: pocketOffset }, // Top-left
      { x: this.boardSize - pocketOffset, y: pocketOffset }, // Top-right
      { x: pocketOffset, y: this.boardSize - pocketOffset }, // Bottom-left
      { x: this.boardSize - pocketOffset, y: this.boardSize - pocketOffset } // Bottom-right
    ];

    this.pockets = pocketPositions.map(pos => ({
      x: pos.x,
      y: pos.y,
      radius: this.pocketRadius,
      body: Bodies.circle(pos.x, pos.y, this.pocketRadius, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#000000' },
        label: 'pocket'
      })
    }));

    World.add(this.engine.world, this.pockets.map(p => p.body));
  }

  setupCoins() {
    const { Bodies, World } = Matter;

    // Remove existing coins
    if (this.coins.length > 0) {
      World.remove(this.engine.world, this.coins.map(c => c.body));
      this.coins = [];
    }

    // Center position for coin arrangement
    const centerX = this.boardSize / 2;
    const centerY = this.boardSize / 2;

    // Create queen (red coin in center)
    const queen = {
      type: 'queen',
      body: Bodies.circle(centerX, centerY, this.coinRadius, {
        render: { fillStyle: '#ff0000' },
        friction: this.friction,
        restitution: this.restitution,
        density: 0.001,
        frictionAir: this.linearDamping,
        label: 'queen'
      })
    };

    this.coins.push(queen);

    // Create black and white coins in hexagonal pattern
    const coinGap = this.coinRadius * 2.2;
    const positions = [
      // Inner ring (6 coins)
      { x: 0, y: -coinGap },
      { x: coinGap * 0.866, y: -coinGap * 0.5 },
      { x: coinGap * 0.866, y: coinGap * 0.5 },
      { x: 0, y: coinGap },
      { x: -coinGap * 0.866, y: coinGap * 0.5 },
      { x: -coinGap * 0.866, y: -coinGap * 0.5 },
      // Outer ring (12 coins)
      { x: 0, y: -coinGap * 2 },
      { x: coinGap * 0.866, y: -coinGap * 1.5 },
      { x: coinGap * 1.732, y: -coinGap },
      { x: coinGap * 1.732, y: 0 },
      { x: coinGap * 1.732, y: coinGap },
      { x: coinGap * 0.866, y: coinGap * 1.5 },
      { x: 0, y: coinGap * 2 },
      { x: -coinGap * 0.866, y: coinGap * 1.5 },
      { x: -coinGap * 1.732, y: coinGap },
      { x: -coinGap * 1.732, y: 0 },
      { x: -coinGap * 1.732, y: -coinGap },
      { x: -coinGap * 0.866, y: -coinGap * 1.5 }
    ];

    // Alternate black and white coins
    positions.forEach((pos, index) => {
      const isBlack = index % 2 === 0;
      const coin = {
        type: isBlack ? 'black' : 'white',
        body: Bodies.circle(centerX + pos.x, centerY + pos.y, this.coinRadius, {
          render: { fillStyle: isBlack ? '#000000' : '#ffffff', strokeStyle: '#333', lineWidth: 1 },
          friction: this.friction,
          restitution: this.restitution,
          density: 0.001,
          frictionAir: this.linearDamping,
          label: isBlack ? 'black' : 'white'
        })
      };
      this.coins.push(coin);
    });

    World.add(this.engine.world, this.coins.map(c => c.body));
  }

  createStriker(position) {
    const { Bodies, World } = Matter;

    // Remove existing striker
    if (this.striker) {
      World.remove(this.engine.world, this.striker.body);
    }

    // Create new striker
    this.striker = {
      body: Bodies.circle(position.x, position.y, this.strikerRadius, {
        render: { fillStyle: '#FFD700', strokeStyle: '#DAA520', lineWidth: 2 },
        friction: this.friction,
        restitution: this.restitution,
        density: 0.002,
        frictionAir: this.linearDamping,
        label: 'striker'
      })
    };

    World.add(this.engine.world, this.striker.body);
    return this.striker;
  }

  shootStriker(force) {
    if (this.striker) {
      const { Body } = Matter;
      Body.applyForce(this.striker.body, this.striker.body.position, force);
    }
  }

  setupCollisionEvents() {
    const { Events } = Matter;

    // Collision sound and effects callbacks
    this.onCollision = null;
    this.onPocket = null;

    Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        // Check for pocketing
        if (bodyA.label === 'pocket' || bodyB.label === 'pocket') {
          const coin = bodyA.label === 'pocket' ? bodyB : bodyA;
          if (coin.label !== 'pocket') {
            this.handlePocket(coin);
          }
        }

        // Trigger collision callback for sound effects
        if (this.onCollision && bodyA.label !== 'pocket' && bodyB.label !== 'pocket') {
          const speed = Matter.Vector.magnitude(Matter.Vector.sub(bodyA.velocity, bodyB.velocity));
          this.onCollision(speed);
        }
      });
    });
  }

  handlePocket(coin) {
    const { World } = Matter;

    // Call pocket callback if set
    if (this.onPocket) {
      this.onPocket(coin.label);
    }

    // Remove the pocketed coin
    setTimeout(() => {
      World.remove(this.engine.world, coin);
      this.coins = this.coins.filter(c => c.body !== coin);
      if (this.striker && this.striker.body === coin) {
        this.striker = null;
      }
    }, 100);
  }

  isStrikerMoving() {
    if (!this.striker) return false;
    const speed = Matter.Vector.magnitude(this.striker.body.velocity);
    return speed > 0.1;
  }

  areCoinsMoving() {
    return this.coins.some(coin => {
      const speed = Matter.Vector.magnitude(coin.body.velocity);
      return speed > 0.1;
    });
  }

  isAnyMoving() {
    return this.isStrikerMoving() || this.areCoinsMoving();
  }

  getStrikerPosition() {
    return this.striker ? this.striker.body.position : null;
  }

  cleanup() {
    const { World, Engine, Render, Runner } = Matter;

    // Stop the renderer and runner
    Render.stop(this.render);
    Runner.stop(this.runner);

    // Clear the world
    World.clear(this.engine.world);
    Engine.clear(this.engine);

    // Clear the canvas
    if (this.render.canvas) {
      this.render.canvas.remove();
    }

    this.render.canvas = null;
    this.render.context = null;
    this.render.textures = {};
  }
}
