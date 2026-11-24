/* Дистрклин — поиск по сайту (в шапке)
   Чтобы добавить товары: допишите их в массив INDEX с type: 'Товар'.
   keys — дополнительные слова, по которым товар должен находиться. */
(function () {
  'use strict';

  var onCatalog = /catalog\.html$/.test(location.pathname);
  var home = onCatalog ? 'index.html' : '';
  var cat = onCatalog ? '' : 'catalog.html';

  var INDEX = [
    // Разделы каталога
    { type: 'Каталог', title: 'Комбо-наборы', url: cat + '#combo', keys: 'комбо набор комбо-набор комплект выгода a1 pro стирка' },
    { type: 'Каталог', title: 'Дезоксид', url: cat + '#dezoksid', keys: 'дезоксид перекись водорода дезинфекция дезинфицирующее дезсредство дезинбак хит продаж' },
    { type: 'Каталог', title: 'Seko — дозирующее оборудование', url: cat + '#seko', keys: 'seko секо насос дозирующий дозатор дозирование пенная станция пеногенератор оборудование станция' },
    { type: 'Каталог', title: 'Novelhim', url: cat + '#novelhim', keys: 'novelhim новелхим ng caus foam outspot glass моющее концентрат усилитель стирки пятновыводитель' },
    { type: 'Каталог', title: 'Ecolab', url: cat + '#ecolab', keys: 'ecolab эколаб cinalab синалаб topax toprinse моющее' },
    { type: 'Каталог', title: 'Разное и аксессуары', url: cat + '#misc', keys: 'разное аксессуары a1 pro ariel ариэль стирка порошок жидкое средство для стирки усилитель стирки' },
    { type: 'Каталог', title: 'Каталоги в PDF — скачать', url: cat + '#downloads', keys: 'pdf каталог скачать прайс' },

    // Отрасли
    { type: 'Отрасль', title: 'Государственные заказчики', url: home + '#sector-1', keys: 'госзаказ тендер 44-фз 223-фз закупки госконтракт федеральные' },
    { type: 'Отрасль', title: 'Лечебные учреждения (ЛПУ)', url: home + '#sector-2', keys: 'лпу больница медицина клиника санпин стирка белья дезинфекция' },
    { type: 'Отрасль', title: 'Пищевые производства', url: home + '#sector-3', keys: 'пищевые перерабатывающие добывающие производство cip мойка санитарная обработка' },
    { type: 'Отрасль', title: 'Отели, санатории, детские сады', url: home + '#sector-4', keys: 'отель гостиница санаторий детский сад horeca хорека белье полотенца' },
    { type: 'Отрасль', title: 'Химчистки и прачечные', url: home + '#sector-5', keys: 'химчистка прачечная стирка туннельные линии фронтальные машины' },
    { type: 'Отрасль', title: 'Фитнес и SPA-комплексы', url: home + '#sector-6', keys: 'фитнес спа spa бассейн душевые раздевалки' },
    { type: 'Отрасль', title: 'Клининговые компании', url: home + '#sector-7', keys: 'клининг уборка генеральная ежедневная' },

    // Страницы и разделы
    { type: 'Раздел', title: 'О компании', url: home + '#about', keys: 'компания дистрклин о нас' },
    { type: 'Раздел', title: 'Дипломы и сертификаты', url: home + '#awards', keys: 'сертификат диплом достижения дистрибьютор свидетельство' },
    { type: 'Раздел', title: 'Что мы предлагаем', url: home + '#offer', keys: 'услуги автоматизация техподдержка сервис оптимизация затрат' },
    { type: 'Раздел', title: 'Контакты и заявка', url: home + '#contact', keys: 'контакты телефон почта заявка консультация адрес' }
  ];

  // Товары из каталога (js/products.js)
  var CATN = {}; (window.CATEGORIES || []).forEach(function (c) { CATN[c.id] = c.name; });
  (window.PRODUCTS || []).forEach(function (p) {
    INDEX.push({ type: 'Товар', title: p.name, url: cat + '#p-' + p.id, keys: (p.keys || '') + ' ' + p.desc + ' ' + (CATN[p.cat] || ''), img: p.img });
  });

  var norm = function (s) { return s.toLowerCase().replace(/ё/g, 'е').replace(/[«»"'.,:;()!?]/g, ' '); };
  // грубый «стемминг»: сравниваем начала слов, чтобы «насоса», «насосы» находили «насос»
  var stem = function (w) { return w.length > 5 ? w.slice(0, w.length - 2) : w; };

  INDEX.forEach(function (it) { it._hay = norm(it.title + ' ' + it.keys); });

  function search(q) {
    var words = norm(q).split(/\s+/).filter(function (w) { return w.length > 1; }).map(stem);
    if (!words.length) return [];
    return INDEX.map(function (it) {
      var score = 0;
      words.forEach(function (w) {
        if (it._hay.indexOf(w) !== -1) score += norm(it.title).indexOf(w) !== -1 ? 3 : 1;
      });
      var all = words.every(function (w) { return it._hay.indexOf(w) !== -1; });
      return { it: it, score: (all ? score + 10 : (words.length > 1 ? 0 : score)) + (all && it.type === 'Товар' ? 1 : 0) };
    }).filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8)
      .map(function (r) { return r.it; });
  }

  var panel = document.getElementById('search-panel');
  if (!panel) return;
  var openBtn = document.querySelector('[data-search-open]');
  var input = panel.querySelector('.search__input');
  var list = panel.querySelector('.search__results');
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function render() {
    var q = input.value.trim();
    if (!q) { list.innerHTML = ''; return; }
    var res = search(q);
    if (!res.length) {
      list.innerHTML = '<li class="search__empty">По запросу «' + esc(q) + '» ничего не нашлось. <a href="' + home + '#contact" data-search-go>Оставьте заявку</a> — подберём под вашу задачу.</li>';
      return;
    }
    list.innerHTML = res.map(function (it) {
      var pic = it.img ? '<img class="search__pic" src="assets/img/products/' + it.img + '-sm.webp" alt="" loading="lazy">' : '<span class="search__type">' + it.type + '</span>';
      return '<li><a class="search__item" href="' + it.url + '" data-search-go>' + pic + '<span class="search__title">' + esc(it.title) + '</span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></li>';
    }).join('');
  }

  function open() {
    panel.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    panel.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
  }

  openBtn.addEventListener('click', function () { panel.hidden ? open() : close(); });
  panel.querySelector('[data-search-close]').addEventListener('click', close);
  input.addEventListener('input', render);
  panel.querySelectorAll('.search__chip').forEach(function (c) {
    c.addEventListener('click', function () { input.value = c.textContent; render(); input.focus(); });
  });
  panel.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var first = list.querySelector('a');
    if (first) first.click();
  });
  list.addEventListener('click', function (e) { if (e.target.closest('[data-search-go]')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { close(); openBtn.focus(); } });
  document.addEventListener('click', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !e.target.closest('[data-search-open]')) close();
  });

  // Открыли страницу каталога по ссылке вида catalog.html?q=...
  var q0 = new URLSearchParams(location.search).get('q');
  if (q0 && !onCatalog) { input.value = q0; open(); render(); }
})();
