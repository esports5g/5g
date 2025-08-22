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
    // 静默回退：不显示错误，直接打开邮件客户端
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }
  function withTimeout(promise, ms){
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(), ms);
    return Promise.race([
      promise(ctrl.signal),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), ms+50))
    ]).finally(()=>clearTimeout(t));
  }
  document.addEventListener('DOMContentLoaded', async () => {
    const cfg = await loadConfig();
    const endpoint = cfg.webapp_url;
    const to = cfg.to_email || 'esportscafe5g@gmail.com';
    const form = document.getElementById('contactForm');
    const status = document.getElementById('status');
    if (!form) return;

    // 防重复绑定
    if (window.__GAS_CONTACT_HOOKED__) return;
    window.__GAS_CONTACT_HOOKED__ = true;

    form.addEventListener('submit', async (e)=>{
      // 只要配置了 GAS，就完全接管，取消其它监听器和默认行为
      if (endpoint) {
        e.preventDefault();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (e.stopPropagation) e.stopPropagation();
      }
      if (form.dataset.sending === '1') return;
      form.dataset.sending = '1';

      status.textContent = '送信中... / Sending...';
      const data = serialize(form);
      if (data.website) { form.dataset.sending=''; return; }

      try{
        if (endpoint){
          const ok = await withTimeout(async (signal)=>{
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
              }),
              signal
            });
            return res.ok;
          }, 12000); // 12s 超时
          if (ok){
            status.textContent = 'ありがとうございました。送信が完了しました。/ 已发送，我们会尽快联系您。/ Sent successfully.';
            status.className='status ok';
            form.reset();
            return;
          }
        }
        // 若未配置或失败：静默回退到 mailto，不显示红色错误
        mailtoFallback(data, to);
        status.textContent = 'メールソフトに切り替えました。/ 已切换到邮件发送。';
        status.className='status ok';
      }catch(err){
        // 任何异常也静默回退
        mailtoFallback(data, to);
        status.textContent = 'メールソフトに切り替えました。/ 已切换到邮件发送。';
        status.className='status ok';
      } finally {
        form.dataset.sending='';
      }
    }, {capture:true});
  });
})();