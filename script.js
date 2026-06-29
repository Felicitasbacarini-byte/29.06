/* ====================================================================
   APEX SIM RACING ACADEMY — script.js
   ==================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initScrollReveal();
  initCounters();
  initSec05Typewriter();
  initSec03Carousel();
  initSec07Wheel();
});

/* ====================================================================
   CURSOR GLOW
   Destello amarillo que sigue al mouse, con efecto extra al pasar
   sobre elementos interactivos (links, botones).
   ==================================================================== */

function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;
  let hasMoved = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      hasMoved = true;
      glowX = mouseX;
      glowY = mouseY;
      glow.classList.add('is-active');
    }
  });

  window.addEventListener('mouseleave', () => {
    glow.classList.remove('is-active');
  });

  window.addEventListener('mouseenter', () => {
    glow.classList.add('is-active');
  });

  // suaviza el movimiento del glow respecto al cursor real
  function animateGlow() {
    glowX += (mouseX - glowX) * 0.18;
    glowY += (mouseY - glowY) * 0.18;
    glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  requestAnimationFrame(animateGlow);

  // estado "hover" sobre elementos clickeables
  const interactiveEls = document.querySelectorAll('a, button, .btn');
  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => glow.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => glow.classList.remove('is-hover'));
  });
}

/* ====================================================================
   SCROLL REVEAL
   Los elementos marcados con [data-reveal] aparecen con fade + slide
   a medida que entran en el viewport.
   ==================================================================== */

function initScrollReveal() {
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!revealEls.length) return;

  // En el hero, mostramos el contenido apenas carga la página
  // (no requiere scroll, ya que está visible desde el inicio).
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach((el) => observer.observe(el));

  // Disparo inmediato para el contenido del hero (above the fold)
  requestAnimationFrame(() => {
    const heroReveals = document.querySelectorAll('.hero [data-reveal]');
    heroReveals.forEach((el) => el.classList.add('is-visible'));
  });
}

/* ====================================================================
   CONTADORES ANIMADOS
   Los números de stats (+120, +3110, +500) cuentan desde 0 hasta su
   valor final a medida que entran en el viewport, con una animación
   lenta y desacelerada (ease-out).
   ==================================================================== */

function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  const DURATION = 2600; // ms — animación lenta, según lo pedido

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count-to'), 10);
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(eased * target);
      el.textContent = '+' + current.toLocaleString('es-AR');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = '+' + target.toLocaleString('es-AR');
      }
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ====================================================================
   SECCIÓN 05 — FRASE (efecto letra por letra)
   Cada carácter de la frase se envuelve en un span individual con
   un transition-delay creciente. La clase "is-visible" en el
   contenedor dispara la revelación de todos los spans en cascada.
   A diferencia de los demás reveals del sitio, ESTE se repite cada
   vez que la sección entra o sale del viewport (no usa unobserve).
   ==================================================================== */

function initSec05Typewriter() {
  const frase = document.querySelector('[data-typewriter]');
  if (!frase) return;

  const DELAY_STEP = 18; // ms entre letra y letra

  // Envuelve cada carácter de texto en un span.sec05__char, agrupando
  // las letras de cada palabra dentro de un span.sec05__word (con
  // white-space: nowrap) para que el navegador nunca corte la línea
  // en medio de una palabra. Los espacios quedan como chars sueltos
  // entre palabras, que es donde sí puede saltar de línea.
  // Preserva los <span class="sec05__highlight"> ya presentes.
  function wrapChars(node) {
    let charIndex = 0;

    function makeChar(ch) {
      const span = document.createElement('span');
      span.className = 'sec05__char';
      span.textContent = ch;
      span.style.transitionDelay = `${charIndex * DELAY_STEP}ms`;
      charIndex += 1;
      return span;
    }

    function walk(node) {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          // separa el texto en palabras y espacios, conservando ambos
          const tokens = child.textContent.split(/( +)/).filter((t) => t.length);

          tokens.forEach((token) => {
            if (token.trim() === '') {
              // espacio(s): un char suelto por cada uno
              token.split('').forEach((ch) => fragment.appendChild(makeChar(ch)));
            } else {
              // palabra: agrupada en un span que no se puede cortar
              const wordSpan = document.createElement('span');
              wordSpan.className = 'sec05__word';
              token.split('').forEach((ch) => wordSpan.appendChild(makeChar(ch)));
              fragment.appendChild(wordSpan);
            }
          });

          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          // elementos como .sec05__highlight: se procesan recursivamente
          // para que sus letras también queden individualizadas, pero
          // siguen contando dentro de la misma secuencia de delays.
          walk(child);
        }
      });
    }

    walk(node);
  }

  wrapChars(frase);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(frase);
}
/* ====================================================================
   SECCIÓN 03 — LOS TRES PILARES (carrusel)
   Una tarjeta queda "activa" (expandida) por vez. Las flechas prev/next
   rotan el índice activo en loop; los dots reflejan cuál está activa.
   ==================================================================== */

function initSec03Carousel() {
  const track = document.querySelector('[data-sec03-track]');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('[data-sec03-card]'));
  const dots = Array.from(document.querySelectorAll('[data-sec03-dot]'));
  const prevBtn = document.querySelector('[data-sec03-prev]');
  const nextBtn = document.querySelector('[data-sec03-next]');

  let activeIndex = cards.findIndex((card) => card.classList.contains('is-active'));
  if (activeIndex === -1) activeIndex = 0;

  function setActive(index) {
    const total = cards.length;
    const normalized = ((index % total) + total) % total; // soporta índices negativos
    activeIndex = normalized;

    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === activeIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === activeIndex);
    });
  }

  // tocar una tarjeta colapsada también la activa
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== activeIndex) setActive(i);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => setActive(activeIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => setActive(activeIndex + 1));
  }

  setActive(activeIndex);
}
/* ====================================================================
   SECCIÓN 07 — TECNOLOGÍA (viaje del volante hacia el centro)
   El volante arranca con el tamaño/posición de ".sec07__wheel-slot"
   (chico, al lado del texto, dentro del flujo normal del documento).
   A medida que ese slot se acerca y empieza a salir del viewport por
   arriba (scrolleando hacia abajo), el volante "fixed" toma el relevo
   visual: se interpola desde la posición que el slot tenía en ese
   instante hacia el centro de la pantalla, agrandándose. Es scroll
   100% libre (sin pin/sticky): el progreso se deriva directamente de
   cuánto se desplazó el slot respecto a su posición de reposo.
   ==================================================================== */

function initSec07Wheel() {
  const wrap = document.querySelector('[data-sec07-wheel]');
  const slot = document.querySelector('[data-sec07-slot]');
  if (!wrap || !slot) return;

  const ASPECT_RATIO = 805 / 463;

  // cuántos px de scroll hace falta recorrer (desde que el slot
  // empieza a salir por arriba) para completar el viaje al 100%
  const TRAVEL_DISTANCE = 700;

  let ticking = false;

  // posición/tamaño de reposo del slot en coordenadas de DOCUMENTO,
  // medidos una sola vez (load/resize), nunca durante el scroll.
  let slotDocTop = 0;
  let slotDocLeft = 0;
  let slotWidth = 0;

  function measure() {
    const r = slot.getBoundingClientRect();
    slotDocTop = r.top + window.scrollY;
    slotDocLeft = r.left + window.scrollX;
    slotWidth = r.width;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function update() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // posición del slot relativa al viewport EN ESTE INSTANTE —válido
    // usar el scroll actual aquí porque es solo para saber cuánto ya
    // se "comió" el scroll respecto al reposo, no como posición final.
    const slotViewportTop = slotDocTop - window.scrollY;

    // el viaje arranca cuando el slot está a punto de tocar el techo
    // del viewport (slotViewportTop llega a ~0) y avanza durante
    // TRAVEL_DISTANCE px de scroll adicional.
    const progressRaw = -slotViewportTop / TRAVEL_DISTANCE;
    const progress = Math.min(Math.max(progressRaw, 0), 1);
    const eased = easeInOutCubic(progress);

    // estado inicial fijo: tal como estaba el slot en el instante en
    // que progress=0 (es decir, slotViewportTop≈0) — su X no cambia
    // con el scroll (solo Y se mueve verticalmente con el documento),
    // así que slotDocLeft - scrollX da directamente su X en viewport.
    const startWidth = slotWidth;
    const startLeft = slotDocLeft - window.scrollX;
    const startTop = 0; // por definición, el viaje arranca cuando el slot toca y=0

    // estado final: centrado en pantalla, más grande
    const endWidth = Math.min(vw * 0.42, 620);
    const endHeight = endWidth / ASPECT_RATIO;
    const endLeft = (vw - endWidth) / 2;
    const endTop = Math.max((vh - endHeight) / 2, vh * 0.14);

    const currentWidth = startWidth + (endWidth - startWidth) * eased;
    const currentLeft = startLeft + (endLeft - startLeft) * eased;
    const currentTop = startTop + (endTop - startTop) * eased;

    wrap.style.width = `${currentWidth}px`;
    wrap.style.left = `${currentLeft}px`;
    wrap.style.top = `${currentTop}px`;

    // cross-fade simple: apenas progress > 0 (el slot real empezó a
    // salir de pantalla), el wrap fixed se hace visible y el slot
    // real se oculta, evitando un duplicado visual del volante.
    const showFixed = progress > 0.001;
    wrap.style.opacity = showFixed ? '1' : '0';
    slot.style.opacity = showFixed ? '0' : '1';

    // las zonas de hover solo responden una vez que el volante llegó
    // (o casi) a su tamaño final
    wrap.classList.toggle('is-interactive', progress > 0.92);

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function onResize() {
    measure();
    onScroll();
  }

  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  // font-display: swap (usado para Victor Mono embebida en base64) puede
  // re-flowear el texto DESPUÉS del load inicial, cuando la fuente real
  // termina de descargar/parsear — eso cambia la altura de las secciones
  // anteriores y deja "vieja" la medición de measure(). Re-medimos apenas
  // las fuentes están listas, y de nuevo tras un pequeño margen extra por
  // si hay un reflow de último momento (imágenes grandes, layout shift).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      measure();
      update();
    });
  }
  window.addEventListener('load', () => {
    measure();
    update();
    setTimeout(() => { measure(); update(); }, 300);
  });

  update();
}