import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Composite, Runner, Events } = Matter;

export class PhysicsEngine {
  constructor() {
    this.engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.002 },
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

    this.walls = [
      Bodies.rectangle(w / 2, h + t / 2, w + 100, t, { isStatic: true }), // floor
      Bodies.rectangle(-t / 2, h / 2, t, h + 100, { isStatic: true }),     // left
      Bodies.rectangle(w + t / 2, h / 2, t, h + 100, { isStatic: true }), // right
    ];

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
        // Brush stroke → approximate with a rectangle body from cell bounds
        const allCoords = stroke.cells.map(k => k.split(',').map(Number));
        const xs = allCoords.map(c => c[0]), ys = allCoords.map(c => c[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const w = Math.max(maxX - minX + 16, 8);
        const h = Math.max(maxY - minY + 16, 8);
        const cx = (minX + maxX + 16) / 2;
        const cy = (minY + maxY + 16) / 2;

        const body = Bodies.rectangle(cx, cy, w, h, {
          restitution: 0.4,
          friction: 0.5,
          density: 0.001,
          chamfer: { radius: Math.min(w, h) * 0.15 },
        });

        this.bodyToStroke.set(body, {
          ...stroke,
          originalCx: cx,
          originalCy: cy,
        });
        this.bodies.push(body);
        Composite.add(this.engine.world, body);
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
}
