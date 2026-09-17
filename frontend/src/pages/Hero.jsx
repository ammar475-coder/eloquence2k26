import { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import logoImg from '../assets/logo.png';
import { getWsUrl } from '../config/api';
import { fetchRegistrationStatus, setCachedRegistrationStatus } from '../services/api';

const cahcetLogo = '/cahcet.jpg';

const EVENT_START = new Date('2026-09-26T00:00:00+05:30').getTime();

function getTimeRemaining() {
  const remainingSeconds = Math.max(0, Math.floor((EVENT_START - Date.now()) / 1000));
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export default function Hero({ onExplore, onRegister }) {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining);
  const [isRegClosed, setIsRegClosed] = useState(false);
  const [closedReason, setClosedReason] = useState('ONLINE REGISTRATIONS ARE CLOSED');
  const [onSpotNotice, setOnSpotNotice] = useState('ON SPOT REGISTRATIONS WILL BE OPENED TOMORROW ON 9:00 AM');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Fetch real-time registration status once & WebSocket listener
  useEffect(() => {
    let isMounted = true;
    let ws = null;

    fetchRegistrationStatus()
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.success) {
          setIsRegClosed(Boolean(data.isRegistrationClosed));
          if (data.closedReason) setClosedReason(data.closedReason);
          if (data.onSpotNotice) setOnSpotNotice(data.onSpotNotice);
        }
      })
      .catch(() => {});

    try {
      ws = new WebSocket(getWsUrl('/ws/registrations'));
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'REGISTRATION_UPDATE' && msg.action === 'REGISTRATION_STATUS_UPDATED') {
            if (isMounted) {
              setCachedRegistrationStatus(msg.data);
              setIsRegClosed(Boolean(msg.data?.isRegistrationClosed));
              if (msg.data?.closedReason) setClosedReason(msg.data.closedReason);
              if (msg.data?.onSpotNotice) setOnSpotNotice(msg.data.onSpotNotice);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      isMounted = false;
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          try { ws.close(); } catch (e) {}
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => {
            try { ws.close(); } catch (e) {}
          };
        }
      }
    };
  }, []);

  // Advanced Doomsday Animation: Adaptive, high-performance canvas with auto-pause on scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    const heroEl = heroRef.current;
    if (!canvas || !heroEl) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId = null;
    let isRunning = false;
    let isHeroVisible = true;
    let isTabVisible = !document.hidden;
    let resizeFrame = null;

    let logicalWidth = heroEl.clientWidth || window.innerWidth;
    let logicalHeight = heroEl.clientHeight || window.innerHeight;
    let isMobile = logicalWidth < 768;
    let dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    let mouse = { x: null, y: null, radius: 140, active: false };
    let embers = [];
    let motes = [];
    let orbitalParticles = [];
    let shockwaves = [];
    let lightnings = [];

    // Flash state for whole-screen lightning flashes
    let flashOpacity = 0;
    let flashPhase = 0;

    // 1-second gap between strikes back to back
    let nextLightningTime = performance.now() + 1000;

    // Advanced Multi-Branching Fractal Lightning from completely random places
    class FractalLightning {
      constructor(w, h, targetX = null, targetY = null) {
        this.w = w;
        this.h = h;

        if (targetX !== null && targetY !== null) {
          this.startX = targetX + (Math.random() - 0.5) * 240;
          this.startY = Math.random() * (h * 0.2);
          this.endX = targetX;
          this.endY = targetY;
        } else {
          // 5 Distinct Random Strike Patterns
          const mode = Math.floor(Math.random() * 5);

          if (mode === 0) {
            this.startX = Math.random() * (w * 0.4);
            this.startY = Math.random() * (h * 0.18);
            this.endX = w * 0.2 + Math.random() * (w * 0.6);
            this.endY = h * (0.68 + Math.random() * 0.28);
          } else if (mode === 1) {
            this.startX = w * 0.6 + Math.random() * (w * 0.4);
            this.startY = Math.random() * (h * 0.18);
            this.endX = Math.random() * (w * 0.65);
            this.endY = h * (0.68 + Math.random() * 0.28);
          } else if (mode === 2) {
            this.startX = w * 0.35 + Math.random() * (w * 0.3);
            this.startY = Math.random() * (h * 0.15);
            this.endX = this.startX + (Math.random() - 0.5) * (w * 0.35);
            this.endY = h * (0.72 + Math.random() * 0.25);
          } else if (mode === 3) {
            const fromLeft = Math.random() > 0.5;
            this.startX = fromLeft ? Math.random() * (w * 0.25) : w * 0.75 + Math.random() * (w * 0.25);
            this.startY = h * (0.05 + Math.random() * 0.25);
            this.endX = fromLeft ? w * 0.55 + Math.random() * (w * 0.4) : Math.random() * (w * 0.45);
            this.endY = h * (0.05 + Math.random() * 0.3);
          } else {
            const fromSide = Math.random() > 0.5 ? 0 : w;
            this.startX = fromSide + (Math.random() - 0.5) * 60;
            this.startY = Math.random() * (h * 0.35);
            this.endX = w * 0.5 + (Math.random() - 0.5) * 240;
            this.endY = h * 0.44 + (Math.random() - 0.5) * 90;
          }
        }

        this.branches = [];
        const branchDepth = isMobile ? 3 : 4;
        const branchJitter = isMobile ? 36 : 45;
        this.generateBranches(this.startX, this.startY, this.endX, this.endY, branchDepth, branchJitter);

        this.maxLife = 16;
        this.life = this.maxLife;
        this.flickerStrobes = [1.0, 0.3, 0.95, 0.15, 0.85, 0.4, 0.2, 0.08];
        this.originX = this.startX;
        this.originY = this.startY;
        this.hitX = this.endX;
        this.hitY = this.endY;
        this.isGroundHit = this.hitY > h * 0.65;
      }

      generateBranches(x1, y1, x2, y2, depth, jitter) {
        if (depth <= 0) {
          this.branches.push({ x1, y1, x2, y2, depth });
          return;
        }

        const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * jitter;
        const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * (jitter * 0.6);

        this.generateBranches(x1, y1, midX, midY, depth - 1, jitter * 0.65);
        this.generateBranches(midX, midY, x2, y2, depth - 1, jitter * 0.65);

        // Sub-fork branching (skip on mobile for performance)
        if (!isMobile && depth >= 2 && Math.random() < 0.5) {
          const angle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() - 0.5) * 1.3;
          const length = Math.hypot(x2 - x1, y2 - y1) * (0.3 + Math.random() * 0.35);
          const forkEndX = midX + Math.cos(angle) * length;
          const forkEndY = midY + Math.sin(angle) * length;
          this.generateBranches(midX, midY, forkEndX, forkEndY, depth - 1, jitter * 0.5);
        }
      }

      update() {
        this.life--;
        return this.life > 0;
      }

      draw(context) {
        const frameIdx = this.maxLife - this.life;
        const strobe = frameIdx < this.flickerStrobes.length 
          ? this.flickerStrobes[frameIdx] 
          : (this.life / this.maxLife);
        if (strobe <= 0.05) return;

        context.save();

        // 1. Volumetric Cloud Illumination at Strike Origin
        const glowRadius = isMobile ? 180 : 320;
        const cloudGlow = context.createRadialGradient(this.originX, this.originY, 8, this.originX, this.originY, glowRadius);
        cloudGlow.addColorStop(0, `rgba(180, 255, 220, ${strobe * 0.35})`);
        cloudGlow.addColorStop(0.4, `rgba(57, 255, 136, ${strobe * 0.18})`);
        cloudGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = cloudGlow;
        context.beginPath();
        context.arc(this.originX, this.originY, glowRadius, 0, Math.PI * 2);
        context.fill();

        // 2. Ground Specular Glint on Cyber Floor
        if (this.isGroundHit) {
          const floorR = isMobile ? 120 : 200;
          const floorGlow = context.createRadialGradient(this.hitX, this.hitY, 4, this.hitX, this.hitY, floorR);
          floorGlow.addColorStop(0, `rgba(220, 255, 240, ${strobe * 0.45})`);
          floorGlow.addColorStop(0.4, `rgba(57, 255, 136, ${strobe * 0.2})`);
          floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          context.fillStyle = floorGlow;
          context.beginPath();
          context.ellipse(this.hitX, this.hitY, floorR, floorR * 0.32, 0, 0, Math.PI * 2);
          context.fill();
        }

        // 3. Wide Outer Emerald Plasma Halo
        context.beginPath();
        for (let i = 0; i < this.branches.length; i++) {
          const b = this.branches[i];
          context.moveTo(b.x1, b.y1);
          context.lineTo(b.x2, b.y2);
        }
        context.strokeStyle = '#39FF88';
        context.lineWidth = isMobile ? 4 : 6;
        context.globalAlpha = strobe * 0.45;
        context.stroke();

        // 4. Vibrant Mid Neon Beam
        context.beginPath();
        for (let i = 0; i < this.branches.length; i++) {
          const b = this.branches[i];
          context.moveTo(b.x1, b.y1);
          context.lineTo(b.x2, b.y2);
        }
        context.strokeStyle = '#76FF03';
        context.lineWidth = isMobile ? 2 : 2.8;
        context.globalAlpha = strobe * 0.8;
        context.stroke();

        // 5. Blinding White-Hot Core Channel
        context.beginPath();
        for (let i = 0; i < this.branches.length; i++) {
          const b = this.branches[i];
          context.moveTo(b.x1, b.y1);
          context.lineTo(b.x2, b.y2);
        }
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1.3;
        context.globalAlpha = strobe * 0.98;
        context.stroke();

        context.restore();
      }
    }

    // Function to trigger a thunder strike with screen flash
    const triggerThunder = (targetX = null, targetY = null) => {
      lightnings.push(new FractalLightning(logicalWidth, logicalHeight, targetX, targetY));
      flashOpacity = Math.random() * 0.18 + 0.38;
      flashPhase = 1.0;
    };

    // Advanced Apocalyptic Ember with Motion Trail & Curl Drift
    class AdvancedEmber {
      constructor(w, h, scatter = false) {
        this.w = w;
        this.h = h;
        this.history = [];
        this.maxHistory = isMobile ? 2 : 4;
        this.reset(scatter);
      }

      reset(scatter = false) {
        this.x = Math.random() * this.w;
        this.y = scatter ? Math.random() * this.h : this.h + Math.random() * 40;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = -(Math.random() * 1.2 + 0.5);
        this.speedX = (Math.random() - 0.5) * 0.45;
        this.curlFreq = Math.random() * 0.02 + 0.008;
        this.curlPhase = Math.random() * Math.PI * 2;
        this.curlAmp = Math.random() * 1.6 + 0.5;

        const palette = ['#00FF66', '#39FF88', '#76FF03', '#A3FFD6', '#FFFFFF', '#FFD54F'];
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.isGold = this.color === '#FFD54F';
        this.isWhite = this.color === '#FFFFFF';

        this.targetAlpha = Math.random() * 0.65 + 0.28;
        this.alpha = 0;
        this.life = 0;
        this.maxLife = Math.random() * 280 + 180;
        this.history = [];
      }

      update(time, mousePos, currentShockwaves) {
        this.life++;
        this.curlPhase += this.curlFreq;

        if (!isMobile) {
          this.history.unshift({ x: this.x, y: this.y });
          if (this.history.length > this.maxHistory) this.history.pop();
        }

        this.y += this.speedY;
        this.x += Math.sin(this.curlPhase) * this.curlAmp + this.speedX;

        const p = this.life / this.maxLife;
        let a = this.targetAlpha;
        if (p < 0.12) a = (p / 0.12) * this.targetAlpha;
        else if (p > 0.78) a = ((1 - p) / 0.22) * this.targetAlpha;

        if (this.y < this.h * 0.1) a *= Math.max(0, this.y / (this.h * 0.1));
        this.alpha = a;

        if (mousePos.x !== null && mousePos.y !== null) {
          const dx = mousePos.x - this.x;
          const dy = mousePos.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mousePos.radius && dist > 0) {
            const force = (1 - dist / mousePos.radius) * 2.5;
            this.x -= (dx / dist) * force;
            this.y -= (dy / dist) * force;
          }
        }

        for (let s = 0; s < currentShockwaves.length; s++) {
          const sw = currentShockwaves[s];
          const dx = this.x - sw.x;
          const dy = this.y - sw.y;
          const dist = Math.hypot(dx, dy);
          const diff = Math.abs(dist - sw.radius);
          if (diff < 36 && dist > 0) {
            const push = (1 - diff / 36) * sw.intensity * 4.5;
            this.x += (dx / dist) * push;
            this.y += (dy / dist) * push;
          }
        }

        if (this.y < -30 || this.x < -40 || this.x > this.w + 40 || this.life >= this.maxLife) {
          this.reset(false);
        }
      }

      draw(context) {
        if (this.alpha <= 0.01) return;

        if (!isMobile && this.history.length >= 2) {
          context.beginPath();
          context.moveTo(this.history[0].x, this.history[0].y);
          for (let i = 1; i < this.history.length; i++) {
            context.lineTo(this.history[i].x, this.history[i].y);
          }
          context.strokeStyle = this.color;
          context.lineWidth = this.size * 0.75;
          context.globalAlpha = this.alpha * 0.35;
          context.stroke();
        }

        context.beginPath();
        context.arc(this.x, this.y, this.size * (isMobile ? 2 : 2.6), 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.globalAlpha = this.alpha * 0.24;
        context.fill();

        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = this.isWhite ? '#FFFFFF' : this.isGold ? '#FFE082' : this.color;
        context.globalAlpha = Math.min(1, this.alpha * 1.2);
        context.fill();
        context.globalAlpha = 1;
      }
    }

    // Ambient floating cosmic dust / star motes in deep space
    class CosmicDustMote {
      constructor(w, h) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 1.4 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.baseAlpha = Math.random() * 0.32 + 0.12;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.025 + 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        if (this.x < 0) this.x = this.w;
        if (this.x > this.w) this.x = 0;
        if (this.y < 0) this.y = this.h;
        if (this.y > this.h) this.y = 0;
      }

      draw(context) {
        const a = this.baseAlpha + Math.sin(this.pulse) * 0.14;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = '#39FF88';
        context.globalAlpha = Math.max(0.06, a);
        context.fill();
        context.globalAlpha = 1;
      }
    }

    // Orbital Planetary Plasma Beads (revolving on the planetary rings aligned with backdrop)
    class OrbitalRingParticle {
      constructor(cx, cy, rx, ry, tilt) {
        this.cx = cx;
        this.cy = cy;
        this.rx = rx;
        this.ry = ry;
        this.tilt = tilt;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (Math.random() * 0.007 + 0.0035) * (Math.random() > 0.5 ? 1 : -1);
        this.size = Math.random() * 2 + 1.1;
        this.color = Math.random() > 0.4 ? '#39FF88' : '#A3FFD6';
      }

      update(cx, cy, rx, ry) {
        this.cx = cx;
        this.cy = cy;
        this.rx = rx;
        this.ry = ry;
        this.angle += this.speed;
      }

      draw(context) {
        const cosA = Math.cos(this.angle);
        const sinA = Math.sin(this.angle);
        const unrotatedX = cosA * this.rx;
        const unrotatedY = sinA * this.ry;

        const cosT = Math.cos(this.tilt);
        const sinT = Math.sin(this.tilt);
        const x = this.cx + (unrotatedX * cosT - unrotatedY * sinT);
        const y = this.cy + (unrotatedX * sinT + unrotatedY * cosT);

        const depthAlpha = sinA > 0 ? 0.85 : 0.28;

        context.save();
        context.beginPath();
        context.arc(x, y, this.size * 2.4, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.globalAlpha = depthAlpha * 0.32;
        context.fill();

        context.beginPath();
        context.arc(x, y, this.size, 0, Math.PI * 2);
        context.fillStyle = '#FFFFFF';
        context.globalAlpha = depthAlpha;
        context.fill();
        context.restore();
      }
    }

    // Advanced Electric Shockwave Ring
    class AdvancedShockwave {
      constructor(x, y, maxR) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = maxR || 240;
        this.speed = isMobile ? 9.5 : 8.5;
        this.intensity = 1;
        this.life = 1;
        this.arcs = [];
        const arcCount = isMobile ? 4 : 7;
        for (let i = 0; i < arcCount; i++) {
          this.arcs.push({
            angle: (i * Math.PI * 2) / arcCount + (Math.random() - 0.5) * 0.3,
            len: Math.random() * 16 + 8,
          });
        }
      }

      update() {
        this.radius += this.speed;
        this.life = 1 - this.radius / this.maxRadius;
        this.intensity = Math.max(0, this.life);
        return this.life > 0;
      }

      draw(context) {
        if (this.life <= 0) return;
        context.save();

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.strokeStyle = '#39FF88';
        context.lineWidth = Math.max(1.5, (isMobile ? 3 : 4) * this.life);
        context.globalAlpha = this.life * 0.7;
        if (!isMobile) {
          context.shadowColor = '#00FF66';
          context.shadowBlur = 12;
        }
        context.stroke();

        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1.6;
        for (const arc of this.arcs) {
          const ax = this.x + Math.cos(arc.angle) * this.radius;
          const ay = this.y + Math.sin(arc.angle) * this.radius;
          const bx = ax + Math.cos(arc.angle + 0.4) * arc.len;
          const by = ay + Math.sin(arc.angle + 0.4) * arc.len;
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.globalAlpha = this.life * 0.85;
          context.stroke();
        }

        if (this.radius > 25) {
          context.beginPath();
          context.arc(this.x, this.y, this.radius * 0.85, 0, Math.PI * 2);
          context.strokeStyle = '#A3FFD6';
          context.lineWidth = 1.2;
          context.globalAlpha = this.life * 0.35;
          context.stroke();
        }

        context.restore();
      }
    }

    // Initialize Particles & Entities based on screen size
    const initScene = () => {
      embers = [];
      motes = [];
      orbitalParticles = [];
      shockwaves = [];
      lightnings = [];

      const emberCount = isMobile ? 24 : 65;
      const moteCount = isMobile ? 14 : 32;
      const orbitalCount = isMobile ? 8 : 16;

      for (let i = 0; i < emberCount; i++) {
        embers.push(new AdvancedEmber(logicalWidth, logicalHeight, true));
      }
      for (let i = 0; i < moteCount; i++) {
        motes.push(new CosmicDustMote(logicalWidth, logicalHeight));
      }

      // Aligned with the center planetary rings in the backdrop image
      const cx = logicalWidth * 0.5;
      const cy = logicalHeight * 0.44;
      const rx = Math.min(logicalWidth * 0.38, 280);
      const ry = rx * 0.28;
      const tilt = -0.12;
      for (let o = 0; o < orbitalCount; o++) {
        orbitalParticles.push(new OrbitalRingParticle(cx, cy, rx, ry, tilt));
      }
    };

    // Throttled Resize Handler with Responsive High-DPI Support
    const handleResize = () => {
      if (!heroEl || !canvas) return;
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        logicalWidth = heroEl.clientWidth || window.innerWidth;
        logicalHeight = heroEl.clientHeight || window.innerHeight;
        isMobile = logicalWidth < 768;
        dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

        canvas.width = Math.floor(logicalWidth * dpr);
        canvas.height = Math.floor(logicalHeight * dpr);
        canvas.style.width = `${logicalWidth}px`;
        canvas.style.height = `${logicalHeight}px`;

        initScene();
      });
    };

    // Main 60 FPS Continuous Animation Loop
    const animate = (timestamp) => {
      if (!isRunning) return;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // 1. Update and Draw Ambient Deep Space Cosmic Dust
      for (let i = 0; i < motes.length; i++) {
        motes[i].update();
        motes[i].draw(ctx);
      }

      // 2. Update and Draw Planetary Orbital Plasma Particles
      const cx = logicalWidth * 0.5;
      const cy = logicalHeight * 0.44;
      const rx = Math.min(logicalWidth * 0.38, 280);
      const ry = rx * 0.28;
      for (let i = 0; i < orbitalParticles.length; i++) {
        orbitalParticles[i].update(cx, cy, rx, ry);
        orbitalParticles[i].draw(ctx);
      }

      // 3. Update and Draw Rising Apocalyptic Embers
      for (let i = 0; i < embers.length; i++) {
        embers[i].update(timestamp, mouse, shockwaves);
        embers[i].draw(ctx);
      }

      // 4. Update and Draw Active Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const alive = shockwaves[i].update();
        if (alive) {
          shockwaves[i].draw(ctx);
        } else {
          shockwaves.splice(i, 1);
        }
      }

      // 5. Back-to-Back Thunders with 1-second gap
      if (timestamp > nextLightningTime) {
        triggerThunder();
        nextLightningTime = timestamp + 1000 + (Math.random() - 0.5) * 250;
      }

      // 6. Update and Draw Lightning Bolts
      for (let i = lightnings.length - 1; i >= 0; i--) {
        const alive = lightnings[i].update();
        if (alive) {
          lightnings[i].draw(ctx);
        } else {
          lightnings.splice(i, 1);
        }
      }

      // 7. Dynamic Atmospheric Flash on Lightning Strikes
      if (flashOpacity > 0.01) {
        const strobe = Math.sin(flashPhase * Math.PI * 4) * 0.2 + 0.8;
        const currentFlash = flashOpacity * Math.max(0, strobe);

        if (isMobile) {
          ctx.fillStyle = `rgba(180, 255, 215, ${currentFlash * 0.35})`;
          ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        } else {
          ctx.fillStyle = `rgba(210, 255, 235, ${currentFlash * 0.32})`;
          ctx.fillRect(0, 0, logicalWidth, logicalHeight);
          ctx.fillStyle = `rgba(57, 255, 136, ${currentFlash * 0.36})`;
          ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        }

        flashOpacity *= 0.82;
        flashPhase += 0.2;
      }

      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    // Lifecycle loop managers
    const startLoop = () => {
      if (isRunning || !isHeroVisible || !isTabVisible) return;
      isRunning = true;
      animationId = requestAnimationFrame(animate);
    };

    const stopLoop = () => {
      if (!isRunning) return;
      isRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    // Setup initial size and particles
    handleResize();
    startLoop();

    // IntersectionObserver: automatically pauses heavy loop when hero is scrolled out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.02, rootMargin: '60px' }
    );
    observer.observe(heroEl);

    // Page Visibility API: pause when user switches tabs or minimizes browser
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isHeroVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Interactive event listeners
    const handleMouseMove = (e) => {
      const rect = heroEl.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const rect = heroEl.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.active = false;
    };

    // Click triggers advanced shockwave and summons lightning directly to cursor
    const handleClick = (e) => {
      if (e.target && e.target.closest('button, a, input, [role="button"]')) {
        return;
      }
      const rect = heroEl.getBoundingClientRect();
      const clickX = (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.width / 2)) - rect.left;
      const clickY = (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.height / 2)) - rect.top;

      shockwaves.push(new AdvancedShockwave(clickX, clickY, Math.min(logicalWidth, logicalHeight) * 0.45));
      triggerThunder(clickX, clickY);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    heroEl.addEventListener('mousemove', handleMouseMove, { passive: true });
    heroEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    heroEl.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    heroEl.addEventListener('click', handleClick);

    return () => {
      stopLoop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      heroEl.removeEventListener('mousemove', handleMouseMove);
      heroEl.removeEventListener('touchmove', handleTouchMove);
      heroEl.removeEventListener('mouseleave', handleMouseLeave);
      heroEl.removeEventListener('click', handleClick);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
    };
  }, []);

  return (
    <section id="hero" ref={heroRef} className="hero" aria-label="Eloquence 26 Hero Section">
      {/* High-Performance Canvas for Continuous Doomsday Animation */}
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Atmospheric overlays tuned for Doomsday theme */}
      <div className="hero-smoke-overlay" />
      <div className="hero-cyber-grid" />
      <div className="hero-ambient-glow" />
      <div className="hero-content">
        {/* Centered College Crest Badge */}
        <div className="hero-college-crest-container">
          <div className="hero-college-crest-card">
            <img src={cahcetLogo} alt="CAHCET College Logo" className="hero-college-crest-img" />
          </div>
        </div>

        {/* College & Department Titles */}
        <div className="hero-college-intro">
          <h2 className="hero-college-name">C. ABDUL HAKEEM COLLEGE OF ENGINEERING AND TECHNOLOGY</h2>
          <p className="hero-department">Department of Computer Science and Engineering</p>
          <div className="hero-presents-flourish">
            <span className="flourish-line" />
            <span className="hero-presents">proudly presents</span>
            <span className="flourish-line" />
          </div>
        </div>

        {/* ELOQUENCE Logo Aligned in Center of Orbital Rings */}
        <div className="hero-logo-wrapper">
          <h1 className="hero-logo-title">
            <img
              src={logoImg}
              alt="ELOQUENCE 26"
              className="hero-logo-img"
            />
          </h1>
        </div>

        {/* Tagline & Motto matching theme */}
        <p className="hero-motto">THINK &bull; BUILD &bull; BEYOND</p>
        <p className="hero-tagline">9TH NATIONAL LEVEL TECHNICAL SYMPOSIUM</p>

        {/* Unified Countdown Timer - Each unit binds number + label together for flawless responsive alignment */}
        <div
          className="countdown countdown-days"
          aria-label={`Countdown: ${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, ${timeRemaining.seconds} seconds`}
        >
          <div className="countdown-grid">
            <div className="countdown-unit">
              <span className="countdown-num">{timeRemaining.days}</span>
              <span className="countdown-lbl">DAYS</span>
            </div>
            <span className="colon" aria-hidden="true">:</span>
            <div className="countdown-unit">
              <span className="countdown-num">{timeRemaining.hours}</span>
              <span className="countdown-lbl">HOURS</span>
            </div>
            <span className="colon" aria-hidden="true">:</span>
            <div className="countdown-unit">
              <span className="countdown-num">{timeRemaining.minutes}</span>
              <span className="countdown-lbl">MINUTES</span>
            </div>
            <span className="colon" aria-hidden="true">:</span>
            <div className="countdown-unit">
              <span className="countdown-num">{timeRemaining.seconds}</span>
              <span className="countdown-lbl">SECONDS</span>
            </div>
          </div>
        </div>

        {/* Event Date & Day Badge */}
        <div className="hero-date-badge" aria-label="Event Date: Saturday, September 26, 2026">
          <FaCalendarAlt className="hero-date-icon" />
          <span className="hero-date-day">SATURDAY</span>
          <span className="hero-date-dot" aria-hidden="true">&bull;</span>
          <span className="hero-date-text">SEPTEMBER 26, 2026</span>
        </div>

        {/* Campus Venue Chip Link */}
        <a 
          href="#intro" 
          className="hero-venue-chip" 
          title="Campus: C. Abdul Hakeem College of Engineering & Technology — Click to view campus details"
        >
          <FaMapMarkerAlt className="hero-venue-chip-icon" />
          <span>CAHCET Campus &bull; Melvisharam, Ranipet</span>
        </a>

        {/* Dynamic Registration Status Banner: Red Marquee Capsule Pill when CLOSED */}
        {isRegClosed ? (
          <div className="hero-closed-banner-container">
            {/* 1. Red Capsule Marquee Ticker */}
            <div className="hero-closed-marquee-pill" aria-live="polite" title={closedReason}>
              <div className="hero-marquee-track">
                <span className="marquee-text-block">
                  {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp; {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp; {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp; {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp;
                </span>
                <span className="marquee-text-block" aria-hidden="true">
                  {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp; {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp; {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp; {closedReason || 'ONLINE REGISTRATIONS ARE CLOSED'} &nbsp;&bull;&nbsp;&nbsp;
                </span>
              </div>
            </div>

            {/* 2. Down: Bold On-Spot Subtitle Text */}
            <p className="hero-closed-spot-subtitle">
              {onSpotNotice || 'ON SPOT REGISTRATIONS WILL BE OPENED TOMORROW ON 9:00 AM'}
            </p>

            {/* Action Buttons */}
            <div className="hero-buttons hero-buttons-closed">
              <button 
                className="btn btn-primary btn-large hero-explore-btn" 
                onClick={onExplore || onRegister}
              >
                EXPLORE EVENTS &amp; RULES <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal State: Explore / Register Action Button */
          <div className="hero-buttons">
            <button className="btn btn-primary btn-large hero-explore-btn" onClick={onExplore || onRegister}>
              EXPLORE EVENTS <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
