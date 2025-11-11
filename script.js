
document.addEventListener('DOMContentLoaded', () => {
  const hamb = document.getElementById('hamb');
  const nav  = document.getElementById('nav');
  if(hamb && nav){
    hamb.addEventListener('click', ()=> { nav.classList.toggle('open'); hamb.classList.toggle('open'); });
  }
});

document.addEventListener('DOMContentLoaded', function(){
  const gridImgs = Array.from(document.querySelectorAll('.img-grid img'));
  if(!gridImgs.length) return;

  let lb = document.getElementById('lightbox');
  if(!lb){
    lb = document.createElement('div');
    lb.className = 'lightbox'; lb.id = 'lightbox';
    lb.innerHTML = `
      <button class="close" aria-label="閉じる" id="lbClose">×</button>
      <div class="nav"><button class="btn" id="lbPrev">‹</button><button class="btn" id="lbNext">›</button></div>
      <img id="lbImg" src="" alt=""><div class="caption" id="lbCap"></div>`;
    document.body.appendChild(lb);
  }

  const img  = lb.querySelector('#lbImg');
  const cap  = lb.querySelector('#lbCap');
  const prev = lb.querySelector('#lbPrev');
  const next = lb.querySelector('#lbNext');
  const xbtn = lb.querySelector('#lbClose');

  let idx = 0;
  function show(i){
    idx = i;
    const el = gridImgs[idx];
    img.src = el.currentSrc || el.src;
    img.alt = el.alt || '';
    cap.textContent = el.alt || '';
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function hide(){
    lb.classList.remove('active');
    setTimeout(()=>{ img.src=''; }, 180);
    document.body.style.overflow = '';
  }
  function nav(d){ idx = (idx + d + gridImgs.length) % gridImgs.length; show(idx); }

  gridImgs.forEach((el,i)=> el.addEventListener('click', ()=> show(i), {passive:true}) );
  prev.addEventListener('click', e=>{e.stopPropagation(); nav(-1);});
  next.addEventListener('click', e=>{e.stopPropagation(); nav(1);});
  xbtn.addEventListener('click', hide);
  lb.addEventListener('click', (e)=>{ if(e.target === lb) hide(); });
  document.addEventListener('keydown', (e)=>{
    if(!lb.classList.contains('active')) return;
    if(e.key === 'Escape') hide();
    if(e.key === 'ArrowLeft') nav(-1);
    if(e.key === 'ArrowRight') nav(1);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const figs = document.querySelectorAll('.img-grid figure');
  if(!figs.length) return;
  figs.forEach(f => f.classList.add('reveal'));
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold:0.2 });
  figs.forEach(f => io.observe(f));
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.img-grid img').forEach(img => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.img-grid.scroll-x.auto-scroll').forEach((el)=>{
    if (reduce) return; 

    let dir = 1, rafId = null;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const speed = isMobile ? 0.25 : 0.6; 

    const tick = () => {
      el.scrollLeft += dir * speed;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) dir = -1;
      if (el.scrollLeft <= 0) dir = 1;
      rafId = requestAnimationFrame(tick);
    };
    const start = () => { if(!rafId) rafId = requestAnimationFrame(tick); };
    const stop  = () => { cancelAnimationFrame(rafId); rafId = null; };

    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e => e.isIntersecting ? start() : stop());
    }, { threshold: .1 });
    io.observe(el);

    ['mouseenter','touchstart','focusin'].forEach(ev => el.addEventListener(ev, stop, {passive:true}));
    ['mouseleave','touchend','blur'].forEach(ev => el.addEventListener(ev, start, {passive:true}));
  });
});


/* === Sticky header shadow on scroll (2025-11-11) === */
document.addEventListener('DOMContentLoaded', function(){
  var hdr = document.querySelector('.hdr');
  if(!hdr) return;
  function upd(){
    if(window.scrollY > 0){ hdr.classList.add('is-scrolled'); }
    else{ hdr.classList.remove('is-scrolled'); }
  }
  upd();
  window.addEventListener('scroll', upd, { passive: true });
});


/* === Sync header height variable for fixed header (2025-11-11) === */
document.addEventListener('DOMContentLoaded', function(){
  var hdr = document.querySelector('.hdr');
  if(!hdr) return;
  var ticking = false;
  function setHdrVar(){
    document.documentElement.style.setProperty('--hdrHpx', hdr.offsetHeight + 'px');
    ticking = false;
  }
  function requestSet(){
    if(!ticking){ requestAnimationFrame(setHdrVar); ticking = true; }
  }
  // update on load, scroll (to catch compressed state), and resize
  requestSet();
  window.addEventListener('resize', requestSet, { passive: true });
  window.addEventListener('scroll', requestSet, { passive: true });
});


/* === Hamburger dropdown behaviors (2025-11-11 v6) === */
document.addEventListener('DOMContentLoaded', function(){
  var hamb = document.getElementById('hamb');
  var nav  = document.getElementById('nav');
  if(!hamb || !nav) return;

  function closeNavDropdown(){ nav.classList.remove('open'); }
  function isInside(el, parent){ while(el){ if(el===parent) return true; el = el.parentElement; } return false; }

  // Close on click outside
  document.addEventListener('click', function(e){
    if(nav.classList.contains('open')){
      if(e.target===hamb || isInside(e.target, hamb)) return;
      if(isInside(e.target, nav)) return;
      closeNavDropdown();
    }
  });

  // Close on ESC
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeNavDropdown(); }
  });

  // Close after selecting a link
  nav.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(a){ closeNavDropdown(); }
  });
});


/* === v9: lock body scroll and backdrop when menu open === */
document.addEventListener('DOMContentLoaded', function(){
  var hamb = document.getElementById('hamb');
  var nav  = document.getElementById('nav');
  if(!hamb || !nav) return;

  function setBodyLock(){
    if(nav.classList.contains('open')){
      document.body.classList.add('menu-open');
    }else{
      document.body.classList.remove('menu-open');
    }
  }

  // Hook into existing click that toggles .open
  hamb.addEventListener('click', setBodyLock);

  // Also run when closing via other handlers (outside click, ESC, link click)
  document.addEventListener('click', function(){ setTimeout(setBodyLock, 0); }, { passive: true });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setTimeout(setBodyLock, 0); }, { passive: true });
});


/* === v11: Robust open/close for dropdown === */
document.addEventListener('DOMContentLoaded', function(){
  var hamb = document.getElementById('hamb');
  var nav  = document.getElementById('nav');
  if(!hamb || !nav) return;

  function syncBody(){
    if(nav.classList.contains('open')) document.body.classList.add('menu-open');
    else document.body.classList.remove('menu-open');
  }
  function toggleMenuOpen(force){
    var willOpen = (typeof force === 'boolean') ? force : !nav.classList.contains('open');
    nav.classList.toggle('open', willOpen);
    hamb.classList.toggle('open', willOpen);
    hamb.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    syncBody();
  }

  hamb.addEventListener('click', function(e){
    e.stopPropagation();  // prevent outside-click handler from firing immediately
    toggleMenuOpen();
  });

  // Close on clicking outside nav/hamb
  document.addEventListener('click', function(e){
    if(!nav.classList.contains('open')) return;
    if(e.target===hamb || hamb.contains(e.target)) return;
    if(nav.contains(e.target)) return;
    toggleMenuOpen(false);
  }, { passive: true });

  // Close on ESC
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') toggleMenuOpen(false);
  });

  // Close after selecting a link
  nav.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(a){ toggleMenuOpen(false); }
  });
});


// === Robust Mobile Menu Controller (id:nav / id:hamb) ===
(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  ready(function(){
    var hamb = document.getElementById('hamb');
    var nav  = document.getElementById('nav');
    if(!hamb || !nav) return;

    function isMobile(){
      // Use same breakpoint as CSS (<=960px)
      return (window.matchMedia && window.matchMedia('(max-width: 960px)').matches) || window.innerWidth <= 960;
    }

    function openMenu(){
      nav.classList.add('open');
      hamb.classList.add('open');
      // Fallback to inline style to beat any conflicting CSS
      if(isMobile()){
        nav.style.display = 'flex';
      }else{
        nav.style.display = ''; // desktop layout uses CSS
      }
      hamb.setAttribute('aria-expanded','true');
    }
    function closeMenu(){
      nav.classList.remove('open');
      hamb.classList.remove('open');
      if(isMobile()){
        nav.style.display = 'none';
      }else{
        nav.style.display = '';
      }
      hamb.setAttribute('aria-expanded','false');
    }
    function toggleMenu(e){
      e && e.preventDefault();
      if(nav.classList.contains('open')) closeMenu(); else openMenu();
    }

    // Initialize collapsed on mobile to avoid "stuck open" states
    function syncOnResize(){
      if(isMobile()){
        // default collapsed
        if(!nav.classList.contains('open')) nav.style.display = 'none';
      }else{
        // desktop uses normal inline nav
        nav.style.display = '';
        nav.classList.remove('open');
        hamb.classList.remove('open');
      }
    }

    hamb.setAttribute('aria-controls','nav');
    hamb.setAttribute('aria-expanded','false');

    // Handle click & touch
    ['click','touchstart'].forEach(function(ev){
      hamb.addEventListener(ev, toggleMenu, {passive:false});
    });

    // Close when a nav link is tapped
    nav.addEventListener('click', function(ev){
      var t = ev.target;
      if(t && (t.tagName === 'A' || t.closest('a'))) closeMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', function(ev){
      if(ev.key === 'Escape') closeMenu();
    });

    // Keep states consistent
    window.addEventListener('resize', syncOnResize);
    syncOnResize();
  });
})();


// === Ultra-Robust Binding for Header Menu ===
(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  function bind(){ 
    var hdr = document.querySelector('header.hdr') || document;
    var hamb = hdr.querySelector('#hamb, button.hamb');
    var nav  = hdr.querySelector('#nav, nav.nav');
    if(!hamb || !nav) return false;
    if(hamb._esc5gBound) return true;
    hamb._esc5gBound = true;
    // Reuse existing functions if present
    var openMenu = window.__esc5gOpenMenu, closeMenu = window.__esc5gCloseMenu, toggleMenu = window.__esc5gToggleMenu;
    if(!openMenu || !closeMenu || !toggleMenu){
      function isMobile(){ return (window.matchMedia && window.matchMedia('(max-width: 960px)').matches) || window.innerWidth <= 960; }
      openMenu = window.__esc5gOpenMenu = function(){
        nav.classList.add('open'); hamb.classList.add('open');
        if(isMobile()){ nav.style.display='flex'; } else { nav.style.display=''; }
        hamb.setAttribute('aria-expanded','true');
      };
      closeMenu = window.__esc5gCloseMenu = function(){
        nav.classList.remove('open'); hamb.classList.remove('open');
        if(isMobile()){ nav.style.display='none'; } else { nav.style.display=''; }
        hamb.setAttribute('aria-expanded','false');
      };
      toggleMenu = window.__esc5gToggleMenu = function(e){ e && e.preventDefault(); (nav.classList.contains('open')?closeMenu:openMenu)(); };
      function syncOnResize(){
        if(((window.matchMedia && window.matchMedia('(max-width: 960px)').matches) || window.innerWidth <= 960)){
          if(!nav.classList.contains('open')) nav.style.display='none';
        }else{
          nav.style.display=''; nav.classList.remove('open'); hamb.classList.remove('open');
        }
      }
      window.addEventListener('resize', syncOnResize);
      syncOnResize();
      document.addEventListener('keydown', function(ev){ if(ev.key==='Escape') closeMenu(); });
      nav.addEventListener('click', function(ev){ var a = ev.target.closest('a'); if(a) closeMenu(); });
    }
    ['click','touchstart'].forEach(function(ev){ hamb.addEventListener(ev, toggleMenu, {passive:false}); });
    hamb.setAttribute('aria-controls','nav');
    hamb.setAttribute('aria-expanded','false');
    return true;
  }
  ready(function(){
    bind();
    // Observe DOM swaps (if any) after language switch or partial reloads
    var mo = new MutationObserver(function(){ bind(); });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  });
})();


// === Per-Header Binding (supports multiple headers or different locales) ===
(function(){
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  function isMobile(){ return (window.matchMedia && window.matchMedia('(max-width: 960px)').matches) || window.innerWidth <= 960; }

  function bindHeader(hdr){
    var hamb = hdr.querySelector('#hamb, button.hamb');
    var nav  = hdr.querySelector('#nav, nav.nav');
    if(!hamb || !nav) return false;
    if(hamb._esc5gBound) return true;
    hamb._esc5gBound = true;

    function openMenu(){
      nav.classList.add('open'); hamb.classList.add('open');
      if(isMobile()){ nav.style.display='flex'; } else { nav.style.display=''; }
      hamb.setAttribute('aria-expanded','true');
    }
    function closeMenu(){
      nav.classList.remove('open'); hamb.classList.remove('open');
      if(isMobile()){ nav.style.display='none'; } else { nav.style.display=''; }
      hamb.setAttribute('aria-expanded','false');
    }
    function toggleMenu(e){ e && e.preventDefault(); (nav.classList.contains('open')?closeMenu:openMenu)(); }

    ['click','touchstart'].forEach(function(ev){ hamb.addEventListener(ev, toggleMenu, {passive:false}); });
    nav.addEventListener('click', function(ev){ if(ev.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function(ev){ if(ev.key==='Escape') closeMenu(); });

    function syncOnResize(){
      if(isMobile()){
        if(!nav.classList.contains('open')) nav.style.display='none';
      }else{
        nav.style.display=''; nav.classList.remove('open'); hamb.classList.remove('open');
      }
    }
    window.addEventListener('resize', syncOnResize);
    syncOnResize();

    hamb.setAttribute('aria-controls','nav'); hamb.setAttribute('aria-expanded','false');
    return true;
  }

  ready(function(){
    // Bind to all header.hdr instances
    var headers = document.querySelectorAll('header.hdr');
    if(headers.length){
      headers.forEach(bindHeader);
    }else{
      // Fallback to document-level search (legacy markup)
      bindHeader(document);
    }
    // Rebind if DOM swaps
    var mo = new MutationObserver(function(){ 
      document.querySelectorAll('header.hdr').forEach(bindHeader);
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  });
})();
