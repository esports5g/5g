
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
