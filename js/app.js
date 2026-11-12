/* ==========================================================================
   APP CONTROLLER & PHYSICAL NOTEBOOK ENGINE
   Cuaderno Interactivo: Movimiento Ondulatorio
   Autoras: Laura Yicel Ocampo Rodríguez & Danna Yised Arias Martínez
   Universidad Tecnológica de Pereira - Ingeniería Industrial
   ========================================================================== */

(function() {
  'use strict';

  // =========================================================================
  // 1. MÓDULO DE AUDIO: SONIDO REALISTA Y DELICADO DE HOJA DE PAPEL FINO
  // =========================================================================
  const PaperAudio = (function() {
    let audioCtx = null;
    let isSoundEnabled = (localStorage.getItem('notebook_sound') !== 'false');

    function getAudioCtx() {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtx = new AudioContext();
        }
      }
      return audioCtx;
    }

    function play(direction = 'next') {
      if (!isSoundEnabled) return;
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Síntesis de fricción de papel fino nuevo:
        // Ruido rosa con filtro acústico suave (fshhh... shhh aterciopelado)
        const duration = 0.18; // 180 ms delicado
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        // Generador de ruido rosa suave (filtro IIR de Paul Kellet)
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          const pink = b0 + b1 + b2 + white * 0.5362;
          const t = i / bufferSize;
          // Envolvente de seda: subida suave, caída natural sin chasquidos
          const env = Math.sin(t * Math.PI) * Math.exp(-t * 2.0);
          output[i] = pink * env * 0.15;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        // Filtro pasa-bajos cálido para eliminar asperezas
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(1600, ctx.currentTime);

        // Filtro pasa-banda resonante suave
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';

        if (direction === 'next') {
          filter.frequency.setValueAtTime(1400, ctx.currentTime);
          filter.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + duration);
          filter.Q.value = 0.85;
        } else {
          filter.frequency.setValueAtTime(950, ctx.currentTime);
          filter.frequency.exponentialRampToValueAtTime(1350, ctx.currentTime + duration);
          filter.Q.value = 0.85;
        }

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        noiseNode.connect(lowpass);
        lowpass.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noiseNode.start();
      } catch (e) {
        console.warn('Audio note:', e);
      }
    }

    function toggleSound() {
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('notebook_sound', isSoundEnabled ? 'true' : 'false');
      updateSoundUI();
      return isSoundEnabled;
    }

    function isEnabled() {
      return isSoundEnabled;
    }

    function updateSoundUI() {
      const icons = document.querySelectorAll('#sound-icon, .sound-icon-indicator');
      icons.forEach(icon => {
        if (isSoundEnabled) {
          icon.className = 'fas fa-volume-high';
          icon.title = 'Sonido de hojas de papel activado';
        } else {
          icon.className = 'fas fa-volume-xmark';
          icon.title = 'Sonido de hojas silenciado';
        }
      });
      const btns = document.querySelectorAll('#btn-sound-toggle');
      btns.forEach(b => {
        b.classList.toggle('muted', !isSoundEnabled);
      });
    }

    return {
      play,
      toggleSound,
      isEnabled,
      updateSoundUI
    };
  })();

  // =========================================================================
  // 2. CONFIGURACIÓN DE PLIEGOS (SPREADS) Y PÁGINAS (COMPATIBILIDAD DINÁMICA 15 Y 16 PLIEGOS)
  // =========================================================================
  const SPREADS_15 = [
    { num: 1, title: 'Portada Oficial & Introducción', pages: [1, 2], p1: 'Portada Principal', p2: 'Introducción & Relevancia' },
    { num: 2, title: '¿Qué es una Onda? & Cinemática Ondulatoria', pages: [3, 4], p1: '¿Qué es una Onda?', p2: 'Movimiento Ondulatorio' },
    { num: 3, title: 'Clasificación de las Ondas', pages: [5, 6], p1: 'Según el Medio de Propagación', p2: 'Según la Dirección de Oscilación' },
    { num: 4, title: 'Magnitudes Fundamentales I & II', pages: [7, 8], p1: 'Periodo (T) y Frecuencia (f)', p2: 'Longitud de Onda (λ) y Amplitud (A)' },
    { num: 5, title: 'Velocidad de Propagación & Calculadora', pages: [9, 10], p1: 'Velocidad de Propagación (v)', p2: 'Calculadora de Parámetros' },
    { num: 6, title: 'Descripción Matemática & Ecuación de Onda', pages: [11, 12], p1: 'Función de Onda Armónica', p2: "Ecuación de Onda de D'Alembert" },
    { num: 7, title: 'Energía, Potencia & Efecto Doppler', pages: [13, 14], p1: 'Energía e Intensidad Sonora', p2: 'Efecto Doppler' },
    { num: 8, title: 'Superposición, Interferencia & Estacionarias', pages: [15, 16], p1: 'Superposición e Interferencia', p2: 'Ondas Estacionarias y Modos' },
    { num: 9, title: 'Reflexión, Refracción & Difracción', pages: [17, 18], p1: 'Reflexión y Refracción', p2: 'Difracción y Principio de Huygens' },
    { num: 10, title: 'Resonancia & Aplicaciones Industriales', pages: [19, 20], p1: 'Fenómeno de Resonancia', p2: 'Aplicaciones en Industria 4.0' },
    { num: 11, title: 'Taller de Ejercicios & Soluciones', pages: [21, 22], p1: 'Ejercicios Prácticos Aplicados', p2: 'Soluciones Paso a Paso' },
    { num: 12, title: 'Laboratorio Gráfico & Quiz Evaluativo', pages: [23, 24], p1: 'Laboratorio Gráfico de Ondas', p2: 'Quiz Conceptual Interactivo' },
    { num: 13, title: 'Simulaciones Interactivas del Movimiento', pages: [25, 26], p1: 'Simulación: Modos Normales', p2: 'Simulación: Reflexión y Refracción' },
    { num: 14, title: 'Simulación Especial Onda Viajera & Pregunta λ', pages: [27, 28], p1: 'Simulación Especial: y(x,t)', p2: 'Pregunta Didáctica de λ' },
    { num: 15, title: 'Referencias Bibliográficas & Agradecimientos', pages: [29, 30], p1: 'Referencias Académicas', p2: 'Agradecimientos & Dedicatoria' }
  ];

  const SPREADS_16 = [
    { num: 1, title: 'Portada Oficial & Introducción', pages: [1, 2], p1: 'Portada Principal', p2: 'Introducción & Relevancia' },
    { num: 2, title: '¿Qué es una Onda? & Cinemática Ondulatoria', pages: [3, 4], p1: '¿Qué es una Onda?', p2: 'Movimiento Ondulatorio' },
    { num: 3, title: 'Clasificación de las Ondas', pages: [5, 6], p1: 'Según el Medio de Propagación', p2: 'Según la Dirección de Oscilación' },
    { num: 4, title: 'Magnitudes Fundamentales I & II', pages: [7, 8], p1: 'Periodo (T) y Frecuencia (f)', p2: 'Longitud de Onda (λ) y Amplitud (A)' },
    { num: 5, title: 'Velocidad de Propagación & Calculadora', pages: [9, 10], p1: 'Velocidad de Propagación (v)', p2: 'Calculadora de Parámetros' },
    { num: 6, title: 'Descripción Matemática & Ecuación de Onda', pages: [11, 12], p1: 'Función de Onda Armónica', p2: "Ecuación de Onda de D'Alembert" },
    { num: 7, title: 'Energía, Potencia & Efecto Doppler', pages: [13, 14], p1: 'Energía e Intensidad Sonora', p2: 'Efecto Doppler' },
    { num: 8, title: 'Superposición, Interferencia & Estacionarias', pages: [15, 16], p1: 'Superposición e Interferencia', p2: 'Ondas Estacionarias y Modos' },
    { num: 9, title: 'Reflexión, Refracción & Difracción', pages: [17, 18], p1: 'Reflexión y Refracción', p2: 'Difracción y Principio de Huygens' },
    { num: 10, title: 'Resonancia & Aplicaciones Industriales', pages: [19, 20], p1: 'Fenómeno de Resonancia', p2: 'Aplicaciones en Industria 4.0' },
    { num: 11, title: 'Taller de Ejercicios & Soluciones', pages: [21, 22], p1: 'Ejercicios Prácticos Aplicados', p2: 'Soluciones Paso a Paso' },
    { num: 12, title: 'Laboratorio Gráfico & Quiz Evaluativo', pages: [23, 24], p1: 'Laboratorio Gráfico de Ondas', p2: 'Quiz Conceptual Interactivo' },
    { num: 13, title: 'Simulaciones Interactivas del Movimiento', pages: [25, 26], p1: 'Simulación: Modos Normales', p2: 'Simulación: Reflexión y Refracción' },
    { num: 14, title: 'Simulación Especial Onda Viajera & Pregunta λ', pages: [27, 28], p1: 'Simulación Especial: y(x,t)', p2: 'Pregunta Didáctica de λ' },
    { num: 15, title: 'Laboratorio Virtual Efecto Doppler', pages: [29, 30], p1: 'Laboratorio Virtual: Efecto Doppler', p2: 'Análisis y Casos del Efecto Doppler' },
    { num: 16, title: 'Referencias Bibliográficas & Agradecimientos', pages: [31, 32], p1: 'Referencias Académicas', p2: 'Agradecimientos & Dedicatoria' }
  ];

  const SPREADS = document.getElementById('spread-16') ? SPREADS_16 : SPREADS_15;

  let currentSpreadNum = 1;
  let isTurningPage = false;

  // =========================================================================
  // 3. CONTROLADOR DE PASO DE PÁGINAS CON ANIMACIÓN 3D
  // =========================================================================
  function goToSpread(targetSpreadNum, direction = null) {
    if (targetSpreadNum < 1) targetSpreadNum = 1;
    if (targetSpreadNum > SPREADS.length) targetSpreadNum = SPREADS.length;
    if (targetSpreadNum === currentSpreadNum && direction !== null) return;

    if (direction === null) {
      direction = targetSpreadNum > currentSpreadNum ? 'next' : 'prev';
    }

    const flipper = document.getElementById('page-flipper');
    const spine = document.getElementById('notebook-spine');

    // Reproducir sonido de hoja pasando
    PaperAudio.play(direction);

    // Destello de luz sobre los aros del argollado
    if (spine) {
      spine.classList.remove('shimmering');
      void spine.offsetWidth; // Forzar reflow
      spine.classList.add('shimmering');
      setTimeout(() => spine.classList.remove('shimmering'), 800);
    }

    // Si la pantalla es lo bastante amplia, animar el paso de página 3D
    const isDesktop = window.innerWidth > 900;

    if (flipper && isDesktop && !isTurningPage) {
      isTurningPage = true;
      flipper.className = 'page-flipper';
      void flipper.offsetWidth;

      if (direction === 'next') {
        flipper.classList.add('flipping-next');
      } else {
        flipper.classList.add('flipping-prev');
      }

      // A mitad de la animación cambiamos el pliego activo
      setTimeout(() => {
        applySpreadChange(targetSpreadNum);
      }, 320);

      // Al finalizar la animación limpiamos el flipper
      setTimeout(() => {
        if (flipper) flipper.className = 'page-flipper';
        isTurningPage = false;
      }, 650);
    } else {
      applySpreadChange(targetSpreadNum);
    }
  }

  function applySpreadChange(targetSpreadNum) {
    currentSpreadNum = targetSpreadNum;
    const spreadData = SPREADS[targetSpreadNum - 1];

    // Actualizar pliego activo
    document.querySelectorAll('.book-spread').forEach(spread => {
      spread.classList.remove('active');
    });

    const activeSpreadEl = document.getElementById(`spread-${targetSpreadNum}`);
    if (activeSpreadEl) {
      activeSpreadEl.classList.add('active');
    }

    // Centrado de argollado: en la portada se ajusta a la separación central
    const notebookContainer = document.getElementById('notebook-container');
    if (notebookContainer) {
      if (targetSpreadNum === 1) {
        notebookContainer.classList.add('cover-active');
      } else {
        notebookContainer.classList.remove('cover-active');
      }
    }

    // Scroll al inicio del pliego
    document.querySelectorAll('.book-page').forEach(p => {
      p.scrollTop = 0;
    });

    // Actualizar Navbar
    const pill = document.getElementById('nav-page-pill');
    const title = document.getElementById('nav-page-title');
    const progressBar = document.getElementById('reading-progress');

    if (pill) {
      pill.innerHTML = `<i class="fas fa-book-open"></i> Pliego ${targetSpreadNum} / ${SPREADS.length}`;
    }
    if (title) {
      title.textContent = `Págs. ${spreadData.pages[0]} y ${spreadData.pages[1]}: ${spreadData.title}`;
    }
    if (progressBar) {
      const pct = ((targetSpreadNum - 1) / (SPREADS.length - 1)) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // Actualizar botones de Navbar
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = (targetSpreadNum === 1);
    if (btnNext) btnNext.disabled = (targetSpreadNum === SPREADS.length);

    // Actualizar barra de navegación inferior (spread nav)
    const btnSpreadPrev = document.getElementById('btn-spread-prev');
    const btnSpreadNext = document.getElementById('btn-spread-next');
    const spreadSelector = document.getElementById('spread-selector');
    const pagesLabel = document.getElementById('spread-pages-label');

    if (btnSpreadPrev) btnSpreadPrev.disabled = (targetSpreadNum === 1);
    if (btnSpreadNext) btnSpreadNext.disabled = (targetSpreadNum === SPREADS.length);
    if (spreadSelector) spreadSelector.value = targetSpreadNum.toString();
    if (pagesLabel) pagesLabel.textContent = `Páginas ${spreadData.pages[0]}-${spreadData.pages[1]} de ${SPREADS.length * 2}`;

    // Actualizar indicador en barra superior
    const topSpreadText = document.getElementById('top-spread-text');
    if (topSpreadText) {
      topSpreadText.textContent = `Pliego ${targetSpreadNum} de ${SPREADS.length}`;
    }

    // Actualizar items activos en el menú drawer lateral
    document.querySelectorAll('.drawer-item').forEach(item => {
      const pNum = parseInt(item.dataset.page);
      if (spreadData.pages.includes(pNum)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Notificar al motor de canvas para ajustar tamaños
    if (window.PhysicsSims && window.PhysicsSims.triggerResizeAll) {
      setTimeout(() => window.PhysicsSims.triggerResizeAll(), 80);
      setTimeout(() => window.PhysicsSims.triggerResizeAll(), 350);
    }

    // Renderizar KaTeX
    renderMath();
  }

  // Navegar a una página individual (localizando su pliego correspondiente)
  function goToPage(pageNum) {
    const totalPages = SPREADS.length * 2;
    if (pageNum < 1) pageNum = 1;
    if (pageNum > totalPages) pageNum = totalPages;

    const targetSpread = SPREADS.find(s => s.pages.includes(pageNum));
    if (targetSpread) {
      const dir = targetSpread.num > currentSpreadNum ? 'next' : (targetSpread.num < currentSpreadNum ? 'prev' : null);
      goToSpread(targetSpread.num, dir);

      // Si la página buscada está en la derecha, hacer foco o scroll suave
      setTimeout(() => {
        const pageEl = document.getElementById(`page-${pageNum}`);
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }

  // =========================================================================
  // 4. RENDERIZADOR MATEMÁTICO KATEX
  // =========================================================================
  function renderMath() {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn('Math render note:', err);
      }
    }
  }

  function ensureMathRendered() {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.renderMathInElement) {
        renderMath();
        clearInterval(interval);
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 200);
  }

  // =========================================================================
  // 5. EFECTO RIPPLE EN BOTONES
  // =========================================================================
  function initRippleEffect() {
    document.addEventListener('click', function(e) {
      const target = e.target.closest('.btn-open-notebook, .btn-nav-step, .btn-spread-step, .btn-sim-action, .btn-check-exercise, .quiz-option-btn, .btn-audio-toggle');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const existing = target.querySelector('.ripple');
      if (existing) existing.remove();

      target.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  }

  // =========================================================================
  // 6. GENERADOR DE AUDIO DE TONOS ACÚSTICOS (WEB AUDIO API)
  // =========================================================================
  let toneAudioCtx = null;
  let oscillator = null;
  let toneGainNode = null;

  function initToneGenerator() {
    const btnTone = document.getElementById('btn-play-tone');
    const sliderTone = document.getElementById('slider-tone-freq');
    const valTone = document.getElementById('val-tone-freq');
    const toneNote = document.getElementById('val-tone-note');

    if (!btnTone || !sliderTone) return;

    function getNoteName(freq) {
      if (Math.abs(freq - 440) < 5) return 'La (A4) - Tono de Concierto Estándar';
      if (Math.abs(freq - 261.6) < 5) return 'Do Central (C4)';
      if (Math.abs(freq - 523.2) < 5) return 'Do Agudo (C5)';
      if (Math.abs(freq - 880) < 5) return 'La Agudo (A5)';
      return `${freq} Hz`;
    }

    sliderTone.addEventListener('input', () => {
      const f = parseFloat(sliderTone.value);
      if (valTone) valTone.textContent = `${f} Hz`;
      if (toneNote) toneNote.textContent = getNoteName(f);
      if (oscillator && toneAudioCtx) {
        oscillator.frequency.setValueAtTime(f, toneAudioCtx.currentTime);
      }
    });

    btnTone.addEventListener('click', () => {
      if (!toneAudioCtx) {
        toneAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (oscillator) {
        toneGainNode.gain.exponentialRampToValueAtTime(0.0001, toneAudioCtx.currentTime + 0.05);
        setTimeout(() => {
          if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
          }
        }, 60);
        btnTone.innerHTML = '<i class="fas fa-volume-high"></i> Escuchar Tono Puro';
        btnTone.classList.remove('active');
      } else {
        const f = parseFloat(sliderTone.value);
        oscillator = toneAudioCtx.createOscillator();
        toneGainNode = toneAudioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(f, toneAudioCtx.currentTime);

        toneGainNode.gain.setValueAtTime(0.0001, toneAudioCtx.currentTime);
        toneGainNode.gain.exponentialRampToValueAtTime(0.12, toneAudioCtx.currentTime + 0.05);

        oscillator.connect(toneGainNode);
        toneGainNode.connect(toneAudioCtx.destination);
        oscillator.start();

        btnTone.innerHTML = '<i class="fas fa-stop"></i> Detener Audio';
        btnTone.classList.add('active');
      }
    });
  }

  // =========================================================================
  // 7. CALCULADORA INTERACTIVA DE MAGNITUDES
  // =========================================================================
  function initWaveCalculator() {
    const inputF = document.getElementById('calc-f');
    const inputL = document.getElementById('calc-lambda');
    const resV = document.getElementById('calc-res-v');
    const resT = document.getElementById('calc-res-t');
    const resK = document.getElementById('calc-res-k');
    const resW = document.getElementById('calc-res-w');

    function calculate() {
      if (!inputF || !inputL) return;
      const f = parseFloat(inputF.value);
      const lambda = parseFloat(inputL.value);

      if (f > 0 && lambda > 0) {
        const v = lambda * f;
        const T = 1 / f;
        const k = (2 * Math.PI) / lambda;
        const omega = 2 * Math.PI * f;

        if (resV) resV.textContent = `${v.toFixed(2)} m/s`;
        if (resT) resT.textContent = `${T.toFixed(4)} s`;
        if (resK) resK.textContent = `${k.toFixed(2)} rad/m`;
        if (resW) resW.textContent = `${omega.toFixed(2)} rad/s`;
      }
    }

    if (inputF && inputL) {
      inputF.addEventListener('input', calculate);
      inputL.addEventListener('input', calculate);
      calculate();
    }
  }

  // =========================================================================
  // 8. EJERCICIOS INTERACTIVOS
  // =========================================================================
  const EXERCISES = [
    { id: 'ex-1', correctValue: 2.0, tolerance: 0.05, unit: 'm' },
    { id: 'ex-2', correctValue: 120.0, tolerance: 2.0, unit: 'm/s' },
    { id: 'ex-3', correctValue: 3.0, tolerance: 0.05, unit: 'Hz' },
    { id: 'ex-4', correctValue: 0.5, tolerance: 0.02, unit: 'm' }
  ];

  function initExercises() {
    EXERCISES.forEach(ex => {
      const btnCheck = document.getElementById(`btn-check-${ex.id}`);
      const input = document.getElementById(`input-${ex.id}`);
      const feedback = document.getElementById(`feedback-${ex.id}`);
      const btnSolution = document.getElementById(`btn-sol-${ex.id}`);
      const solutionBox = document.getElementById(`box-sol-${ex.id}`);

      if (btnCheck && input && feedback) {
        btnCheck.addEventListener('click', () => {
          const val = parseFloat(input.value.replace(',', '.'));
          if (isNaN(val)) {
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Por favor ingresa un número válido.';
            return;
          }

          const diff = Math.abs(val - ex.correctValue);
          if (diff <= ex.tolerance) {
            feedback.className = 'exercise-feedback correct';
            feedback.innerHTML = `<i class="fas fa-check-circle"></i> ¡Excelente! Respuesta correcta: ${val} ${ex.unit}. Procedimiento impecable.`;
          } else {
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = `<i class="fas fa-times-circle"></i> Valor incorrecto (${val} ${ex.unit}). Revisa tus despejes y las unidades.`;
          }
        });
      }

      if (btnSolution && solutionBox) {
        btnSolution.addEventListener('click', () => {
          const isOpen = solutionBox.classList.toggle('active');
          btnSolution.innerHTML = isOpen
            ? '<i class="fas fa-eye-slash"></i> Ocultar Explicación'
            : '<i class="fas fa-lightbulb"></i> Ver Solución Paso a Paso';
          renderMath();
        });
      }
    });
  }

  // =========================================================================
  // 9. QUIZ INTERACTIVO (10 PREGUNTAS)
  // =========================================================================
  const QUIZ_QUESTIONS = [
    {
      question: '1. En una onda mecánica, ¿qué es exactamente lo que se transporta a través del espacio?',
      options: [
        'Materia y masa física de forma neta hacia adelante',
        'Energía y cantidad de movimiento lineal sin transporte neto de materia',
        'Únicamente calor y temperatura del medio',
        'Partículas individuales que viajan a la velocidad de la luz'
      ],
      correct: 1,
      explanation: 'Las ondas transportan energía y momento lineal mediante la oscilación local de las partículas de un medio, sin que exista un desplazamiento permanente neto de masa.'
    },
    {
      question: '2. Si duplicas la frecuencia (f) de una onda en una cuerda tensa con tensión constante, ¿qué sucede con la longitud de onda (λ)?',
      options: [
        'Se duplica',
        'Permanece idéntica',
        'Se reduce a la mitad',
        'Se cuadruplica'
      ],
      correct: 2,
      explanation: 'La velocidad de la onda depende únicamente de las propiedades del medio ($v = \\sqrt{T/\\mu}$). Como $v$ es constante y $v = \\lambda f$, si $f$ se duplica, $\\lambda$ debe dividirse entre 2.'
    },
    {
      question: '3. ¿Qué magnitud física determina la cantidad de energía transportada por una onda armónica?',
      options: [
        'Es proporcional al cuadrado de la amplitud ($E \\propto A^2$)',
        'Es inversamente proporcional a la amplitud ($E \\propto 1/A$)',
        'Es completamente independiente de la amplitud',
        'Depende exclusivamente del color de la onda'
      ],
      correct: 0,
      explanation: 'La energía mecánica total transportada por una onda sinusoidal es proporcional al cuadrado de la amplitud y al cuadrado de la frecuencia angular ($P \\propto \\omega^2 A^2$).'
    },
    {
      question: '4. En una onda transversal, la dirección de vibración de las partículas es:',
      options: [
        'Paralela a la dirección de propagación',
        'Perpendicular a la dirección de propagación',
        'Circular y helicoidal en todo momento',
        'Opuesta al avance de la onda'
      ],
      correct: 1,
      explanation: 'En las ondas transversales (como en cuerdas o luz), las partículas oscilan perpendicularmente a la dirección en la que viaja la perturbación.'
    },
    {
      question: '5. La ecuación diferencial unidimensional de onda descubierta por D’Alembert tiene la forma:',
      options: [
        '$\\frac{\\partial y}{\\partial x} = v \\frac{\\partial y}{\\partial t}$',
        '$\\frac{\\partial^2 y}{\\partial x^2} = \\frac{1}{v^2} \\frac{\\partial^2 y}{\\partial t^2}$',
        '$\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\varepsilon_0}$',
        '$y = A \\sin(kx - \\omega t)$'
      ],
      correct: 1,
      explanation: 'La ecuación canónica de onda en 1D relaciona la curvatura espacial (segunda derivada respecto a x) con la aceleración temporal (segunda derivada respecto a t) dividida por $v^2$.'
    },
    {
      question: '6. Si dos ondas idénticas interfieren con una diferencia de fase de $\\Delta\\phi = \\pi$ radianes (180°), ¿qué tipo de interferencia se produce?',
      options: [
        'Interferencia constructiva máxima con amplitud $2A$',
        'Interferencia destructiva total con amplitud resultante nula ($0$)',
        'Batimiento con pulsaciones periódicas',
        'Difracción hiperbólica'
      ],
      correct: 1,
      explanation: 'Un desfase de $\\pi$ radianes significa que una cresta coincide exactamente con un valle, anulándose mutuamente ($A_{\\text{tot}} = 2A \\cos(\\pi/2) = 0$).'
    },
    {
      question: '7. El fenómeno por el cual una onda rodea un obstáculo o se dispersa al pasar por una rendija de tamaño comparable a su longitud de onda se denomina:',
      options: [
        'Reflexión',
        'Refracción',
        'Difracción',
        'Dispersión cromática'
      ],
      correct: 2,
      explanation: 'La difracción es el doblamiento y dispersión de los frentes de onda cuando el obstáculo o rendija tiene dimensiones del orden de la longitud de onda ($a \\sim \\lambda$).'
    },
    {
      question: '8. Cuando un pulso en una cuerda se refleja en un extremo firmemente fijo (empotrado), ¿qué ocurre con el pulso reflejado?',
      options: [
        'Se refleja con la misma orientación (en fase, 0°)',
        'Se invierte de cabeza (cambio de fase de 180° o $\\pi$ rad)',
        'Se detiene y es absorbido por completo sin reflejarse',
        'Duplica su amplitud'
      ],
      correct: 1,
      explanation: 'Por la tercera ley de Newton, el soporte ejerce una fuerza de reacción en sentido opuesto hacia abajo, invirtiendo la cresta en un valle.'
    },
    {
      question: '9. Cuando una onda electromagnética pasa del aire al agua (medio más denso ópticamente), ¿qué sucede con sus magnitudes?',
      options: [
        'La frecuencia cambia pero la velocidad y longitud de onda son constantes',
        'La velocidad disminuye, la longitud de onda se acorta y la frecuencia permanece invariable',
        'Todas las magnitudes aumentan al doble',
        'La longitud de onda se alarga y la velocidad se duplica'
      ],
      correct: 1,
      explanation: 'La frecuencia $f$ la define la fuente emisora y es invariante. Al entrar a un medio con mayor índice de refracción $n$, la velocidad disminuye ($v = c/n$) y por tanto $\\lambda = v/f$ se acorta.'
    },
    {
      question: '10. El fenómeno de resonancia ocurre cuando:',
      options: [
        'La frecuencia externa de excitación coincide con la frecuencia natural del sistema oscilatorio',
        'El amortiguamiento es infinito',
        'La velocidad de propagación cae a cero',
        'Las ondas viajan en sentido contrario sin tocarse'
      ],
      correct: 0,
      explanation: 'En resonancia, la transferencia de energía desde la fuerza externa al oscilador es máxima, provocando un notable incremento en la amplitud de oscilación.'
    }
  ];

  let quizCurrentIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  function initQuiz() {
    const qTitle = document.getElementById('quiz-q-title');
    const optionsContainer = document.getElementById('quiz-options-container');
    const explanationBox = document.getElementById('quiz-explanation');
    const btnNext = document.getElementById('btn-quiz-next');
    const stepCount = document.getElementById('quiz-step-count');
    const liveScore = document.getElementById('quiz-live-score');
    const finalBox = document.getElementById('quiz-final');
    const mainBox = document.getElementById('quiz-main');
    const btnRestart = document.getElementById('btn-quiz-restart');

    if (!qTitle || !optionsContainer) return;

    function renderQuestion(idx) {
      quizAnswered = false;
      const q = QUIZ_QUESTIONS[idx];
      qTitle.textContent = q.question;
      if (stepCount) stepCount.textContent = `Pregunta ${idx + 1} de ${QUIZ_QUESTIONS.length}`;
      if (liveScore) liveScore.textContent = `Aciertos: ${quizScore} / ${idx}`;
      if (explanationBox) {
        explanationBox.style.display = 'none';
        explanationBox.innerHTML = '';
      }
      if (btnNext) btnNext.style.display = 'none';

      optionsContainer.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `<span class="quiz-option-letter">${letters[optIdx]}</span> <span>${optText}</span>`;

        btn.addEventListener('click', () => {
          if (quizAnswered) return;
          quizAnswered = true;

          const allBtns = optionsContainer.querySelectorAll('.quiz-option-btn');
          allBtns.forEach((b, bIdx) => {
            b.disabled = true;
            if (bIdx === q.correct) {
              b.classList.add('correct');
            } else if (bIdx === optIdx) {
              b.classList.add('wrong');
            }
          });

          if (optIdx === q.correct) {
            quizScore++;
            if (explanationBox) {
              explanationBox.style.display = 'block';
              explanationBox.innerHTML = `<strong><i class="fas fa-check-circle" style="color:#059669"></i> ¡Correcto!</strong> ${q.explanation}`;
            }
          } else {
            if (explanationBox) {
              explanationBox.style.display = 'block';
              explanationBox.innerHTML = `<strong><i class="fas fa-times-circle" style="color:#dc2626"></i> Respuesta incorrecta.</strong> ${q.explanation}`;
            }
          }

          if (liveScore) liveScore.textContent = `Aciertos: ${quizScore} / ${idx + 1}`;
          if (btnNext) btnNext.style.display = 'inline-flex';
          renderMath();
        });

        optionsContainer.appendChild(btn);
      });

      renderMath();
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (quizCurrentIndex < QUIZ_QUESTIONS.length - 1) {
          quizCurrentIndex++;
          renderQuestion(quizCurrentIndex);
        } else {
          if (mainBox) mainBox.style.display = 'none';
          if (finalBox) {
            finalBox.style.display = 'flex';
            const grade = ((quizScore / QUIZ_QUESTIONS.length) * 5.0).toFixed(1);
            const pct = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);

            const badgeGrade = document.getElementById('final-grade');
            const badgeDetail = document.getElementById('final-detail');
            const medal = document.getElementById('final-medal');

            if (badgeGrade) badgeGrade.textContent = `Calificación: ${grade} / 5.0`;
            if (badgeDetail) badgeDetail.textContent = `Aciertos: ${quizScore} de 10 (${pct}%)`;

            if (medal) {
              if (grade >= 4.5) {
                medal.innerHTML = '<i class="fas fa-crown" style="color:#f59e0b"></i>';
              } else if (grade >= 3.5) {
                medal.innerHTML = '<i class="fas fa-medal" style="color:#8a7beb"></i>';
              } else {
                medal.innerHTML = '<i class="fas fa-book-reader" style="color:#38bdf8"></i>';
              }
            }
          }
        }
      });
    }

    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        quizCurrentIndex = 0;
        quizScore = 0;
        if (mainBox) mainBox.style.display = 'block';
        if (finalBox) finalBox.style.display = 'none';
        renderQuestion(0);
      });
    }

    renderQuestion(0);
  }

  // =========================================================================
  // 9B. PREGUNTA DIDÁCTICA INTERACTIVA DE LONGITUD DE ONDA (λ)
  // =========================================================================
  function initSpecialLambdaQuestion() {
    const btns = document.querySelectorAll('.lambda-btn');
    const feedbackBox = document.getElementById('lambda-feedback-box');
    if (!btns || btns.length === 0 || !feedbackBox) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => {
          b.classList.remove('correct', 'incorrect');
        });

        const choice = btn.getAttribute('data-choice');
        feedbackBox.classList.remove('show', 'correct', 'incorrect');

        if (choice === 'C') {
          // Respuesta Correcta: 5 cm
          btn.classList.add('correct');
          feedbackBox.className = 'lambda-feedback-box show correct';
          feedbackBox.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; font-weight:800; font-size:0.92rem;">
              <i class="fas fa-circle-check" style="color:#16a34a; font-size:1.1rem;"></i> ¡Excelente deducción! Respuesta correcta: <strong>λ = 5 cm</strong>.
            </div>
            <p>Al comparar la función dada con la ecuación general de una onda armónica unidimensional viajando en dirección positiva (+x):</p>
            <div style="background:rgba(255,255,255,0.85); padding:8px 12px; border-radius:8px; margin:6px 0; font-family:'Fira Code', monospace; font-size:0.84rem; border:1px solid rgba(34,197,94,0.3);">
              Forma estándar: y(x,t) = A · sin[ (2π / λ) · (x - vt) ] <br>
              Ecuación dada:  y(x,t) = 4 · sin[ (2π / 5) · (x - 3t) ]
            </div>
            <ul style="margin:4px 0 0 16px; font-size:0.8rem; line-height:1.45;">
              <li><strong>Longitud de onda:</strong> En el denominador espacial encontramos directamente: <strong>λ = 5 cm</strong>.</li>
              <li><strong>Velocidad de propagación:</strong> El factor multiplicador del tiempo es <strong>v = 3 cm/s</strong>.</li>
              <li><strong>Amplitud:</strong> El coeficiente exterior indica que <strong>A = 4 cm</strong>.</li>
              <li><strong>Frecuencia:</strong> f = v / λ = 3 / 5 = <strong>0.60 Hz</strong>.</li>
              <li><strong>Período:</strong> T = 1 / f = 5 / 3 = <strong>1.67 s</strong>.</li>
            </ul>
          `;
        } else {
          // Respuesta Incorrecta
          btn.classList.add('incorrect');
          feedbackBox.className = 'lambda-feedback-box show incorrect';
          let hint = '';
          if (choice === 'A') {
            hint = 'El valor <strong>3</strong> corresponde a la <strong>velocidad de propagación v = 3 cm/s</strong> (el término que multiplica al tiempo t), no a la longitud de onda espacial.';
          } else if (choice === 'B') {
            hint = 'El valor <strong>4</strong> corresponde a la <strong>amplitud A = 4 cm</strong> (la máxima elongación desde la posición de equilibrio), no a la longitud de onda.';
          } else if (choice === 'D') {
            hint = 'El valor <strong>10 cm</strong> corresponde exactamente a <strong>dos longitudes de onda completas (2λ)</strong>, pero una sola oscilación espacial mide 5 cm.';
          }
          feedbackBox.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; font-weight:800; font-size:0.92rem;">
              <i class="fas fa-circle-xmark" style="color:#dc2626; font-size:1.1rem;"></i> Opción incorrecta (${btn.textContent.trim()}).
            </div>
            <p>${hint}</p>
            <p style="margin-top:4px; font-size:0.78rem; opacity:0.9;"><strong>Pista:</strong> Observa la fracción que acompaña a 2π: <code>(2π / λ)</code>. ¿Qué número divide a 2π?</p>
          `;
        }
        renderMath();
      });
    });
  }

  // =========================================================================
  // 10. MENÚ DRAWER LATERAL (ÍNDICE COMPLETO)
  // =========================================================================
  function initDrawerMenu() {
    const btnToggle = document.getElementById('btn-menu-toggle');
    const drawer = document.getElementById('drawer-menu');
    const backdrop = document.getElementById('drawer-backdrop');
    const btnClose = document.getElementById('btn-drawer-close');
    const searchInput = document.getElementById('drawer-search-input');
    const listContainer = document.getElementById('drawer-list');

    function openDrawer() {
      if (drawer) drawer.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
    }

    function closeDrawer() {
      if (drawer) drawer.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
    }

    if (btnToggle) btnToggle.addEventListener('click', openDrawer);
    if (btnClose) btnClose.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    if (listContainer) {
      listContainer.innerHTML = '';
      SPREADS.forEach(s => {
        // Opción para cada página del pliego
        s.pages.forEach((pNum, pIdx) => {
          const title = pIdx === 0 ? s.p1 : s.p2;
          const li = document.createElement('li');
          li.className = 'drawer-item';
          li.dataset.page = pNum;
          li.innerHTML = `<span class="drawer-num">${pNum}</span> <span>${title}</span>`;
          li.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(pNum);
            closeDrawer();
          });
          listContainer.appendChild(li);
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.drawer-item').forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(term) ? 'flex' : 'none';
        });
      });
    }
  }

  // =========================================================================
  // 11. CONTROLES DE NAVEGACIÓN Y EVENTOS
  // =========================================================================
  function initNavigationControls() {
    // Teclas de flecha
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToSpread(currentSpreadNum + 1, 'next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToSpread(currentSpreadNum - 1, 'prev');
      }
    });

    // Botones de Navbar superior
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => goToSpread(currentSpreadNum - 1, 'prev'));
    if (btnNext) btnNext.addEventListener('click', () => goToSpread(currentSpreadNum + 1, 'next'));

    // Botones de Spread Nav inferior
    const btnSpreadPrev = document.getElementById('btn-spread-prev');
    const btnSpreadNext = document.getElementById('btn-spread-next');
    const spreadSelector = document.getElementById('spread-selector');
    const btnSoundToggle = document.getElementById('btn-sound-toggle');

    if (btnSpreadPrev) btnSpreadPrev.addEventListener('click', () => goToSpread(currentSpreadNum - 1, 'prev'));
    if (btnSpreadNext) btnSpreadNext.addEventListener('click', () => goToSpread(currentSpreadNum + 1, 'next'));

    if (spreadSelector) {
      spreadSelector.addEventListener('change', () => {
        const target = parseInt(spreadSelector.value);
        const dir = target > currentSpreadNum ? 'next' : 'prev';
        goToSpread(target, dir);
      });
    }

    if (btnSoundToggle) {
      btnSoundToggle.addEventListener('click', () => {
        PaperAudio.toggleSound();
      });
    }

    // Botón de Portada "✦ Abrir Cuaderno Interactivo"
    const btnOpen = document.getElementById('btn-open-notebook');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        goToSpread(2, 'next'); // Pasar a Pliego 2 (Págs 3 y 4)
      });
    }

    // Clic en la insignia o nombre en la barra superior para volver al Pliego 1
    const brand = document.querySelector('.nav-brand, .top-bar-brand');
    if (brand) {
      brand.addEventListener('click', (e) => {
        e.preventDefault();
        goToSpread(1, 'prev');
      });
      brand.style.cursor = 'pointer';
    }

    // Inicializar controlador de Pantalla Completa
    FullscreenController.init();
  }

  // =========================================================================
  // 12. CONTROLADOR DE PANTALLA COMPLETA (FULLSCREEN API)
  // =========================================================================
  const FullscreenController = (function() {
    function isFullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }

    function toggleFullscreen() {
      if (!isFullscreen()) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
            fallbackToggleClass();
          });
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else {
          fallbackToggleClass();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.warn('Exit fullscreen failed:', err));
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }

    function fallbackToggleClass() {
      document.body.classList.toggle('is-fullscreen');
      updateUI();
      if (window.PhysicsSims && window.PhysicsSims.triggerResizeAll) {
        setTimeout(() => window.PhysicsSims.triggerResizeAll(), 150);
      }
    }

    function updateUI() {
      const active = isFullscreen() || document.body.classList.contains('is-fullscreen');
      
      const topIcon = document.getElementById('fullscreen-icon');
      const topText = document.getElementById('fullscreen-text');
      const topBtn = document.getElementById('btn-fullscreen-toggle');

      const navIcon = document.getElementById('nav-fullscreen-icon');
      const navBtn = document.getElementById('btn-spread-fullscreen');

      if (topIcon) {
        topIcon.className = active ? 'fas fa-compress' : 'fas fa-expand';
      }
      if (topText) {
        topText.textContent = active ? 'Salir Pantalla Completa' : 'Pantalla Completa';
      }
      if (topBtn) {
        topBtn.title = active ? 'Salir de Pantalla Completa' : 'Pantalla Completa';
      }

      if (navIcon) {
        navIcon.className = active ? 'fas fa-compress' : 'fas fa-expand';
      }
      if (navBtn) {
        navBtn.title = active ? 'Salir de Pantalla Completa' : 'Pantalla Completa';
      }

      if (active) {
        document.body.classList.add('is-fullscreen');
      } else {
        document.body.classList.remove('is-fullscreen');
      }

      if (window.PhysicsSims && window.PhysicsSims.triggerResizeAll) {
        setTimeout(() => window.PhysicsSims.triggerResizeAll(), 80);
        setTimeout(() => window.PhysicsSims.triggerResizeAll(), 300);
      }
    }

    function init() {
      const btnToggle = document.getElementById('btn-fullscreen-toggle');
      const btnSpreadNav = document.getElementById('btn-spread-fullscreen');

      if (btnToggle) {
        btnToggle.addEventListener('click', (e) => {
          e.preventDefault();
          toggleFullscreen();
        });
      }

      if (btnSpreadNav) {
        btnSpreadNav.addEventListener('click', (e) => {
          e.preventDefault();
          toggleFullscreen();
        });
      }

      ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, updateUI);
      });
    }

    return {
      init,
      toggleFullscreen,
      isFullscreen,
      updateUI
    };
  })();

  // =========================================================================
  // INICIALIZACIÓN GLOBAL AL CARGAR EL DOCUMENTO
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    PaperAudio.updateSoundUI();
    initDrawerMenu();
    initNavigationControls();
    initRippleEffect();
    initToneGenerator();
    initWaveCalculator();
    initExercises();
    initQuiz();
    initSpecialLambdaQuestion();

    if (window.PhysicsSims && window.PhysicsSims.initAll) {
      window.PhysicsSims.initAll();
    }

    applySpreadChange(1);
    ensureMathRendered();
  });

  window.addEventListener('load', () => {
    renderMath();
    if (window.PhysicsSims && window.PhysicsSims.triggerResizeAll) {
      window.PhysicsSims.triggerResizeAll();
    }
  });

})();
