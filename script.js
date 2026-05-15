const RATINGS = [
  { url: 'https://i.imgur.com/s72fabd.png', title: 'brak oceny' },
  { url: 'https://i.imgur.com/ETeEAiR.png', title: 'fatalny' },
  { url: 'https://i.imgur.com/mw6v51f.png', title: 'słaby' },
  { url: 'https://i.imgur.com/agYGgMZ.png', title: 'średniak' },
  { url: 'https://i.imgur.com/z8SwGro.png', title: 'dobry' },
  { url: 'https://i.imgur.com/vlkGgwf.png', title: 'cinema' },
];

const BATCH_SIZE = 20;
const STAGGER_MS = 35;
const PREFETCH_MARGIN_PX = 500;
const UNTYPED = '__no_type__';
const UNTAGGED = '__no_tag__';
const UNAGE = '__no_age__';

// Live data source — Google Sheets via the gviz JSON endpoint. Picked over
// `/export?format=csv` because gviz sends CORS headers consistently, whereas
// the CSV export redirects through googleusercontent which can refuse the
// cross-origin fetch from the browser.
const SHEETS_GVIZ_URL = 'https://docs.google.com/spreadsheets/d/1CuHfluEd-9hVun6ANAeK41lNx949Aa_j0YVzWbgGIY8/gviz/tq?tqx=out:json';
const CACHE_KEY    = 'paf_live_db_v7';
const CACHE_TTL_MS = 60 * 60 * 1000;

const SHEET_COL = {
  DYSK: 1, SERIA: 3, NAZWA: 4, ROK: 5, ODC: 6, LANGUAGE: 7,
  DLUGOSC: 9, JAKOSC: 10, FILETYPE: 11, GB: 12,
  OCENA: 14, WIEK: 15, TAGI: 16, RODZAJ: 17,
};

// Maps the sheet's "Dysk" column to the actual drive letter where that
// category's content lives on the owner's machine. Used to build the
// `search-ms:` URL behind the "Zobacz" button. Add entries here if new disk
// categories appear in the sheet.
const DRIVE_MAP = {
  'bajki i anime':   'P',
  'filmy i seriale': 'Q',
};

// Cover-filename character replacements. Must be byte-equivalent to whatever
// produced the files in cover/ — if you ever rename files there with different
// rules, update this table or the lookup will miss.
const COVER_ILLEGAL = [
  [':', ' -'], ['/', ' '], ['\\', ' '],
  ['<', ''], ['>', ''], ['"', ''], ['|', ''], ['?', ''], ['*', '']
];
function sanitizeCoverName(s) {
  let r = String(s == null ? '' : s).trim();
  for (const [bad, good] of COVER_ILLEGAL) r = r.split(bad).join(good);
  return r.replace(/\s+/g, ' ').trim();
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function highlightMatch(text, query) {
  if (!query) return esc(text);
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return esc(text);
  return esc(text.slice(0, idx)) +
    '<mark class="hl">' + esc(text.slice(idx, idx + query.length)) + '</mark>' +
    esc(text.slice(idx + query.length));
}

function renderStars(n) {
  n = Math.max(0, Math.min(5, n | 0));
  let h = '';
  for (let i = 0; i < n; i++)     h += '<span class="star-on">★</span>';
  for (let i = n; i < 5; i++)     h += '<span class="star-off">☆</span>';
  return h;
}

// Heroicons (solid). Read better at 10–12 px than the outline variants.
const ICON_TAG  = '<svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"/></svg>';
const ICON_TYPE = '<svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 9.375v-4.5ZM13.5 4.875c0-1.036.84-1.875 1.875-1.875h4.5C20.91 3 21.75 3.84 21.75 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 0 1-1.875-1.875v-4.5ZM3 15.375c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 19.875v-4.5ZM13.5 15.375c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 0 1-1.875-1.875v-4.5Z"/></svg>';

// "Zobacz" button target — uses Windows' `search-ms:` protocol because
// `file:///` URLs are blocked from http origins. Browser asks for permission
// once, then routes the click straight to Explorer with results scoped to
// the chosen folder.
function zobaczHref(c) {
  if (c.drive && c.seria) return 'search-ms:crumb=location:' + encodeURIComponent(c.drive + ':\\' + c.seria);
  if (c.drive)            return 'search-ms:crumb=location:' + encodeURIComponent(c.drive + ':\\');
  return 'search-ms:query=' + encodeURIComponent(c.alt);
}
function zobaczTitle(c) {
  if (c.drive && c.seria) return 'Otwórz w Eksploratorze: ' + c.drive + ':\\' + c.seria;
  if (c.drive)            return 'Otwórz w Eksploratorze: ' + c.drive + ':\\';
  return 'Szukaj w Eksploratorze: ' + c.alt;
}

function renderCard(c, query) {
  const r = RATINGS[c.rating] || RATINGS[0];
  const ratingNum = c.rating || 0;

  // "tag:..." queries highlight inside the tag chips; everything else
  // highlights the title.
  const isTagQuery = !!query && query.toLowerCase().startsWith('tag:');
  const titleQuery = isTagQuery ? '' : (query || '');
  const tagQuery   = isTagQuery ? query.slice(4).trim() : '';

  let yearBlock;
  const hasMeta = (c.tags && c.tags.length) || c.type || c.age != null;
  if (hasMeta) {
    const tagBtns = (c.tags || []).map(function (t) {
      return '<span class="btn-tag">' + ICON_TAG + '<span>' + highlightMatch(t, tagQuery) + '</span></span>';
    }).join(' ');
    const typeBtn = c.type
      ? '<span class="btn-tag">' + ICON_TYPE + '<span>' + esc(c.type) + '</span></span>'
      : '';
    const ageBtn = c.age != null
      ? '<span class="btn-' + c.age + '">+' + c.age + '</span>'
      : '';
    const tail = (typeBtn || ageBtn);
    const sep = (tagBtns && tail) ? '<br>' : '';
    yearBlock = tagBtns + sep + ' ' + typeBtn + ' ' + ageBtn;
  } else {
    // Year is already inside the title (e.g. "13 Posterunek 2 (1997-1998)"),
    // so leave the chip row empty here to avoid showing the year twice. The
    // `.card-year:empty` CSS rule collapses the now-empty <h5> so it doesn't
    // leave a phantom line below the title.
    yearBlock = '';
  }

  const tlParts = [];
  if (c.fileType) tlParts.push(esc(c.fileType));
  if (c.fileSize) tlParts.push(esc(c.fileSize) + ' GB');
  const tlBadge = tlParts.length
    ? '<div class="cover-badge absolute top-1.5 left-1.5">' + tlParts.join(' · ') + '</div>'
    : '';
  const trBadge = c.quality
    ? '<div class="cover-badge absolute top-1.5 right-1.5">' + esc(c.quality) + '</div>'
    : '';
  const langLines = c.language
    ? c.language.split('/').map(function (s) { return s.trim(); }).filter(Boolean)
    : [];
  const brBadge = langLines.length
    ? '<div class="cover-badge cover-badge--lang absolute bottom-1.5 right-1.5" title="' + esc(c.language) + '">' +
        langLines.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('') +
      '</div>'
    : '';

  // Episode count is kept for serials/animes regardless, but suppressed for
  // single-disc films (count <= 1).
  const hoverLines = [];
  if (c.length) hoverLines.push('<div>' + esc(c.length) + '</div>');
  const epCount = c.episodes ? parseInt(c.episodes, 10) : 0;
  const showEp = c.episodes && (c.type === 'Serial' || c.type === 'Anime' || epCount > 1);
  if (showEp) hoverLines.push('<div>' + esc(c.episodes) + ' odc.</div>');
  const hoverOverlay = hoverLines.length
    ? '<div class="cover-hover">' + hoverLines.join('') + '</div>'
    : '';

  return '' +
    '<div class="p-2 flex">' +
      '<div class="card-modern w-[calc(50vw-20px)] max-w-[200px] sm:w-[calc(33vw-20px)] sm:max-w-[220px] md:w-64 md:max-w-none h-full flex flex-col">' +
        '<div class="relative">' +
          '<img src="' + c.cover + '" alt="' + esc(c.alt) + '" width="256" height="396" class="block w-full" />' +
          hoverOverlay + tlBadge + trBadge + brBadge +
        '</div>' +
        '<div class="px-3 py-2 flex flex-col items-center gap-1.5 flex-1">' +
          '<div class="flex flex-col items-center justify-center gap-1 flex-1 min-h-[60px] w-full">' +
            '<h5 class="card-title">' + highlightMatch(c.title, titleQuery) + '</h5>' +
            '<h5 class="card-year">' + yearBlock + '</h5>' +
          '</div>' +
          '<img src="' + r.url + '" title="' + esc(r.title) + '" alt="' + ratingNum + '/5" width="100" height="31" class="block">' +
          '<a href="' + zobaczHref(c) + '" title="' + esc(zobaczTitle(c)) + '" class="btn-primary inline-block no-underline px-4 py-1 rounded-md text-white text-sm font-medium">Zobacz</a>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// sort: sheet | name-asc | name-desc | rating-desc | rating-asc-rated | date-desc | date-asc | length-desc
const state = {
  query: '',
  sort: 'sheet',
  types: null,
  ratings: null,
  tags: null,
  ages: null,
};

// Polish collator for the alphabetical sort modes. `sensitivity: base` makes
// case + diacritics blind ("Łowca" sorts among the L's, not at the end);
// `numeric: true` keeps "Sezon 2" before "Sezon 10" instead of after.
const PL_COLLATOR = new Intl.Collator('pl', { sensitivity: 'base', numeric: true });

function sortFiltered(items, mode) {
  const arr = items.slice();
  switch (mode) {
    case 'name-desc':
      arr.sort(function (a, b) { return PL_COLLATOR.compare(b.alt || '', a.alt || ''); });
      break;
    case 'rating-desc':
      arr.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
      break;
    case 'rating-asc-rated':
      // Worst-to-best — but `applyFilters` strips unrated (rating 0) entries
      // before calling us, so the result is only rated cards.
      arr.sort(function (a, b) { return (a.rating || 0) - (b.rating || 0); });
      break;
    case 'date-desc':
      arr.sort(function (a, b) { return (b._sortYear || 0) - (a._sortYear || 0); });
      break;
    case 'date-asc':
      // Missing years go to the END for asc too (treat as +Infinity).
      arr.sort(function (a, b) { return (a._sortYear || Infinity) - (b._sortYear || Infinity); });
      break;
    case 'length-desc':
      arr.sort(function (a, b) { return (b._sortLen || 0) - (a._sortLen || 0); });
      break;
    case 'sheet':
      // No-op — Array.filter preserves order, and allData already arrives in
      // gviz row order, so a plain slice is exactly the sheet's layout.
      break;
    case 'name-asc':
    default:
      arr.sort(function (a, b) { return PL_COLLATOR.compare(a.alt || '', b.alt || ''); });
  }
  return arr;
}

// Populated by buildFilterSidebar. Maps each panel id to its full item list
// and corresponding state-Set key, so handleSidebarClick stays generic.
const filterDefs = {
  typ:   { items: [], key: 'types'   },
  ocena: { items: [], key: 'ratings' },
  tag:   { items: [], key: 'tags'    },
  wiek:  { items: [], key: 'ages'    },
};

let allData = null;
let currentController = null;
const container = document.getElementById('container');

function matchesFilters(c) {
  // For every panel, an *empty* Set means "this panel isn't restricting" —
  // otherwise "Odznacz wszystkie" on one panel + a single pick on another
  // panel would block everything, because `Set().has(x)` is always false.
  if (state.types && state.types.size && !state.types.has(c.type || UNTYPED)) return false;
  if (state.ratings && state.ratings.size && !state.ratings.has(String(c.rating || 0))) return false;
  if (state.ages && state.ages.size) {
    const k = c.age != null ? String(c.age) : UNAGE;
    if (!state.ages.has(k)) return false;
  }
  if (state.tags && state.tags.size) {
    if (c.tags && c.tags.length) {
      if (!c.tags.some(function (t) { return state.tags.has(t); })) return false;
    } else {
      if (!state.tags.has(UNTAGGED)) return false;
    }
  }

  if (state.query) {
    const q = state.query;
    if (q.toLowerCase().startsWith('tag:')) {
      const tq = q.slice(4).trim().toLowerCase();
      if (tq) {
        if (!c.tags || !c.tags.some(function (t) { return t.toLowerCase().includes(tq); })) return false;
      }
    } else {
      if (!c.title.toLowerCase().includes(q.toLowerCase())) return false;
    }
  }
  return true;
}

function applyFilters() {
  if (!allData) return;
  if (currentController) currentController.stop();
  container.innerHTML = '';
  if (window.scrollY > 0) window.scrollTo(0, 0);

  let filtered = allData.filter(matchesFilters);
  // "Gówna totalne" — sort by worst rating first, but exclude unrated entries
  // (otherwise everything-with-no-rating would dominate the top of the list).
  if (state.sort === 'rating-asc-rated') {
    filtered = filtered.filter(function (c) { return (c.rating || 0) > 0; });
  }
  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="brak">' +
        'Nie znaleziono żadnych pozycji.' +
        '<img src="gfx/archiwa.png" alt="" onerror="this.style.display=\'none\'" class="block mx-auto mt-6 max-w-md rounded-lg shadow-xl">' +
      '</div>';
    currentController = null;
    return;
  }
  const sorted = sortFiltered(filtered, state.sort);
  currentController = startProgressiveRender(sorted, container, state.query);
}

function startProgressiveRender(data, container, query) {
  let cursor = 0;
  let stopped = false;

  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'flex-basis:100%;height:1px;';
  container.appendChild(sentinel);

  function renderBatch() {
    if (stopped || cursor >= data.length) return false;
    const slice = data.slice(cursor, cursor + BATCH_SIZE);
    cursor += slice.length;

    const tmp = document.createElement('template');
    tmp.innerHTML = slice.map(function (c) { return renderCard(c, query); }).join('');
    const cards = Array.from(tmp.content.children);
    for (const c of cards) {
      c.classList.add('card-fade');
      container.insertBefore(c, sentinel);
    }
    void container.offsetHeight;

    // Reveal each card only when its cover image is decoded AND its stagger
    // delay has elapsed — otherwise we'd fade in an empty card and the image
    // would pop in afterwards. The cover-load step itself goes through
    // attachCoverFallback which retries .jpeg → .png before giving up.
    cards.forEach(function (c, i) {
      const cover = c.querySelector('img');
      const delay = i * STAGGER_MS;
      let delayDone = false, imgDone = false;
      function check() { if (delayDone && imgDone && !stopped) c.classList.add('card-shown'); }
      setTimeout(function () { delayDone = true; check(); }, delay);

      if (!cover || cover.complete) {
        imgDone = true;
        check();
      } else {
        attachCoverFallback(cover, function () { imgDone = true; check(); });
      }
    });
    return true;
  }

  function fillUntilOutOfView() {
    if (stopped) return;
    while (cursor < data.length) {
      const rect = sentinel.getBoundingClientRect();
      if (rect.top > window.innerHeight + PREFETCH_MARGIN_PX) break;
      renderBatch();
    }
    if (cursor >= data.length) {
      observer.disconnect();
      if (sentinel.parentNode) sentinel.remove();
    }
  }

  const observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) fillUntilOutOfView();
  }, { rootMargin: PREFETCH_MARGIN_PX + 'px 0px' });

  fillUntilOutOfView();
  if (cursor < data.length) observer.observe(sentinel);

  return {
    stop: function () {
      stopped = true;
      observer.disconnect();
      if (sentinel.parentNode) sentinel.remove();
    }
  };
}

function refreshToggleLabel(section) {
  const def = filterDefs[section];
  if (!def) return;
  const set = state[def.key];
  const sidebar = document.getElementById('filtry');
  const btn = sidebar.querySelector('.filter-btn-all[data-section="' + section + '"]');
  if (btn) btn.textContent = set.size === def.items.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie';
}

function handleSidebarClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.id === 'myRefresh') {
    onRefreshClick(btn);
    return;
  }

  const section = btn.dataset.section;
  if (!section || !filterDefs[section]) return;
  const def = filterDefs[section];
  const set = state[def.key];
  const sidebar = document.getElementById('filtry');

  if (btn.classList.contains('filter-btn-all')) {
    const allActive = set.size === def.items.length;
    const targets = sidebar.querySelectorAll('.filter-btn[data-section="' + section + '"]');
    if (allActive) {
      set.clear();
      targets.forEach(function (b) { b.classList.remove('active'); });
    } else {
      def.items.forEach(function (v) { set.add(String(v)); });
      targets.forEach(function (b) { b.classList.add('active'); });
    }
    refreshToggleLabel(section);
    applyFilters();
    return;
  }

  if (btn.classList.contains('filter-btn')) {
    const v = btn.dataset.value;
    if (set.has(v)) {
      set.delete(v);
      btn.classList.remove('active');
    } else {
      set.add(v);
      btn.classList.add('active');
    }
    refreshToggleLabel(section);
    applyFilters();
  }
}

function buildFilterSidebar(data) {
  const types = new Set(), tags = new Set(), ages = new Set();
  let hasUntyped = false, hasUntagged = false, hasUnaged = false;
  data.forEach(function (c) {
    if (c.type) types.add(c.type); else hasUntyped = true;
    if (c.tags && c.tags.length) c.tags.forEach(function (t) { tags.add(t); });
    else hasUntagged = true;
    if (c.age != null) ages.add(c.age); else hasUnaged = true;
  });

  const typesList = [...types].sort();
  if (hasUntyped) typesList.push(UNTYPED);

  const ratingsList = ['5', '4', '3', '2', '1', '0'];

  const tagsList = [...tags].sort();
  if (hasUntagged) tagsList.push(UNTAGGED);

  const agesList = [...ages].sort(function (a, b) { return a - b; }).map(String);
  if (hasUnaged) agesList.push(UNAGE);

  // Nothing-selected by default; combined with the empty-Set guard in
  // matchesFilters, every card is visible on first load and the user narrows
  // by clicking filters in.
  state.types   = new Set();
  state.ratings = new Set();
  state.tags    = new Set();
  state.ages    = new Set();

  filterDefs.typ.items   = typesList;
  filterDefs.ocena.items = ratingsList;
  filterDefs.tag.items   = tagsList;
  filterDefs.wiek.items  = agesList;

  // labelFn returns raw HTML — labelRating emits styled <span> stars — so each
  // label function is responsible for escaping any data-derived strings.
  function labelType(t)   { return t === UNTYPED  ? 'Bez typu'  : esc(t); }
  function labelTag(t)    { return t === UNTAGGED ? 'Bez tagów' : esc(t); }
  function labelAge(a)    { return a === UNAGE    ? 'Bez wieku' : '+' + esc(a); }
  function labelRating(r) { return renderStars(parseInt(r, 10)); }

  function panelHtml(section, title, items, labelFn) {
    const buttons = items.map(function (v) {
      return '<button type="button" class="filter-btn" data-section="' + section +
             '" data-value="' + esc(String(v)) + '">' + labelFn(v) + '</button>';
    }).join('');
    return '<div class="filtry-naglowek">' + esc(title) + '</div>' + buttons +
           '<button type="button" class="filter-btn-all" data-section="' + section + '">Zaznacz wszystkie</button>';
  }

  const sidebar = document.getElementById('filtry');
  sidebar.innerHTML =
    '<button id="myRefresh" type="button" title="Odśwież dane katalogu bazując na magicznym arkuszu Natpyriosa" class="btn-primary px-3 py-1.5 rounded-lg text-white text-xs font-semibold w-full">Pobierz dane</button>' +
    panelHtml('typ',   'Typ',   typesList,   labelType)   +
    panelHtml('ocena', 'Ocena', ratingsList, labelRating) +
    panelHtml('tag',   'Tag',   tagsList,    labelTag)    +
    panelHtml('wiek',  'Wiek',  agesList,    labelAge);

  // buildFilterSidebar runs again on every "Pobierz dane" refresh, so attach
  // the delegated click handler only once — innerHTML rewrites don't drop it.
  if (!sidebar.dataset.wired) {
    sidebar.dataset.wired = '1';
    sidebar.addEventListener('click', handleSidebarClick);
  }
}

function smoothScrollTop() {
  const startY = window.scrollY;
  if (startY === 0) return;
  const duration = Math.min(700, Math.max(280, startY * 0.25));
  const startTime = performance.now();
  let aborted = false;
  function abort() { aborted = true; }
  window.addEventListener('wheel',      abort, { once: true, passive: true });
  window.addEventListener('touchstart', abort, { once: true, passive: true });
  function step(now) {
    if (aborted) return;
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic — fast start, slow finish
    window.scrollTo(0, startY * (1 - eased));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function wireSearchInput() {
  const input = document.getElementById('myInput');
  const clear = document.getElementById('myClear');

  function sync() {
    const raw = input.value;
    state.query = raw.trim();
    if (clear) clear.classList.toggle('hidden', raw.length === 0);
    applyFilters();
  }

  input.addEventListener('input', sync);

  if (clear) {
    clear.addEventListener('click', function () {
      input.value = '';
      state.query = '';
      clear.classList.add('hidden');
      applyFilters();
      input.focus();
    });
  }
}

function wireSortControl() {
  const sel = document.getElementById('sort');
  if (!sel) return;
  sel.value = state.sort;
  sel.addEventListener('change', function () {
    state.sort = this.value;
    applyFilters();
  });
}

function wireFiltryToggle() {
  const btn = document.getElementById('filtryToggle');
  const filtry = document.getElementById('filtry');
  if (!btn || !filtry) return;
  btn.addEventListener('click', function () {
    filtry.classList.toggle('is-open');
  });
}

function rowToEntry(row) {
  function cell(i) {
    const c = row && row.c && row.c[i];
    if (!c) return '';
    // Prefer the formatted display value (`f`) over the raw value (`v`):
    // gviz returns time cells as "Date(1899,11,30,1,33,47)" in `v` but the
    // pretty "1:33:47" in `f`; numbers like 3.98 GB come through as `f="3,98"`
    // already locale-formatted with a comma — saves us re-formatting.
    const v = c.f != null ? c.f : c.v;
    return v == null ? '' : String(v).trim();
  }

  const nazwa = cell(SHEET_COL.NAZWA);
  if (!nazwa) return null;

  const dysk     = cell(SHEET_COL.DYSK);
  // Folder names on disk can't contain ":" — strip it so the search-ms URL
  // points at the actual folder ("Avatar: Legenda…" → "Avatar Legenda…").
  const seria    = cell(SHEET_COL.SERIA).replace(/:/g, '');
  const rok      = cell(SHEET_COL.ROK);
  const odc      = cell(SHEET_COL.ODC);
  const jezyk    = cell(SHEET_COL.LANGUAGE);
  const dlugosc  = cell(SHEET_COL.DLUGOSC);
  const jakosc   = cell(SHEET_COL.JAKOSC);
  const filetype = cell(SHEET_COL.FILETYPE);
  const gb       = cell(SHEET_COL.GB);
  const ocena    = cell(SHEET_COL.OCENA);
  const wiek     = cell(SHEET_COL.WIEK);
  const tagi     = cell(SHEET_COL.TAGI);
  const rodzaj   = cell(SHEET_COL.RODZAJ);

  const title  = rok ? (nazwa + ' (' + rok + ')') : nazwa;
  const cover  = 'cover/' + encodeURIComponent(sanitizeCoverName(nazwa)) + '.jpeg';
  const tags   = tagi ? tagi.split(',').map(function (t) { return t.trim(); }).filter(Boolean) : [];
  const rating = parseInt(ocena, 10) || 0;
  const ageM   = wiek.match(/(\d+)/);
  const age    = ageM ? parseInt(ageM[1], 10) : null;

  const entry = { title: title, cover: cover, alt: nazwa, rating: rating };
  const hasMeta = rodzaj || tags.length || age != null;
  if (hasMeta) {
    if (tags.length) entry.tags = tags;
    if (rodzaj)      entry.type = rodzaj;
    if (age != null) entry.age  = age;
  }

  if (dlugosc)  entry.length   = dlugosc;
  if (odc)      entry.episodes = odc;
  if (jezyk)    entry.language = jezyk;
  if (jakosc)   entry.quality  = jakosc;
  if (filetype) entry.fileType = filetype;
  if (gb)       entry.fileSize = gb;

  // "Zobacz" target — drive comes from the Dysk column via DRIVE_MAP, folder
  // name from the Seria column. Both kept on the entry so renderCard can
  // build the search-ms URL without re-mapping.
  const drive = DRIVE_MAP[dysk.toLowerCase()];
  if (drive) entry.drive = drive;
  if (seria) entry.seria = seria;

  // Pre-computed sort keys — parsed once here so sortFiltered() can do plain
  // numeric compares instead of regex/split per swap.
  if (rok) {
    const ym = rok.match(/(\d{4})/);
    if (ym) entry._sortYear = parseInt(ym[1], 10);
  }
  if (dlugosc) {
    const parts = dlugosc.split(':').map(function (s) { return parseInt(s, 10) || 0; });
    let secs = 0;
    if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) secs = parts[0] * 60 + parts[1];
    if (secs) entry._sortLen = secs;
  }

  return entry;
}

function parseGvizResponse(text) {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('unexpected gviz payload');
  const json = JSON.parse(text.slice(start, end + 1));
  if (!json.table || !json.table.rows) throw new Error('no table data in gviz response');
  return json.table.rows.map(rowToEntry).filter(Boolean);
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || typeof c.ts !== 'number' || !Array.isArray(c.data)) return null;
    return c;
  } catch (e) { return null; }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, ts: Date.now() }));
  } catch (e) {
    // Storage full or disabled — non-fatal, page still works for this session
    console.warn('localStorage write failed:', e);
  }
}

async function loadData(forceFresh) {
  if (!forceFresh) {
    const cached = readCache();
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;
  }
  try {
    const r = await fetch(SHEETS_GVIZ_URL);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const text = await r.text();
    const entries = parseGvizResponse(text);
    writeCache(entries);
    return entries;
  } catch (err) {
    // Network/CORS failure — fall back to whatever's cached, even if stale.
    const stale = readCache();
    if (stale) {
      console.warn('Live fetch failed, using stale cache:', err);
      return stale.data;
    }
    throw err;
  }
}

// renderCard emits `.jpeg` URLs; on error walk through these fallback exts,
// then try a single placeholder image, then give up and hide.
const COVER_FALLBACK_EXTS = ['.jpg', '.png', '.webp'];
const COVER_PLACEHOLDER   = 'cover/placeholder.jpg';

function attachCoverFallback(img, onSettled) {
  let attempt = 0;
  let placeholderTried = false;
  function settle() { if (onSettled) onSettled(); }

  img.addEventListener('load', settle, { once: true });
  img.addEventListener('error', function onError() {
    if (attempt < COVER_FALLBACK_EXTS.length) {
      img.addEventListener('error', onError, { once: true });
      img.src = img.src.replace(/\.(jpeg|jpg|png|webp)(\?.*)?$/, COVER_FALLBACK_EXTS[attempt++] + '$2');
      return;
    }
    if (!placeholderTried) {
      placeholderTried = true;
      img.addEventListener('error', onError, { once: true });
      img.src = COVER_PLACEHOLDER;
      return;
    }
    img.style.display = 'none';
    settle();
  }, { once: true });
}

function reloadAll(data) {
  allData = data;
  buildFilterSidebar(data);
  applyFilters();
}

async function onRefreshClick(btn) {
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Pobieranie...';
  try {
    const data = await loadData(true);
    reloadAll(data);
    btn.textContent = 'Pobrano!';
    setTimeout(function () { btn.textContent = orig; }, 1200);
  } catch (err) {
    console.error(err);
    btn.textContent = 'Błąd';
    setTimeout(function () { btn.textContent = orig; }, 2000);
  } finally {
    btn.disabled = false;
  }
}

(async function () {
  const back = document.getElementById('myBtn');
  if (back) back.addEventListener('click', smoothScrollTop);

  // Wire DOM-static listeners once, before fetch. applyFilters() bails early
  // when allData is null so a stray keystroke before the first load is fine.
  wireSearchInput();
  wireSortControl();
  wireFiltryToggle();

  try {
    const data = await loadData(false);
    reloadAll(data);
  } catch (err) {
    container.innerHTML =
      '<p style="padding:100px;text-align:center;color:#fff;">' +
      'Błąd ładowania danych z Google Sheets: ' + esc(err.message) + '<br>' +
      'Sprawdź połączenie i odśwież stronę, albo użyj "Pobierz dane" w panelu po lewej.' +
      '</p>';
  }
})();
