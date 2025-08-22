
【Google Apps Script（纯前端直通邮箱方案）】
1) 你已经把 GAS 部署好了；此包内 `gas.config.json` 已写入你的 Web 应用 URL。
2) 把本包解压覆盖到你的网站根目录（与 index.html 同级）。
3) 访问 /contact.html 测试发送。成功后邮件会到 esportscafe5g@gmail.com；失败将自动回退到 mailto。

（可选）仍可保留 /api/contact 服务器端方案（需 Vercel 环境变量），作为备用。
