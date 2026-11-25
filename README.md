# ESPORTS CAFE 5G

正式站使用 GitHub Pages，从 `main` 分支的仓库根目录部署。自定义域名配置在 `CNAME`。

- 日文首页为 `/`，英文首页为 `/en/`。内页内容在对应目录的 `index.html` 中，例如 `price/index.html` 和 `en/price/index.html`。
- 旧的 `.html` 地址保留跳转，以兼容已有链接。
- 全站共用 `styles.css` 和 `script.js`，图片和图标位于 `assets/`。

## 联系表单

日英文联系页使用 `gas.email.js` 从 `gas.config.json` 读取 Google Apps Script Web 应用地址。`GAS_webapp_code.gs` 保留部署时使用的后端源码。提交失败时，前端可打开访客的邮件客户端。
