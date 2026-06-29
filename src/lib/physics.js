import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Composite, Runner, Events } = Matter;

// Collision filter — rim only collides with things moving upward
const CATEGORY_DEFAULT = 0x0001;
const CATEGORY_RIM = 0x0002;

export class PhysicsEngine {
  constructor() {
    this.engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0005 },
    });
    this.runner = null;
    this.bodies = [];
    this.bodyToStroke = new Map(); // maps physics body -> original stroke/stamp data
    this.running = false;
    this.walls = [];
  }

  setCanvasSize(width, height) {
    this.width = width;
    this.height = height;
    this._createWalls();
  }

  _createWalls() {
    // Remove old walls
    if (this.walls.length) {
      Composite.remove(this.engine.world, this.walls);
    }

    const w = this.width;
    const h = this.height;
    const t = 40; // wall thickness

    // Hoop — two thin static pillars forming a U at top center
    const hoopW = 220;
    const hoopH = 60;
    const hoopX = w / 2;
    const hoopY = 75;
    const pillarW = 4;
    const leftPillar = Bodies.rectangle(hoopX - hoopW / 2, hoopY + hoopH / 2, pillarW, hoopH, { isStatic: true });
    const rightPillar = Bodies.rectangle(hoopX + hoopW / 2, hoopY + hoopH / 2, pillarW, hoopH, { isStatic: true });
    const bottomRim = Bodies.rectangle(hoopX, hoopY + hoopH, hoopW, pillarW, { isStatic: true });
    this.bottomRim = bottomRim;

    // One-way platform: only block things coming from below
    Events.on(this.engine, 'beforeUpdate', () => {
      if (!this.bottomRim) return;
      const rimY = this.bottomRim.position.y;
      // Temporarily disable collision for bodies above the rim moving downward
      for (const body of this.bodies) {
        if (body.position.y < rimY && body.velocity.y > 0) {
          // Above rim, moving down — let it through
          body.collisionFilter = { ...body.collisionFilter, mask: CATEGORY_DEFAULT };
        } else {
          // Below or moving up — block
          body.collisionFilter = { ...body.collisionFilter, mask: CATEGORY_DEFAULT | CATEGORY_RIM };
        }
      }
      if (this.player) {
        const py = this.player.position.y;
        if (py < rimY && this.player.velocity.y > 0) {
          this.player.collisionFilter = { ...this.player.collisionFilter, mask: CATEGORY_DEFAULT };
        } else {
          this.player.collisionFilter = { ...this.player.collisionFilter, mask: CATEGORY_DEFAULT | CATEGORY_RIM };
        }
      }
    });

    // Set rim collision filter
    bottomRim.collisionFilter = { category: CATEGORY_RIM, mask: CATEGORY_DEFAULT | CATEGORY_RIM };

    this.walls = [
      Bodies.rectangle(w / 2, h + t / 2, w + 100, t, { isStatic: true }), // floor
      Bodies.rectangle(-t / 2, h / 2, t, h + 100, { isStatic: true }),     // left
      Bodies.rectangle(w + t / 2, h / 2, t, h + 100, { isStatic: true }), // right
      leftPillar,
      rightPillar,
      bottomRim,
    ];

    this.hoop = { x: hoopX, y: hoopY, w: hoopW, h: hoopH };
    this.score = 0;
    this.scoredBodies = new Set();
    this.gameStartTime = performance.now();

    Composite.add(this.engine.world, this.walls);
  }

  // Convert drawing strokes into physics bodies
  addStrokes(strokes) {
    strokes.forEach((stroke) => {
      if (stroke.type === 'stamp') {
        // Stamp → circle body roughly matching stamp size
        const size = stroke.size || 40;
        const body = Bodies.circle(stroke.x, stroke.y, size / 2, {
          restitution: 0.5,
          friction: 0.3,
          density: 0.002,
        });
        this.bodyToStroke.set(body, { ...stroke });
        this.bodies.push(body);
        Composite.add(this.engine.world, body);
      } else if (stroke.type === 'brush' && stroke.cells && stroke.cells.length > 0) {
        // Split brush strokes into small chunks for tighter collision
        const allCoords = stroke.cells.map(k => k.split(',').map(Number));
        const chunkSize = 6;
        for (let c = 0; c < allCoords.length; c += chunkSize) {
          const chunk = allCoords.slice(c, c + chunkSize);
          const xs = chunk.map(p => p[0]), ys = chunk.map(p => p[1]);
          const minX = Math.min(...xs), maxX = Math.max(...xs);
          const minY = Math.min(...ys), maxY = Math.max(...ys);
          const w = Math.max(maxX - minX + 12, 8);
          const h = Math.max(maxY - minY + 12, 8);
          const cx = (minX + maxX + 12) / 2;
          const cy = (minY + maxY + 12) / 2;

          const body = Bodies.rectangle(cx, cy, w, h, {
            restitution: 0.4,
            friction: 0.5,
            density: 0.001,
            chamfer: { radius: Math.min(w, h) * 0.1 },
          });

          this.bodyToStroke.set(body, {
            ...stroke,
            cells: chunk.map(([gx, gy]) => `${gx},${gy}`),
            originalCx: cx,
            originalCy: cy,
          });
          this.bodies.push(body);
          Composite.add(this.engine.world, body);
        }
      }
    });
  }

  _getStrokeBounds(points) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
    return { minX, minY, maxX, maxY };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.runner) {
      Runner.stop(this.runner);
      this.runner = null;
    }
  }

  clear() {
    this.stop();
    Composite.clear(this.engine.world, false);
    this.bodies = [];
    this.bodyToStroke.clear();
    this.walls = [];
  }

  // Get current state for rendering
  getState() {
    return this.bodies.map((body) => {
      const strokeData = this.bodyToStroke.get(body);
      return {
        body,
        stroke: strokeData,
        position: body.position,
        angle: body.angle,
      };
    });
  }

  // Apply an impulse to shake everything
  shake() {
    this.bodies.forEach((body) => {
      Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.08,
        y: -Math.random() * 0.08,
      });
    });
  }

  // Easter egg: spawn a stick figure player
  spawnPlayer(x, y, stampsList) {
    this.player = Bodies.rectangle(x, y, 15, 36, {
      restitution: 0.1,
      friction: 0.8,
      density: 0.05,
      inertia: Infinity,
      inverseInertia: 0,
    });
    Composite.add(this.engine.world, this.player);
    this.keys = {};
    this.playerWon = false;
    this.starBody = null;
    this.jumpCount = 0;
    this.wasJumpPressed = false;
    this.facingRight = true;

    // Find the sparkle star body
    for (const [body, stroke] of this.bodyToStroke) {
      if (stroke.type === 'stamp' && stroke.stampIndex != null) {
        if (stampsList[stroke.stampIndex]?.name === 'sparkle') {
          this.starBody = body;
          break;
        }
      }
    }
  }

  updatePlayer() {
    if (!this.player || this.playerWon) return;

    // Direct velocity control — no force-based sluggishness
    const speed = 6;
    const jumpVel = -12;
    let vx = this.player.velocity.x;

    if (this.keys?.ArrowLeft || this.keys?.a) {
      vx = -speed;
      this.facingRight = false;
    } else if (this.keys?.ArrowRight || this.keys?.d) {
      vx = speed;
      this.facingRight = true;
    } else {
      vx *= 0.7; // friction when not pressing
    }

    // Fast fall
    if (this.keys?.ArrowDown || this.keys?.s) {
      Body.setVelocity(this.player, { x: this.player.velocity.x, y: Math.max(this.player.velocity.y, 8) });
    }

    // On ground — reset jump count (generous threshold)
    const onGround = Math.abs(this.player.velocity.y) < 1.5;
    if (onGround) this.jumpCount = 0;

    // Jump on press (not hold) — max 2 jumps, always works
    const jumpPressed = this.keys?.ArrowUp || this.keys?.w;
    if (jumpPressed && !this.wasJumpPressed && this.jumpCount < 2) {
      Body.setVelocity(this.player, { x: vx, y: jumpVel });
      this.jumpCount++;
    } else {
      Body.setVelocity(this.player, { x: vx, y: this.player.velocity.y });
    }
    this.wasJumpPressed = jumpPressed;

    // Check collision with star
    if (this.starBody) {
      const dx = this.player.position.x - this.starBody.position.x;
      const dy = this.player.position.y - this.starBody.position.y;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        this.playerWon = true;
      }
    }

    // Check if any bodies pass through the hoop (wait 2s for things to settle)
    if (this.hoop && performance.now() - this.gameStartTime > 2000) {
      const h = this.hoop;
      const scoreZoneTop = h.y + h.h - 10;
      const scoreZoneBot = h.y + h.h + 5;
      for (const body of this.bodies) {
        const bx = body.position.x;
        const by = body.position.y;
        const inHoopX = bx > h.x - h.w / 2 + 5 && bx < h.x + h.w / 2 - 5;
        const inScoreZone = by > scoreZoneTop && by < scoreZoneBot;

        if (this.scoredBodies.has(body.id)) {
          // Clear scored status once it leaves the hoop area
          if (!inHoopX || by > scoreZoneBot + 30 || by < h.y) {
            this.scoredBodies.delete(body.id);
          }
          continue;
        }

        if (inHoopX && inScoreZone && body.velocity.y > 0.5) {
          this.score++;
          this.scoredBodies.add(body.id);
          this.lastScoreTime = performance.now();
        }
      }
    }
  }

  getPlayerState() {
    if (!this.player) return null;
    return {
      position: this.player.position,
      velocity: this.player.velocity,
      won: this.playerWon,
      facingRight: this.facingRight,
      score: this.score || 0,
      hoop: this.hoop,
      lastScoreTime: this.lastScoreTime || 0,
    };
  }
}
