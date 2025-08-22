(function(){
  async function loadConfig(){
    try{
      const r = await fetch('./gas.config.json', { cache: 'no-store' });
      if(!r.ok) throw new Error('no config');
      return await r.json();
    }catch(e){
      return {};
    }
  }
  function serialize(form){
    const fd = new FormData(form);
    const o = {};
    for (const [k,v] of fd.entries()) o[k]=v;
    return o;
  }
  function mailtoFallback(data, to){
    const subject = encodeURIComponent(`【サイト問い合わせ】${data.topic||''} ${data.name||''}`.trim());
    const body = encodeURIComponent(
`お名前: ${data.name||''}
Email: ${data.email||''}
電話: ${data.phone||''}
区分: ${data.topic||''}

本文:
${data.message||''}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }
  document.addEventListener('DOMContentLoaded', async () => {
    const cfg = await loadConfig();
    const endpoint = cfg.webapp_url;
    const to = cfg.to_email || 'esportscafe5g@gmail.com';
    const form = document.getElementById('contactForm');
    const status = document.getElementById('status');
    if (!form) return;

    // Ensure we only hook once
    if (window.__GAS_CONTACT_HOOKED__) return;
    window.__GAS_CONTACT_HOOKED__ = true;

    form.addEventListener('submit', async (e)=>{
      if(!endpoint) return; // no GAS configured -> let other handlers run
      // Stop default submit and STOP other listeners (e.g., /api/contact handler)
      e.preventDefault();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      if (e.stopPropagation) e.stopPropagation();

      if (form.dataset.sending === '1') return;
      form.dataset.sending = '1';

      status.textContent = '送信中... / Sending...';
      const data = serialize(form);
      if (data.website) { status.textContent = 'Spam detected.'; status.className='status ng'; form.dataset.sending=''; return; }

      try{
        const res = await fetch(endpoint, {
          method:'POST',
          headers:{'Content-Type':'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            to: to,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            topic: data.topic || '',
            message: data.message || '',
            subject: '【ESPORTSCAFE 5G】お問い合わせ'
          })
        });
        if(res.ok){
          status.textContent = 'ありがとうございました。送信が完了しました。/ 已发送，我们会尽快联系您。/ Sent successfully.';
          status.className='status ok';
          form.reset();
        }else{
          mailtoFallback(data, to);
        }
      }catch(err){
        console.error(err);
        mailtoFallback(data, to);
      } finally {
        form.dataset.sending='';
      }
    }, {capture:true});
  });
})();