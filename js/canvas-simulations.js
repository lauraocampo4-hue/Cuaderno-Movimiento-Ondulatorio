/* ==========================================================================
   CANVAS SIMULATIONS & PHYSICS ENGINE (ROBUST & RESILIENT)
   Cuaderno Interactivo: Movimiento Ondulatorio
   Autoras: Laura Yicel Ocampo Rodríguez & Danna Yised Arias Martínez
   Universidad Tecnológica de Pereira - Ingeniería Industrial
   ========================================================================== */

window.PhysicsSims = (function() {
  'use strict';

  const resizers = [];

  function triggerResizeAll() {
    resizers.forEach(fn => {
      try { fn(); } catch(e) { console.error(e); }
    });
  }

  // =========================================================================
  // 1. FONDO DE AGUA CON BURBUJAS Y ONDAS TRANSLÚCIDAS
  // =========================================================================
  function initBackgroundWater() {
    const canvas = document.getElementById('water-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    }

    function createParticles() {
      particles = [];
      const count = Math.min(45, Math.floor((width * height) / 25000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 8 + 3,
          speedY: -(Math.random() * 0.4 + 0.15),
          speedX: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.35 + 0.15,
          hue: Math.random() > 0.5 ? 245 : 195 // lila / azul pastel
        });
      }
    }

    resizers.push(resize);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    resize();

    let t = 0;
    function animate() {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Dibujar 2 capas de ondas suaves en el fondo
      ctx.save();
      // Capa 1: Azul pastel suave
      ctx.fillStyle = 'rgba(224, 242, 254, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 30) {
        const y = Math.sin(x * 0.003 + t) * 20 + Math.cos(x * 0.006 + t * 0.8) * 12 + (height - 90);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Capa 2: Lavanda translúcido
      ctx.fillStyle = 'rgba(236, 232, 252, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 30) {
        const y = Math.sin(x * 0.004 - t * 0.9) * 16 + Math.cos(x * 0.002 + t) * 14 + (height - 60);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Dibujar burbujas / esferas de agua translúcidas
      for (let p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        // Interacción suave con el cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.1,
          p.x, p.y, p.radius
        );
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 95%, ${p.opacity + 0.3})`);
        grad.addColorStop(0.7, `hsla(${p.hue}, 70%, 75%, ${p.opacity})`);
        grad.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  // =========================================================================
  // 2. SIMULADOR DE ONDA SINUSOIDAL (MAGNITUDES Y GRÁFICAS DIDÁCTICAS)
  // =========================================================================
  function initWaveGraphSim() {
    const canvas = document.getElementById('wave-graph-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderA = document.getElementById('slider-wave-a');
    const sliderF = document.getElementById('slider-wave-f');
    const sliderL = document.getElementById('slider-wave-l');
    const valA = document.getElementById('val-wave-a');
    const valF = document.getElementById('val-wave-f');
    const valL = document.getElementById('val-wave-l');
    const valV = document.getElementById('val-wave-v');
    const valEq = document.getElementById('val-wave-eq');
    const btnPlay = document.getElementById('btn-wave-play');
    const btnReset = document.getElementById('btn-wave-reset');

    let isPlaying = true;
    let t = 0;

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resizers.push(resize);
    window.addEventListener('resize', resize);
    resize();

    function updateMetrics() {
      const A = parseFloat(sliderA ? sliderA.value : 1.0);
      const f = parseFloat(sliderF ? sliderF.value : 1.2);
      const lambda = parseFloat(sliderL ? sliderL.value : 4.0);
      const v = (lambda * f).toFixed(2);
      const k = ((2 * Math.PI) / lambda).toFixed(2);
      const omega = (2 * Math.PI * f).toFixed(2);

      if (valA) valA.textContent = `${A.toFixed(2)} m`;
      if (valF) valF.textContent = `${f.toFixed(2)} Hz`;
      if (valL) valL.textContent = `${lambda.toFixed(2)} m`;
      if (valV) valV.textContent = `${v} m/s`;
      if (valEq) valEq.textContent = `y(x,t) = ${A.toFixed(2)} · sin(${k}x - ${omega}t)`;
    }

    [sliderA, sliderF, sliderL].forEach(slider => {
      if (slider) slider.addEventListener('input', updateMetrics);
    });

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying ? '<i class="fas fa-pause"></i> Pausa' : '<i class="fas fa-play"></i> Continuar';
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        t = 0;
        if (sliderA) sliderA.value = 1.0;
        if (sliderF) sliderF.value = 1.2;
        if (sliderL) sliderL.value = 4.0;
        updateMetrics();
      });
    }

    updateMetrics();

    function draw() {
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 0;

      if (width <= 0 || height <= 0) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const A_val = parseFloat(sliderA ? sliderA.value : 1.0);
      const f_val = parseFloat(sliderF ? sliderF.value : 1.2);
      const L_val = parseFloat(sliderL ? sliderL.value : 4.0);

      const centerY = height / 2;
      const scaleY = (height * 0.32) / 2.5;
      const scaleX = width / 12;

      const k = (2 * Math.PI) / L_val;
      const omega = 2 * Math.PI * f_val;

      // Cuadrícula milimetrada sutil
      ctx.save();
      ctx.strokeStyle = 'rgba(138, 123, 235, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += scaleX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += scaleY * 0.5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Eje X (Equilibrio)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Eje Y
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(50, height);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('x (m) → Posición', width - 110, centerY - 10);
      ctx.fillText('y (m)', 12, 24);
      ctx.fillText('+A', 16, centerY - A_val * scaleY + 4);
      ctx.fillText('-A', 16, centerY + A_val * scaleY + 4);
      ctx.fillText('0', 36, centerY + 14);

      // Líneas guía de Amplitud
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.5)';
      ctx.beginPath();
      ctx.moveTo(50, centerY - A_val * scaleY);
      ctx.lineTo(width, centerY - A_val * scaleY);
      ctx.moveTo(50, centerY + A_val * scaleY);
      ctx.lineTo(width, centerY + A_val * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Onda Sinusoidal
      ctx.beginPath();
      for (let px = 0; px <= width; px += 2) {
        const x_m = (px - 50) / scaleX;
        const y_m = A_val * Math.sin(k * x_m - omega * t);
        const py = centerY - y_m * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, '#8a7beb');
      waveGrad.addColorStop(0.5, '#38bdf8');
      waveGrad.addColorStop(1, '#6366f1');
      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Relleno de agua suave
      ctx.save();
      ctx.lineTo(width, centerY);
      ctx.lineTo(0, centerY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, centerY - A_val * scaleY, 0, centerY);
      areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
      areaGrad.addColorStop(1, 'rgba(138, 123, 235, 0.02)');
      ctx.fillStyle = areaGrad;
      ctx.fill();
      ctx.restore();

      // Partículas materiales oscilando verticalmente
      const numParticles = 7;
      for (let i = 1; i <= numParticles; i++) {
        const partX_m = i * 1.5;
        const px = 50 + partX_m * scaleX;
        if (px > width) continue;

        const y_m = A_val * Math.sin(k * partX_m - omega * t);
        const py = centerY - y_m * scaleY;
        const vy = -omega * A_val * Math.cos(k * partX_m - omega * t);

        // Guía vertical
        ctx.strokeStyle = 'rgba(138, 123, 235, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, centerY - A_val * scaleY);
        ctx.lineTo(px, centerY + A_val * scaleY);
        ctx.stroke();

        // Partícula
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#db2777';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vector vy
        const arrowLen = vy * 12;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - arrowLen);
        ctx.stroke();
      }

      // Cota de Longitud de Onda
      const crest1_m = (Math.PI / 2 + omega * t) / k;
      const c1_px = 50 + ((crest1_m % 12 + 12) % 12) * scaleX;
      const c2_px = c1_px + L_val * scaleX;

      if (c2_px < width && c1_px > 30) {
        const markerY = centerY - A_val * scaleY - 24;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(c1_px, markerY);
        ctx.lineTo(c2_px, markerY);
        ctx.moveTo(c1_px, markerY - 5);
        ctx.lineTo(c1_px, markerY + 5);
        ctx.moveTo(c2_px, markerY - 5);
        ctx.lineTo(c2_px, markerY + 5);
        ctx.stroke();

        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`λ = ${L_val.toFixed(2)} m`, (c1_px + c2_px) / 2 - 30, markerY - 8);
      }

      // Flecha de propagación v
      ctx.save();
      const vArrowX = width - 130;
      const vArrowY = 40;
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(vArrowX, vArrowY);
      ctx.lineTo(vArrowX + 60, vArrowY);
      ctx.lineTo(vArrowX + 50, vArrowY - 6);
      ctx.moveTo(vArrowX + 60, vArrowY);
      ctx.lineTo(vArrowX + 50, vArrowY + 6);
      ctx.stroke();
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('v (propagación)', vArrowX, vArrowY - 10);
      ctx.restore();

      if (isPlaying) {
        t += 0.02;
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  // =========================================================================
  // 3. SIMULADOR DE INTERFERENCIA (TEMA 15)
  // =========================================================================
  function initInterferenceSim() {
    const canvas = document.getElementById('interference-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderPhase = document.getElementById('slider-interf-phase');
    const valPhase = document.getElementById('val-interf-phase');
    const badgeType = document.getElementById('badge-interf-type');

    let t = 0;

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resizers.push(resize);
    window.addEventListener('resize', resize);
    resize();

    function update() {
      const deg = parseInt(sliderPhase ? sliderPhase.value : 0);
      if (valPhase) valPhase.textContent = `${deg}° (${(deg * Math.PI / 180).toFixed(2)} rad)`;

      if (badgeType) {
        if (deg % 360 === 0) {
          badgeType.textContent = 'Interferencia Constructiva Máxima (A_tot = 2A)';
          badgeType.style.background = '#d1fae5';
          badgeType.style.color = '#065f46';
        } else if (deg % 360 === 180) {
          badgeType.textContent = 'Interferencia Destructiva Total (A_tot = 0)';
          badgeType.style.background = '#fee2e2';
          badgeType.style.color = '#991b1b';
        } else {
          badgeType.textContent = 'Interferencia Intermedia';
          badgeType.style.background = '#ede9fe';
          badgeType.style.color = '#5b21b6';
        }
      }
    }

    if (sliderPhase) sliderPhase.addEventListener('input', update);
    update();

    function draw() {
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 0;

      if (width <= 0 || height <= 0) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const deg = parseInt(sliderPhase ? sliderPhase.value : 0);
      const deltaPhi = (deg * Math.PI) / 180;
      const centerY = height / 2;
      const A = 40;
      const k = 0.025;
      const omega = 2.5;

      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Onda 1: Azul celeste
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        const y1 = A * Math.sin(k * x - omega * t);
        if (x === 0) ctx.moveTo(x, centerY - y1);
        else ctx.lineTo(x, centerY - y1);
      }
      ctx.stroke();

      // Onda 2: Lila / Rosa
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        const y2 = A * Math.sin(k * x - omega * t + deltaPhi);
        if (x === 0) ctx.moveTo(x, centerY - y2);
        else ctx.lineTo(x, centerY - y2);
      }
      ctx.stroke();

      // Resultante: Púrpura grueso
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        const y1 = A * Math.sin(k * x - omega * t);
        const y2 = A * Math.sin(k * x - omega * t + deltaPhi);
        const yTot = y1 + y2;
        if (x === 0) ctx.moveTo(x, centerY - yTot);
        else ctx.lineTo(x, centerY - yTot);
      }
      ctx.stroke();

      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.fillText('— Onda 1 (y₁)', 20, 25);
      ctx.fillStyle = '#db2777';
      ctx.fillText('— Onda 2 (y₂)', 130, 25);
      ctx.fillStyle = '#4338ca';
      ctx.fillText('— Superposición y = y₁ + y₂', 240, 25);

      t += 0.02;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // =========================================================================
  // 4. SIMULADOR DE DIFRACCIÓN (TEMA 16)
  // =========================================================================
  function initDiffractionSim() {
    const canvas = document.getElementById('diffraction-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderAperture = document.getElementById('slider-diff-aperture');
    const valAperture = document.getElementById('val-diff-aperture');

    let t = 0;

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resizers.push(resize);
    window.addEventListener('resize', resize);
    resize();

    function update() {
      if (valAperture && sliderAperture) {
        valAperture.textContent = `${sliderAperture.value} mm`;
      }
    }
    if (sliderAperture) sliderAperture.addEventListener('input', update);
    update();

    function draw() {
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 0;

      if (width <= 0 || height <= 0) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const slitWidth = parseFloat(sliderAperture ? sliderAperture.value : 25);
      const barrierX = width * 0.38;
      const centerY = height / 2;
      const slitTop = centerY - slitWidth / 2;
      const slitBottom = centerY + slitWidth / 2;
      const wavelength = 26;

      // Frentes planos
      const numPlanes = 8;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < numPlanes; i++) {
        const xPos = ((i * wavelength + t * 40) % barrierX);
        const alpha = Math.min(1, xPos / 50);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, height);
        ctx.stroke();
      }

      // Frentes difractados
      const maxR = width - barrierX;
      for (let r = (t * 40) % wavelength; r < maxR; r += wavelength) {
        if (r <= 0) continue;
        const alpha = Math.max(0, 1 - r / maxR);
        ctx.strokeStyle = `rgba(138, 123, 235, ${alpha * 0.85})`;
        ctx.beginPath();

        if (slitWidth < 35) {
          ctx.arc(barrierX, centerY, r, -Math.PI / 2.2, Math.PI / 2.2);
        } else {
          ctx.moveTo(barrierX + r, slitTop);
          ctx.lineTo(barrierX + r, slitBottom);
          ctx.arc(barrierX, slitTop, r, -Math.PI / 2.2, 0);
          ctx.arc(barrierX, slitBottom, r, 0, Math.PI / 2.2);
        }
        ctx.stroke();
      }

      // Barrera física
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barrierX - 5, 0, 10, slitTop);
      ctx.fillRect(barrierX - 5, slitBottom, 10, height - slitBottom);

      // Cota
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(barrierX - 16, slitTop);
      ctx.lineTo(barrierX - 16, slitBottom);
      ctx.stroke();
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`a = ${slitWidth} mm`, barrierX - 65, centerY + 4);

      t += 0.02;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // =========================================================================
  // 5. SIMULADOR DE REFLEXIÓN (TEMA 17)
  // =========================================================================
  function initReflectionSim() {
    const canvas = document.getElementById('reflection-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const btnFixed = document.getElementById('btn-refl-fixed');
    const btnFree = document.getElementById('btn-refl-free');
    const btnPulse = document.getElementById('btn-refl-pulse');

    let isFixedEnd = true;
    let pulsePos = 50;
    let pulseDirection = 1;
    let pulsePhase = 1;

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resizers.push(resize);
    window.addEventListener('resize', resize);
    resize();

    if (btnFixed && btnFree) {
      btnFixed.addEventListener('click', () => {
        isFixedEnd = true;
        btnFixed.classList.add('active');
        btnFree.classList.remove('active');
      });
      btnFree.addEventListener('click', () => {
        isFixedEnd = false;
        btnFree.classList.add('active');
        btnFixed.classList.remove('active');
      });
    }

    if (btnPulse) {
      btnPulse.addEventListener('click', () => {
        pulsePos = 50;
        pulseDirection = 1;
        pulsePhase = 1;
      });
    }

    function draw() {
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 0;

      if (width <= 0 || height <= 0) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      const endX = width - 40;

      pulsePos += pulseDirection * 3;
      if (pulseDirection === 1 && pulsePos >= endX - 10) {
        pulseDirection = -1;
        pulsePhase = isFixedEnd ? -1 : 1;
      }
      if (pulseDirection === -1 && pulsePos <= 50) {
        pulseDirection = 1;
        pulsePhase = 1;
      }

      // Cuerda
      ctx.strokeStyle = '#6353ca';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let x = 40; x <= endX; x += 2) {
        const dist = x - pulsePos;
        const pulseY = 45 * pulsePhase * Math.exp(-(dist * dist) / (2 * 18 * 18));
        const py = centerY - pulseY;

        if (x === 40) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();

      // Soporte
      ctx.save();
      if (isFixedEnd) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(endX, centerY - 60, 14, 120);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        for (let y = centerY - 55; y <= centerY + 55; y += 12) {
          ctx.beginPath();
          ctx.moveTo(endX + 14, y);
          ctx.lineTo(endX + 24, y + 8);
          ctx.stroke();
        }
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Extremo Fijo (Inversión 180°)', endX - 170, centerY - 70);
      } else {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(endX, centerY - 60);
        ctx.lineTo(endX, centerY + 60);
        ctx.stroke();

        const dist = endX - pulsePos;
        const ringY = centerY - 45 * pulsePhase * Math.exp(-(dist * dist) / (2 * 18 * 18));
        ctx.beginPath();
        ctx.arc(endX, ringY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Extremo Libre (En fase 0°)', endX - 160, centerY - 70);
      }
      ctx.restore();

      requestAnimationFrame(draw);
    }
    draw();
  }

  // =========================================================================
  // 6. SIMULADOR DE RESONANCIA (TEMA 19)
  // =========================================================================
  function initResonanceSim() {
    const canvas = document.getElementById('resonance-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderFreq = document.getElementById('slider-res-f');
    const valFreq = document.getElementById('val-res-f');
    const badgeStatus = document.getElementById('badge-res-status');

    let t = 0;
    const f0 = 2.0;
    const gamma = 0.25;

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resizers.push(resize);
    window.addEventListener('resize', resize);
    resize();

    function update() {
      const f = parseFloat(sliderFreq ? sliderFreq.value : 2.0);
      if (valFreq) valFreq.textContent = `${f.toFixed(2)} Hz`;

      if (badgeStatus) {
        const diff = Math.abs(f - f0);
        if (diff < 0.1) {
          badgeStatus.textContent = '¡RESONANCIA! Amplitud Máxima (f_ext ≈ f_0)';
          badgeStatus.style.background = '#fef3c7';
          badgeStatus.style.color = '#b45309';
        } else if (diff < 0.4) {
          badgeStatus.textContent = 'Zona Próxima a Resonancia';
          badgeStatus.style.background = '#d1fae5';
          badgeStatus.style.color = '#065f46';
        } else {
          badgeStatus.textContent = 'Fuera de Resonancia (Amplitud Baja)';
          badgeStatus.style.background = '#f1f5f9';
          badgeStatus.style.color = '#64748b';
        }
      }
    }
    if (sliderFreq) sliderFreq.addEventListener('input', update);
    update();

    function draw() {
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 0;

      if (width <= 0 || height <= 0) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const f_ext = parseFloat(sliderFreq ? sliderFreq.value : 2.0);
      const omega_ext = 2 * Math.PI * f_ext;
      const omega_0 = 2 * Math.PI * f0;

      const denom = Math.sqrt(Math.pow(omega_0 * omega_0 - omega_ext * omega_ext, 2) + Math.pow(gamma * omega_ext * 20, 2));
      const A_forced = (3500 / denom);

      // Resorte y Masa
      const simX = 120;
      const centerY = height / 2;
      const massY = centerY + Math.min(height * 0.4, A_forced) * Math.sin(omega_ext * t);

      ctx.fillStyle = '#334155';
      ctx.fillRect(simX - 45, 20, 90, 8);

      ctx.strokeStyle = '#8a7beb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(simX, 28);
      const coils = 14;
      const coilH = (massY - 50) / coils;
      for (let i = 0; i < coils; i++) {
        const xOffset = (i % 2 === 0 ? 1 : -1) * 14;
        ctx.lineTo(simX + xOffset, 28 + (i + 0.5) * coilH);
      }
      ctx.lineTo(simX, massY - 20);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(simX - 25, massY - 20, 50, 40);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(simX - 25, massY - 20, 50, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('m', simX - 6, massY + 4);

      // Curva Lorentziana
      const graphX = 240;
      const graphY = height - 40;
      const graphW = width - graphX - 40;
      const graphH = height - 80;

      if (graphW > 50) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(graphX, graphY);
        ctx.lineTo(graphX + graphW, graphY);
        ctx.moveTo(graphX, graphY);
        ctx.lineTo(graphX, graphY - graphH);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('f_ext (Hz)', graphX + graphW - 50, graphY + 25);
        ctx.fillText('Amplitud A', graphX - 10, graphY - graphH - 8);

        ctx.strokeStyle = '#8a7beb';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let px = 0; px <= graphW; px += 2) {
          const f_curve = (px / graphW) * 4.0;
          const w_c = 2 * Math.PI * f_curve;
          const d_c = Math.sqrt(Math.pow(omega_0 * omega_0 - w_c * w_c, 2) + Math.pow(gamma * w_c * 20, 2));
          const amp = (3500 / d_c);
          const py = graphY - (amp / 85) * graphH;
          if (px === 0) ctx.moveTo(graphX + px, py);
          else ctx.lineTo(graphX + px, py);
        }
        ctx.stroke();

        const f0_px = graphX + (f0 / 4.0) * graphW;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(f0_px, graphY);
        ctx.lineTo(f0_px, graphY - graphH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('f₀ = 2.0 Hz', f0_px - 26, graphY + 16);

        const current_px = graphX + (f_ext / 4.0) * graphW;
        const current_py = graphY - (A_forced / 85) * graphH;
        ctx.beginPath();
        ctx.arc(current_px, current_py, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      t += 0.02;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // =========================================================================
  // 7. SUITE DE SIMULACIONES: MODOS NORMALES EN CUERDA (TEMA 20)
  // =========================================================================
  function initStandingWavesSuite() {
    const canvas = document.getElementById('suite-standing-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const btnModes = document.querySelectorAll('[data-harmonic-mode]');
    const valModeTitle = document.getElementById('val-mode-title');
    const valModeFreq = document.getElementById('val-mode-freq');

    let currentN = 1;
    let t = 0;

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resizers.push(resize);
    window.addEventListener('resize', resize);
    resize();

    btnModes.forEach(btn => {
      btn.addEventListener('click', () => {
        btnModes.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentN = parseInt(btn.dataset.harmonicMode);
        if (valModeTitle) valModeTitle.innerHTML = `<i class="fas fa-guitar"></i> Modo Normal n = ${currentN} (${currentN === 1 ? 'Fundamental' : currentN + 'º Armónico'})`;
        if (valModeFreq) valModeFreq.textContent = `f_${currentN} = ${currentN} · f₁ = ${(currentN * 110).toFixed(0)} Hz`;
      });
    });

    function draw() {
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : 0;

      if (width <= 0 || height <= 0) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      const L = width - 80;
      const startX = 40;
      const A = 55;
      const omega = 3 * currentN;

      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(startX + L, centerY);
      ctx.stroke();

      // Envolventes
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(138, 123, 235, 0.35)';
      ctx.beginPath();
      for (let x = 0; x <= L; x += 2) {
        const env = A * Math.sin((currentN * Math.PI * x) / L);
        if (x === 0) ctx.moveTo(startX + x, centerY - env);
        else ctx.lineTo(startX + x, centerY - env);
      }
      for (let x = L; x >= 0; x -= 2) {
        const env = -A * Math.sin((currentN * Math.PI * x) / L);
        ctx.lineTo(startX + x, centerY - env);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Cuerda
      ctx.strokeStyle = '#8a7beb';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let x = 0; x <= L; x += 2) {
        const y = A * Math.sin((currentN * Math.PI * x) / L) * Math.cos(omega * t);
        if (x === 0) ctx.moveTo(startX + x, centerY - y);
        else ctx.lineTo(startX + x, centerY - y);
      }
      ctx.stroke();

      // Nodos
      for (let i = 0; i <= currentN; i++) {
        const nodeX = startX + (i * L) / currentN;
        ctx.beginPath();
        ctx.arc(nodeX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#991b1b';
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('N', nodeX - 4, centerY + 18);
      }

      // Antinodos
      for (let i = 0; i < currentN; i++) {
        const antiX = startX + ((i + 0.5) * L) / currentN;
        ctx.beginPath();
        ctx.arc(antiX, centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#059669';
        ctx.fill();
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('A', antiX - 4, centerY - 14);
      }

      t += 0.02;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // =========================================================================
  // 8. SIMULACIÓN ESPECIAL: ONDA VIAJERA y(x,t) = 4*sin[2*pi/5*(x - 3t)]
  // Con regla milimetrada en centímetros, indicador λ=5cm de cresta a cresta,
  // vector velocidad v=3cm/s y partículas oscilantes del medio.
  // =========================================================================
  function initSpecialTravelingWaveSim() {
    const canvas = document.getElementById('special-wave-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Elementos de la interfaz
    const btnPlay = document.getElementById('btn-spec-play');
    const btnReset = document.getElementById('btn-spec-reset');
    const sliderT = document.getElementById('slider-spec-t');
    const sliderA = document.getElementById('slider-spec-a');
    const sliderLambda = document.getElementById('slider-spec-lambda');
    const sliderV = document.getElementById('slider-spec-v');

    const valT = document.getElementById('val-spec-t');
    const valA = document.getElementById('val-spec-a');
    const valLambda = document.getElementById('val-spec-lambda');
    const valV = document.getElementById('val-spec-v');
    const valF = document.getElementById('val-spec-f');
    const valPeriod = document.getElementById('val-spec-period');
    const valK = document.getElementById('val-spec-k');
    const valOmega = document.getElementById('val-spec-omega');
    const valEq = document.getElementById('val-spec-eq');

    let isPlaying = true;
    let t = 0; // tiempo en segundos
    let lastTime = performance.now();

    // Parámetros físicos (por defecto según modelo exacto del usuario)
    let A = 4.0;      // Amplitud en cm
    let lambda = 5.0; // Longitud de onda en cm
    let v = 3.0;      // Velocidad en cm/s

    function updateUIValues() {
      if (valT) valT.textContent = `${t.toFixed(2)} s`;
      if (sliderT && isPlaying) sliderT.value = t.toFixed(2);
      if (valA) valA.textContent = `${A.toFixed(1)} cm`;
      if (valLambda) valLambda.textContent = `${lambda.toFixed(1)} cm`;
      if (valV) valV.textContent = `${v.toFixed(1)} cm/s`;

      const f = v / lambda;
      const T = 1 / f;
      const k = (2 * Math.PI) / lambda;
      const omega = 2 * Math.PI * f;

      if (valF) valF.textContent = `${f.toFixed(2)} Hz`;
      if (valPeriod) valPeriod.textContent = `${T.toFixed(2)} s`;
      if (valK) valK.textContent = `${k.toFixed(2)} rad/cm`;
      if (valOmega) valOmega.textContent = `${omega.toFixed(2)} rad/s`;

      if (valEq) {
        valEq.textContent = `y(x,t) = ${A.toFixed(1)} · sin[ (2π / ${lambda.toFixed(1)}) · (x - ${v.toFixed(1)}t) ]`;
      }
    }

    if (sliderT) {
      sliderT.addEventListener('input', () => {
        t = parseFloat(sliderT.value);
        if (valT) valT.textContent = `${t.toFixed(2)} s`;
      });
    }

    if (sliderA) {
      sliderA.addEventListener('input', () => {
        A = parseFloat(sliderA.value);
        updateUIValues();
      });
    }

    if (sliderLambda) {
      sliderLambda.addEventListener('input', () => {
        lambda = parseFloat(sliderLambda.value);
        updateUIValues();
      });
    }

    if (sliderV) {
      sliderV.addEventListener('input', () => {
        v = parseFloat(sliderV.value);
        updateUIValues();
      });
    }

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        isPlaying = !isPlaying;
        btnPlay.innerHTML = isPlaying
          ? '<i class="fas fa-pause"></i> <span>Pausar</span>'
          : '<i class="fas fa-play"></i> <span>Reanudar</span>';
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        t = 0;
        A = 4.0;
        lambda = 5.0;
        v = 3.0;
        if (sliderA) sliderA.value = 4.0;
        if (sliderLambda) sliderLambda.value = 5.0;
        if (sliderV) sliderV.value = 3.0;
        if (sliderT) sliderT.value = 0;
        updateUIValues();
      });
    }

    function resize() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resizers.push(resize);
    window.addEventListener('resize', resize);
    resize();

    // Rango físico del canvas: X de 0 a 16 cm, Y de -5 a +5 cm
    const xMaxCm = 15.0;
    const yMaxCm = 5.5;

    function toCanvasX(xCm, width, marginL, plotW) {
      return marginL + (xCm / xMaxCm) * plotW;
    }

    function toCanvasY(yCm, height, marginT, plotH) {
      // yCm = +5 arriba, -5 abajo
      return marginT + plotH / 2 - (yCm / yMaxCm) * (plotH / 2);
    }

    function draw(now) {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        t += delta * 1.0;
        if (t > 10.0) t = 0; // bucle suave de 10s
        updateUIValues();
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const marginL = 42;
      const marginR = 24;
      const marginT = 32;
      const marginB = 36;
      const plotW = width - marginL - marginR;
      const plotH = height - marginT - marginB;

      if (plotW <= 0 || plotH <= 0) {
        requestAnimationFrame(draw);
        return;
      }

      const centerY = marginT + plotH / 2;

      // 1. Rejilla milimétrica y coordenadas
      ctx.save();
      ctx.strokeStyle = 'rgba(138, 123, 235, 0.12)';
      ctx.lineWidth = 1;

      // Líneas horizontales de referencia (-4, -2, 0, +2, +4 cm)
      [-4, -2, 0, 2, 4].forEach(yVal => {
        const yPx = toCanvasY(yVal, height, marginT, plotH);
        ctx.beginPath();
        ctx.moveTo(marginL, yPx);
        ctx.lineTo(marginL + plotW, yPx);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px "Fira Code", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${yVal > 0 ? '+' : ''}${yVal}`, marginL - 6, yPx + 3);
      });

      // Eje vertical con etiqueta de unidad
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('y [cm]', marginL - 10, marginT - 10);

      // Línea de referencia central (y = 0)
      ctx.strokeStyle = 'rgba(138, 123, 235, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(marginL, centerY);
      ctx.lineTo(marginL + plotW, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Regla graduada en el eje X (centímetros)
      const rulerY = marginT + plotH + 4;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(marginL, rulerY);
      ctx.lineTo(marginL + plotW, rulerY);
      ctx.stroke();

      for (let xCm = 0; xCm <= xMaxCm; xCm += 0.5) {
        const xPx = toCanvasX(xCm, width, marginL, plotW);
        const isMajor = (xCm % 1 === 0);
        const tickH = isMajor ? 9 : 5;

        ctx.strokeStyle = isMajor ? '#334155' : '#94a3b8';
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(xPx, rulerY);
        ctx.lineTo(xPx, rulerY + tickH);
        ctx.stroke();

        if (isMajor) {
          ctx.fillStyle = '#334155';
          ctx.font = '10px "Fira Code", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(xCm.toString(), xPx, rulerY + tickH + 12);
        }
      }

      // Etiqueta del eje X
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('x [cm] (Regla graduada)', marginL + plotW - 120, rulerY + 24);
      ctx.restore();

      // 3. Área translúcida bajo la onda
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(marginL, centerY);
      for (let px = 0; px <= plotW; px += 2) {
        const xCm = (px / plotW) * xMaxCm;
        const yCm = A * Math.sin(((2 * Math.PI) / lambda) * (xCm - v * t));
        const yPx = toCanvasY(yCm, height, marginT, plotH);
        ctx.lineTo(marginL + px, yPx);
      }
      ctx.lineTo(marginL + plotW, centerY);
      ctx.closePath();

      const gradFill = ctx.createLinearGradient(0, centerY - 60, 0, centerY + 60);
      gradFill.addColorStop(0, 'rgba(138, 123, 235, 0.22)');
      gradFill.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      gradFill.addColorStop(1, 'rgba(138, 123, 235, 0.02)');
      ctx.fillStyle = gradFill;
      ctx.fill();
      ctx.restore();

      // 4. Trazo brillante de la onda
      ctx.save();
      ctx.beginPath();
      for (let px = 0; px <= plotW; px += 2) {
        const xCm = (px / plotW) * xMaxCm;
        const yCm = A * Math.sin(((2 * Math.PI) / lambda) * (xCm - v * t));
        const yPx = toCanvasY(yCm, height, marginT, plotH);
        if (px === 0) ctx.moveTo(marginL + px, yPx);
        else ctx.lineTo(marginL + px, yPx);
      }
      const waveGrad = ctx.createLinearGradient(marginL, 0, marginL + plotW, 0);
      waveGrad.addColorStop(0, '#8a7beb');
      waveGrad.addColorStop(0.5, '#38bdf8');
      waveGrad.addColorStop(1, '#a855f7');
      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(138, 123, 235, 0.45)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      // 5. Partículas del medio (oscilando en M.A.S. puramente vertical)
      const particlePositions = [2.0, 5.0, 8.0, 11.0, 13.5];
      particlePositions.forEach(pXCm => {
        if (pXCm <= xMaxCm) {
          const pYCm = A * Math.sin(((2 * Math.PI) / lambda) * (pXCm - v * t));
          const pXPx = toCanvasX(pXCm, width, marginL, plotW);
          const pYPx = toCanvasY(pYCm, height, marginT, plotH);

          // Pista vertical punteada
          ctx.save();
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.moveTo(pXPx, toCanvasY(+A, height, marginT, plotH));
          ctx.lineTo(pXPx, toCanvasY(-A, height, marginT, plotH));
          ctx.stroke();

          // Partícula tipo perla
          ctx.beginPath();
          ctx.arc(pXPx, pYPx, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ec4899';
          ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pXPx - 1.5, pYPx - 1.5, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 6. INDICADOR PROMINENTE DE LONGITUD DE ONDA (λ = 5 cm)
      // Buscamos dos crestas consecutivas visibles: (2pi/lambda)*(x - v*t) = pi/2 + 2*pi*n
      // => x_crest = v*t + lambda*(0.25 + n)
      const phaseOffset = (v * t) % lambda;
      let crest1Cm = phaseOffset + 0.25 * lambda;
      while (crest1Cm < 0.5) crest1Cm += lambda;
      while (crest1Cm > lambda + 0.5) crest1Cm -= lambda;

      let crest2Cm = crest1Cm + lambda;

      if (crest2Cm <= xMaxCm + 0.5) {
        const c1Px = toCanvasX(crest1Cm, width, marginL, plotW);
        const c2Px = toCanvasX(crest2Cm, width, marginL, plotW);
        const crestYPx = toCanvasY(A, height, marginT, plotH);
        const dimYPx = Math.max(marginT - 14, 16);

        ctx.save();
        // Líneas guías verticales punteadas desde las crestas
        ctx.strokeStyle = '#8a7beb';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(c1Px, crestYPx);
        ctx.lineTo(c1Px, dimYPx + 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(c2Px, crestYPx);
        ctx.lineTo(c2Px, dimYPx + 4);
        ctx.stroke();

        // Línea de dimensión con flechas dobles <--->
        ctx.setLineDash([]);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c1Px + 4, dimYPx);
        ctx.lineTo(c2Px - 4, dimYPx);
        ctx.stroke();

        // Flecha izquierda
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.moveTo(c1Px, dimYPx);
        ctx.lineTo(c1Px + 6, dimYPx - 3.5);
        ctx.lineTo(c1Px + 6, dimYPx + 3.5);
        ctx.closePath();
        ctx.fill();

        // Flecha derecha
        ctx.beginPath();
        ctx.moveTo(c2Px, dimYPx);
        ctx.lineTo(c2Px - 6, dimYPx - 3.5);
        ctx.lineTo(c2Px - 6, dimYPx + 3.5);
        ctx.closePath();
        ctx.fill();

        // Cartela / Badge con la longitud de onda λ
        const badgeX = (c1Px + c2Px) / 2;
        const badgeText = `⟷ λ = ${lambda.toFixed(1)} cm`;
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        const txtMetrics = ctx.measureText(badgeText);
        const padX = 8;
        const padY = 4;
        const bW = txtMetrics.width + padX * 2;
        const bH = 18;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(99, 102, 241, 0.35)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(badgeX - bW / 2, dimYPx - bH / 2, bW, bH, 6);
        ctx.fill();

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#4338ca';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, badgeX, dimYPx);

        // Perlas en las crestas
        [c1Px, c2Px].forEach(xP => {
          ctx.beginPath();
          ctx.arc(xP, crestYPx, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#6366f1';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        ctx.restore();
      }

      // 7. Vector velocidad de propagación
      ctx.save();
      const vX = marginL + 20;
      const vY = centerY - 50;
      ctx.fillStyle = '#0ea5e9';
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vX, vY);
      ctx.lineTo(vX + 38, vY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(vX + 44, vY);
      ctx.lineTo(vX + 36, vY - 4);
      ctx.lineTo(vX + 36, vY + 4);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`v = ${v.toFixed(1)} cm/s →`, vX + 48, vY + 3.5);
      ctx.restore();

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
    updateUIValues();
  }

  // =========================================================================
  // INICIALIZADOR GLOBAL
  // =========================================================================
  function initAll() {
    initBackgroundWater();
    initWaveGraphSim();
    initInterferenceSim();
    initDiffractionSim();
    initReflectionSim();
    initResonanceSim();
    initStandingWavesSuite();
    initSpecialTravelingWaveSim();
  }

  return {
    initAll,
    triggerResizeAll
  };
})();
