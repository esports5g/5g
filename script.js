
document.addEventListener('DOMContentLoaded', () => {
  const hamb = document.getElementById('hamb');
  const nav  = document.getElementById('nav');
  if(hamb && nav){
    hamb.addEventListener('click', ()=> nav.classList.toggle('open'));
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
