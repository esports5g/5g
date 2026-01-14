/* ESPORTS CAFE 5G — clean interactions (no text changes) */
(function(){
  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  document.addEventListener('DOMContentLoaded', function(){
    const hamb = qs('#hamb');
    const nav  = qs('#nav');

    // Mobile menu
    function setMenu(open){
      if(!nav || !hamb) return;
      nav.classList.toggle('open', open);
      hamb.classList.toggle('open', open);
      hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    }
    if(hamb && nav){
      hamb.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        setMenu(!nav.classList.contains('open'));
      });
      document.addEventListener('click', function(e){
        if(!nav.classList.contains('open')) return;
        if(hamb.contains(e.target) || nav.contains(e.target)) return;
        setMenu(false);
      });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape') setMenu(false);
      });
      nav.addEventListener('click', function(e){
        const a = e.target.closest('a');
        if(a) setMenu(false);
      });
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

    // Gallery reveal
    const figs = qsa('.img-grid figure');
    if(figs.length){
      figs.forEach(f => f.classList.add('reveal'));
      const io = new IntersectionObserver((ents)=>{
        ents.forEach(e => { if(e.isIntersecting) e.target.classList.add('show'); });
      }, { threshold: 0.18 });
      figs.forEach(f => io.observe(f));
    }

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
        setTimeout(()=>{ img.src=''; }, 120);
      }
      function navBy(d){
        idx = (idx + d + imgs.length) % imgs.length;
        show(idx);
      }

      imgs.forEach((el,i)=>{
        el.style.cursor = 'zoom-in';
        el.addEventListener('click', ()=>show(i), {passive:true});
      });

      prev && prev.addEventListener('click', (e)=>{ e.stopPropagation(); navBy(-1); });
      next && next.addEventListener('click', (e)=>{ e.stopPropagation(); navBy(1); });
      xbtn && xbtn.addEventListener('click', hide);
      lb.addEventListener('click', (e)=>{ if(e.target === lb) hide(); });

      document.addEventListener('keydown', (e)=>{
        if(!lb.classList.contains('active')) return;
        if(e.key === 'Escape') hide();
        if(e.key === 'ArrowLeft') navBy(-1);
        if(e.key === 'ArrowRight') navBy(1);
      });
    }
  });
})();
