/**
 * Google Apps Script Web App
 * Deploy: Publish -> Deploy as web app -> Execute as "Me" -> Who has access: "Anyone"
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData) {
      if (e.postData.type === 'application/json') {
        data = JSON.parse(e.postData.contents || '{}');
      } else {
        // application/x-www-form-urlencoded
        data = e.parameter || {};
      }
    }
    var to = (data.to || 'esportscafe5g@gmail.com').trim();
    var name = (data.name || '').trim();
    var fromEmail = (data.email || '').trim();
    var phone = (data.phone || '').trim();
    var topic = (data.topic || '').trim();
    var message = (data.message || '').trim();
    var subjectPrefix = (data.subject || '【ESPORTSCAFE 5G】お問い合わせ').trim();
    var subject = subjectPrefix + (topic ? ' ' + topic : '') + (name ? ' - ' + name : '');

    var html = ''
      + '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.7">'
      + '<h2>📩 新しいお問い合わせ / New Inquiry</h2>'
      + '<table cellspacing="0" cellpadding="8" style="border-collapse:collapse;border:1px solid #e5e7eb">'
      + '<tr><td style="background:#f9fafb;border:1px solid #e5e7eb"><b>名前 / 姓名</b></td><td style="border:1px solid #e5e7eb">' + escapeHtml(name) + '</td></tr>'
      + '<tr><td style="background:#f9fafb;border:1px solid #e5e7eb"><b>Email</b></td><td style="border:1px solid #e5e7eb">' + escapeHtml(fromEmail) + '</td></tr>'
      + '<tr><td style="background:#f9fafb;border:1px solid #e5e7eb"><b>電話 / Phone</b></td><td style="border:1px solid #e5e7eb">' + escapeHtml(phone) + '</td></tr>'
      + '<tr><td style="background:#f9fafb;border:1px solid #e5e7eb"><b>用件 / Topic</b></td><td style="border:1px solid #e5e7eb">' + escapeHtml(topic) + '</td></tr>'
      + '</table>'
      + '<h3 style="margin-top:16px">内容 / Message</h3>'
      + '<pre style="white-space:pre-wrap;background:#0b0b0b;color:#e5e7eb;padding:12px;border-radius:8px">'
      + escapeHtml(message)
      + '</pre>'
      + '</div>';

    MailApp.sendEmail({
      to: to,
      replyTo: fromEmail || '',
      name: 'ESPORTSCAFE 5G',
      subject: subject,
      htmlBody: html
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Simple HTML escaper */
function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
