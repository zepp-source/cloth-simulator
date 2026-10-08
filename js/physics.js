const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.pinned = false;
  }

  update(dt, damping, gravity, windStrength, phase) {
    if (this.pinned) return;

    const vx = (this.x - this.px) * damping;
    const vy = (this.y - this.py) * damping;

    this.px = this.x;
    this.py = this.y;
    this.x += vx;
    this.y += vy + gravity * dt * 0.06;

    if (windStrength > 0) {
      const turbulent = Math.sin(this.y * 0.08 + phase) * windStrength * 0.18;
      this.x += turbulent;
    }
  }
}

class Link {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.active = true;
    this.restLength = Math.hypot(b.x - a.x, b.y - a.y);
  }

  solve(stiffness, tearThreshold) {
    if (!this.active) return;

    const dx = this.b.x - this.a.x;
    const dy = this.b.y - this.a.y;
    const distance = Math.hypot(dx, dy) || 0.0001;

    if (distance > tearThreshold) {
      this.active = false;
      return;
    }

    const ratio = (this.restLength - distance) / (distance + 0.0001);
    const offsetX = dx * ratio * 0.5 * stiffness;
    const offsetY = dy * ratio * 0.5 * stiffness;

    if (!this.a.pinned) {
      this.a.x += offsetX;
      this.a.y += offsetY;
    }

    if (!this.b.pinned) {
      this.b.x -= offsetX;
      this.b.y -= offsetY;
    }
  }
}

class ClothSimulation {
  constructor(width = 75, height = 45, spacing = 14) {
    this.width = width;
    this.height = height;
    this.spacing = spacing;

    this.points = [];
    this.links = [];

    this.iterations = 6;
    this.stiffness = 0.75;
    this.damping = 0.9945;
    this.gravity = 0.35;
    this.tearThreshold = 35;
    this.windStrength = 0.4;
    this.bounce = 0.1;
    this.dragRadius = 46;
    this.phase = 0;
    this.paused = false;
    this.interactionMode = 'grab';
    this.pointer = { x: 0, y: 0, px: 0, py: 0, down: false, button: 0 };
    this.touchPoints = new Map();
    this.groundY = window.innerHeight - 60;

    this.initialize();
  }

  initialize() {
    this.points = [];
    this.links = [];

    const startX = (window.innerWidth - (this.width - 1) * this.spacing) / 2 + 80;
    const startY = 90;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const point = new Point(startX + x * this.spacing, startY + y * this.spacing);
        if (y === 0) point.pinned = true;
        this.points.push(point);
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        if (x < this.width - 1) this.links.push(new Link(this.points[index], this.points[index + 1]));
        if (y < this.height - 1) this.links.push(new Link(this.points[index], this.points[index + this.width]));
      }
    }

    this.groundY = window.innerHeight - 60;
  }

  setDimensions(width, height, spacing) {
    this.width = width;
    this.height = height;
    this.spacing = spacing;
    this.initialize();
  }

  setInteractionMode(mode) {
    this.interactionMode = mode;
  }

  applyPreset(preset) {
    const config = window.PRESET_CONFIG[preset];
    if (!config) return;

    Object.assign(this, config);
  }

  update(dt) {
    if (this.paused) return;

    this.phase += dt * 0.008;

    for (const point of this.points) {
      point.update(dt, this.damping, this.gravity, this.windStrength, this.phase);

      if (point.y > this.groundY) {
        point.y = this.groundY;
        point.py = point.y + (point.y - point.py) * this.bounce;
      }
    }

    for (let i = 0; i < this.iterations; i++) {
      for (const link of this.links) {
        link.solve(this.stiffness, this.tearThreshold);
      }
    }

    this.handlePointerInteraction();
    this.handleTouchInteraction();
  }

  handlePointerInteraction() {
    if (!this.pointer.down) return;

    if (this.interactionMode === 'grab') {
      const dx = this.pointer.x - this.pointer.px;
      const dy = this.pointer.y - this.pointer.py;

      for (const point of this.points) {
        const dist = Math.hypot(point.x - this.pointer.x, point.y - this.pointer.y);
        if (dist < this.dragRadius) {
          point.x += dx * 0.75;
          point.y += dy * 0.75;
          point.px = point.x;
          point.py = point.y;
        }
      }
    }

    if (this.interactionMode === 'tear' && this.pointer.button === 2) {
      for (const link of this.links) {
        const midX = (link.a.x + link.b.x) * 0.5;
        const midY = (link.a.y + link.b.y) * 0.5;
        const dist = Math.hypot(midX - this.pointer.x, midY - this.pointer.y);

        if (dist < this.dragRadius * 0.7) {
          link.active = false;
        }
      }
    }

    if (this.interactionMode === 'pin') {
      for (const point of this.points) {
        const dist = Math.hypot(point.x - this.pointer.x, point.y - this.pointer.y);
        if (dist < this.dragRadius) {
          point.pinned = true;
        }
      }
    }
  }

  handleTouchInteraction() {
    for (const touch of this.touchPoints.values()) {
      if (this.interactionMode === 'grab') {
        for (const point of this.points) {
          const dist = Math.hypot(point.x - touch.x, point.y - touch.y);
          if (dist < this.dragRadius) {
            point.x += (touch.x - point.x) * 0.18;
            point.y += (touch.y - point.y) * 0.18;
          }
        }
      }

      if (this.interactionMode === 'tear') {
        for (const link of this.links) {
          const midX = (link.a.x + link.b.x) * 0.5;
          const midY = (link.a.y + link.b.y) * 0.5;
          const dist = Math.hypot(midX - touch.x, midY - touch.y);
          if (dist < this.dragRadius * 0.7) {
            link.active = false;
          }
        }
      }
    }
  }

  setPointerFromEvent(event, rect) {
    this.pointer.px = this.pointer.x;
    this.pointer.py = this.pointer.y;
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
  }

  setTouchesFromEvent(event, rect) {
    const touches = new Map();
    for (const touch of event.touches) {
      touches.set(touch.identifier, {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
    this.touchPoints = touches;
  }
}

if (typeof window !== 'undefined') {
  window.ClothSimulation = ClothSimulation;
  window.clamp = clamp;
}