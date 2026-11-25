/* ESPORTS CAFE 5G — clean interactions (no text changes) */
(function(){
  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  document.addEventListener('DOMContentLoaded', function(){
    const nav  = qs('#nav');

    // Mark current page in nav (works for both / and /en/ pages)
    if(nav){
      const path = (location.pathname || '').split('/').filter(Boolean);
      const current = (path[path.length - 1] || 'index.html');
      const links = qsa('a[href]', nav);
      const hit = links.find(a => {
        const href = (a.getAttribute('href')||'').split('#')[0];
        if(!href) return false;
        // match by last segment to tolerate relative paths
        const last = href.split('/').filter(Boolean).pop();
        return last === current;
      });
      if(hit){
        hit.classList.add('is-active');
      }
    }

    // Header shadow on scroll
    const hdr = qs('.hdr');
    function onScroll(){
      if(!hdr) return;
      hdr.classList.toggle('is-scrolled', window.scrollY > 4);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});

    // Sync header height for fixed/mobile cases
    function syncHdr(){
      if(!hdr) return;
      document.documentElement.style.setProperty('--hdrHpx', hdr.offsetHeight + 'px');
    }
    syncHdr();
    window.addEventListener('resize', syncHdr, {passive:true});

    // Lightbox (opt-in: if .img-grid exists)
    const imgs = qsa('.img-grid img');
    if(imgs.length){
      let lb = qs('#lightbox');
      if(!lb){
        lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.id = 'lightbox';
        lb.setAttribute('role','dialog');
        lb.setAttribute('aria-modal','true');
        lb.innerHTML = `
          <button class="close" aria-label="閉じる" id="lbClose">×</button>
          <div class="nav">
            <button class="btn" aria-label="前の画像" id="lbPrev">‹</button>
            <button class="btn" aria-label="次の画像" id="lbNext">›</button>
          </div>
          <img id="lbImg" src="" alt="">
          <div class="caption" id="lbCap"></div>`;
        document.body.appendChild(lb);
      }
      const img  = qs('#lbImg', lb);
      const cap  = qs('#lbCap', lb);
      const prev = qs('#lbPrev', lb);
      const next = qs('#lbNext', lb);
      const xbtn = qs('#lbClose', lb);

      let idx = 0;
      let trigger = null;
      function show(i){
        idx = i;
        const el = imgs[idx];
        img.src = el.currentSrc || el.src;
        img.alt = el.alt || '';
        cap.textContent = el.alt || '';
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      function hide(){
        lb.classList.remove('active');
        document.body.style.overflow = '';
        trigger?.focus();
      }
      function navBy(d){
        idx = (idx + d + imgs.length) % imgs.length;
        show(idx);
      }

      imgs.forEach((el,i)=>{
        const control = el.closest('button') || el;
        control.addEventListener('click', () => {
          trigger = control;
          show(i);
          xbtn?.focus();
        });
      });

      prev && prev.addEventListener('click', (e)=>{ e.stopPropagation(); navBy(-1); });
      next && next.addEventListener('click', (e)=>{ e.stopPropagation(); navBy(1); });
      xbtn && xbtn.addEventListener('click', hide);
      lb.addEventListener('click', (e)=>{ if(e.target === lb) hide(); });

      document.addEventListener('keydown', (e)=>{
        if(!lb.classList.contains('active')) return;
        if(e.key === 'Tab') {
          const controls = [xbtn, prev, next].filter(Boolean);
          const index = e.shiftKey ? 0 : controls.length - 1;
          if (document.activeElement === controls[index]) {
            e.preventDefault();
            controls[controls.length - 1 - index].focus();
          }
        }
        if(e.key === 'Escape') hide();
        if(e.key === 'ArrowLeft') navBy(-1);
        if(e.key === 'ArrowRight') navBy(1);
      });
    }
  });
})();

/* Ambient light follows mouse movement without replacing the native cursor. */
(function () {
  if (!matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
  const light = document.createElement('div');
  light.className = 'cursor-glow';
  light.setAttribute('aria-hidden', 'true');
  document.body.append(light);
  let frame = 0;
  let x = 0, y = 0;
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      light.style.setProperty('--glow-x', x + 'px');
      light.style.setProperty('--glow-y', y + 'px');
      light.classList.add('is-visible');
      frame = 0;
    });
  }, { passive: true });
  const hide = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    light.classList.remove('is-visible');
  };
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
})();


/* Mobile controls are progressive enhancement over the existing navigation. */
(function () {
  const root = document.documentElement;
  if (root.classList.contains('touch-effects-ready')) return;
  root.classList.add('touch-effects-ready');
  const nav = document.querySelector('.hdr #nav');
  if (nav) {
    const english = document.documentElement.lang === 'en';
    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'touch-menu';
    menu.textContent = english ? 'Menu' : 'メニュー';
    menu.setAttribute('aria-controls', nav.id);
    menu.setAttribute('aria-expanded', 'false');
    nav.before(menu);
    const close = () => menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', () => {
      menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') === 'false'));
    });
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        close();
        menu.focus();
      }
    });
    document.addEventListener('pointerdown', (event) => {
      if (!nav.contains(event.target) && !menu.contains(event.target)) close();
    }, { passive: true });
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const progress = document.createElement('div');
  progress.className = 'read-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  let frame = 0;
  function updateProgress() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const range = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty('--read-progress', range > 0 ? Math.max(0, Math.min(scrollY / range, 1)) : 0);
      frame = 0;
    });
  }
  window.addEventListener('scroll', updateProgress, { passive:true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const mast = document.querySelector('.new-stage,.page-mast');
  if (mast) {
    const shine = document.createElement('span');
    shine.className = 'touch-shine';
    shine.setAttribute('aria-hidden','true');
    mast.classList.add('motion-sweep');
    mast.append(shine);
    shine.addEventListener('animationend', () => shine.remove(), { once:true });
  }

  if ('IntersectionObserver' in window) {
    const surfaces = document.querySelectorAll('.fare-grid .card, .view-spec .card, .gallery-mosaic figure, .visit-panel, .guide-block, .topup-table, .faq-item');
    const observer = new IntersectionObserver((items) => {
      items.forEach((item) => {
        if (!item.isIntersecting) return;
        observer.unobserve(item.target);
        item.target.classList.add('is-arriving');
      });
    }, { threshold:.13 });
    surfaces.forEach((item, i) => {
      item.classList.add('motion-surface');
      item.style.setProperty('--arrival-delay', (i % 3) * 45 + 'ms');
      observer.observe(item);
    });
  }

  if (!('animate' in Element.prototype)) return;
  const flare = document.createElement('span');
  flare.className = 'touch-flare';
  flare.setAttribute('aria-hidden','true');
  document.body.append(flare);
  let activeFlare;
  document.addEventListener('pointerdown', (event) => {
    if (!['touch','pen'].includes(event.pointerType) || !event.target.closest('a,button,summary')) return;
    activeFlare?.cancel();
    const position = 'translate3d(' + (event.clientX - 45) + 'px,' + (event.clientY - 45) + 'px,0) ';
    activeFlare = flare.animate([
      { transform:position + 'scale(.18)', opacity:.82 },
      { transform:position + 'scale(1.2)', opacity:0 }
    ], { duration:380, easing:'ease-out' });
  }, { passive:true });
})();
