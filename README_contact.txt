問い合わせページ & メール送信（Vercel想定）
================================================

このフォルダには、以下のファイルを追加しました：
- contact.html  … お問い合わせフォーム本体（JP/ZH/EN）
- /api/contact.js … Vercel サーバーレス関数（Nodemailer で Gmail 送信）

【使い方（Vercel）】
1) リポジトリにこの2ファイルを追加して push。
2) Vercel ダッシュボード -> Project Settings -> Environment Variables に以下を追加：
   - SMTP_USER = esportscafe5g@gmail.com
   - SMTP_PASS = （Google アカウントで2段階認証を有効化後、「アプリ パスワード」を作成して設定）
   - （任意）MAIL_TO = 受信先を変えたい場合はここにメールアドレス
   - （任意）MAIL_FROM = From を変更したい場合
   追加後、再デプロイしてください。
3) デプロイ後、 https://あなたのドメイン/contact.html でフォーム送信をテスト。

【既存ナビからのリンク】
サイトのナビゲーションに「お問い合わせ」リンク（/contact.html）を追加してください。

【補足】
- フロント側は FormData 送信（multipart）ですが、環境により x-www-form-urlencoded が必要な場合があります。その場合は fetch の body を URLSearchParams に変えるだけでOKです。
- 迷惑メール対策として、簡易ハニーポット（website フィールド）を入れています。

【Vercel 以外の選択肢】
- Google Apps Script を使う方法（サーバ不要）も可能です。必要なら GAS スクリプトもご提供できます。


【中文说明（Vercel 部署）】
1) 把 contact.html 和 api/contact.js 两个文件加入你的站点仓库并推送（push）。
2) 在 Vercel 项目后台 -> Settings -> Environment Variables 新增：
   - SMTP_USER = esportscafe5g@gmail.com
   - SMTP_PASS = 你的 Gmail【应用专用密码】（必须先开启两步验证，然后生成 App Password）
   - （可选）MAIL_TO = 如果想把收件地址改为其他邮箱
   - （可选）MAIL_FROM = 自定义发件人显示名
   添加后重新部署。
3) 部署完成后访问 https://你的域名/contact.html 测试提交是否能收到邮件。

注意：我们已将前端改为使用 application/x-www-form-urlencoded 方式提交，后端会稳定解析。
如果需要防垃圾增强（如 reCAPTCHA、hCaptcha），告诉我我可以帮你追加。

【如果不用 Vercel】
- 也可以用 Google Apps Script 做纯前端收信。若你需要，我可以给你一份 GAS 脚本和接入步骤。


【Google Apps Script（纯前端直通邮箱方案）】
1) 打开 https://script.google.com/ → 新建脚本，把仓库里的 `GAS_webapp_code.gs` 全部复制粘贴进去并保存。
2) 点击“部署”→“部署为网络应用”，执行身份选“本人（Me）”，访问权限选“任何人”。部署后会得到一个 Web 应用 URL。
3) 把得到的 URL 填入站点根目录 `gas.config.json` 的 `webapp_url` 字段；`to_email` 可改为你的收件邮箱（默认就是 esportscafe5g@gmail.com）。
4) 重新发布你的网站（纯静态即可）。前端会直接向该URL发送请求，GAS会把邮件投递到你邮箱。
5) 若 GAS 失败，表单会自动 fallback 到 `mailto:` 打开用户自己的邮件客户端，保证可以联系到你。

（可选）如果你更希望使用 EmailJS，也可以把 `email.config.json` 中的参数填写完整，并在前端引用对应脚本。
