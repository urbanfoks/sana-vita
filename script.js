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
  const menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;
  const setOpen = open => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', e => {
    if (e.target.closest('a')) setOpen(false);
    const seg = e.target.closest('.seg__item');
    if (seg) menu.querySelectorAll('.seg__item').forEach(b => {
      b.classList.toggle('is-active', b === seg); b.setAttribute('aria-pressed', String(b === seg));
    });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1180 && !menu.hidden) setOpen(false); });
  // «Передзвоніть мені» з меню веде до форми на сторінці, або на сторінку запису
  menu.querySelectorAll('[data-callback]').forEach(a => {
    if (!document.getElementById('booking')) a.setAttribute('href', 'booking.html');
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

// ===== Phone mask +38 (0XX) XXX XX XX — for every tel input =====
function maskPhone(input) {
  input.addEventListener('input', () => {
    let d = input.value.replace(/\D/g, '');
    if (d.startsWith('38')) d = d.slice(2);
    d = d.slice(0, 10);
    let out = d.length ? '+38' : '';
    if (d.length) out += ' (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += ' ' + d.slice(6, 8);
    if (d.length > 8) out += ' ' + d.slice(8, 10);
    input.value = out;
  });
}
document.querySelectorAll('input[type="tel"]').forEach(maskPhone);

// ===== Booking forms (home, doctor, service, prices, contacts) =====
document.querySelectorAll('[data-booking-form]').forEach(form => {
  const toggle = form.querySelector('.form__toggle');
  const extra = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
  const msg = form.querySelector('.form__msg');
  const phone = form.querySelector('input[name="phone"]');

  const setExtra = open => {
    if (!toggle || !extra) return;
    extra.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    const label = toggle.querySelector('span');
    if (label && toggle.dataset.labelOpen) label.textContent = open ? toggle.dataset.labelOpen : toggle.dataset.labelClosed;
  };
  if (toggle) toggle.addEventListener('click', () => setExtra(extra.hidden));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name;
    const consent = form.elements.consent;
    const nameOk = !name || name.value.trim();
    const phoneOk = phone.value.replace(/\D/g, '').length === 12;
    if (name) name.classList.toggle('is-invalid', !nameOk);
    phone.classList.toggle('is-invalid', !phoneOk);
    if (consent) consent.closest('.consent').classList.toggle('is-invalid', !consent.checked);

    if (!nameOk || !phoneOk || (consent && !consent.checked)) {
      msg.className = 'form__msg is-err';
      msg.textContent = 'Будь ласка, заповніть імʼя, телефон і погодьтеся з політикою конфіденційності.';
      return;
    }
    msg.className = 'form__msg is-ok';
    msg.textContent = 'Дякуємо! Адміністратор зателефонує вам найближчим часом.';
    form.reset();
    setExtra(false);
  });
});

// ===== Prices: section list opens the matching accordion =====
(() => {
  const toc = document.querySelector('.toc');
  if (!toc) return;
  const links = [...toc.querySelectorAll('a')];
  const setActive = id => links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
  links.forEach(a => a.addEventListener('click', () => {
    const acc = document.querySelector(a.getAttribute('href'));
    if (acc) acc.open = true;
    setActive(acc.id);
  }));
  document.querySelectorAll('.acc').forEach(acc => acc.addEventListener('toggle', () => { if (acc.open) setActive(acc.id); }));
  const hash = location.hash && document.querySelector(location.hash + '.acc');
  if (hash) { hash.open = true; setActive(hash.id); }
})();

// ===== Online booking page: doctor → date → time → summary =====
(() => {
  const form = document.querySelector('[data-online-booking]');
  if (!form) return;
  const $ = s => form.querySelector(s);
  const MONTHS = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
  const MONTHS_GEN = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
  const DAYS = ['Неділя','Понеділок','Вівторок','Середа','Четвер','Пʼятниця','Субота'];
  const DOW = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
  const state = { date: null, time: null };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmtDate = d => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;

  // Tabs: doctor / service
  const tabs = form.querySelectorAll('[data-tab]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', String(on)); });
    form.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    updateSummary();
  }));

  // Show all doctors
  const more = $('[data-more]');
  more.addEventListener('click', () => {
    const open = more.getAttribute('aria-expanded') !== 'true';
    form.querySelectorAll('[data-extra]').forEach(el => { el.hidden = !open; });
    more.setAttribute('aria-expanded', String(open));
    more.firstChild.textContent = open ? 'Згорнути список ' : 'Показати всіх лікарів ';
  });

  // Calendar (real current month; Sundays off, past days disabled)
  const grid = $('[data-days]');
  const prev = $('[data-prev]'), next = $('[data-next]');
  function renderCalendar() {
    $('[data-month]').textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    prev.querySelector('img').src = prev.disabled ? 'assets/icons/chev-r-muted.svg' : 'assets/icons/chev-r-dark.svg';
    grid.innerHTML = DOW.map(d => `<span class="cal__dow">${d}</span>`).join('');
    const offset = (view.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) grid.insertAdjacentHTML('beforeend', '<span></span>');
    const last = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const past = date < today, sunday = date.getDay() === 0, isToday = +date === +today;
      const free = !past && !sunday && !isToday;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cal__day'; b.textContent = d;
      if (free) b.classList.add('is-free'); else b.disabled = true;
      if (isToday) b.classList.add('is-today');
      if (state.date && +date === +state.date) b.classList.add('is-selected');
      b.setAttribute('aria-label', `${d} ${MONTHS_GEN[date.getMonth()]}${sunday ? ', вихідний' : ''}`);
      b.addEventListener('click', () => { state.date = date; state.time = null; renderCalendar(); renderSlots(); updateSummary(); });
      grid.appendChild(b);
    }
  }
  prev.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCalendar(); });
  next.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCalendar(); });

  // Time slots
  const slotBtns = form.querySelectorAll('.slots__row button');
  function renderSlots() {
    $('[data-date-label]').textContent = state.date ? fmtDate(state.date) : 'Оберіть дату';
    slotBtns.forEach(b => {
      b.disabled = !state.date || (state.date.getDay() === 6 && b.textContent >= '20:30'); // Сб до 21:00
      b.classList.toggle('is-selected', b.textContent === state.time);
    });
  }
  slotBtns.forEach(b => b.addEventListener('click', () => { state.time = b.textContent; renderSlots(); updateSummary(); }));

  // Summary
  function updateSummary() {
    const svcMode = !form.querySelector('[data-panel="services"]').hidden;
    const doc = form.querySelector('input[name="doctor"]:checked');
    const svc = form.querySelector('input[name="service"]:checked');
    const photoBox = $('[data-sum-photo]').closest('.bk-summary__photo');
    if (svcMode) {
      $('[data-sum-name]').textContent = svc ? svc.value : 'Послугу не обрано';
      $('[data-sum-role]').textContent = 'Лікаря підбере адміністратор';
      $('[data-sum-price]').textContent = svc && svc.dataset.price ? svc.dataset.price : 'уточнить адміністратор';
      photoBox.hidden = true;
    } else if (doc) {
      $('[data-sum-name]').textContent = doc.value;
      $('[data-sum-role]').textContent = doc.dataset.role;
      $('[data-sum-price]').textContent = doc.dataset.price;
      $('[data-sum-photo]').src = doc.dataset.photo;
      photoBox.hidden = false;
    }
    $('[data-sum-date]').textContent = state.date ? fmtDate(state.date) : '—';
    $('[data-sum-time]').textContent = state.time || '—';
  }
  form.addEventListener('change', e => { if (e.target.name === 'doctor' || e.target.name === 'service') updateSummary(); });

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('.form__msg');
    const name = form.elements.name, phone = form.elements.phone, consent = form.elements.consent;
    const phoneOk = phone.value.replace(/\D/g, '').length === 12;
    name.classList.toggle('is-invalid', !name.value.trim());
    phone.classList.toggle('is-invalid', !phoneOk);
    consent.closest('.consent').classList.toggle('is-invalid', !consent.checked);
    const missing = [];
    if (!state.date) missing.push('дату');
    if (!state.time) missing.push('час');
    if (!name.value.trim()) missing.push('імʼя');
    if (!phoneOk) missing.push('телефон');
    if (!consent.checked) missing.push('згоду з політикою конфіденційності');
    if (missing.length) {
      msg.className = 'form__msg is-err';
      msg.textContent = 'Будь ласка, вкажіть: ' + missing.join(', ') + '.';
      return;
    }
    msg.className = 'form__msg is-ok';
    msg.textContent = `Дякуємо! Запис: ${fmtDate(state.date).toLowerCase()}, ${state.time}. Адміністратор зателефонує для підтвердження.`;
  });

  renderCalendar(); renderSlots(); updateSummary();
})();
