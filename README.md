# DLscrape

> DLsite Play（含 Comipo）漫画下载器 —— **改进版 / fork**。
> 基于 **cpufan** 的 [DLsite Play Downloader](https://github.com/cpuopt/DLsite-Play-Downloader) v2.2.1（MIT）。
> 上游的下载与解密内核逻辑不变，本仓库在其之上重做了界面并补上了几个下载体验上的短板。
> 原始版权归原作者所有，本仓库同样以 **MIT** 发布，详见 [LICENSE](LICENSE)。

在浏览器里完成 DLsite Play（含 Comipo）漫画的下载、拼图解密与保存。

## 相比上游的改进

| # | 功能 | 说明 |
|---|---|---|
| 1 | **Material Design 3 界面** | 整套主题改用 M3 token（surface 层级、primary/secondary/error 容器色）、40px 控件、胶囊按钮、分段滑块、侧边栏形态，并跟随系统深浅色；滑块档位与按钮文字均在控件内水平垂直居中 |
| 2 | **页码范围** | `起始 → 结束` 两个输入框 + 「全部」快捷按钮，实时显示选中页数；大篇幅作品可以只下一部分 |
| 3 | **输出方式 + 输出格式** | 两组独立滑块：`逐页 / 压缩`，以及 `JPG / PNG`。图片模式优先调用 `showDirectoryPicker()` 直接写入文件夹，避免几百次浏览器下载提示 |
| 4 | **三种文件命名** | `页号 / 顺序 / 原始` 三档滑块 + 位数选择（2–5，默认 3）。页号用原始页号（只下 10–20 页就是 `010.jpg`–`020.jpg`），顺序按本次下载顺序从 `001` 重排，原始保留 DLsite 原名 |
| 5 | **任务进度面板** | 进度条 + 成功/失败计数 + 逐页状态（等待/下载中/成功/失败原因）+ 可筛选的明细列表 + 带时间戳日志，支持取消 |
| 6 | **重复注入去重** | 同一文档被安装两次（或与旧版并存）时只保留一个面板，并清掉别人的面板宿主；顶层与 iframe 之间通过 `top.__dpdHostState` 让真正检测到加密方式的那一帧显示界面 |

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 Violentmonkey。
2. 打开 [`DLscrape.user.js`](DLscrape.user.js) 的 raw 链接安装：
   `https://github.com/operLin/DLscrape/raw/main/DLscrape.user.js`
3. 打开 DLsite Play 作品阅读页，右侧面板会自动检测加密方式（XOR / 拼图）并列出页数。

> 如果你同时装着上游原版，**建议先禁用原版**：两者会各自注入一个面板（本 fork 会清理对方的面板，但同名脚本装两份本身就容易混淆）。

## 从源码（本仓库的构建方式）

本仓库不含上游的 TypeScript + Vue SFC 源码 —— 上游发布的是**编译产物**（Vite + vite-plugin-monkey 打出的 SystemJS bundle）。
因此本仓库把"改动"保存为独立片段，用 `build/apply.mjs` 按行区间把它们拼回原始 bundle，从而做到可复现、可 review：

```powershell
node build/apply.mjs                              # 生成/刷新 DLscrape.user.js
node --check .\DLscrape.user.js                   # 产物语法校验
node build/verify.mjs                             # 拼接完整性 + 内核行为 + UI 渲染 + 头部元数据（52 项）
cd build; npm i; cd ..                            # 一次性安装测试依赖（vue 3.5.42 + jsdom）
node build/dom-test.mjs                           # 真实 Vue + jsdom 集成测试（26 项）
```

`apply.mjs` 在替换前会对每个区间的**起始行做内容断言**，行号漂移时直接报错而不是静默改错位置；它同时负责把输出文件的油猴头改写成 fork 版元数据（`@author` / `@version` / `@namespace` / 自更新地址），**`dlsite.txt` 始终字节不变**。

## 目录结构

```
dlsite.txt                         上游 v2.2.1 编译产物（只读输入，未修改）
DLscrape.user.js                   构建产物：可安装的改进版 userscript
build/
  apply.mjs                        拼接脚本（含 fork 元数据配置块）
  parts/
    01-puzzle-resolve.js           拼图链路：页列表 hook
    02-engine.js                   下载内核：命名 / 格式 / 打包 / 进度 / 并发
    03-xor-resolve.js              XOR 链路：页列表 hook
    04-xor-fetch.js                XOR 单页抓取与转码
    05-app.js                      UI：手写 h() 渲染 + Material 3 主题
  verify.mjs                       静态 + 内核行为验证
  dom-test.mjs                     真实 Vue + jsdom 集成测试
  README.md                        构建细节（拼接点、关键约定）
```

## 关键约定

- 检测链路只负责产出 `pages: [{ pageNo, originalName, load({ format, quality }) -> { blob, ext } }]`，
  下载、命名、打包、进度全部由 `executeDownloadJob()` 统一处理。
- 命名由 `options.naming`（`page` / `seq` / `original`）决定，格式由 `options.format`（`jpg` / `png`）决定；
  旧参数 `rename: false` 与 `asJpeg: false` 仍兼容映射。
- 取消后剩余页面不做网络请求、直接记为 `skipped`，因此 `成功 + 失败 + 跳过 === 总数` 恒成立。
  压缩包模式中途取消时按钮变为「保存不完整压缩包」，避免把残缺压缩包当完整结果。
- 更多实现细节见 [build/README.md](build/README.md)。

## 免责声明

本工具仅用于**备份你本人已购买或已获得授权的内容**，请勿用于传播、二次分发或任何商业用途。
使用者需自行承担因使用本脚本产生的一切后果；请遵守 DLsite / Comipo 的服务条款与当地法律。

## License

[MIT](LICENSE) — 原始版权归 **cpufan** 所有；本 fork 的修改部分同样以 MIT 发布。
