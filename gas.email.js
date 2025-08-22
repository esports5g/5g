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
    form.addEventListener('submit', async (e)=>{
      if(!endpoint) return; // let original handler run (fallback to serverless if present)
      e.preventDefault();
      status.textContent = '送信中... / Sending...';
      const data = serialize(form);
      if (data.website) { status.textContent = 'Spam detected.'; status.className='status ng'; return; }
      try{
        const res = await fetch(endpoint, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
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
          // If GAS returns non-OK, fallback to mailto to guarantee user can still reach you
          mailtoFallback(data, to);
        }
      }catch(err){
        console.error(err);
        mailtoFallback(data, to);
      }
    }, {capture:true});
  });
})();