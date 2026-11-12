/* ==========================================================================
   V3-EXAMPLES.JS - LÓGICA INTERACTIVA AISLADA PARA LOS 18 EJEMPLOS REALES
   Cuaderno Digital Universitario de Física III: Movimiento Ondulatorio
   Universidad Tecnológica de Pereira (UTP)
   ========================================================================== */

(function() {
  'use strict';

  // Helper para asignar comprobaciones de preguntas de opción múltiple
  function setupQuiz(checkBtnId, radioName, correctValue, feedbackId, successMsg, errorMsg) {
    const btn = document.getElementById(checkBtnId);
    if (!btn) return;
    btn.addEventListener('click', function() {
      const selected = document.querySelector(`input[name="${radioName}"]:checked`);
      const fb = document.getElementById(feedbackId);
      if (!fb) return;
      if (!selected) {
        fb.className = 'v3-feedback hint';
        fb.innerHTML = '<i class="fas fa-hand-point-right"></i> Por favor, selecciona una opción antes de comprobar.';
        fb.style.display = 'block';
        return;
      }
      if (selected.value === correctValue) {
        fb.className = 'v3-feedback success';
        fb.innerHTML = `<i class="fas fa-circle-check"></i> <strong>¡Correcto!</strong> ${successMsg}`;
        fb.style.display = 'block';
      } else {
        fb.className = 'v3-feedback incorrect';
        fb.innerHTML = `<i class="fas fa-circle-xmark"></i> <strong>Inténtalo de nuevo.</strong> ${errorMsg}`;
        fb.style.display = 'block';
      }
    });
  }

  // =========================================================================
  // EJEMPLO 1: ¿QUÉ ES UNA ONDA? (Estanque de agua y corcho oscilante)
  // =========================================================================
  function initExample1() {
    const canvas = document.getElementById('v3-canvas-pond');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let waves = [];
    let isPaused = false;
    let amplitude = 1.0;
    let time = 0;

    function resetPond() {
      waves = [];
      for (let i = 0; i < 4; i++) {
        waves.push({ r: i * 28, maxR: 160, alpha: 1.0 });
      }
    }
    resetPond();

    const sliderAmp = document.getElementById('v3-pond-amp');
    const valAmp = document.getElementById('v3-pond-amp-val');
    if (sliderAmp) {
      sliderAmp.addEventListener('input', (e) => {
        amplitude = parseFloat(e.target.value);
        if (valAmp) valAmp.textContent = amplitude.toFixed(1) + 'x';
      });
    }

    const btnDrop = document.getElementById('v3-pond-drop');
    if (btnDrop) {
      btnDrop.addEventListener('click', () => {
        resetPond();
      });
    }

    const btnPause = document.getElementById('v3-pond-pause');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        btnPause.innerHTML = isPaused ? '<i class="fas fa-play"></i> Reanudar' : '<i class="fas fa-pause"></i> Pausar';
      });
    }

    // Corcho en posición fija (cx + 55, cy)
    function draw() {
      if (!isPaused) time += 0.04;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.35;
      const cy = height * 0.5;

      // Ondas concéntricas expandiéndose
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        if (!isPaused) {
          w.r += 0.8;
          w.alpha = Math.max(0, 1 - (w.r / w.maxR));
          if (w.r > w.maxR) {
            w.r = 0;
            w.alpha = 1.0;
          }
        }
        ctx.beginPath();
        ctx.arc(cx, cy, w.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${w.alpha * 0.7 * amplitude})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Punto de caída de la piedra
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px sans-serif';
      ctx.fillText('Impacto piedra', cx - 28, cy - 8);

      // Corcho flotante en posición fija (x0, y0)
      const corkX = cx + 65;
      // El corcho oscila verticalmente según la perturbación
      const corkDist = 65;
      const wavePhase = (corkDist * 0.15) - (time * 3);
      const corkOffsetY = Math.sin(wavePhase) * (8 * amplitude);

      // Línea de referencia de equilibrio
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(corkX - 15, cy);
      ctx.lineTo(corkX + 15, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dibujar corcho
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(corkX, cy + corkOffsetY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mástil y banderita
      ctx.beginPath();
      ctx.moveTo(corkX, cy + corkOffsetY - 6);
      ctx.lineTo(corkX, cy + corkOffsetY - 16);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.moveTo(corkX, cy + corkOffsetY - 16);
      ctx.lineTo(corkX + 8, cy + corkOffsetY - 12);
      ctx.lineTo(corkX, cy + corkOffsetY - 8);
      ctx.fill();

      // Flecha vertical de oscilación local
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(corkX + 16, cy - 10);
      ctx.lineTo(corkX + 16, cy + 10);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px sans-serif';
      ctx.fillText('Oscilación local (Δx=0)', corkX - 30, cy + 24);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 140;
      }
    });

    setupQuiz(
      'v3-pond-check',
      'v3-pond-opt',
      'b',
      'v3-pond-feedback',
      'Exacto. La onda transporta energía mecánica de oscilación y cantidad de movimiento. El agua y el corcho únicamente oscilan arriba y abajo sin trasladarse horizontalmente (\(\\Delta M_{\\text{neto}} = 0\)).',
      'Observa el corcho en la animación: permanece en el mismo punto \(x\) oscilando en torno a su equilibrio.'
    );
  }

  // =========================================================================
  // EJEMPLO 2: CINEMÁTICA ONDULATORIA (Ola en la piscina de 50 m)
  // =========================================================================
  function initExample2() {
    const canvas = document.getElementById('v3-canvas-pool');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let speed = 2.5;
    let time = 8.0;

    const sliderV = document.getElementById('v3-pool-v');
    const sliderT = document.getElementById('v3-pool-t');
    const valV = document.getElementById('v3-pool-v-val');
    const valT = document.getElementById('v3-pool-t-val');
    const outD = document.getElementById('v3-pool-dist-out');
    const outTotalT = document.getElementById('v3-pool-totalt-out');

    function update() {
      if (sliderV) speed = parseFloat(sliderV.value);
      if (sliderT) time = parseFloat(sliderT.value);

      if (valV) valV.textContent = speed.toFixed(1) + ' m/s';
      if (valT) valT.textContent = time.toFixed(1) + ' s';

      const dist = Math.min(50, speed * time);
      if (outD) outD.textContent = dist.toFixed(1) + ' m';
      if (outTotalT) outTotalT.textContent = (50 / speed).toFixed(1) + ' s';

      draw();
    }

    function draw() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Representación de piscina olímpica de 50m
      const padX = 25;
      const poolW = width - padX * 2;
      const poolY = 35;
      const poolH = 55;

      // Agua de la piscina
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(padX, poolY, poolW, poolH);

      // Líneas de carriles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let y = poolY + 18; y < poolY + poolH; y += 18) {
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + poolW, y);
        ctx.stroke();
      }

      // Regla de distancia en metros (0 a 50m)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      for (let m = 0; m <= 50; m += 10) {
        const xPos = padX + (m / 50) * poolW;
        ctx.beginPath();
        ctx.moveTo(xPos, poolY + poolH);
        ctx.lineTo(xPos, poolY + poolH + 5);
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
        ctx.fillText(m + 'm', xPos - 8, poolY + poolH + 16);
      }

      // Posición de la ola
      const currentDist = Math.min(50, speed * time);
      const waveX = padX + (currentDist / 50) * poolW;

      // Dibujar frente de ola
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fillRect(padX, poolY, waveX - padX, poolH);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(waveX, poolY - 4);
      ctx.lineTo(waveX, poolY + poolH + 4);
      ctx.stroke();

      // Indicador de la ola
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(waveX, poolY - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Cresta: ${currentDist.toFixed(1)} m`, Math.max(padX, waveX - 35), poolY - 18);
    }

    if (sliderV) sliderV.addEventListener('input', update);
    if (sliderT) sliderT.addEventListener('input', update);

    update();

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 140;
        update();
      }
    });

    setupQuiz(
      'v3-pool-check',
      'v3-pool-opt',
      '30',
      'v3-pool-feedback',
      '¡Correcto! Aplicando la cinemática lineal de la onda: \\(d = v \\cdot t = 2.5\\text{ m/s} \\times 12\\text{ s} = 30\\text{ m}\\).',
      'Recuerda que la velocidad del frente de onda es constante: multiplica \\(v = 2.5\\text{ m/s}\\) por \\(t = 12\\text{ s}\\).'
    );
  }

  // =========================================================================
  // EJEMPLO 3: MECÁNICAS VS ELECTROMAGNÉTICAS (Campana de Vacío)
  // =========================================================================
  function initExample3() {
    const canvas = document.getElementById('v3-canvas-vacuum');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let mode = 'sound'; // 'sound' or 'radio'
    let isVacuum = false;
    let animTime = 0;

    const btnSound = document.getElementById('v3-vac-sound-btn');
    const btnRadio = document.getElementById('v3-vac-radio-btn');
    const btnVac = document.getElementById('v3-vac-toggle-btn');
    const statusText = document.getElementById('v3-vac-status-desc');

    function updateUI() {
      if (btnSound && btnRadio) {
        btnSound.className = mode === 'sound' ? 'v3-btn-action active' : 'v3-btn-action';
        btnRadio.className = mode === 'radio' ? 'v3-btn-action active' : 'v3-btn-action';
      }
      if (btnVac) {
        btnVac.className = isVacuum ? 'v3-btn-action active' : 'v3-btn-action';
        btnVac.innerHTML = isVacuum ? '<i class="fas fa-compress-arrows-alt"></i> Aire Restaurado (1 atm)' : '<i class="fas fa-wind"></i> Activar Bomba de Vacío';
      }
      if (statusText) {
        if (mode === 'sound') {
          statusText.innerHTML = isVacuum
            ? '<strong style="color:#ef4444;">Vacío absoluto:</strong> La bocina vibra mecánicamente, pero <strong>NO hay moléculas de aire</strong> que transmitan las compresiones. ¡Silencio total!'
            : '<strong style="color:#10b981;">Con aire (1 atm):</strong> El sonido se propaga como onda de presión mecánica longitudinal a ~343 m/s.';
        } else {
          statusText.innerHTML = isVacuum
            ? '<strong style="color:#10b981;">Vacío absoluto:</strong> Las ondas electromagnéticas <strong>se autopropagan</strong> mediante oscilaciones acopladas de \(\\vec{E}\) y \(\\vec{B}\) a \(c \\approx 300\\,000\\text{ km/s}\).'
            : '<strong style="color:#10b981;">Con aire:</strong> La señal de radio viaja prácticamente a la velocidad de la luz en el aire.';
        }
      }
    }

    if (btnSound) {
      btnSound.addEventListener('click', () => { mode = 'sound'; updateUI(); });
    }
    if (btnRadio) {
      btnRadio.addEventListener('click', () => { mode = 'radio'; updateUI(); });
    }
    if (btnVac) {
      btnVac.addEventListener('click', () => { isVacuum = !isVacuum; updateUI(); });
    }

    function render() {
      animTime += 0.05;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.4;
      const cy = height * 0.52;

      // Dibujar campana de cristal
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 45, Math.PI, 0, false);
      ctx.lineTo(cx + 45, cy + 35);
      ctx.lineTo(cx - 45, cy + 35);
      ctx.closePath();
      ctx.stroke();

      // Base de campana
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 52, cy + 35, 104, 10);

      // Partículas de aire (desaparecen en vacío)
      if (!isVacuum) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        for (let i = 0; i < 20; i++) {
          const px = cx - 35 + ((i * 19 + animTime * 10) % 70);
          const py = cy - 20 + ((i * 23) % 45);
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Fuente emisora dentro de la campana
      if (mode === 'sound') {
        // Bocina
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 15, cy - 6, 12, 14);
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 6);
        ctx.lineTo(cx + 10, cy - 14);
        ctx.lineTo(cx + 10, cy + 22);
        ctx.lineTo(cx - 3, cy + 8);
        ctx.closePath();
        ctx.fillStyle = '#d97706';
        ctx.fill();

        // Ondas de sonido
        if (!isVacuum) {
          for (let r = 8; r < 60; r += 14) {
            const rad = (r + animTime * 12) % 60;
            ctx.strokeStyle = `rgba(245, 158, 11, ${1 - rad/60})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx + 10, cy + 4, rad, -0.6, 0.6);
            ctx.stroke();
          }
        } else {
          // Marca de bloqueo
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx + 20, cy - 8);
          ctx.lineTo(cx + 36, cy + 8);
          ctx.moveTo(cx + 36, cy - 8);
          ctx.lineTo(cx + 20, cy + 8);
          ctx.stroke();
        }
      } else {
        // Antena de Radio
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 18);
        ctx.lineTo(cx, cy - 14);
        ctx.stroke();
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(cx, cy - 14, 4, 0, Math.PI * 2);
        ctx.fill();

        // Ondas electromagnéticas de radio (atraviesan con o sin vacío)
        for (let r = 8; r < 75; r += 16) {
          const rad = (r + animTime * 20) % 75;
          ctx.strokeStyle = `rgba(236, 72, 153, ${1 - rad/75})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(cx, cy - 14, rad, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Etiqueta lateral
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      ctx.fillText(isVacuum ? 'Ambiente: VACÍO TOTAL' : 'Ambiente: AIRE (1 atm)', width * 0.05, 18);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    updateUI();

    setupQuiz(
      'v3-vac-check',
      'v3-vac-opt',
      'radio',
      'v3-vac-feedback',
      '¡Totalmente correcto! La señal de radio es una onda electromagnética y no necesita medio material alguno. El sonido, al ser una onda mecánica elástica, no puede propagarse en el vacío.',
      'Recuerda la definición: las ondas mecánicas necesitan obligatoriamente partículas elásticas que colisionen para propagarse.'
    );
  }

  // =========================================================================
  // EJEMPLO 4: TRANSVERSALES VS LONGITUDINALES (Cuerda vs Parlante)
  // =========================================================================
  function initExample4() {
    const canvas = document.getElementById('v3-canvas-polar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let mode = 'transverse'; // 'transverse' or 'longitudinal'
    let time = 0;

    const btnTrans = document.getElementById('v3-mode-trans-btn');
    const btnLong = document.getElementById('v3-mode-long-btn');
    const descText = document.getElementById('v3-mode-desc');

    function setMode(m) {
      mode = m;
      if (btnTrans && btnLong) {
        btnTrans.className = mode === 'transverse' ? 'v3-btn-action active' : 'v3-btn-action';
        btnLong.className = mode === 'longitudinal' ? 'v3-btn-action active' : 'v3-btn-action';
      }
      if (descText) {
        descText.innerHTML = mode === 'transverse'
          ? '<strong>Cuerda tensada:</strong> Cada partícula sube y baja verticalmente (\(\\vec{\\xi} \\perp \\vec{v}\)) mientras la onda avanza horizontalmente a la derecha.'
          : '<strong>Onda acústica en aire:</strong> Las moléculas oscilan hacia adelante y atrás en la misma línea de propagación (\(\\vec{\\xi} \\parallel \\vec{v}\)), creando compresiones y rarefacciones.';
      }
    }

    if (btnTrans) btnTrans.addEventListener('click', () => setMode('transverse'));
    if (btnLong) btnLong.addEventListener('click', () => setMode('longitudinal'));

    function draw() {
      time += 0.05;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cy = height * 0.5;

      if (mode === 'transverse') {
        // Cuerda vibrante
        ctx.beginPath();
        for (let x = 20; x < width - 20; x += 3) {
          const y = cy + Math.sin(x * 0.04 - time * 2) * 22;
          if (x === 20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Resaltar una partícula en oscilación vertical
        const testX = width * 0.5;
        const testY = cy + Math.sin(testX * 0.04 - time * 2) * 22;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(testX, testY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Flecha de oscilación ξ perpendicular
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(testX, testY - 14);
        ctx.lineTo(testX, testY + 14);
        ctx.stroke();
        ctx.fillText('ξ ⟂ v', testX + 8, testY + 4);

        // Flecha de velocidad v hacia la derecha
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(testX + 20, cy - 35);
        ctx.lineTo(testX + 55, cy - 35);
        ctx.lineTo(testX + 48, cy - 40);
        ctx.moveTo(testX + 55, cy - 35);
        ctx.lineTo(testX + 48, cy - 30);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText('v (avance)', testX + 22, cy - 44);

      } else {
        // Onda longitudinal de compresión
        const numParticles = 40;
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < numParticles; i++) {
          const baseX = 25 + (i / numParticles) * (width - 50);
          const displacement = Math.sin(baseX * 0.04 - time * 2) * 14;
          const actualX = baseX + displacement;

          ctx.beginPath();
          ctx.arc(actualX, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Partícula testigo resaltada
        const iTarget = 20;
        const tBaseX = 25 + (iTarget / numParticles) * (width - 50);
        const tDisp = Math.sin(tBaseX * 0.04 - time * 2) * 14;
        const tActualX = tBaseX + tDisp;

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(tActualX, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Flecha horizontal de oscilación
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tActualX - 16, cy + 18);
        ctx.lineTo(tActualX + 16, cy + 18);
        ctx.stroke();
        ctx.fillText('ξ ∥ v', tActualX - 10, cy + 30);
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    setMode('transverse');

    setupQuiz(
      'v3-geom-check',
      'v3-geom-opt',
      'transverse',
      'v3-geom-feedback',
      '¡Muy bien! Por definición, en una onda transversal el vector de oscilación \\(\\vec{\\xi}\\) forma un ángulo de 90° con la velocidad de propagación \\(\\vec{v}\\).',
      'Revisa la orientación de la flecha roja en la animación: en la cuerda oscila arriba-abajo mientras avanza hacia la derecha.'
    );
  }

  // =========================================================================
  // EJEMPLO 5: PERIODO, FRECUENCIA Y FRECUENCIA ANGULAR (Diapasón 440 Hz)
  // =========================================================================
  function initExample5() {
    const sliderF = document.getElementById('v3-fork-freq');
    const valF = document.getElementById('v3-fork-freq-val');
    const outT = document.getElementById('v3-fork-t-out');
    const outW = document.getElementById('v3-fork-w-out');
    const btn440 = document.getElementById('v3-fork-440');

    function update(f) {
      if (valF) valF.textContent = f + ' Hz';
      const T = 1 / f;
      const omega = 2 * Math.PI * f;

      if (outT) outT.textContent = (T * 1000).toFixed(2) + ' ms';
      if (outW) outW.textContent = omega.toFixed(1) + ' rad/s';
    }

    if (sliderF) {
      sliderF.addEventListener('input', (e) => update(parseInt(e.target.value, 10)));
    }
    if (btn440) {
      btn440.addEventListener('click', () => {
        if (sliderF) sliderF.value = 440;
        update(440);
      });
    }

    update(440);

    setupQuiz(
      'v3-fork-check',
      'v3-fork-opt',
      '2.27',
      'v3-fork-feedback',
      '¡Excelente! \\(T = \\frac{1}{f} = \\frac{1}{440\\text{ s}^{-1}} \\approx 0.002273\\text{ s} = 2.27\\text{ ms}\\). La pulsación angular es \\(\\omega = 2\\pi(440) \\approx 2764.6\\text{ rad/s}\\).',
      'Aplica la fórmula matemática \\(T = 1 / f\\): calcula \\(1 / 440\\) y multiplica por 1000 para expresarlo en milisegundos.'
    );
  }

  // =========================================================================
  // EJEMPLO 6: LONGITUD DE ONDA, NÚMERO DE ONDA Y AMPLITUD (Olas del Mar)
  // =========================================================================
  function initExample6() {
    const canvas = document.getElementById('v3-canvas-ocean');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let amp = 1.5;
    let lambda = 12.0;

    const sliderAmp = document.getElementById('v3-ocean-amp');
    const sliderLambda = document.getElementById('v3-ocean-lambda');
    const valAmp = document.getElementById('v3-ocean-amp-val');
    const valLambda = document.getElementById('v3-ocean-lambda-val');
    const outK = document.getElementById('v3-ocean-k-out');
    const outH = document.getElementById('v3-ocean-h-out');

    function update() {
      if (sliderAmp) amp = parseFloat(sliderAmp.value);
      if (sliderLambda) lambda = parseFloat(sliderLambda.value);

      if (valAmp) valAmp.textContent = amp.toFixed(1) + ' m';
      if (valLambda) valLambda.textContent = lambda.toFixed(0) + ' m';

      const k = (2 * Math.PI) / lambda;
      if (outK) outK.textContent = k.toFixed(2) + ' rad/m';
      if (outH) outH.textContent = (2 * amp).toFixed(1) + ' m';

      draw();
    }

    function draw() {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cy = height * 0.52;
      const pxPerMeter = width / 30; // 30 metros de escala visible
      const ampPx = amp * 12;

      // Línea de calma de agua (y=0)
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(10, cy);
      ctx.lineTo(width - 10, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Perfil del agua
      ctx.beginPath();
      for (let x = 10; x < width - 10; x += 2) {
        const xMeters = (x - 10) / pxPerMeter;
        const y = cy - Math.cos((2 * Math.PI * xMeters) / lambda) * ampPx;
        if (x === 10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Cota de cresta a cresta (λ)
      const c1X = 10;
      const c2X = 10 + lambda * pxPerMeter;
      const crestY = cy - ampPx;

      if (c2X < width - 10) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c1X, crestY - 8);
        ctx.lineTo(c2X, crestY - 8);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = '10px monospace';
        ctx.fillText(`λ = ${lambda.toFixed(0)}m`, (c1X + c2X) / 2 - 20, crestY - 12);
      }

      // Marcador de Cresta y Valle
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(c1X, crestY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '9px sans-serif';
      ctx.fillText('Cresta (+A)', c1X + 6, crestY - 2);

      const troughX = 10 + (lambda / 2) * pxPerMeter;
      const troughY = cy + ampPx;
      if (troughX < width - 10) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(troughX, troughY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('Valle (-A)', troughX + 6, troughY + 10);
      }
    }

    if (sliderAmp) sliderAmp.addEventListener('input', update);
    if (sliderLambda) sliderLambda.addEventListener('input', update);

    update();

    setupQuiz(
      'v3-ocean-check',
      'v3-ocean-opt',
      '10-1.5',
      'v3-ocean-feedback',
      '¡Exacto! \\(\\lambda\\) es la distancia cresta-a-cresta (\(10\\text{ m}\)) y la amplitud \\(A\\) es la elevación desde el reposo (\(1.5\\text{ m}\)). El número de onda resulta \\(k = 2\\pi / 10 \\approx 0.63\\text{ rad/m}\\).',
      'Recuerda: la distancia horizontal entre dos crestas es la longitud de onda \\(\\lambda\\); la altura sobre el nivel de equilibrio es la amplitud \\(A\\).'
    );
  }

  // =========================================================================
  // EJEMPLO 7: VELOCIDAD DE PROPAGACIÓN (Cuerda tensada)
  // =========================================================================
  function initExample7() {
    const sliderT = document.getElementById('v3-string-tension');
    const sliderMu = document.getElementById('v3-string-density');
    const valT = document.getElementById('v3-string-tension-val');
    const valMu = document.getElementById('v3-string-density-val');
    const outV = document.getElementById('v3-string-v-out');

    function update() {
      const Ts = parseFloat(sliderT ? sliderT.value : 100);
      const muG = parseFloat(sliderMu ? sliderMu.value : 4); // g/m
      const muKg = muG / 1000; // kg/m

      if (valT) valT.textContent = Ts.toFixed(0) + ' N';
      if (valMu) valMu.textContent = muG.toFixed(1) + ' g/m';

      const v = Math.sqrt(Ts / muKg);
      if (outV) outV.textContent = v.toFixed(1) + ' m/s';
    }

    if (sliderT) sliderT.addEventListener('input', update);
    if (sliderMu) sliderMu.addEventListener('input', update);
    update();

    setupQuiz(
      'v3-string-check',
      'v3-string-opt',
      'quadruple',
      'v3-string-feedback',
      '¡Excelente razonamiento! Como \\(v = \\sqrt{T_s / \\mu}\\), para que \\(v\\) se duplique (\(2v\\)) la tensión debe cuadruplicarse: \\(\\sqrt{4 T_s} = 2\\sqrt{T_s}\\).',
      'Fíjate en la raíz cuadrada de la fórmula: para duplicar la raíz, el radicando interno debe multiplicarse por 4.'
    );
  }

  // =========================================================================
  // EJEMPLO 8: RETO EN CALCULADORA DE PARÁMETROS
  // =========================================================================
  function initExample8() {
    const btnLoad = document.getElementById('v3-calc-load-btn');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        const inputF = document.getElementById('calc-f');
        const inputLambda = document.getElementById('calc-lambda');
        if (inputF && inputLambda) {
          inputF.value = '80';
          inputLambda.value = '2.0';
          inputF.dispatchEvent(new Event('input', { bubbles: true }));
          inputLambda.dispatchEvent(new Event('input', { bubbles: true }));

          // Destello visual en la calculadora original
          inputF.style.background = '#ede9fe';
          inputLambda.style.background = '#ede9fe';
          setTimeout(() => {
            inputF.style.background = '';
            inputLambda.style.background = '';
          }, 1000);
        }
      });
    }

    setupQuiz(
      'v3-calc-check',
      'v3-calc-opt',
      'opt1',
      'v3-calc-feedback',
      '¡Solución perfecta! En la calculadora: \\(v = \\lambda f = 2.0\\text{ m} \\times 80\\text{ Hz} = 160.00\\text{ m/s}\\), y \\(k = 2\\pi / 2.0 \\approx 3.14\\text{ rad/m}\\).',
      'Carga los valores en la calculadora superior o calcula: \\(v = 80 \\times 2.0 = 160\\text{ m/s}\\).'
    );
  }

  // =========================================================================
  // EJEMPLO 9: FUNCIÓN DE ONDA ARMÓNICA (Cuerda de guitarra)
  // =========================================================================
  function initExample9() {
    const canvas = document.getElementById('v3-canvas-harmonic');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let A = 0.05;
    let f = 2.0;
    let lambda = 1.0;
    let time = 0;

    const sliderA = document.getElementById('v3-harm-amp');
    const sliderF = document.getElementById('v3-harm-freq');
    const sliderL = document.getElementById('v3-harm-lambda');
    const eqLabel = document.getElementById('v3-harm-eq-str');

    function updateEq() {
      if (sliderA) A = parseFloat(sliderA.value);
      if (sliderF) f = parseFloat(sliderF.value);
      if (sliderL) lambda = parseFloat(sliderL.value);

      const k = (2 * Math.PI / lambda).toFixed(2);
      const w = (2 * Math.PI * f).toFixed(1);

      if (eqLabel) {
        eqLabel.textContent = `y(x,t) = ${A.toFixed(2)} · sin(${k}x - ${w}t)`;
      }
    }

    if (sliderA) sliderA.addEventListener('input', updateEq);
    if (sliderF) sliderF.addEventListener('input', updateEq);
    if (sliderL) sliderL.addEventListener('input', updateEq);
    updateEq();

    function render() {
      time += 0.03;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cy = height * 0.5;
      const k = (2 * Math.PI) / lambda;
      const w = 2 * Math.PI * f;

      ctx.beginPath();
      for (let x = 10; x < width - 10; x += 2) {
        const xReal = (x - 10) / 100;
        const y = cy - (Math.sin(k * xReal - w * time) * (A * 450));
        if (x === 10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    setupQuiz(
      'v3-harm-check',
      'v3-harm-opt',
      'phase',
      'v3-harm-feedback',
      '¡Correcto! \\((kx - \\omega t)\\) es la fase angular total \\(\\Phi(x,t)\\) en radianes. Determina el estado de oscilación exacto del punto en ese instante.',
      'El argumento completo dentro de la función trigonométrica seno es siempre la fase.'
    );
  }

  // =========================================================================
  // EJEMPLO 10: ECUACIÓN DE D'ALEMBERT (Pulso solitario)
  // =========================================================================
  function initExample10() {
    const canvas = document.getElementById('v3-canvas-dal');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let dir = 1; // +1 = derecha (x - vt), -1 = izquierda (x + vt)
    let speed = 2.5;
    let pulseX = 50;
    let isPaused = false;

    const btnRight = document.getElementById('v3-dal-right-btn');
    const btnLeft = document.getElementById('v3-dal-left-btn');
    const sliderV = document.getElementById('v3-dal-speed');
    const valV = document.getElementById('v3-dal-speed-val');
    const btnReset = document.getElementById('v3-dal-reset');

    if (btnRight && btnLeft) {
      btnRight.addEventListener('click', () => {
        dir = 1;
        btnRight.className = 'v3-btn-action active';
        btnLeft.className = 'v3-btn-action';
        pulseX = 40;
      });
      btnLeft.addEventListener('click', () => {
        dir = -1;
        btnLeft.className = 'v3-btn-action active';
        btnRight.className = 'v3-btn-action';
        pulseX = width - 40;
      });
    }

    if (sliderV) {
      sliderV.addEventListener('input', (e) => {
        speed = parseFloat(e.target.value);
        if (valV) valV.textContent = speed.toFixed(1) + ' m/s';
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        pulseX = dir === 1 ? 40 : width - 40;
      });
    }

    function draw() {
      if (!isPaused) {
        pulseX += dir * speed * 0.8;
        if (dir === 1 && pulseX > width + 40) pulseX = -30;
        if (dir === -1 && pulseX < -40) pulseX = width + 30;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cy = height * 0.58;

      // Cuerda con pulso gaussiano
      ctx.beginPath();
      for (let x = 10; x < width - 10; x += 2) {
        const dx = x - pulseX;
        const pulse = 32 * Math.exp(-(dx * dx) / (2 * 18 * 18));
        const y = cy - pulse;
        if (x === 10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2.8;
      ctx.stroke();

      // Etiqueta del argumento
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px monospace';
      const argStr = dir === 1 ? 'y = f(x - vt) → viaja a la derecha' : 'y = g(x + vt) ← viaja a la izquierda';
      ctx.fillText(argStr, 20, 24);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    setupQuiz(
      'v3-dal-check',
      'v3-dal-opt',
      'constant',
      'v3-dal-feedback',
      '¡Exacto! Para seguir la cresta del pulso, el argumento debe mantenerse constante: \\(x - vt = C \\implies x = C + vt\\). A medida que \\(t\\) crece, \\(x\\) aumenta hacia la derecha.',
      'Analiza la igualdad: si el tiempo avanza, ¿cómo debe cambiar la posición \\(x\\) para que \\(x - vt\\) no varíe?'
    );
  }

  // =========================================================================
  // EJEMPLO 11: ENERGÍA, POTENCIA E INTENSIDAD (Ley de Inverso Cuadrado)
  // =========================================================================
  function initExample11() {
    const sliderR = document.getElementById('v3-sound-dist');
    const valR = document.getElementById('v3-sound-dist-val');
    const outI = document.getElementById('v3-sound-i-out');
    const outDb = document.getElementById('v3-sound-db-out');
    const outRatio = document.getElementById('v3-sound-ratio-out');

    const P = 10; // Potencia 10 Watts
    const rA = 2; // Referencia 2 metros
    const I0 = 1e-12;

    function update() {
      const r = parseFloat(sliderR ? sliderR.value : 4);
      if (valR) valR.textContent = r.toFixed(1) + ' m';

      const I = P / (4 * Math.PI * r * r);
      const beta = 10 * Math.log10(I / I0);
      const ratio = (rA * rA) / (r * r);

      if (outI) outI.textContent = I.toExponential(3) + ' W/m²';
      if (outDb) outDb.textContent = beta.toFixed(1) + ' dB';
      if (outRatio) outRatio.textContent = ratio.toFixed(3) + 'x';
    }

    if (sliderR) sliderR.addEventListener('input', update);
    update();

    setupQuiz(
      'v3-energy-check',
      'v3-energy-opt',
      'quarter',
      'v3-energy-feedback',
      '¡Perfecto! Por la ley del inverso del cuadrado: \\(I_2 / I_1 = (r_1 / r_2)^2 = (5 / 10)^2 = 1/4 = 0.25\\). La intensidad disminuye al 25% (una caída de 6 dB).',
      'Recuerda que la intensidad esférica diluye la energía en el área de una esfera: \\(I \\propto 1/r^2\\).'
    );
  }

  // =========================================================================
  // EJEMPLO 12: EFECTO DOPPLER (Preguntas y Enlace al Laboratorio)
  // =========================================================================
  function initExample12() {
    setupQuiz(
      'v3-dop-pred-check',
      'v3-dop-pred-opt',
      'higher',
      'v3-dop-pred-feedback',
      '¡Muy buena predicción! Al acercarse la ambulancia, las ondas se comprimen delante del vehículo y llegan con menor separación espacial (\\(\\lambda\' < \\lambda\\)), por lo que el peatón percibe un tono audiblemente más agudo (\\(f\' > f\\)).',
      'Piensa en qué ocurre con los frentes de onda: el emisor persigue sus propias ondas, acortando la distancia entre crestas.'
    );

    setupQuiz(
      'v3-dop-post-check',
      'v3-dop-post-opt',
      'dilated',
      'v3-dop-post-feedback',
      '¡Excelente deducción física! Al alejarse la fuente sonora, cada cresta se emite más lejos de la anterior, dilatando la longitud de onda en \\(\\lambda_{\\text{detrás}} = \\frac{v + v_s}{f}\\), reduciendo la tasa de llegada de crestas al tímpano (tono más grave).',
      'La velocidad del sonido en el aire la determina el medio y no cambia; lo que se dilata en el espacio es la longitud de onda detrás del vehículo.'
    );
  }

  // =========================================================================
  // EJEMPLO 13: SUPERPOSICIÓN E INTERFERENCIA (Dos parlantes acústicos)
  // =========================================================================
  function initExample13() {
    setupQuiz(
      'v3-interf-q1-check',
      'v3-interf-q1-opt',
      '2a',
      'v3-interf-q1-feedback',
      '¡Correcto! Con desfase nulo \\(\\Delta\\phi = 0\\), las crestas de ambos parlantes coinciden exactamente en fase: \\(A_{\\text{res}} = 2A\\cos(0) = 2A\\) (interferencia constructiva máxima).',
      'Sustituye \\(\\Delta\\phi = 0\\) en la fórmula de la página: \\(2A \\cos(0) = 2A(1) = 2A\\).'
    );

    setupQuiz(
      'v3-interf-q2-check',
      'v3-interf-q2-opt',
      'anc',
      'v3-interf-q2-feedback',
      '¡Brillante aplicación tecnológica! Con \\(\\Delta\\phi = 180^\\circ\\), la cresta de una onda coincide con el valle de la otra: \\(2A\\cos(90^\\circ) = 0\\). Esta anulación destructiva total es la base de los auriculares con Cancelación Activa de Ruido (ANC).',
      'Recuerda que \\(\\cos(180^\\circ / 2) = \\cos(90^\\circ) = 0\\): las dos ondas de presión se cancelan entre sí.'
    );
  }

  // =========================================================================
  // EJEMPLO 14: ONDAS ESTACIONARIAS Y MODOS NORMALES (Guitarra acústica)
  // =========================================================================
  function initExample14() {
    const canvas = document.getElementById('v3-canvas-standing');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let n = 2; // Número de armónico por defecto
    let time = 0;

    const btns = [1, 2, 3, 4].map(idx => document.getElementById(`v3-harm-btn-${idx}`));
    const outN = document.getElementById('v3-mode-n-out');
    const outNodes = document.getElementById('v3-mode-nodes-out');
    const outAntinodes = document.getElementById('v3-mode-antinodes-out');

    function setHarmonic(newN) {
      n = newN;
      btns.forEach((b, i) => {
        if (b) b.className = (i + 1 === n) ? 'v3-btn-action active' : 'v3-btn-action';
      });
      if (outN) outN.textContent = `n = ${n}`;
      if (outNodes) outNodes.textContent = `${n + 1} nodos`;
      if (outAntinodes) outAntinodes.textContent = `${n} antinodos`;
    }

    btns.forEach((b, i) => {
      if (b) b.addEventListener('click', () => setHarmonic(i + 1));
    });

    setHarmonic(2);

    function draw() {
      time += 0.06;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cy = height * 0.5;
      const padX = 25;
      const L = width - padX * 2;
      const ampMax = 28;

      // Envolvente punteada
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      for (let x = 0; x <= L; x += 2) {
        const yTop = cy - Math.sin((n * Math.PI * x) / L) * ampMax;
        if (x === 0) ctx.moveTo(padX + x, yTop);
        else ctx.lineTo(padX + x, yTop);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let x = 0; x <= L; x += 2) {
        const yBot = cy + Math.sin((n * Math.PI * x) / L) * ampMax;
        if (x === 0) ctx.moveTo(padX + x, yBot);
        else ctx.lineTo(padX + x, yBot);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Cuerda oscilando
      const currentAmp = Math.cos(time * 2.5) * ampMax;
      ctx.beginPath();
      for (let x = 0; x <= L; x += 2) {
        const y = cy - Math.sin((n * Math.PI * x) / L) * currentAmp;
        if (x === 0) ctx.moveTo(padX + x, y);
        else ctx.lineTo(padX + x, y);
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.8;
      ctx.stroke();

      // Dibujar NODOS (rojo) y ANTINODOS (verde)
      for (let i = 0; i <= n; i++) {
        const nodeX = padX + (i * L) / n;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(nodeX, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < n; i++) {
        const antiX = padX + ((i + 0.5) * L) / n;
        const antiY = cy - Math.sin((n * Math.PI * (antiX - padX)) / L) * currentAmp;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(antiX, antiY, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    setupQuiz(
      'v3-stand-check',
      'v3-stand-opt',
      '3',
      'v3-stand-feedback',
      '¡Exacto! Para cualquier armónico en una cuerda fija en ambos extremos, el número total de nodos es \\(N = n + 1\\). En el segundo armónico (\\(n=2\\)) hay 3 nodos: en \\(x=0\\), \\(x=L/2\\) y \\(x=L\\).',
      'Cuenta los puntos rojos en la animación del segundo armónico: tienes los dos extremos fijos más el nodo central.'
    );
  }

  // =========================================================================
  // EJEMPLO 15: REFLEXIÓN Y REFRACCIÓN (Eco y cambio de medio)
  // =========================================================================
  function initExample15() {
    const canvas = document.getElementById('v3-canvas-refl');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let caseType = 'fixed'; // 'fixed', 'free', 'boundary'
    let pulsePos = 20;

    const btnFixed = document.getElementById('v3-refl-fixed-btn');
    const btnFree = document.getElementById('v3-refl-free-btn');
    const btnBound = document.getElementById('v3-refl-bound-btn');
    const descText = document.getElementById('v3-refl-desc');

    function setCase(c) {
      caseType = c;
      pulsePos = 20;
      if (btnFixed) btnFixed.className = c === 'fixed' ? 'v3-btn-action active' : 'v3-btn-action';
      if (btnFree) btnFree.className = c === 'free' ? 'v3-btn-action active' : 'v3-btn-action';
      if (btnBound) btnBound.className = c === 'boundary' ? 'v3-btn-action active' : 'v3-btn-action';

      if (descText) {
        if (c === 'fixed') {
          descText.innerHTML = '<strong>Extremo fijo (pared rígida):</strong> El apoyo ejerce una fuerza de reacción que invierte el pulso reflejado (desfase de \(180^\\circ\) o \(\\pi\\text{ rad}\)).';
        } else if (c === 'free') {
          descText.innerHTML = '<strong>Extremo libre (anillo sin fricción):</strong> El extremo duplica su amplitud momentáneamente y el pulso se refleja en fase (\(0^\\circ\), sin inversión).';
        } else {
          descText.innerHTML = '<strong>Cambio de medio (liviano → denso):</strong> Parte de la energía se refleja invertida y parte se transmite al medio denso con menor longitud de onda y menor velocidad.';
        }
      }
    }

    if (btnFixed) btnFixed.addEventListener('click', () => setCase('fixed'));
    if (btnFree) btnFree.addEventListener('click', () => setCase('free'));
    if (btnBound) btnBound.addEventListener('click', () => setCase('boundary'));

    setCase('fixed');

    function draw() {
      pulsePos += 1.8;
      if (pulsePos > 240) pulsePos = 20;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cy = height * 0.55;
      const wallX = width * 0.7;

      // Pared o frontera
      ctx.fillStyle = '#475569';
      ctx.fillRect(wallX, cy - 35, 8, 70);

      // Cuerda
      ctx.beginPath();
      for (let x = 15; x < wallX; x += 2) {
        let y = cy;
        // Pulso incidente
        if (pulsePos < 100) {
          const dx = x - (15 + pulsePos * 1.5);
          y -= 25 * Math.exp(-(dx * dx) / 150);
        } else {
          // Pulso reflejado
          const refDist = (pulsePos - 100) * 1.5;
          const refX = wallX - refDist;
          const dx = x - refX;
          const sign = caseType === 'free' ? 1 : -1;
          y -= sign * 22 * Math.exp(-(dx * dx) / 150);
        }
        if (x === 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Si es cambio de medio, dibujar segunda cuerda densa
      if (caseType === 'boundary') {
        ctx.beginPath();
        for (let x = wallX; x < width - 15; x += 2) {
          let y = cy;
          if (pulsePos >= 100) {
            const transDist = (pulsePos - 100) * 0.7; // más lenta
            const transX = wallX + transDist;
            const dx = x - transX;
            y -= 14 * Math.exp(-(dx * dx) / 90);
          }
          if (x === wallX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4.5; // más gruesa
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    setupQuiz(
      'v3-refl-check',
      'v3-refl-opt',
      'freq',
      'v3-refl-feedback',
      '¡Completamente verificado! La frecuencia temporal \\(f\\) la dicta exclusivamente el oscilador emisor original y jamás cambia al cruzar una frontera física. Lo que cambia conjuntamente son la rapidez \\(v\\) y la longitud de onda \\(\\lambda\\).',
      'Recuerda la ley de conservación de los ciclos por segundo: el número de oscilaciones que entran por segundo debe ser igual al que sale.'
    );
  }

  // =========================================================================
  // EJEMPLO 16: DIFRACCIÓN Y HUYGENS (Escuchar tras la puerta)
  // =========================================================================
  function initExample16() {
    setupQuiz(
      'v3-diff-check',
      'v3-diff-opt',
      'lambda_size',
      'v3-diff-feedback',
      '¡Exacto! El sonido de la voz tiene longitudes de onda del orden de metros (\\(\\lambda \\approx 1\\text{ a }3\\text{ m}\\)), muy similar al ancho de una puerta (\\(a \\approx 0.9\\text{ m}\\)), provocando una difracción máxima que dispersa las ondas en semicírculos. La luz visible, con \\(\\lambda \\approx 0.0005\\text{ mm}\\), viaja en línea recta geométrica.',
      'Aplica la condición de difracción de Huygens: sólo hay dispersión apreciable cuando la rendija es del mismo orden de magnitud que la longitud de onda (\\(a \\approx \\lambda\\)).'
    );
  }

  // =========================================================================
  // EJEMPLO 17: RESONANCIA (El columpio en el parque)
  // =========================================================================
  function initExample17() {
    const sliderF = document.getElementById('v3-res-freq');
    const valF = document.getElementById('v3-res-freq-val');
    const outAmp = document.getElementById('v3-res-amp-out');
    const badgeStatus = document.getElementById('v3-res-badge');

    const f0 = 0.5; // Frecuencia natural del columpio

    function update() {
      const f = parseFloat(sliderF ? sliderF.value : 0.5);
      if (valF) valF.textContent = f.toFixed(2) + ' Hz';

      const diff = Math.abs(f - f0);
      const amp = 1.0 / Math.sqrt(Math.pow(1 - (f/f0)*(f/f0), 2) + 0.08);

      if (outAmp) outAmp.textContent = (amp * 25).toFixed(0) + '°';

      if (badgeStatus) {
        if (diff < 0.05) {
          badgeStatus.className = 'v3-card-tag';
          badgeStatus.style.background = '#fef3c7';
          badgeStatus.style.color = '#b45309';
          badgeStatus.textContent = '¡RESONANCIA! Máxima absorción de energía';
        } else {
          badgeStatus.className = 'v3-card-tag';
          badgeStatus.style.background = '#e2e8f0';
          badgeStatus.style.color = '#475569';
          badgeStatus.textContent = 'Fuera de sintonía: baja amplitud';
        }
      }
    }

    if (sliderF) sliderF.addEventListener('input', update);
    update();

    setupQuiz(
      'v3-swing-check',
      'v3-swing-opt',
      'inphase',
      'v3-swing-feedback',
      '¡Totalmente correcto! Para transferir la máxima energía mecánica posible (potencia \\(P = \\vec{F} \\cdot \\vec{v}\\)), la fuerza del empuje debe aplicarse siempre en la misma dirección y fase de la velocidad, sintonizado con la frecuencia natural.',
      'Si empujas a destiempo (en contra del movimiento), frenas el columpio. La resonancia exige aplicar la fuerza exactamente en fase.'
    );
  }

  // =========================================================================
  // EJEMPLO 18: APLICACIONES EN INDUSTRIA 4.0 (Monitoreo de Motor)
  // =========================================================================
  function initExample18() {
    const canvas = document.getElementById('v3-canvas-motor');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth || 300;
    let height = canvas.height = canvas.parentElement.clientHeight || 140;

    let isFault = false;
    let time = 0;

    const btnNormal = document.getElementById('v3-motor-normal-btn');
    const btnFault = document.getElementById('v3-motor-fault-btn');
    const diagText = document.getElementById('v3-motor-diag');

    function setCondition(fault) {
      isFault = fault;
      if (btnNormal) btnNormal.className = !isFault ? 'v3-btn-action active' : 'v3-btn-action';
      if (btnFault) btnFault.className = isFault ? 'v3-btn-action active' : 'v3-btn-action';

      if (diagText) {
        if (!isFault) {
          diagText.innerHTML = '<span style="color:#10b981; font-weight:800;"><i class="fas fa-check-circle"></i> Estado Normal:</span> El espectro FFT muestra únicamente la componente rotacional del eje a \(30\\text{ Hz}\) (\(1800\\text{ RPM}\)) con amplitud segura según ISO 10816 (< 1.8 mm/s).';
        } else {
          diagText.innerHTML = '<span style="color:#ef4444; font-weight:800;"><i class="fas fa-triangle-exclamation"></i> Alerta Crítica (Falla BPFO):</span> Aparece un pico anómalo de gran amplitud a \(107\\text{ Hz}\), correspondiente al defecto en la pista exterior del rodamiento. Programar cambio predictivo.';
        }
      }
    }

    if (btnNormal) btnNormal.addEventListener('click', () => setCondition(false));
    if (btnFault) btnFault.addEventListener('click', () => setCondition(true));

    setCondition(false);

    function draw() {
      time += 0.08;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const halfW = width * 0.48;

      // 1. Dominio del Tiempo y(t) a la izquierda
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px monospace';
      ctx.fillText('Aceleración Temporal y(t)', 10, 14);

      const cyTime = height * 0.55;
      ctx.beginPath();
      for (let x = 10; x < halfW; x += 2) {
        const tVal = (x - 10) * 0.15;
        let ySignal = Math.sin(tVal - time * 2) * 14;
        if (isFault) {
          // Agregar armónico agudo de impacto de bola
          ySignal += Math.sin(tVal * 3.6 - time * 6) * 16 * (Math.sin(tVal * 0.5) > 0 ? 1 : 0.2);
        }
        const yPx = cyTime - ySignal;
        if (x === 10) ctx.moveTo(x, yPx);
        else ctx.lineTo(x, yPx);
      }
      ctx.strokeStyle = isFault ? '#ef4444' : '#10b981';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Separador central
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(halfW + 5, 5);
      ctx.lineTo(halfW + 5, height - 5);
      ctx.stroke();

      // 2. Espectro FFT a la derecha
      const fftX = halfW + 15;
      const fftW = width - fftX - 10;
      const fftBaseY = height - 20;

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Espectro FFT (Frecuencias)', fftX, 14);

      // Eje FFT
      ctx.strokeStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(fftX, fftBaseY);
      ctx.lineTo(fftX + fftW, fftBaseY);
      ctx.stroke();

      // Pico fundamental (30 Hz)
      const p1X = fftX + fftW * 0.28;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p1X - 3, fftBaseY - 35, 6, 35);
      ctx.font = '8px monospace';
      ctx.fillText('30Hz', p1X - 8, fftBaseY + 12);

      // Pico de falla anómalo (107 Hz)
      if (isFault) {
        const p2X = fftX + fftW * 0.72;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(p2X - 4, fftBaseY - 60, 8, 60);
        ctx.fillText('107Hz(!)', p2X - 12, fftBaseY + 12);
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    setupQuiz(
      'v3-motor-check',
      'v3-motor-opt',
      'fft',
      'v3-motor-feedback',
      '¡Diagnóstico industrial exacto! La FFT transforma la señal temporal caótica en un espectro de frecuencias discretas donde cada componente mecánica rota a su propia frecuencia característica, permitiendo diagnosticar con precisión fallas de rodamientos, holguras o desbalances.',
      'La FFT descompone la función compleja en sus armónicos elementales, asociando picos de frecuencia con componentes mecánicos específicos.'
    );
  }

  // =========================================================================
  // INICIALIZADOR GLOBAL DE LA VERSIÓN 3.0
  // =========================================================================
  function initAll() {
    initExample1();
    initExample2();
    initExample3();
    initExample4();
    initExample5();
    initExample6();
    initExample7();
    initExample8();
    initExample9();
    initExample10();
    initExample11();
    initExample12();
    initExample13();
    initExample14();
    initExample15();
    initExample16();
    initExample17();
    initExample18();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
