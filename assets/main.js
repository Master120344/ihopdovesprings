const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.site-nav');
function setMenu(open) {
  menuButton?.setAttribute('aria-expanded', String(open));
  menu?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  if (!open) menuButton?.focus({ preventScroll: true });
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false);
  if (event.key === 'Tab' && menuButton?.getAttribute('aria-expanded') === 'true') {
    const items = [menuButton, ...menu.querySelectorAll('a')];
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 1001px)').addEventListener('change', event => {
  if (event.matches && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false);
});
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

function initSlideshow(root) {
  const photos = JSON.parse(root.querySelector('[data-slide-data]').textContent);
  const layers = [...root.querySelectorAll('[data-slide-layer]')];
  const toggle = root.querySelector('[data-slide-toggle]');
  const caption = root.querySelector('[data-slide-caption]');
  const announcement = root.querySelector('[data-slide-announcement]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = Number(root.dataset.interval) || 12000;
  let index = 0;
  let activeLayer = 0;
  let userPaused = motion.matches;
  let hovered = false;
  let focusPaused = false;
  let inView = !('IntersectionObserver' in window);
  let busy = false;
  let timer;
  function schedule() {
    clearTimeout(timer);
    toggle.textContent = userPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', userPaused ? 'Play automatic slideshow' : 'Pause automatic slideshow');
    if (!userPaused && !hovered && !focusPaused && inView && !document.hidden && !busy) {
      timer = setTimeout(() => show(index + 1, false), interval);
    }
  }
  async function show(requested, manual) {
    if (busy) return;
    clearTimeout(timer);
    if (manual) userPaused = true;
    busy = true;
    const nextLayer = 1 - activeLayer;
    const next = layers[nextLayer];
    let loaded = false;
    const direction = requested < index ? -1 : 1;
    const deadline = Date.now() + 8000;
    let candidate = (requested + photos.length) % photos.length;
    // A failed photograph should not interrupt the rest of the gallery.
    for (let attempt = 0; attempt < photos.length - 1; attempt++) {
      if (candidate === index) break;
      const photo = photos[candidate];
      next.src = photo.src;
      next.alt = photo.alt;
      next.style.objectPosition = photo.position || 'center';
      let loadTimer;
      try {
        await Promise.race([
          next.decode(),
          new Promise((_, reject) => {
            loadTimer = setTimeout(() => reject(new Error('Image load timed out')), Math.max(1, deadline - Date.now()));
          })
        ]);
        loaded = true;
        break;
      } catch {
        if (Date.now() >= deadline) break;
        candidate = (candidate + direction + photos.length) % photos.length;
      } finally {
        clearTimeout(loadTimer);
      }
    }
    // Honor a pause requested while the next photograph was loading.
    if (!manual && (userPaused || hovered || focusPaused || !inView || document.hidden)) loaded = false;
    if (loaded) {
      layers[activeLayer].classList.remove('active');
      layers[activeLayer].setAttribute('aria-hidden', 'true');
      next.classList.add('active');
      next.removeAttribute('aria-hidden');
      activeLayer = nextLayer;
      index = candidate;
      caption.textContent = photos[index].caption;
      if (manual) announcement.textContent = photos[index].alt;
      // Finish the crossfade before reusing either image layer.
      await new Promise(resolve => setTimeout(resolve, motion.matches ? 0 : 1800));
    }
    busy = false;
    schedule();
  }
  root.querySelector('[data-slide-prev]').addEventListener('click', () => show(index - 1, true));
  root.querySelector('[data-slide-next]').addEventListener('click', () => show(index + 1, true));
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    focusPaused = false;
    schedule();
  });
  root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  root.addEventListener('focusin', () => { focusPaused = true; schedule(); });
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) { focusPaused = false; schedule(); }
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowLeft' ? -1 : 1), true);
    }
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', event => {
    if (event.matches) userPaused = true;
    schedule();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.1 });
    observer.observe(root);
  }
  schedule();
}
document.querySelectorAll('[data-slideshow]').forEach(initSlideshow);
