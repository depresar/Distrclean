/* Дистрклин — скрипты страницы */
(function () {
  'use strict';

  var mqMobile = window.matchMedia('(max-width: 760px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка: тень при скролле + мобильное меню ---------- */
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 20); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mobile-menu');
  var setMenu = function (open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
  };
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  /* ---------- Обложка: видео для ПК / телефона ---------- */
  var heroVideo = document.querySelector('.hero__video');
  var heroMode = null;
  var setHeroVideo = function () {
    var mode = mqMobile.matches ? 'mobile' : 'desktop';
    if (mode === heroMode) return;
    heroMode = mode;
    heroVideo.poster = mode === 'mobile' ? heroVideo.dataset.posterMobile : 'assets/video/hero-desktop.jpg';
    heroVideo.src = heroVideo.dataset[mode];
    if (!reduceMotion) {
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () {});
    }
  };
  setHeroVideo();
  mqMobile.addEventListener('change', setHeroVideo);

  /* ---------- Анимация цифр на обложке ---------- */
  var counters = document.querySelectorAll('[data-count]');
  var fmt = function (v, dec) {
    var s = v.toFixed(dec).replace('.', ',');
    var parts = s.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    return parts.join(',');
  };
  function runCounters() {
    counters.forEach(function (el, i) {
      var to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
      var dur = 1600 + i * 150, t0 = null;
      el.textContent = fmt(0, dec);
      var step = function (t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - k, 3); // плавное замедление в конце
        el.textContent = fmt(to * e, dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  if (!reduceMotion && counters.length) {
    var statsEl = document.querySelector('.stats');
    new IntersectionObserver(function (en, obs) {
      if (en[0].isIntersecting) { setTimeout(runCounters, 250); obs.disconnect(); }
    }, { threshold: 0.4 }).observe(statsEl);
  }

  /* ---------- Направления (вкладки с видео) ---------- */
  var SECTORS = [
    {
      title: 'Государственные заказчики, заказчики федерального назначения',
      short: 'Госзаказчики',
      video: 'gov',
      items: [
        ['Сопровождение закупок', 'участие в сфере закупок zakupki.gov.ru по 44-ФЗ и 223-ФЗ: подготовка пакета документов для участия в тендерах на заданный результат.'],
        ['Поставки для госнужд', 'оперативные поставки химии по госконтрактам. Соответствие техрегламентам.'],
        ['Внедрение и сервис', 'пусконаладка и постоянная техподдержка на объектах.'],
        ['Финансовые гарантии', 'обеспечение исполнения контрактов, подтверждённое большой базой исполненных контрактов заказчиков федерального значения.']
      ]
    },
    {
      title: 'Лечебные учреждения любого профиля',
      short: 'Лечебные учреждения',
      video: 'medical',
      items: [
        ['Стерильность текстиля', 'поставка средств с автоматической дозировкой для стирки белья в ЛПУ. Обработка по режимам подтверждённой термохимической дезинфекции.'],
        ['Автоматизация прачечных', 'внедрение точного дозирования для стирки больничного текстиля. Соответствие нормам СанПиН.'],
        ['Санэпидконтроль', 'поверхностей и зон пациентов за счёт цветовой кодировки и подобранных комплектов моющих и дезинфицирующих средств.'],
        ['Пищеблок и питание', 'эффективные готовые решения для пищеблока больничного направления и их финансовая оценка под специфику заказчика.'],
        ['Сервис оборудования', 'регулярный сервис, обучение персонала и калибровка дозаторов.'],
        ['Документация', 'подготовка технической документации, включая описание закупки, с учётом последних изменений федеральных законов РФ.']
      ]
    },
    {
      title: 'Пищевые, перерабатывающие, добывающие производства',
      short: 'Пищевые производства',
      video: 'food',
      items: [
        ['Автоматизация санитарной обработки', 'внедрение систем дозирования для оборудования и линий. Исключаем человеческий фактор, гарантируем стабильность обработки.'],
        ['Сопровождение CIP-моек', 'настройка автоматических станций подачи химии для безразборной мойки. Обеспечиваем соответствие СанПиН.'],
        ['Контроль качества мойки', 'лабораторный контроль остаточных средств на поверхностях. Подтверждаем безопасность продукции.'],
        ['Продление срока годности', 'продукта за счёт термической и термохимической дезинфекции: ежемесячный и ежеквартальный срез заданной концентрации с подтверждающими актами сервисной группы.']
      ]
    },
    {
      title: 'Отели, гостиницы, санатории, детские сады',
      short: 'Отели и санатории',
      video: 'hotels',
      items: [
        ['Стирка текстиля', 'технологические программы моющих процессов для сохранности, мягкости и эталонной белизны постельного белья и полотенец.'],
        ['Дезинфекция помещений', 'автоматизированные 4-компонентные решения для номеров, зон общего пользования и пищеблоков.'],
        ['Гигиена персонала и гостей', 'оснащение входных групп и санитарных комнат дозаторами с дезсредствами и антисептиками.'],
        ['Сервисное обслуживание', 'регулярный сервис, консультации, минимизация рисков поломок. Оперативное реагирование 24/7.']
      ]
    },
    {
      title: 'Коммерческие химчистки и промышленные прачечные',
      short: 'Химчистки и прачечные',
      video: 'laundry',
      items: [
        ['Интеллектуальное дозирование', 'цифровые системы отчётности и статистики ресурсов для фронтальных машин и туннельных линий. Исключение ошибок персонала.'],
        ['Производственный сервис', 'обслуживание дозирующего оборудования, диагностика и калибровка насосов. Предотвращаем простои.'],
        ['Химический анализ', 'подбор, адаптация и экспресс-тестирование рецептур стирки под ваши задачи. Оптимизируем расход на килограмм белья.'],
        ['Аудит и запуск', 'выездная диагностика, настройка программ по коротким циклам, обучение персонала и ввод линий под ключ.'],
        ['Лабораторный контроль', 'проверка остаточных моющих средств, оценка белизны и сохранности тканей.'],
        ['Нестандартные подходы', 'программа «всё включено» и оплата за выработанную условную единицу объёма товара заказчика.']
      ]
    },
    {
      title: 'Фитнес и SPA-комплексы',
      short: 'Фитнес и SPA',
      video: 'fitness',
      items: [
        ['Гигиена персонала и посетителей', 'оснащение раздевалок и душевых дозаторами с дезсредствами.'],
        ['Стирка текстиля', 'химия для стирки полотенец, халатов и банного текстиля. Сохранность тканей при интенсивной эксплуатации.'],
        ['Автоматизация дозирования', 'точная подача средств для всех зон комплекса: прачечная, кафе, душевые, бассейны, санузлы.'],
        ['Сопровождение клининга', 'аудит и поддержка процессов уборки и дезинфекции.']
      ]
    },
    {
      title: 'Клининговые компании',
      short: 'Клининговые компании',
      video: 'cleaning',
      items: [
        ['Автоматизация клининга', 'оснащение объектов системами дозирования для всех видов уборки: локальной, ежедневной, генеральной. Точность и экономия.'],
        ['Сопровождение решений', 'аудит и поддержка процессов уборки для высоких стандартов чистоты.'],
        ['Пусконаладка и сервис', 'монтаж, настройка оборудования и регулярное обслуживание. Минимизируем простои.']
      ]
    }
  ];

  var root = document.querySelector('[data-sectors]');
  var tabsEl = root.querySelector('.sectors__tabs');
  var video = root.querySelector('.sectors__video video');
  var counter = root.querySelector('.sectors__counter');
  var content = root.querySelector('.sectors__content');
  var titleEl = root.querySelector('.sectors__title');
  var listEl = root.querySelector('.checks');
  var cta = root.querySelector('[data-sector-cta]');
  var current = -1;
  var autoTimer = null;
  var AUTO_MS = 12000;

  var esc = function (s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };

  SECTORS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.setAttribute('role', 'tab');
    b.innerHTML = '<span class="tab__num">' + String(i + 1).padStart(2, '0') + '</span><span>' + esc(s.short) + '</span><span class="tab__bar"></span>';
    b.addEventListener('click', function () { root.classList.add('is-manual'); stopAuto(); select(i); });
    tabsEl.appendChild(b);
  });
  var tabs = tabsEl.querySelectorAll('.tab');
  root.style.setProperty('--dur', AUTO_MS + 'ms');

  function select(i, fromAuto) {
    if (i === current) return;
    current = i;
    var s = SECTORS[i];
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    if (!fromAuto && tabsEl.scrollWidth > tabsEl.clientWidth) {
      tabsEl.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: 'smooth' });
    }

    video.classList.add('is-loading');
    video.poster = 'assets/video/' + s.video + '.jpg';
    video.src = 'assets/video/' + s.video + '.mp4';
    video.preload = 'auto';
    if (inView && !reduceMotion) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }

    counter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(SECTORS.length).padStart(2, '0');
    titleEl.textContent = s.title;
    listEl.innerHTML = s.items.map(function (it) { return '<li><span><b>' + esc(it[0]) + ':</b> ' + esc(it[1]) + '</span></li>'; }).join('');
    cta.dataset.sector = s.title;
    content.classList.remove('is-swapping'); void content.offsetWidth; content.classList.add('is-swapping');
    if (autoTimer) restartAuto();
  }
  video.addEventListener('loadeddata', function () { video.classList.remove('is-loading'); });

  // Клавиатура по вкладкам
  tabsEl.addEventListener('keydown', function (e) {
    var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    root.classList.add('is-manual'); stopAuto();
    var n = (current + d + SECTORS.length) % SECTORS.length;
    select(n); tabs[n].focus();
  });

  // Автопереключение, пока блок на экране и пользователь не выбрал вкладку сам
  function restartAuto() {
    stopAuto();
    if (root.classList.contains('is-manual') || reduceMotion) return;
    autoTimer = setTimeout(function () { select((current + 1) % SECTORS.length, true); }, AUTO_MS);
  }
  function stopAuto() { clearTimeout(autoTimer); autoTimer = null; }

  var inView = false;
  new IntersectionObserver(function (entries) {
    inView = entries[0].isIntersecting;
    if (inView) {
      root.classList.remove('is-paused');
      if (!reduceMotion) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      restartAuto();
    } else {
      root.classList.add('is-paused');
      video.pause(); stopAuto();
    }
  }, { threshold: 0.35 }).observe(root);

  // Одинаковая высота блока для всех отраслей — чтобы при переключении ничего не прыгало
  function equalizeHeight() {
    content.style.minHeight = '';
    var saved = [titleEl.textContent, listEl.innerHTML], max = 0;
    SECTORS.forEach(function (s) {
      titleEl.textContent = s.title;
      listEl.innerHTML = s.items.map(function (it) { return '<li><span><b>' + esc(it[0]) + ':</b> ' + esc(it[1]) + '</span></li>'; }).join('');
      max = Math.max(max, content.offsetHeight);
    });
    titleEl.textContent = saved[0]; listEl.innerHTML = saved[1];
    content.style.minHeight = max + 'px';
  }

  select(0);
  equalizeHeight();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(equalizeHeight, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalizeHeight);

  // Ссылки вида index.html#sector-3 (из поиска и подвала) открывают нужную отрасль
  function openSectorFromHash() {
    var m = /^#sector-(\d+)$/.exec(location.hash);
    if (!m) return;
    var i = Math.min(Math.max(+m[1] - 1, 0), SECTORS.length - 1);
    root.classList.add('is-manual'); stopAuto(); select(i);
    document.getElementById('clients').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  window.addEventListener('hashchange', openSectorFromHash);
  openSectorFromHash();

  // Ссылки из подвала на конкретную отрасль
  document.querySelectorAll('[data-goto-sector]').forEach(function (a) {
    a.addEventListener('click', function () { root.classList.add('is-manual'); stopAuto(); select(+a.dataset.gotoSector); });
  });

  /* ---------- Кнопка «Подобрать решение» в отрасли → форма ---------- */
  var form = document.querySelector('.form');
  var sectorBox = form.querySelector('.form__sector');
  cta.addEventListener('click', function () {
    form.elements.sector.value = cta.dataset.sector || '';
    sectorBox.innerHTML = 'Направление: <b></b>';
    sectorBox.querySelector('b').textContent = cta.dataset.sector || '';
    sectorBox.hidden = !cta.dataset.sector;
    setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, 600);
  });

  // Пришли из каталога с кнопки «Запросить цену»: index.html?product=...#contact
  var fromProduct = new URLSearchParams(location.search).get('product');
  if (fromProduct) {
    form.elements.sector.value = 'Товар: ' + fromProduct;
    sectorBox.innerHTML = 'Товар: <b></b>'; sectorBox.querySelector('b').textContent = fromProduct;
    sectorBox.hidden = false;
  }

  /* ---------- Форма ---------- */
  var phone = form.elements.phone;
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '');
    if (!d) { phone.value = ''; return; }
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var r = '+7';
    if (d.length > 1) r += ' (' + d.slice(1, 4);
    if (d.length >= 4) r += ')';
    if (d.length > 4) r += ' ' + d.slice(4, 7);
    if (d.length > 7) r += '-' + d.slice(7, 9);
    if (d.length > 9) r += '-' + d.slice(9, 11);
    phone.value = r;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    var name = form.elements.name, email = form.elements.email, agree = form.elements.agree;
    [name, phone, email].forEach(function (f) { f.classList.remove('is-invalid'); });
    if (!name.value.trim()) { name.classList.add('is-invalid'); ok = false; }
    if (phone.value.replace(/\D/g, '').length !== 11) { phone.classList.add('is-invalid'); ok = false; }
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('is-invalid'); ok = false; }
    if (!agree.checked) ok = false;
    if (!ok) { var bad = form.querySelector('.is-invalid'); if (bad) bad.focus(); return; }

    // TODO: подключить отправку (Tilda-форма, Telegram-бот, почтовый сервис и т.п.)
    form.querySelector('button[type="submit"]').hidden = true;
    form.querySelector('.form__ok').hidden = false;
  });

  /* ---------- Слайдер сертификатов ---------- */
  document.querySelectorAll('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var track = document.querySelector('[data-track="' + btn.dataset.scroll + '"]');
      var item = track.firstElementChild;
      var step = item.getBoundingClientRect().width + 20;
      track.scrollBy({ left: step * +btn.dataset.dir, behavior: 'smooth' });
    });
  });

  /* ---------- Лайтбокс для сертификатов ---------- */
  var lb = document.querySelector('.lightbox');
  var lbBody = lb.querySelector('.lightbox__body');
  var lastFocus = null;
  document.querySelectorAll('.cert__frame').forEach(function (f) {
    f.addEventListener('click', function () {
      lastFocus = f;
      lbBody.innerHTML = '';
      var img = document.createElement('img');
      img.src = f.dataset.full || f.querySelector('img').src;
      img.alt = f.querySelector('img').alt;
      lbBody.appendChild(img);
      lb.hidden = false;
      lb.querySelector('.lightbox__close').focus();
    });
  });
  var closeLb = function () { lb.hidden = true; if (lastFocus) lastFocus.focus(); };
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox__close')) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!lb.hidden) closeLb();
    if (!menu.hidden) setMenu(false);
  });

  /* ---------- Бегущая лента: дублируем группу для бесшовной прокрутки ---------- */
  var mTrack = document.querySelector('.marquee__track');
  var group = mTrack.querySelector('.marquee__group');
  // логотипов мало — удваиваем их внутри группы, чтобы лента была шире любого экрана
  Array.prototype.slice.call(group.children).forEach(function (c) {
    var cl = c.cloneNode(true); cl.setAttribute('aria-hidden', 'true'); group.appendChild(cl);
  });
  // вторая копия группы: анимация сдвигает трек на -50% и бесшовно повторяется
  var copy = group.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); mTrack.appendChild(copy);

  /* ---------- Появление блоков при скролле ---------- */
  var revealEls = document.querySelectorAll('.section .section-head, .offer__card, .cat, .downloads, .about__media, .about__text, .cert, .sectors, .consult');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.classList.add('reveal');
      var sib = el.parentElement.children;
      var idx = Array.prototype.indexOf.call(sib, el);
      el.style.transitionDelay = Math.min(idx, 5) * 70 + 'ms';
      ro.observe(el);
    });
  }

  /* ---------- Cookie ---------- */
  var cookie = document.querySelector('.cookie');
  var cookieOk = false;
  try { cookieOk = localStorage.getItem('cookie-ok') === '1'; } catch (e) {}
  if (!cookieOk) {
    setTimeout(function () { cookie.hidden = false; }, 1500);
    cookie.querySelector('button').addEventListener('click', function () {
      cookie.hidden = true;
      try { localStorage.setItem('cookie-ok', '1'); } catch (e) {}
    });
  }
})();
