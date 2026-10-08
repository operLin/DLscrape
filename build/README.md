# DLscrape — 改进版构建说明

`upstream/dlsite-play-downloader-v2.2.1.user.js` 是**上游编译产物**（Vite + vite-plugin-monkey → SystemJS register 格式），不是手写源码。
本目录把「改动代码」保存为独立片段，用 `apply.mjs` 按行区间拼接回原始 bundle，从而得到可复现、
可 review 的改进版 userscript。

## 产物

| 文件 | 说明 |
|---|---|
| `../DLscrape.user.js` | 改进版 userscript，可直接拖进 Tampermonkey / Violentmonkey 安装 |
| `../upstream/dlsite-play-downloader-v2.2.1.user.js` | 上游 v2.2.1 编译产物，**只读输入、保持字节未修改**（行号锚点依赖它） |

## 构建与验证

```powershell
node build/apply.mjs          # 生成 / 刷新改进版 userscript
node --check ..\DLscrape.user.js   # 语法校验
node build/verify.mjs         # 拼接完整性 + 悬挂引用 + 下载内核 + UI 渲染桩测试 + 头部元数据（68 项）

# 真实 Vue + jsdom 集成测试（需一次性安装测试依赖，见 build/package.json）
cd build; npm i; cd ..
node build/dom-test.mjs       # 32 项
```

`apply.mjs` 会在替换前对每个区间的**起始行做内容断言**，行号漂移时直接报错而不是静默改错地方。
它同时把输出文件的油猴头改写成 fork 版元数据（文件顶部的 `FORK` 配置块）：`@name` / `@version` /
`@namespace` / `@supportURL` / `@downloadURL` / `@updateURL`。**这一改写是逐行等长替换**，
因此不会移动任何行号锚点；上游产物始终保持字节不变。

## 拼接点（行号基于 `upstream/dlsite-play-downloader-v2.2.1.user.js`）

| 行区间 | 内容 | 片段 |
|---|---|---|
| 3013–3015 | `extractDlsiteId` → 平台识别（`detectPlayPlatform`）+ 兼容 comipo 路由的作品号提取 | `parts/00-work-id.js` |
| 3051–3058 | `hookFetchPuzzle` 的 resolve：由「一次性 download 回调」改为「页列表 + 单页 loader」 | `parts/01-puzzle-resolve.js` |
| 3071–3112 | 下载凭据 / ziptree / 作品元信息改为平台感知，并新增 comipo 主动解析 `resolveComipoPages` | `parts/06-content-api.js` |
| 3195–3336 | 旧 `downloadPuzzleImagesToZip` / `restorePuzzleImage` 等 → 新下载内核 | `parts/02-engine.js` |
| 7956–7999 | `hookXorEnc` 的 resolve：改为页列表 + 检测超时；`makeArtworkSaveName` 加空值保护 | `parts/07-xor-enc.js` |
| 8000–8024 | `makeEncBinUrls`：支持没有 `.enc` 编号的 URL（comipo 的签名 query 原样保留） | `parts/08-enc-bin-urls.js` |
| 8025–8084 | 密钥/页面请求钩子：新增 comipo 接口与图片 URL 匹配，元信息钩子不再阻塞检测 | `parts/09-xor-hooks.js` |
| 8115–8194 | 旧 `downloadAndDecryptToZip` → 单页 XOR 抓取器（支持 hex 文本密钥与 comipo 密钥形态） | `parts/04-xor-fetch.js` |
| 8253–8446 | 旧的编译模板 App → 手写 `h()` 渲染的新 UI + 新 CSS | `parts/05-app.js` |
| 第 25 行 | 给 SystemJS 的 `vue` 命名空间补 `h`（`var ref,createApp,h,warn,` + `h=module.h;`） | 由 `apply.mjs` 做字符串替换 |

## 本次改动对应的功能

1. **Material Design 3 界面** — 整套主题改用 M3 design token（`--md-*`）：surface 层级、primary/secondary/error
   容器色、Roboto 字体与字距、40px 控件高度、20px 胶囊按钮、分段滑块（switch）、侧边栏（side sheet）形态，
   并通过 `@media (prefers-color-scheme: dark)` 覆盖同一批 token 自动适配深色模式。可折叠、无毛玻璃拟态。
   滑块档位（`.dpd-switch-item`）、胶囊按钮（`.dpd-btn`）、小按钮（`.dpd-mini`）与下拉框（`.dpd-select`）
   都用 `display:inline-flex` + `justify-content:center` + `text-align:center` 让文字在控件内部居中。
2. **页码范围** — `起始 → 结束` 两个输入框 + 「全部」快捷按钮，实时显示选中页数；只抓取选中区间。
3. **输出方式 + 输出格式** — 第一组滑块在「逐页 / 压缩」间切换，右侧第二组滑块独立选择
   「JPG / PNG」。图片模式优先调用 `showDirectoryPicker()` 直接写入所选文件夹（避免几百次下载提示），
   不支持或失败时退化为逐个文件下载。
4. **文件命名（三档滑块）** — 「页号 / 顺序 / 原始」：
   - 页号：`001.jpg`、`002.jpg`…，使用**原始页号**，只下载 10–20 页时得到 `010.jpg`–`020.jpg`，位数可选 2–5（默认 3）；
   - 顺序：按本次下载顺序从 `001` 重新编号（第 10–20 页 → `001`–`011`）；
   - 原始：保留 DLsite 原名，仅把扩展名校正为实际输出格式。
5. **任务进度面板** — 进度条 + 成功/失败计数 + 逐页状态列表（等待/下载中/成功/失败原因），
   可按「全部 / 失败」筛选；另有带时间戳的日志区。支持取消下载。
6. **comipo Play 支持** — 除了 DLsite Play，同一套脚本也支持 comipo 的换皮阅读器
   （`https://play.comipo.app/viewer/sample/<作品号>`、`/viewer/free/<作品号>`）。检测到 comipo 时
   整个面板切换为绿色 M3 主题（`.dpd-panel.is-comipo` 覆盖 primary 一系 token），标题副行与徽章显示
   `comipo`。检测走**主动解析**：`POST /api/comipo/sample/viewer/token/<no>`（免费作品走
   `/viewer/free/` 分支）拿到带 S3 签名的内容前缀 → `viewer-meta.json` 取页表与
   `decryption.key`（64 位 hex 文本）→ 每页 `.enc` XOR 解密后按文件头嗅探（WebP/JPEG/PNG）再按用户
   选择的 JPG/PNG 输出。主动解析失败（例如接口变更、需要登录的付费内容）时自动回退到原有的被动
   hook 检测；检测竞速会忽略「没有页数据」的空结果，并且元信息钩子有 6 秒上限、整体检测有 20 秒上限，
   不会再像原版那样静默卡在「正在检测加密方式…」。

## 关键约定

- 检测链路只负责产出 `pages: [{ pageNo, originalName, load({ format, quality }) -> { blob, ext } }]`，
  下载、命名、打包、进度全部由 `executeDownloadJob()` 统一处理。
- 输出格式由 `options.format`（`"jpg" | "png"`）决定，并透传给 `page.load`；旧参 `asJpeg: true/false`
  仍被接受（`false` → png）以保持向后兼容。拼图链路用 canvas 分别编码 JPEG（可调 quality）或 PNG；
  XOR 链路若原始字节已是目标格式则直接复用（不重编码、不损失画质），否则用 canvas 转码。
- 命名由 `options.naming`（`"page" | "seq" | "original"`）决定；旧参 `rename: false` 等价于 `"original"`。
- **重复注入去重**：脚本可能在同一文档被安装两次（或与旧版并存）。`mountApp()` 用
  `__dpdPanelHost` 单例标记保证只挂载一个面板，并调用 `removeForeignPanels()` 清掉别人的
  `.dlsite-play-downloader-vue` / `.dpd-panel` / 原版 `.plugin-area` 宿主；同时通过
  `top.__dpdHostState`（`yieldToSubFrame()`）让真正检测到加密方式的那一帧显示面板，避免顶层与
  iframe 各挂一个却都停在「正在检测加密方式…」。
- comipo 的检测器与 DLsite 的拼图检测器**互斥**：`state.platform === "comipo"` 时只用
  `[resolveComipoPages(workNo), hookXorEnc()]`，DLsite 页面上仍是 `[hookXorEnc(), hookFetchPuzzle()]`；
  `waitForUsableDetector()` 会丢弃 `null`/无 `data` 的结果，全部失败才把错误显示到面板上。
- 取消语义：取消后仍会把剩余页面逐个派发，但它们不做任何网络请求、直接记为 `skipped`，
  因此 `成功 + 失败 + 跳过 === 总数` 恒成立、进度条必然走到 100%。取消不会把任务标记为「已完成」；
  压缩包模式中途取消时按钮变为「保存不完整压缩包」，避免把残缺压缩包当成完整结果。
- 逐页（图片）模式若拿不到文件夹句柄（Firefox 等不支持 `showDirectoryPicker`），只能靠
  `<a download>` 逐个触发下载，此时强制单线程串行，否则浏览器会拦截批量下载。
- 文件夹写入时原始名称里的 `目录/文件` 会被逐层创建为子目录（`getDirectoryHandle`），
  不会因为名字里带 `/` 而抛 `TypeError`。
