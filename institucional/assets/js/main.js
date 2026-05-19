/* Ateliê Moema — interactions */
(function () {
  'use strict';

  /* ---------- Sticky header + hide on scroll down ---------- */
  const header = document.getElementById('site-header');
  let lastY = 0;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-stuck', y > 20);
      if (y > 300 && y > lastY + 4) {
        header.classList.add('is-hidden');
      } else if (y < lastY - 4) {
        header.classList.remove('is-hidden');
      }
    }
    const btt = document.getElementById('back-to-top');
    if (btt) btt.classList.toggle('is-visible', y > 600);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Offcanvas ---------- */
  const toggle = document.getElementById('menu-toggle');
  const offcanvas = document.getElementById('offcanvas');
  const backdrop = document.getElementById('offcanvas-backdrop');
  const closeBtn = document.getElementById('offcanvas-close');

  function openCanvas() {
    if (!offcanvas) return;
    offcanvas.classList.add('is-open');
    offcanvas.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeCanvas() {
    if (!offcanvas) return;
    offcanvas.classList.remove('is-open');
    offcanvas.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  toggle && toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    open ? closeCanvas() : openCanvas();
  });
  closeBtn && closeBtn.addEventListener('click', closeCanvas);
  backdrop && backdrop.addEventListener('click', closeCanvas);
  // close on link click
  offcanvas && offcanvas.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setTimeout(closeCanvas, 100));
  });
  // esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCanvas();
  });

  /* ---------- Counter animation (odometer-like) ---------- */
  const counters = document.querySelectorAll('.counter-num[data-target]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const start = performance.now();
        function step(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = Math.round(target * eased);
          el.textContent = value.toLocaleString('pt-BR') + suffix;
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---------- Scroll-in animations ---------- */
  const animatedSelectors = [
    '.hero-copy', '.hero-visual',
    '.about-intro-head', '.about-intro-gallery',
    '.specialty-card', '.team-card',
    '.mission-copy', '.mission-visual',
    '.clinic-feature', '.cta-facetas-img', '.cta-facetas-copy',
    '.doctor-portrait', '.doctor-copy',
    '.big-counter-img', '.big-counter-card', '.big-counter-copy',
    '.testimonial-card',
    '.section-head'
  ];
  const targets = document.querySelectorAll(animatedSelectors.join(','));
  targets.forEach((el, i) => {
    el.classList.add('scroll-in');
    el.style.transitionDelay = (i % 4) * 60 + 'ms';
  });
  const inObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        inObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => inObserver.observe(el));

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('testimonial-track');
  if (track) {
    const cards = track.querySelectorAll('.testimonial-card');
    const dotsHost = document.getElementById('slider-dots');
    const prev = document.querySelector('.slider-prev');
    const next = document.querySelector('.slider-next');
    let idx = 0;
    let autoTimer = null;

    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
      b.addEventListener('click', () => goTo(i));
      dotsHost.appendChild(b);
    });
    const dots = dotsHost.querySelectorAll('button');

    function update() {
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }
    function goTo(i) {
      idx = (i + cards.length) % cards.length;
      update();
      restartAuto();
    }
    function nextSlide() { goTo(idx + 1); }
    function prevSlide() { goTo(idx - 1); }
    prev && prev.addEventListener('click', prevSlide);
    next && next.addEventListener('click', nextSlide);
    function restartAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 7000);
    }
    update();
    restartAuto();
    // pause on hover
    const slider = document.getElementById('testimonial-slider');
    slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
    slider.addEventListener('mouseleave', restartAuto);
  }

  /* ---------- Smooth-scroll for anchors with sticky offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
