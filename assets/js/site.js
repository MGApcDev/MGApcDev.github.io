/* Zenna Lua — small progressive enhancements: header state, scroll reveal,
   gallery filtering with deep links, and a keyboard-navigable lightbox.
   No dependencies. */

(function () {
  'use strict';

  /* ------------------------------------------------------------ header state */
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* ----------------------------------------------------------- scroll reveal */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if (revealTargets.length) {
    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      revealTargets.forEach((element, index) => {
        element.style.transitionDelay = Math.min(index % 6, 5) * 70 + 'ms';
        observer.observe(element);
      });
    }
  }

  /* ---------------------------------------------------------- masonry packing */
  // The gallery is a row-major grid so DOM order matches reading order. Each
  // card claims however many 8px rows its own height needs, which packs the
  // wall without the column-major ordering that CSS multi-column forces.
  const galleries = Array.from(document.querySelectorAll('.gallery'));
  if (galleries.length) {
    const packGallery = (gallery) => {
      const styles = getComputedStyle(gallery);
      const rowHeight = parseFloat(styles.getPropertyValue('--gallery-row')) || 8;
      const gap = parseFloat(styles.getPropertyValue('--gallery-gap')) || 16;
      gallery.querySelectorAll('.work').forEach((work) => {
        if (work.hidden) return;
        work.style.removeProperty('--span');
        const height = work.getBoundingClientRect().height;
        work.style.setProperty('--span', String(Math.ceil((height + gap) / rowHeight)));
      });
    };
    const packAll = () => galleries.forEach(packGallery);
    packAll();
    window.addEventListener('resize', packAll);
    window.addEventListener('load', packAll);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(packAll);
      galleries.forEach((gallery) => observer.observe(gallery));
    }
    document.querySelectorAll('.gallery img').forEach((image) => {
      if (!image.complete) image.addEventListener('load', packAll, { once: true });
    });
    // Captions reflow when the display face finally resolves, which changes
    // card heights after the first pack.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(packAll);
    window.__packGalleries = packAll;
  }

  /* -------------------------------------------------------- gallery filtering */
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const filterableWorks = Array.from(document.querySelectorAll('[data-series]'));
  const filterStatus = document.querySelector('[data-filter-status]');

  function applyFilter(selectedSeries, updateHash) {
    let shownCount = 0;
    filterableWorks.forEach((work) => {
      const matches = selectedSeries === 'all' || work.dataset.series === selectedSeries;
      work.hidden = !matches;
      if (matches) shownCount++;
    });
    filterButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === selectedSeries));
    });
    if (filterStatus) {
      const seriesLabel = selectedSeries === 'all' ? 'all series' : selectedSeries;
      filterStatus.textContent = `Showing ${shownCount} ${shownCount === 1 ? 'work' : 'works'} — ${seriesLabel}.`;
    }
    if (updateHash) {
      const nextHash = selectedSeries === 'all' ? ' ' : '#' + selectedSeries;
      history.replaceState(null, '', selectedSeries === 'all' ? location.pathname : nextHash);
    }
    // Re-pack: the remaining cards need fresh row spans.
    if (typeof window.__packGalleries === 'function') window.__packGalleries();
  }

  if (filterButtons.length && filterableWorks.length) {
    const knownSeries = filterButtons.map((button) => button.dataset.filter);
    const hashSeries = decodeURIComponent(location.hash.replace('#', ''));
    applyFilter(knownSeries.includes(hashSeries) ? hashSeries : 'all', false);

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => applyFilter(button.dataset.filter, true));
    });

    window.addEventListener('hashchange', () => {
      // #view=… belongs to the lightbox, not to the filters.
      if (location.hash.startsWith('#view=')) return;
      const nextSeries = decodeURIComponent(location.hash.replace('#', ''));
      applyFilter(knownSeries.includes(nextSeries) ? nextSeries : 'all', false);
    });
  }

  /* --------------------------------------------------------------- mail forms */
  // A form posting to mailto: is silently dropped by Chrome — the visitor types
  // a message, presses send, and nothing happens at all. Compose the mail URL
  // ourselves, hand it to the mail app, and always leave a visible link behind
  // in case the app never opened.
  document.querySelectorAll('[data-mailto-form]').forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) return;
      event.preventDefault();

      const values = new FormData(form);
      const address = form.dataset.mailto || 'hello@zennalua.dk';
      const name = (values.get('name') || '').toString().trim();
      const email = (values.get('email') || values.get('newsletter') || '').toString().trim();
      const subjectField = (values.get('subject') || '').toString().trim();
      const message = (values.get('message') || '').toString().trim();

      const subject = form.dataset.subject
        || (subjectField ? `${subjectField}${name ? ' — ' + name : ''}` : 'Message from the website');
      const bodyLines = [message, '', name && `— ${name}`, email && email].filter(Boolean);
      const href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      if (status) {
        status.innerHTML = '';
        const lead = document.createElement('span');
        lead.textContent = 'Your mail app should be opening. ';
        const link = document.createElement('a');
        link.href = href;
        link.textContent = 'If it did not, open the message here.';
        status.append(lead, link);
      }
      window.location.href = href;
    });
  });

  /* ------------------------------------------------------------------ lightbox */
  const lightbox = document.querySelector('[data-lightbox]');
  if (!lightbox) return;

  const lightboxImage = lightbox.querySelector('[data-lightbox-image]');
  const lightboxCaption = lightbox.querySelector('[data-lightbox-caption]');
  const lightboxCounter = lightbox.querySelector('[data-lightbox-counter]');
  const closeButton = lightbox.querySelector('[data-lightbox-close]');
  const previousButton = lightbox.querySelector('[data-lightbox-prev]');
  const nextButton = lightbox.querySelector('[data-lightbox-next]');
  const focusables = [closeButton, previousButton, nextButton];
  const openers = Array.from(document.querySelectorAll('[data-lightbox-open]'));
  let currentIndex = -1;
  let lastFocused = null;
  let previousHash = null;

  const visibleOpeners = () => openers.filter((opener) => !opener.hidden && opener.offsetParent !== null);

  function preload(source) {
    if (!source) return;
    const image = new Image();
    image.src = source;
  }

  function show(index) {
    const items = visibleOpeners();
    if (!items.length) return;
    currentIndex = (index + items.length) % items.length;
    const opener = items[currentIndex];
    const sourceImage = opener.querySelector('img');
    lightboxImage.src = opener.dataset.lightboxOpen || (sourceImage && sourceImage.src) || '';
    lightboxImage.alt = (sourceImage && sourceImage.alt) || '';
    lightboxCaption.textContent = opener.dataset.caption || '';
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;
    }
    const neighbours = [items[(currentIndex + 1) % items.length], items[(currentIndex - 1 + items.length) % items.length]];
    neighbours.forEach((neighbour) => preload(neighbour && neighbour.dataset.lightboxOpen));

    const slug = slugFor(opener);
    if (slug) {
      if (previousHash === null) previousHash = location.hash;
      history.replaceState(null, '', '#view=' + slug);
    }
  }

  // A viewer that is looking at one frame should be able to send that frame,
  // not just the page it lives on. The slug comes from the image filename.
  const slugFor = (opener) => (opener.dataset.lightboxOpen || '').split('/').pop().replace(/\.[a-z0-9]+$/i, '');

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    lightbox.classList.add('is-open');
    lightbox.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousHash !== null) {
      history.replaceState(null, '', previousHash || location.pathname + location.search);
      previousHash = null;
    }
    if (lastFocused) lastFocused.focus();
  }

  openers.forEach((opener) => {
    opener.addEventListener('click', (event) => {
      // Work cards are links to the image file; let modified clicks through so
      // "open in new tab" keeps working, and only then take over.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      open(visibleOpeners().indexOf(opener));
    });
  });

  closeButton.addEventListener('click', close);
  previousButton.addEventListener('click', () => show(currentIndex - 1));
  nextButton.addEventListener('click', () => show(currentIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(currentIndex - 1);
    if (event.key === 'ArrowRight') show(currentIndex + 1);
    if (event.key !== 'Tab') return;
    // Keep focus inside the dialog while it is open.
    event.preventDefault();
    const position = focusables.indexOf(document.activeElement);
    const step = event.shiftKey ? -1 : 1;
    const nextTarget = focusables[(position + step + focusables.length) % focusables.length];
    nextTarget.focus();
  });

  /* open straight into a shared frame: works.html#view=work-01-poppy */
  function openFromHash() {
    const match = location.hash.match(/^#view=(.+)$/);
    if (!match) return;
    const wanted = decodeURIComponent(match[1]);
    const index = visibleOpeners().findIndex((opener) => slugFor(opener) === wanted);
    if (index === -1) return;
    previousHash = '';
    open(index);
  }
  openFromHash();
  window.addEventListener('hashchange', () => {
    if (!lightbox.classList.contains('is-open')) openFromHash();
  });

  /* swipe between works on touch devices */
  let touchStartX = null;
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) show(currentIndex + (deltaX < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
})();
