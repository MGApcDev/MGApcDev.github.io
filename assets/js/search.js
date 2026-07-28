/* Client-side search over assets/search-index.json.

   With JS off the page still lists every destination by hand (the fallback
   block), so this only ever adds capability — it never gates it. */

(function () {
  'use strict';

  const form = document.querySelector('.search-form');
  const input = document.getElementById('query');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const fallback = document.querySelector('[data-search-fallback]');
  if (!form || !input || !results || !status) return;

  let records = null;
  let loadFailed = false;

  const normalise = (text) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ø/g, 'o')
      .replace(/æ/g, 'ae')
      .replace(/å/g, 'a');

  async function loadIndex() {
    if (records || loadFailed) return;
    try {
      const response = await fetch('assets/search-index.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const payload = await response.json();
      records = payload.records.map((record) => ({
        ...record,
        haystack: normalise([record.title, record.summary, record.headings.join(' '), record.text].join(' ')),
        normalisedTitle: normalise(record.title),
        normalisedSummary: normalise(record.summary || ''),
        normalisedHeadings: normalise((record.headings || []).join(' ')),
      }));
    } catch (error) {
      loadFailed = true;
      status.textContent = 'Search is unavailable right now — the list below has every page.';
    }
  }

  function score(record, terms) {
    let total = 0;
    for (const term of terms) {
      if (!record.haystack.includes(term)) return 0;
      // A title match is what someone is almost always after; body frequency is
      // the weakest signal and is capped so long pages cannot out-rank the page
      // actually named after the term.
      if (record.normalisedTitle === term) total += 40;
      else if (record.normalisedTitle.includes(term)) total += 25;
      if (record.normalisedHeadings.includes(term)) total += 7;
      if (record.normalisedSummary.includes(term)) total += 8;
      total += Math.min(record.haystack.split(term).length - 1, 4);
    }
    if (record.type === 'page') total += 2;
    return total;
  }

  function excerpt(record, terms) {
    const source = record.text || record.summary || '';
    const lower = normalise(source);
    const at = lower.indexOf(terms[0]);
    if (at === -1) return record.summary || source.slice(0, 150);
    const start = Math.max(0, at - 60);
    return (start > 0 ? '…' : '') + source.slice(start, start + 170).trim() + '…';
  }

  function render(query) {
    const terms = normalise(query).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      results.innerHTML = '';
      status.textContent = '';
      if (fallback) fallback.hidden = false;
      return;
    }
    if (!records) return;

    // On a tie the page that is *about* the term should win over one that merely
    // mentions it, so compare how densely the term occurs before falling back to
    // title length.
    const density = (record) => {
      const length = Math.max(record.haystack.length, 1);
      const hits = terms.reduce((total, term) => total + (record.haystack.split(term).length - 1), 0);
      return hits / Math.sqrt(length);
    };

    const matches = records
      .map((record) => ({ record, weight: score(record, terms), density: density(record) }))
      .filter((entry) => entry.weight > 0)
      .sort((first, second) =>
        second.weight - first.weight ||
        second.density - first.density ||
        first.record.title.length - second.record.title.length)
      .slice(0, 25);

    if (fallback) fallback.hidden = matches.length > 0;
    status.textContent = matches.length
      ? `${matches.length} result${matches.length === 1 ? '' : 's'} for “${query}”.`
      : `Nothing matched “${query}”. Everything on the site is listed below.`;

    const escape = (text) => text.replace(/[&<>"]/g, (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);

    results.innerHTML = matches
      .map(({ record }) => {
        const label = record.type === 'work' ? 'Work' : 'Page';
        return `<li class="search-result">
          <p class="search-result__kind">${label}</p>
          <h3 class="search-result__title"><a href="${escape(record.url)}">${escape(record.title)}</a></h3>
          <p class="search-result__text">${escape(excerpt(record, terms))}</p>
        </li>`;
      })
      .join('');
  }

  async function run(query) {
    await loadIndex();
    render(query);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    history.replaceState(null, '', query ? '?q=' + encodeURIComponent(query) : location.pathname);
    run(query);
  });

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => run(input.value.trim()), 160);
  });

  const initial = new URLSearchParams(location.search).get('q');
  if (initial) {
    input.value = initial;
    run(initial);
  } else {
    loadIndex();
  }
})();
