// ===== Hero slider: autoplay every 3 s, segmented progress, pause button =====
(() => {
  const root = document.querySelector('[data-hero-slider]');
  if (!root) return;
  const track = root.querySelector('.hero-slider__track');
  const slides = root.querySelectorAll('.hero-slide');
  const dots = root.querySelectorAll('.hero-slider__progress button');
  const pauseBtn = root.querySelector('.hero-slider__pause');
  const DURATION = 3000;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0, timer = null, paused = reduced;

  root.style.setProperty('--slide-ms', DURATION + 'ms');

  function go(i) {
    index = (i + slides.length) % slides.length;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.style.transform = `translateX(${-index * (slides[0].offsetWidth + gap)}px)`;
    dots.forEach((d, n) => {
      d.classList.remove('is-active', 'is-done');
      void d.offsetWidth; // restart CSS animation
      if (n < index) d.classList.add('is-done');
      if (n === index) d.classList.add('is-active');
      d.setAttribute('aria-current', n === index ? 'true' : 'false');
    });
    slides.forEach((s, n) => s.setAttribute('aria-hidden', n === index ? 'false' : 'true'));
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused) timer = setTimeout(() => go(index + 1), DURATION);
  }
  function setPaused(p) {
    paused = p;
    root.classList.toggle('is-paused', p);
    pauseBtn.setAttribute('aria-pressed', String(p));
    pauseBtn.setAttribute('aria-label', p ? 'Відтворити' : 'Пауза');
    go(index);
  }

  dots.forEach((d, n) => d.addEventListener('click', () => go(n)));
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  window.addEventListener('resize', () => go(index));

  // swipe
  let startX = null;
  root.addEventListener('pointerdown', e => { startX = e.clientX; });
  root.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  setPaused(paused);
})();

// ===== Services slider: arrows scroll the track =====
(() => {
  const track = document.querySelector('[data-services-track]');
  if (!track) return;
  const prev = document.querySelector('.arrow[data-dir="-1"]');
  const next = document.querySelector('.arrow[data-dir="1"]');
  const step = () => track.querySelector('.service-card').offsetWidth + 24;

  function update() {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
  [prev, next].forEach(btn => btn.addEventListener('click', () => {
    track.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: 'smooth' });
  }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ===== Mobile menu =====
(() => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  });
})();

// ===== Language dropdown =====
(() => {
  const btn = document.querySelector('.lang__btn');
  const list = document.querySelector('.lang__list');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    list.hidden = !list.hidden;
    btn.setAttribute('aria-expanded', String(!list.hidden));
  });
  list.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    list.querySelectorAll('li').forEach(x => x.setAttribute('aria-selected', 'false'));
    li.setAttribute('aria-selected', 'true');
    btn.firstChild.textContent = li.textContent + ' ';
    list.hidden = true;
  });
  document.addEventListener('click', () => { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
})();

// ===== Booking form =====
(() => {
  const form = document.querySelector('[data-booking-form]');
  if (!form) return;
  const toggle = form.querySelector('.form__toggle');
  const dt = form.querySelector('#datetime');
  const msg = form.querySelector('.form__msg');
  const phone = form.querySelector('input[name="phone"]');

  toggle.addEventListener('click', () => {
    dt.hidden = !dt.hidden;
    toggle.setAttribute('aria-expanded', String(!dt.hidden));
  });

  // simple phone mask +38 (0XX) XXX XX XX
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('38')) d = d.slice(2);
    d = d.slice(0, 10);
    let out = '+38';
    if (d.length) out += ' (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += ' ' + d.slice(6, 8);
    if (d.length > 8) out += ' ' + d.slice(8, 10);
    phone.value = out;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name;
    const consent = form.elements.consent;
    const phoneOk = phone.value.replace(/\D/g, '').length === 12;
    name.classList.toggle('is-invalid', !name.value.trim());
    phone.classList.toggle('is-invalid', !phoneOk);
    consent.closest('.consent').classList.toggle('is-invalid', !consent.checked);

    if (!name.value.trim() || !phoneOk || !consent.checked) {
      msg.className = 'form__msg is-err';
      msg.textContent = 'Будь ласка, заповніть імʼя, телефон і погодьтеся з політикою конфіденційності.';
      return;
    }
    msg.className = 'form__msg is-ok';
    msg.textContent = 'Дякуємо! Адміністратор зателефонує вам найближчим часом.';
    form.reset();
    dt.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  });
})();
