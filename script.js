
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
document.getElementById('hamb')?.addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));
// active nav
document.querySelectorAll('.nav a').forEach(a=>{
  if(location.pathname.endsWith(a.getAttribute('href'))) a.style.opacity=1;
});
// copy + toast
(function(){
  const toast = document.getElementById('toast');
  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg || 'コピーしました';
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 1600);
  }
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-copy]');
    if(!btn) return;
    navigator.clipboard.writeText(btn.getAttribute('data-copy')||'').then(()=>showToast('コピーしました'));
  });
})();
// ---- Lightbox for .img-grid ----
(function(){
  const gridImgs = Array.from(document.querySelectorAll('.img-grid img'));
  if(!gridImgs.length) return;

  const lb   = document.getElementById('lightbox');
  const img  = document.getElementById('lbImg');
  const cap  = document.getElementById('lbCap');
  const prev = document.getElementById('lbPrev');
  const next = document.getElementById('lbNext');
  const xbtn = document.getElementById('lbClose');

  let idx = 0;

  function open(i){
    idx = i;
    const el = gridImgs[idx];
    img.src = el.src;
    img.alt = el.alt || '';
    cap.textContent = el.alt || '';
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.classList.remove('active');
    img.src = '';
    document.body.style.overflow = '';
  }
  function nav(d){
    idx = (idx + d + gridImgs.length) % gridImgs.length;
    open(idx);
  }

  gridImgs.forEach((el,i)=>{
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', ()=> open(i));
  });

  prev.addEventListener('click', e=>{e.stopPropagation(); nav(-1);});
  next.addEventListener('click', e=>{e.stopPropagation(); nav(1);});
  xbtn.addEventListener('click', close);
  lb.addEventListener('click', (e)=>{ if(e.target === lb) close(); });

  // 键盘：Esc 关闭，←/→ 切换
  document.addEventListener('keydown', (e)=>{
    if(!lb.classList.contains('active')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') nav(-1);
    if(e.key === 'ArrowRight') nav(1);
  });
})();
