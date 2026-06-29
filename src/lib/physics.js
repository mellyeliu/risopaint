import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Composite, Runner, Events } = Matter;

export class PhysicsEngine {
  constructor() {
    this.engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });
    this.runner = null;
    this.bodies = [];
    this.bodyToStroke = new Map();
    this.running = false;
    this.walls = [];
  }

  setCanvasSize(width, height) {
    this.width = width;
    this.height = height;
    this._createWalls();
  }

  _createWalls() {
    if (this.walls.length) Composite.remove(this.engine.world, this.walls);
    const w = this.width, h = this.height, t = 40;
    this.walls = [
      Bodies.rectangle(-t / 2, h / 2, t, h + 100, { isStatic: true }),
      Bodies.rectangle(w + t / 2, h / 2, t, h + 100, { isStatic: true }),
    ];
    this.finishLine = null;
    Composite.add(this.engine.world, this.walls);
  }

  addStrokes(strokes, stampsList) {
    this.mushrooms = [];
    this.butterflies = [];
    this.clouds = [];
    this.smokes = [];
    this.ladybugs = [];
    this.sparkles = [];
    this.vines = [];
    this.blackHoles = [];
    this.conveyors = [];
    this.rainbows = [];
    this.playerDead = false;
    this.invincibleUntil = 0;

    strokes.forEach((stroke) => {
      if (stroke.type === 'stamp') {
        const size = stroke.size || 40;
        const name = stampsList?.[stroke.stampIndex]?.name;

        if (name === 'mushroom') {
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { isStatic: true, restitution: 1.5 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.mushrooms.push({ body, baseY: stroke.y });
          Composite.add(this.engine.world, body);
        } else if (name === 'butterfly') {
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { isStatic: true, isSensor: true });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.butterflies.push({
            body, baseX: stroke.x, baseY: stroke.y,
            phaseX: Math.random() * Math.PI * 2, phaseY: Math.random() * Math.PI * 2,
            speedX: 0.3 + Math.random() * 0.5, speedY: 0.5 + Math.random() * 0.4,
            rangeX: 40 + Math.random() * 60, rangeY: 20 + Math.random() * 30,
          });
          Composite.add(this.engine.world, body);
        } else if (name === 'cloud') {
          // Moving platforms — left to right
          const body = Bodies.rectangle(stroke.x, stroke.y, size, size * 0.4, { isStatic: true, friction: 1 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.clouds.push({ body, baseX: stroke.x, baseY: stroke.y, range: 60 + Math.random() * 40, speed: 0.4 + Math.random() * 0.3, phase: Math.random() * Math.PI * 2 });
          Composite.add(this.engine.world, body);
        } else if (name === 'smoke') {
          // Crumbling platforms — drop after 5s of standing
          const body = Bodies.rectangle(stroke.x, stroke.y, size, size * 0.3, { isStatic: true, friction: 1 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.smokes.push({ body, baseX: stroke.x, baseY: stroke.y, standTime: 0, crumbled: false, range: 30, speed: 0.3, phase: Math.random() * Math.PI * 2 });
          Composite.add(this.engine.world, body);
        } else if (name === 'ladybug') {
          // Stationary trap
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { isStatic: true, isSensor: true });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.ladybugs.push({ body });
          Composite.add(this.engine.world, body);
        } else if (name === 'sparkle' || name === 'four-star') {
          // Power-up — collect to disable butterflies
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { isStatic: true, isSensor: true });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.sparkles.push({ body, collected: false });
          Composite.add(this.engine.world, body);
        } else if (name === 'vine') {
          // Teleporter — warps player to top of vine
          const body = Bodies.rectangle(stroke.x, stroke.y, size * 0.3, size, { isStatic: true, isSensor: true });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.vines.push({ body, topY: stroke.y - size / 2, bottomY: stroke.y + size / 2 });
          Composite.add(this.engine.world, body);
        } else if (name === 'flower' || name === 'lotus') {
          // Flowers — static decoration platforms
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { isStatic: true, friction: 0.8 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          Composite.add(this.engine.world, body);
        } else if (name === 'shell') {
          // Shell — kickable projectile
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { restitution: 0.8, friction: 0.2, density: 0.003 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          Composite.add(this.engine.world, body);
        } else if (name === 'leaf' || name === 'grass') {
          // Decorative — falls slowly like confetti
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { restitution: 0.2, friction: 0.5, density: 0.0005, frictionAir: 0.05 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          Composite.add(this.engine.world, body);
        } else if (name === 'wave') {
          // Wave — hazard zone, kills on touch
          const body = Bodies.rectangle(stroke.x, stroke.y, size, size * 0.4, { isStatic: true, isSensor: true });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.ladybugs.push({ body }); // reuse trap logic
          Composite.add(this.engine.world, body);
        } else if (name === 'rainbow') {
          // Rainbow — speed boost platform
          const body = Bodies.rectangle(stroke.x, stroke.y, size, size * 0.3, { isStatic: true, friction: 0.1 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.rainbows.push({ body });
          Composite.add(this.engine.world, body);
          // check in updatePlayer
        } else if (name === 'bow') {
          // Bow — extra jump token (gives +1 jump)
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { isStatic: true, isSensor: true });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          this.sparkles.push({ body, collected: false, isBow: true });
          Composite.add(this.engine.world, body);
        } else {
          // Default — dynamic, falls
          const body = Bodies.circle(stroke.x, stroke.y, size / 2, { restitution: 0.5, friction: 0.3, density: 0.002 });
          this.bodyToStroke.set(body, { ...stroke });
          this.bodies.push(body);
          Composite.add(this.engine.world, body);
        }
      } else if (stroke.type === 'brush' && stroke.cells && stroke.cells.length > 0) {
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
          const body = Bodies.rectangle(cx, cy, w, h, { isStatic: true, friction: 0.8, chamfer: { radius: Math.min(w, h) * 0.1 } });
          this.bodyToStroke.set(body, { ...stroke, cells: chunk.map(([gx, gy]) => `${gx},${gy}`), originalCx: cx, originalCy: cy });
          this.bodies.push(body);
          Composite.add(this.engine.world, body);
        }
      } else if (stroke.type === 'crayon' && stroke.points && stroke.points.length > 1) {
        // Crayon — black hole, sucks player toward center
        const pts = stroke.points;
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        const radius = Math.max(40, stroke.size * 4);
        const body = Bodies.circle(cx, cy, radius, { isStatic: true, isSensor: true });
        this.bodyToStroke.set(body, stroke);
        this.bodies.push(body);
        this.blackHoles.push({ body, cx, cy, radius, strength: 0.4 });
        Composite.add(this.engine.world, body);
      } else if (stroke.type === 'marker' && stroke.points && stroke.points.length > 1) {
        // Marker — conveyor belt, pushes player along the stroke direction
        const pts = stroke.points;
        const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const bw = Math.max(maxX - minX, 10);
        const bh = Math.max(maxY - minY, 10);
        const bcx = (minX + maxX) / 2;
        const bcy = (minY + maxY) / 2;
        // Direction: from first point to last point
        const dirX = pts[pts.length - 1].x - pts[0].x;
        const dirY = pts[pts.length - 1].y - pts[0].y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const body = Bodies.rectangle(bcx, bcy, bw, Math.max(bh, stroke.size || 8), { isStatic: true, friction: 0.3 });
        this.bodyToStroke.set(body, stroke);
        this.bodies.push(body);
        this.conveyors.push({ body, dirX: dirX / len, dirY: dirY / len, speed: 4, bw, bh: Math.max(bh, stroke.size || 8) });
        Composite.add(this.engine.world, body);
      } else if (stroke.type === 'start') {
        const fw = stroke.width || 50, fh = stroke.height || 60;
        const platform = Bodies.rectangle(stroke.x, stroke.y, fw, 6, { isStatic: true, friction: 0.8 });
        this.bodyToStroke.set(platform, stroke);
        this.bodies.push(platform);
        Composite.add(this.engine.world, platform);
        this.startPos = { x: stroke.x, y: stroke.y - fh / 2 };
        this.startZone = { x: stroke.x - fw / 2, y: stroke.y - fh, w: fw, h: fh };
      } else if (stroke.type === 'finish') {
        const fw = stroke.width || 50, fh = stroke.height || 60;
        const platform = Bodies.rectangle(stroke.x, stroke.y, fw, 6, { isStatic: true, friction: 0.8 });
        this.bodyToStroke.set(platform, stroke);
        this.bodies.push(platform);
        Composite.add(this.engine.world, platform);
        this.finishLine = { x: stroke.x - fw / 2, y: stroke.y - fh, w: fw, h: fh };
      }
    });
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
    if (this.runner) { Runner.stop(this.runner); this.runner = null; }
  }

  clear() {
    this.stop();
    Composite.clear(this.engine.world, false);
    this.bodies = [];
    this.bodyToStroke.clear();
    this.walls = [];
  }

  getState() {
    return this.bodies.map((body) => ({
      body, stroke: this.bodyToStroke.get(body),
      position: body.position, angle: body.angle,
    }));
  }

  shake() {
    this.bodies.forEach((body) => {
      Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.08, y: -Math.random() * 0.08 });
    });
  }

  spawnPlayer(x, y, stampsList) {
    this.player = Bodies.rectangle(x, y, 15, 36, {
      restitution: 0.1, friction: 0.8, density: 0.05,
      inertia: Infinity, inverseInertia: 0,
    });
    Composite.add(this.engine.world, this.player);
    this.keys = {};
    this.playerWon = false;
    this.jumpCount = 0;
    this.wasJumpPressed = false;
    this.facingRight = true;
    this.maxJumps = 2;
    this.lastActiveTime = performance.now();
  }

  updatePlayer() {
    if (!this.player) return;
    const time = performance.now() * 0.001;
    const now = performance.now();
    const invincible = now < this.invincibleUntil;

    // Animate clouds — move left to right, carry player
    if (this.clouds) {
      for (const c of this.clouds) {
        const prevX = c.body.position.x;
        const newX = c.baseX + Math.sin(time * c.speed + c.phase) * c.range;
        Body.setPosition(c.body, { x: newX, y: c.baseY });
        // Carry player if standing on cloud
        if (this.player && !this.playerDead && !this.playerWon) {
          const dx = Math.abs(this.player.position.x - c.body.position.x);
          const dy = this.player.position.y - c.body.position.y;
          const stroke = this.bodyToStroke.get(c.body);
          const sw = (stroke?.size || 40);
          if (dx < sw / 2 && dy < -5 && dy > -40 && Math.abs(this.player.velocity.y) < 2) {
            const drift = newX - prevX;
            Body.setPosition(this.player, { x: this.player.position.x + drift, y: this.player.position.y });
          }
        }
      }
    }

    // Animate smokes — move left to right, crumble logic
    if (this.smokes) {
      for (const s of this.smokes) {
        if (s.crumbled) continue;
        const prevX = s.body.position.x;
        const newX = s.baseX + Math.sin(time * s.speed + s.phase) * s.range;
        Body.setPosition(s.body, { x: newX, y: s.baseY });
        // Check if player is standing on it
        if (this.player && !this.playerDead) {
          const dx = Math.abs(this.player.position.x - s.body.position.x);
          const dy = this.player.position.y - s.body.position.y;
          const stroke = this.bodyToStroke.get(s.body);
          const sw = (stroke?.size || 40);
          if (dx < sw / 2 && dy < -10 && dy > -40 && Math.abs(this.player.velocity.y) < 2) {
            // Carry player
            const drift = newX - prevX;
            Body.setPosition(this.player, { x: this.player.position.x + drift, y: this.player.position.y });
            s.standTime += 16;
            if (s.standTime > 5000) {
              s.crumbled = true;
              Body.setStatic(s.body, false);
              Body.setDensity(s.body, 0.01);
            }
          } else {
            s.standTime = Math.max(0, s.standTime - 8); // recover slowly when not standing
          }
        }
      }
    }

    // Animate butterflies
    if (this.butterflies) {
      for (const b of this.butterflies) {
        const newX = b.baseX + Math.sin(time * b.speedX + b.phaseX) * b.rangeX;
        const newY = b.baseY + Math.sin(time * b.speedY + b.phaseY) * b.rangeY;
        Body.setPosition(b.body, { x: newX, y: newY });
      }
    }

    // Restart on R — always available
    if (this.keys?.r || this.keys?.R) {
      const sp = this.startPos || { x: 30, y: 20 };
      Body.setPosition(this.player, sp);
      Body.setVelocity(this.player, { x: 0, y: 0 });
      this.playerDead = false;
      this.playerWon = false;
      this.jumpCount = 0;
      this.maxJumps = 2;
      this.invincibleUntil = 0;
      if (this.smokes) this.smokes.forEach(s => { s.standTime = 0; s.crumbled = false; Body.setStatic(s.body, true); });
      if (this.sparkles) this.sparkles.forEach(s => { s.collected = false; });
      this.keys.r = false;
      this.keys.R = false;
      return;
    }

    if (this.playerDead || this.playerWon) return;

    // Check butterfly collision (skip if invincible)
    if (this.butterflies && !invincible) {
      for (const b of this.butterflies) {
        const dx = this.player.position.x - b.body.position.x;
        const dy = this.player.position.y - b.body.position.y;
        const stroke = this.bodyToStroke.get(b.body);
        const hitDist = ((stroke?.size || 40) / 2) + 10;
        if (Math.sqrt(dx * dx + dy * dy) < hitDist) {
          this.playerDead = true;
          this.deathTime = now;
          return;
        }
      }
    }

    // Check ladybug/wave traps
    if (this.ladybugs) {
      for (const l of this.ladybugs) {
        const dx = this.player.position.x - l.body.position.x;
        const dy = this.player.position.y - l.body.position.y;
        const stroke = this.bodyToStroke.get(l.body);
        const hitDist = ((stroke?.size || 40) / 2) + 5;
        if (Math.sqrt(dx * dx + dy * dy) < hitDist) {
          this.playerDead = true;
          this.deathTime = now;
          return;
        }
      }
    }

    // Check sparkle/star collection — invincibility
    if (this.sparkles) {
      for (const s of this.sparkles) {
        if (s.collected) continue;
        const dx = this.player.position.x - s.body.position.x;
        const dy = this.player.position.y - s.body.position.y;
        if (Math.sqrt(dx * dx + dy * dy) < 25) {
          s.collected = true;
          if (s.isBow) {
            this.maxJumps = 3; // extra jump
          } else {
            this.invincibleUntil = now + 30000; // 30 seconds
          }
          // Hide the body off-screen
          Body.setPosition(s.body, { x: -999, y: -999 });
        }
      }
    }

    // Check vine teleport
    if (this.vines) {
      for (const v of this.vines) {
        const dx = this.player.position.x - v.body.position.x;
        const dy = this.player.position.y - v.body.position.y;
        const stroke = this.bodyToStroke.get(v.body);
        const hitDist = ((stroke?.size || 40) / 2);
        if (Math.abs(dx) < hitDist && Math.abs(dy) < hitDist) {
          // Teleport to top of vine
          Body.setPosition(this.player, { x: v.body.position.x, y: v.topY - 20 });
          Body.setVelocity(this.player, { x: 0, y: -5 });
          this.jumpCount = 0;
          break;
        }
      }
    }

    // Check mushroom trampoline
    if (this.mushrooms && this.player.velocity.y > 0) {
      for (const m of this.mushrooms) {
        const dx = this.player.position.x - m.body.position.x;
        const dy = this.player.position.y - m.body.position.y;
        const stroke = this.bodyToStroke.get(m.body);
        const hitDist = ((stroke?.size || 40) / 2) + 18;
        if (Math.sqrt(dx * dx + dy * dy) < hitDist && dy < 0) {
          Body.setVelocity(this.player, { x: this.player.velocity.x, y: -18 });
          this.jumpCount = 0;
        }
      }
    }

    // Check rainbow speed boost
    this.speedBoost = false;
    if (this.rainbows) {
      for (const r of this.rainbows) {
        const dx = Math.abs(this.player.position.x - r.body.position.x);
        const dy = this.player.position.y - r.body.position.y;
        const stroke = this.bodyToStroke.get(r.body);
        const sw = (stroke?.size || 40);
        if (dx < sw / 2 && dy < -5 && dy > -40 && Math.abs(this.player.velocity.y) < 2) {
          this.speedBoost = true;
        }
      }
    }

    // Black holes — suck player toward center
    for (const bh of this.blackHoles) {
      const dx = bh.cx - this.player.position.x;
      const dy = bh.cy - this.player.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bh.radius * 4) {
        // Strong gravitational pull — gets stronger as you get closer
        const pull = bh.strength * (1 / Math.max(dist * 0.02, 0.5));
        const nx = (dx / dist) * pull;
        const ny = (dy / dist) * pull;
        Body.setVelocity(this.player, {
          x: this.player.velocity.x + nx,
          y: this.player.velocity.y + ny,
        });
        // Kill if sucked into center
        if (dist < 15) {
          this.playerDead = true;
          this.deathTime = now;
          return;
        }
      }
    }

    // Conveyors — push player along direction when near it
    for (const c of this.conveyors) {
      const dx = Math.abs(this.player.position.x - c.body.position.x);
      const dy = Math.abs(this.player.position.y - c.body.position.y);
      if (dx < c.bw / 2 + 20 && dy < c.bh / 2 + 25) {
        Body.setVelocity(this.player, {
          x: this.player.velocity.x + c.dirX * c.speed * 0.3,
          y: this.player.velocity.y + c.dirY * c.speed * 0.3,
        });
      }
    }

    // Movement
    const speed = this.speedBoost ? 12 : 6;
    const jumpVel = -7;
    let vx = this.player.velocity.x;

    const anyKey = this.keys?.ArrowLeft || this.keys?.a || this.keys?.ArrowRight || this.keys?.d || this.keys?.ArrowUp || this.keys?.w || this.keys?.ArrowDown || this.keys?.s;
    if (anyKey) this.lastActiveTime = now;

    if (this.keys?.ArrowLeft || this.keys?.a) { vx = -speed; this.facingRight = false; }
    else if (this.keys?.ArrowRight || this.keys?.d) { vx = speed; this.facingRight = true; }
    else { vx *= 0.7; }

    if (this.keys?.ArrowDown || this.keys?.s) {
      Body.setVelocity(this.player, { x: this.player.velocity.x, y: Math.max(this.player.velocity.y, 8) });
    }

    // On ground — only reset if velocity is near zero AND player was moving down or stationary
    // (prevents mid-air reset at jump apex)
    const vy = this.player.velocity.y;
    const onGround = Math.abs(vy) < 0.5 && this.lastVy !== undefined && this.lastVy >= 0;
    if (onGround) this.jumpCount = 0;
    this.lastVy = vy;

    const jumpPressed = this.keys?.ArrowUp || this.keys?.w;
    if (jumpPressed && !this.wasJumpPressed && this.jumpCount < this.maxJumps) {
      Body.setVelocity(this.player, { x: vx, y: jumpVel });
      this.jumpCount++;
    } else {
      Body.setVelocity(this.player, { x: vx, y: this.player.velocity.y });
    }
    this.wasJumpPressed = jumpPressed;

    // Check finish zone
    if (this.finishLine) {
      const fl = this.finishLine;
      const px = this.player.position.x, py = this.player.position.y;
      if (px > fl.x && px < fl.x + fl.w && py > fl.y && py < fl.y + fl.h) {
        this.playerWon = true;
        Body.setVelocity(this.player, { x: 0, y: 0 });
      }
    }

    // Fall off bottom
    if (this.player.position.y > this.height + 50) {
      this.playerDead = true;
      this.deathTime = now;
    }
  }

  getPlayerState() {
    if (!this.player) return null;
    return {
      position: this.player.position,
      velocity: this.player.velocity,
      won: this.playerWon,
      dead: this.playerDead,
      deathTime: this.deathTime || 0,
      facingRight: this.facingRight,
      finishLine: this.finishLine,
      startZone: this.startZone,
      invincible: performance.now() < (this.invincibleUntil || 0),
      invincibleUntil: this.invincibleUntil || 0,
      sleeping: !this.playerDead && !this.playerWon && (performance.now() - (this.lastActiveTime || 0)) > 10000,
    };
  }
}
