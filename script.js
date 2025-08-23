
// ===== Mobile nav (hamburger) =====
document.addEventListener('DOMContentLoaded', () => {
  const hamb = document.getElementById('hamb');
  const nav  = document.getElementById('nav');
  if(hamb && nav){
    hamb.addEventListener('click', ()=> nav.classList.toggle('open'));
  }
});

// ===== Lightbox for .img-grid =====
document.addEventListener('DOMContentLoaded', function(){
  const gridImgs = Array.from(document.querySelectorAll('.img-grid img'));
  if(!gridImgs.length) return;

  // Create container if not present
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
// === Gallery: scroll-reveal ===
document.addEventListener('DOMContentLoaded', () => {
  const figs = document.querySelectorAll('.img-grid figure');
  if(!figs.length) return;
  figs.forEach(f => f.classList.add('reveal'));
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold:0.2 });
  figs.forEach(f => io.observe(f));
});
// === Mobile: lazy load images (节流首屏) ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.img-grid img').forEach(img => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
});

// === Gallery: auto-scroll (方案B) - mobile aware & respects reduced motion ===
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.img-grid.scroll-x.auto-scroll').forEach((el)=>{
    if (reduce) return; // 用户偏好“减少动效”则停用

    let dir = 1, rafId = null;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const speed = isMobile ? 0.25 : 0.6; // 手机上更慢更稳

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

    // 悬停/触摸/聚焦时暂停，离开继续
    ['mouseenter','touchstart','focusin'].forEach(ev => el.addEventListener(ev, stop, {passive:true}));
    ['mouseleave','touchend','blur'].forEach(ev => el.addEventListener(ev, start, {passive:true}));
  });
});
