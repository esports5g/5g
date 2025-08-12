
# 上传包（响应式 + 图墙放大 已集成）

把这 2 个文件替换到你仓库根目录：

- `styles.css`（包含 PC + Mobile 响应式样式、Gallery 3×2、自适应、Lightbox 风格）
- `script.js`（包含移动端汉堡菜单和图片 Lightbox 功能）

## 在每个 HTML 页确认以下 2 件事：
1. `<head>` 里引用样式：
```html
<link rel="stylesheet" href="./styles.css">
```
2. `</body>` 之前引用脚本：
```html
<script src="./script.js"></script>
```

> 注意：不要同时再引入旧的 CSS/JS（否则会打架）。

## 导航（如果你有手机汉堡按钮）：
```html
<button id="hamb" class="hamb" aria-label="menu">
  <span></span><span></span><span></span>
</button>
<nav id="nav" class="nav"> ... </nav>
```
脚本会把 `#hamb` 与 `#nav` 连接起来，移动端点击可展开/收起。

## Gallery（不改 HTML 即可生效）
你现有的：
```html
<div class="img-grid">
  <figure><img src="./assets/img/rigs_top_row.jpg" alt=""></figure>
  ...
</div>
```
脚本会自动为 `.img-grid img` 加上点击放大。无需额外容器。

## GitHub Pages 刷新
提交到 `main` 分支后，等待 1~2 分钟。强制刷新（Ctrl+F5）或在 URL 后加 `?v=2`。

