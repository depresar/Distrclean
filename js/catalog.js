/* Дистрклин — страница каталога: фильтр по разделам, поиск, карточки, окно товара */
(function () {
  'use strict';

  var P = window.PRODUCTS || [];
  var CATS = window.CATEGORIES || [];
  var root = document.getElementById('catalog-root');
  var chipsEl = document.querySelector('.cat-filter');
  var input = document.querySelector('.cat-search__input');
  var countEl = document.querySelector('.cat-count');
  var current = 'all';

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var norm = function (s) { return s.toLowerCase().replace(/ё/g, 'е'); };
  var stem = function (w) { return w.length > 5 ? w.slice(0, w.length - 2) : w; };
  var price = function (p) { return p ? p.toLocaleString('ru-RU').replace(/ | /g, ' ') + ' ₽' : 'Цена по запросу'; };
  var catName = {}; CATS.forEach(function (c) { catName[c.id] = c.name; });
  P.forEach(function (p) { p._hay = norm(p.name + ' ' + p.desc + ' ' + catName[p.cat]); });

  /* Фильтр-кнопки */
  var chipHtml = '<button type="button" class="cat-chip" data-cat="all">Все товары <span>' + P.length + '</span></button>';
  CATS.forEach(function (c) {
    var n = P.filter(function (p) { return p.cat === c.id; }).length;
    chipHtml += '<button type="button" class="cat-chip" data-cat="' + c.id + '">' + esc(c.short || c.name) + ' <span>' + n + '</span></button>';
  });
  chipsEl.innerHTML = chipHtml;

  function card(p) {
    return '<article class="pcard">' +
      '<button type="button" class="pcard__link" data-open="' + p.id + '" aria-label="Подробнее: ' + esc(p.name) + '"></button>' +
      '<div class="pcard__img"><img src="assets/img/products/' + p.img + '-sm.webp" alt="' + esc(p.name) + '" loading="lazy" width="480" height="480"></div>' +
      '<div class="pcard__body">' +
        '<span class="pcard__brand">' + esc(catName[p.cat]) + '</span>' +
        '<h3 class="pcard__name">' + esc(p.name) + '</h3>' +
        (p.desc ? '<p class="pcard__desc">' + esc(p.desc) + '</p>' : '') +
        '<div class="pcard__foot"><span class="pcard__price' + (p.price ? '' : ' is-request') + '">' + price(p.price) + '</span><span class="pcard__more" aria-hidden="true">Подробнее</span></div>' +
      '</div></article>';
  }

  function render() {
    var words = norm(input.value.trim()).split(/\s+/).filter(function (w) { return w.length > 1; }).map(stem);
    var list = P.filter(function (p) {
      return (current === 'all' || p.cat === current) && words.every(function (w) { return p._hay.indexOf(w) !== -1; });
    });
    var html = '';
    CATS.forEach(function (c) {
      var items = list.filter(function (p) { return p.cat === c.id; });
      if (!items.length) return;
      html += '<section class="pgroup" id="' + c.id + '">' +
        '<div class="pgroup__head"><h2 class="h3">' + esc(c.name) + '</h2><p>' + esc(c.desc) + '</p></div>' +
        '<div class="pgrid">' + items.map(card).join('') + '</div></section>';
    });
    if (!html) {
      html = '<div class="pempty"><p class="h3">Ничего не нашлось</p><p>Попробуйте другой запрос или <a href="index.html#contact">оставьте заявку</a> — подберём продукт под вашу задачу.</p></div>';
    }
    root.innerHTML = html;
    countEl.textContent = list.length + ' ' + plural(list.length, ['товар', 'товара', 'товаров']);
    chipsEl.querySelectorAll('.cat-chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cat === current)); });
  }
  function plural(n, f) { n = Math.abs(n) % 100; var n1 = n % 10; if (n > 10 && n < 20) return f[2]; if (n1 > 1 && n1 < 5) return f[1]; if (n1 === 1) return f[0]; return f[2]; }

  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.cat-chip'); if (!b) return;
    current = b.dataset.cat; render(); scrollToList();
    history.replaceState(null, '', current === 'all' ? location.pathname : '#' + current);
  });
  input.addEventListener('input', render);

  /* Окно товара */
  var modal = document.querySelector('.pmodal');
  var mBody = modal.querySelector('.pmodal__body');
  var lastFocus = null;
  function openProduct(id) {
    var p = P.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    lastFocus = document.activeElement;
    mBody.innerHTML =
      '<div class="pmodal__img"><img src="assets/img/products/' + p.img + '.webp" alt="' + esc(p.name) + '"></div>' +
      '<div class="pmodal__info">' +
        '<span class="pcard__brand">' + esc(catName[p.cat]) + '</span>' +
        '<h2 class="pmodal__name" id="pmodal-title">' + esc(p.name) + '</h2>' +
        (p.desc ? '<p class="pmodal__desc">' + esc(p.desc) + '</p>' : '<p class="pmodal__desc">Состав и комплектацию набора уточнит менеджер — подберём под ваш объект и объёмы.</p>') +
        '<p class="pmodal__price' + (p.price ? '' : ' is-request') + '">' + price(p.price) + '</p>' +
        '<div class="pmodal__actions">' +
          '<a class="btn btn--primary" href="index.html?product=' + encodeURIComponent(p.name) + '#contact">' + (p.price ? 'Заказать' : 'Запросить цену') + '</a>' +
          '<a class="btn btn--outline" href="tel:+79251733345">+7 (925) 173-33-45</a>' +
        '</div>' +
      '</div>';
    modal.hidden = false;
    document.documentElement.classList.add('modal-open');
    modal.querySelector('.pmodal__close').focus();
    history.replaceState(null, '', '#p-' + id);
  }
  function closeProduct() {
    modal.hidden = true;
    document.documentElement.classList.remove('modal-open');
    history.replaceState(null, '', current === 'all' ? location.pathname : '#' + current);
    if (lastFocus) lastFocus.focus();
  }
  root.addEventListener('click', function (e) { var b = e.target.closest('[data-open]'); if (b) openProduct(b.dataset.open); });
  modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.pmodal__close')) closeProduct(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeProduct(); });

  /* Переходы по ссылкам: #seko — раздел, #p-<товар> — окно товара, ?q= — поиск */
  function scrollToList() {
    var y = document.getElementById('catalog-root').getBoundingClientRect().top + window.scrollY - 170;
    window.scrollTo({ top: Math.max(0, y) });
  }
  function fromUrl() {
    var h = location.hash.slice(1);
    var q = new URLSearchParams(location.search).get('q');
    if (q) input.value = q;
    if (CATS.some(function (c) { return c.id === h; })) { current = h; }
    render();
    if (h.indexOf('p-') === 0) openProduct(h.slice(2));
    else if (current !== 'all' || q) scrollToList();
  }
  window.addEventListener('hashchange', function () {
    var h = location.hash.slice(1);
    if (h.indexOf('p-') === 0) openProduct(h.slice(2));
    else if (CATS.some(function (c) { return c.id === h; })) { current = h; input.value = ''; render(); scrollToList(); }
  });
  fromUrl();
})();
