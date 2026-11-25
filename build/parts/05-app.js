var DPD_CSS = `
.dpd-panel{--md-primary:#6750A4;--md-on-primary:#fff;--md-primary-container:#EADDFF;--md-on-primary-container:#21005D;--md-secondary-container:#E8DEF8;--md-on-secondary-container:#1D192B;--md-tertiary-container:#FFD8E4;--md-on-tertiary-container:#31111D;--md-surface-container-low:#F7F2FA;--md-surface-container:#F3EDF7;--md-surface-container-high:#ECE6F0;--md-surface-container-highest:#E6E0E9;--md-on-surface:#1D1B20;--md-on-surface-variant:#49454F;--md-outline:#79747E;--md-outline-variant:#CAC4D0;--md-error:#B3261E;--md-on-error:#fff;--md-error-container:#F9DEDC;--md-on-error-container:#410E0B;--md-ok:#146C2E;--md-warn:#7D5700;--md-hover:rgba(29,27,32,.08);--md-shadow-1:0 1px 2px rgba(0,0,0,.30),0 1px 3px 1px rgba(0,0,0,.15);--md-shadow-2:0 1px 2px rgba(0,0,0,.30),0 2px 6px 2px rgba(0,0,0,.15);color-scheme:light dark;position:fixed;top:50%;right:0;z-index:2147483000;width:376px;max-width:calc(100vw - 6px);max-height:86vh;display:flex;flex-direction:column;transform:translateY(-50%);background:var(--md-surface-container-low);color:var(--md-on-surface);border:1px solid var(--md-outline-variant);border-right:0;border-radius:16px 0 0 16px;box-shadow:var(--md-shadow-2);font:400 14px/1.45 Roboto,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;letter-spacing:.25px;overflow:hidden;transition:transform .3s cubic-bezier(.2,0,0,1)}
.dpd-panel *,.dpd-panel *::before,.dpd-panel *::after{box-sizing:border-box}
.dpd-panel.is-collapsed{transform:translateY(-50%) translateX(calc(100% - 56px))}
.dpd-panel.is-collapsed .dpd-body{display:none}
.dpd-panel.is-collapsed .dpd-head-text,.dpd-panel.is-collapsed .dpd-head-actions{opacity:0;pointer-events:none}
@media (prefers-color-scheme:dark){.dpd-panel{--md-primary:#D0BCFF;--md-on-primary:#381E72;--md-primary-container:#4F378B;--md-on-primary-container:#EADDFF;--md-secondary-container:#4A4458;--md-on-secondary-container:#E8DEF8;--md-tertiary-container:#633B48;--md-on-tertiary-container:#FFD8E4;--md-surface-container-low:#1D1B20;--md-surface-container:#211F26;--md-surface-container-high:#2B2930;--md-surface-container-highest:#36343B;--md-on-surface:#E6E0E9;--md-on-surface-variant:#CAC4D0;--md-outline:#938F99;--md-outline-variant:#49454F;--md-error:#F2B8B5;--md-on-error:#601410;--md-error-container:#8C1D18;--md-on-error-container:#F9DEDC;--md-ok:#7DD58F;--md-warn:#F0C24B;--md-hover:rgba(230,224,233,.08)}}
/* comipo Play 是绿色换皮站，检测到后整块面板换成绿色主色（品牌色 #43c453 对应的 M3 绿色系）。 */
.dpd-panel.is-comipo{--md-primary:#1B6C2D;--md-on-primary:#fff;--md-primary-container:#A5F4A9;--md-on-primary-container:#002105;--md-tertiary-container:#C3F0C7;--md-on-tertiary-container:#00210A}
@media (prefers-color-scheme:dark){.dpd-panel.is-comipo{--md-primary:#8AD68F;--md-on-primary:#003912;--md-primary-container:#00531C;--md-on-primary-container:#A5F4A9;--md-tertiary-container:#2C5C33;--md-on-tertiary-container:#C6F3C9}}
.dpd-head{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;-webkit-user-select:none;user-select:none;border-bottom:1px solid var(--md-outline-variant);transition:background .15s}
.dpd-head:hover{background:var(--md-hover)}
.dpd-panel.is-collapsed .dpd-head{border-bottom:0}
.dpd-mark{flex:0 0 40px;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;letter-spacing:.5px;color:var(--md-on-primary-container);background:var(--md-primary-container)}
.dpd-head-text{min-width:0;flex:1;transition:opacity .2s}
.dpd-title{font-size:16px;font-weight:500;letter-spacing:.15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dpd-sub{font-size:12px;letter-spacing:.4px;color:var(--md-on-surface-variant);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dpd-head-actions{display:flex;align-items:center;gap:6px;transition:opacity .2s}
.dpd-chip{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:8px;font-size:11px;font-weight:500;letter-spacing:.5px;color:var(--md-on-primary-container);background:var(--md-primary-container)}
.dpd-chip.is-xor{color:var(--md-on-tertiary-container);background:var(--md-tertiary-container)}
.dpd-ghost{width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:var(--md-on-surface-variant);font-size:16px;line-height:1;cursor:pointer;padding:0;transition:background .15s}
.dpd-lang{font-size:12px;letter-spacing:.5px;font-weight:500}
.dpd-ghost:hover{background:var(--md-hover);color:var(--md-on-surface)}
.dpd-body{display:flex;flex-direction:column;gap:16px;padding:16px;overflow-y:auto;overscroll-behavior:contain}
.dpd-body::-webkit-scrollbar{width:8px}
.dpd-body::-webkit-scrollbar-thumb{background:var(--md-outline-variant);border-radius:4px}
.dpd-block{display:flex;flex-direction:column;gap:8px}
.dpd-label{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:500;letter-spacing:.5px;color:var(--md-on-surface-variant)}
.dpd-label-extra{font-weight:400;letter-spacing:.4px;opacity:.95}
.dpd-tip{font-size:12px;line-height:1.45;letter-spacing:.4px;color:var(--md-on-surface-variant)}
.dpd-hint{padding:20px 16px;text-align:center;font-size:14px;letter-spacing:.25px;color:var(--md-on-surface-variant);background:var(--md-surface-container);border-radius:16px}
.dpd-alert{padding:12px 16px;border-radius:12px;font-size:14px;letter-spacing:.25px;color:var(--md-on-error-container);background:var(--md-error-container)}
.dpd-range{display:flex;align-items:center;gap:8px}
.dpd-input,.dpd-select{height:40px;padding:0 12px;font:inherit;font-size:14px;color:var(--md-on-surface);background:transparent;border:1px solid var(--md-outline);border-radius:4px;outline:none;transition:border-color .15s,box-shadow .15s}
.dpd-input{text-align:center;font-variant-numeric:tabular-nums}
.dpd-range .dpd-input{flex:1 1 0;min-width:0;width:auto}
.dpd-select{min-width:80px;text-align:center;text-align-last:center}
.dpd-input:hover:not(:disabled),.dpd-select:hover:not(:disabled){border-color:var(--md-on-surface)}
.dpd-input:focus,.dpd-select:focus{border-color:var(--md-primary);box-shadow:inset 0 0 0 1px var(--md-primary)}
.dpd-input:disabled,.dpd-select:disabled,.dpd-btn:disabled,.dpd-mini:disabled,.dpd-switch-item:disabled{opacity:.38;cursor:not-allowed}
.dpd-range-sep{color:var(--md-on-surface-variant)}
.dpd-mini{display:inline-flex;align-items:center;justify-content:center;text-align:center;height:32px;padding:0 12px;font:inherit;font-size:14px;font-weight:500;letter-spacing:.1px;color:var(--md-primary);background:transparent;border:1px solid var(--md-outline);border-radius:16px;cursor:pointer;transition:background .15s,border-color .15s}
.dpd-range .dpd-mini{height:40px}
.dpd-mini:hover:not(:disabled){background:var(--md-hover)}
.dpd-mini.is-on{color:var(--md-on-secondary-container);background:var(--md-secondary-container);border-color:transparent}
.dpd-switch{position:relative;display:grid;grid-template-columns:1fr 1fr;height:40px;padding:3px;background:transparent;border:1px solid var(--md-outline);border-radius:20px}
.dpd-switch-knob{position:absolute;top:3px;left:3px;width:calc(50% - 3px);height:calc(100% - 6px);border-radius:17px;background:var(--md-secondary-container);transition:transform .2s cubic-bezier(.2,0,0,1)}
.dpd-switch.is-right .dpd-switch-knob{transform:translateX(100%)}
.dpd-switch.is-3grid{grid-template-columns:repeat(3,1fr)}
.dpd-switch.is-3grid .dpd-switch-knob{width:calc(33.333% - 2px)}
.dpd-switch.is-3grid.pos-1 .dpd-switch-knob{transform:translateX(100%)}
.dpd-switch.is-3grid.pos-2 .dpd-switch-knob{transform:translateX(200%)}
.dpd-row-inline .dpd-switch{flex:1 1 auto;min-width:0}
.dpd-format{flex:0 0 116px}
.dpd-switch-item{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;text-align:center;height:34px;min-width:0;padding:0;border:0;background:transparent;font:inherit;font-size:14px;font-weight:500;letter-spacing:.1px;color:var(--md-on-surface-variant);cursor:pointer;border-radius:17px;transition:color .2s,background .15s;white-space:nowrap;overflow:hidden}
.dpd-switch-item.is-on{color:var(--md-on-secondary-container)}
.dpd-switch-item:not(:disabled):hover{background:var(--md-hover)}
.dpd-row-inline{display:flex;align-items:center;gap:8px}
.dpd-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;margin:10px 0;border-radius:2px;background:linear-gradient(90deg,var(--md-primary) 0 var(--dpd-fill,0%),var(--md-surface-container-highest) var(--dpd-fill,0%) 100%);outline:none}
.dpd-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border:0;border-radius:50%;background:var(--md-primary);box-shadow:var(--md-shadow-1);cursor:pointer;transition:box-shadow .15s}
.dpd-slider::-webkit-slider-thumb:hover{box-shadow:var(--md-shadow-1),0 0 0 10px var(--md-hover)}
.dpd-slider::-moz-range-thumb{width:20px;height:20px;border:0;border-radius:50%;background:var(--md-primary);box-shadow:var(--md-shadow-1);cursor:pointer}
.dpd-actions{display:flex;gap:8px}
.dpd-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;text-align:center;height:40px;padding:0 12px;border:0;border-radius:20px;font:inherit;font-size:14px;font-weight:500;letter-spacing:.1px;cursor:pointer;transition:background .15s,filter .15s,opacity .15s}
.dpd-btn:not(:disabled):hover{filter:brightness(1.08)}
.dpd-btn:not(:disabled):active{filter:brightness(.92)}
.dpd-btn.is-primary{color:var(--md-on-primary);background:var(--md-primary)}
.dpd-btn.is-danger{color:var(--md-on-error);background:var(--md-error)}
.dpd-btn.is-ghost{flex:0 0 auto;padding:0 16px;color:var(--md-primary);background:transparent;border:1px solid var(--md-outline)}
.dpd-progress-block{padding-top:16px;border-top:1px solid var(--md-outline-variant)}
.dpd-bar{height:4px;border-radius:2px;background:var(--md-surface-container-highest);overflow:hidden}
.dpd-bar-fill{height:100%;border-radius:2px;background:var(--md-primary);transition:width .2s cubic-bezier(.2,0,0,1)}
.dpd-stats{display:flex;flex-wrap:wrap;gap:8px}
.dpd-stat{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:8px;font-size:12px;font-weight:500;letter-spacing:.4px;color:var(--md-on-surface-variant);background:var(--md-surface-container-high)}
.dpd-stat.is-ok{color:var(--md-ok)}
.dpd-stat.is-err{color:var(--md-error)}
.dpd-stat.is-warn{color:var(--md-warn)}
.dpd-filters{display:flex;gap:8px}
.dpd-list{max-height:190px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;padding-right:2px}
.dpd-list::-webkit-scrollbar{width:8px}
.dpd-list::-webkit-scrollbar-thumb{background:var(--md-outline-variant);border-radius:4px}
.dpd-row{display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;font-size:12px;letter-spacing:.4px;background:var(--md-surface-container)}
.dpd-row-no{flex:0 0 auto;font-variant-numeric:tabular-nums;color:var(--md-on-surface-variant);font-weight:500}
.dpd-row-icon{flex:0 0 14px;text-align:center;font-weight:500}
.dpd-row-text{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dpd-row.is-ok .dpd-row-icon{color:var(--md-ok)}
.dpd-row.is-error{background:var(--md-error-container)}
.dpd-row.is-error .dpd-row-icon,.dpd-row.is-error .dpd-row-text{color:var(--md-on-error-container)}
.dpd-row.is-active .dpd-row-icon{color:var(--md-primary)}
.dpd-row.is-skipped{opacity:.6}
.dpd-row.is-skipped .dpd-row-icon{color:var(--md-warn)}
.dpd-logs{display:flex;flex-direction:column-reverse;gap:4px;max-height:120px;overflow-y:auto;padding:12px;border-radius:12px;background:var(--md-surface-container);font-size:12px;letter-spacing:.4px;color:var(--md-on-surface-variant)}
.dpd-log-line{line-break:anywhere}
`;
_css(DPD_CSS);
// ————— 多语言：中文 / English —————
// 语言优先级：unsafeWindow.__dpdLang（调试与自动化测试用）> localStorage 记忆 > 浏览器语言（zh* → 中文，其余 → English）。
var DPD_LANG_KEY = "dpd-lang";
var DPD_STRINGS = {
	zh: {
		"method.xor": "XOR 解密",
		"method.puzzle": "拼图还原",
		"method.short.xor": "XOR 解密",
		"method.short.puzzle": "拼图还原",
		"chip.puzzle": "拼图",
		"chip.detecting": "检测中",
		"header.expandTitle": "点击展开",
		"header.collapseTitle": "点击收起",
		"header.expand": "展开",
		"header.collapse": "收起",
		"sub.error": "出错，详见日志",
		"sub.detecting": "正在检测加密方式…",
		"sub.waiting": "等待作品页",
		"sub.waitingComipo": "comipo · 等待作品页",
		"sub.running": "下载中 {done}/{total}",
		"sub.zippingSuffix": " · 打包中",
		"sub.cancellingSuffix": " · 正在取消",
		"sub.cancelled": "已取消：成功 {ok} / 失败 {fail}",
		"sub.finished": "完成：成功 {ok} / 失败 {fail}",
		"common.pages": "共 {count} 页",
		"hint.detecting": "正在检测该作品的加密方式…",
		"hint.dlsite": "打开 DLsite Play 作品阅读页后自动检测",
		"hint.comipo": "打开 comipo Play 作品阅读页后自动检测",
		"range.title": "页码范围",
		"range.all": "全部",
		"range.selected": "当前选中 {count} 页",
		"mode.title": "输出方式",
		"mode.image": "逐页",
		"mode.zip": "压缩",
		"mode.jpg": "JPG · 体积小、有损",
		"mode.png": "PNG · 无损、体积较大",
		"mode.tipZip": "打包成 ZIP 后一次性保存，包内所有图片统一为 {format}",
		"mode.tipDir": "直接输出 {format} 图片，可选择保存文件夹",
		"mode.tipDownload": "直接输出 {format} 图片，浏览器逐个保存",
		"naming.title": "文件命名",
		"naming.page": "页号",
		"naming.seq": "顺序",
		"naming.original": "原始",
		"naming.labelPage": "按页号重命名",
		"naming.labelSeq": "按下载顺序重命名",
		"naming.labelOriginal": "保留原始名称",
		"naming.digits": "{count} 位",
		"naming.examplePage": "示例：{first}.{ext}、{second}.{ext}（用原始页号，只下 10–20 页就是 010–020）",
		"naming.exampleSeq": "示例：第一个文件 {first}.{ext}，与原始页号无关",
		"naming.exampleOriginal": "示例：保留 DLsite 原始文件名，扩展名校正为 .{ext}",
		"concurrency.title": "并发数",
		"concurrency.value": "{count} 线程",
		"actions.start": "开始下载",
		"actions.cancel": "取消下载",
		"actions.restart": "重新下载",
		"actions.saveZip": "保存压缩包",
		"actions.savePartial": "保存不完整压缩包",
		"progress.title": "任务进度",
		"progress.ok": "成功 {count}",
		"progress.fail": "失败 {count}",
		"progress.skip": "跳过 {count}",
		"progress.zipping": "打包中…",
		"progress.cancelling": "正在取消",
		"progress.filterAll": "全部 {count}",
		"progress.filterFailed": "失败 {count}",
		"row.pending": "等待中",
		"row.active": "下载中…",
		"row.skipped": "已跳过",
		"log.detecting": "正在检测加密方式…",
		"log.detected": "检测到{method}，共 {count} 页",
		"log.detectFailed": "检测失败：{message}",
		"log.start": "开始下载 {count} 页（{mode} · {format} · {naming}）",
		"log.savedTo": "保存位置：{name}",
		"log.cancelNoDir": "已取消：未选择保存位置",
		"log.dirUnavailable": "目录选择不可用，改为逐个保存文件",
		"log.cancelNotStarted": "已取消：未开始下载",
		"log.noDirSerial": "未选择文件夹：浏览器会拦截批量下载，已改为单线程逐个保存",
		"log.pageError": "✗ 第 {page} 页：{message}",
		"log.zipStart": "正在打包 ZIP…",
		"log.zipDone": "ZIP 已就绪：{size} MB",
		"log.cancelled": "已取消：{summary}",
		"log.zipFinished": "打包完成：{summary}",
		"log.downloadFinished": "下载完成：{summary}",
		"log.failed": "下载失败：{message}",
		"log.cancelRequested": "已请求取消，正在停止…",
		"summary.basic": "成功 {ok} / 失败 {fail}",
		"summary.skipSuffix": " / 跳过 {skip}",
		"summary.partialSuffix": "（可保存不完整压缩包）",
		"error.noDetector": "没有可用的检测方式",
		"error.unknownScheme": "没能识别该作品的加密方式",
		"error.allPagesFailed": "全部页面下载失败，无法生成压缩包",
		"error.metaTimeout": "等待页面数据超时：没有捕获到页面文件请求，该作品可能使用了尚未支持的加密方式",
		"error.noPageRequests": "没有捕获到页面文件请求，无法确定下载地址"
	},
	en: {
		"method.xor": "XOR decryption",
		"method.puzzle": "puzzle reassembly",
		"method.short.xor": "XOR",
		"method.short.puzzle": "Puzzle",
		"chip.puzzle": "Puzzle",
		"chip.detecting": "Detecting",
		"header.expandTitle": "Click to expand",
		"header.collapseTitle": "Click to collapse",
		"header.expand": "Expand",
		"header.collapse": "Collapse",
		"sub.error": "Error — see log",
		"sub.detecting": "Detecting encryption…",
		"sub.waiting": "Waiting for a work page",
		"sub.waitingComipo": "comipo · waiting for a work page",
		"sub.running": "Downloading {done}/{total}",
		"sub.zippingSuffix": " · packing",
		"sub.cancellingSuffix": " · cancelling",
		"sub.cancelled": "Cancelled: {ok} ok / {fail} failed",
		"sub.finished": "Done: {ok} ok / {fail} failed",
		"common.pages": "{count} pages",
		"hint.detecting": "Detecting how this work is encrypted…",
		"hint.dlsite": "Open a DLsite Play reading page — detection runs automatically",
		"hint.comipo": "Open a comipo Play reading page — detection runs automatically",
		"range.title": "Page range",
		"range.all": "All",
		"range.selected": "{count} pages selected",
		"mode.title": "Output",
		"mode.image": "Per page",
		"mode.zip": "ZIP",
		"mode.jpg": "JPG · smaller, lossy",
		"mode.png": "PNG · lossless, larger",
		"mode.tipZip": "Packed into one ZIP and saved at once; every image inside is {format}",
		"mode.tipDir": "Writes {format} images into a folder you pick",
		"mode.tipDownload": "Writes {format} images, saved one by one by the browser",
		"naming.title": "File naming",
		"naming.page": "Page no.",
		"naming.seq": "Sequential",
		"naming.original": "Original",
		"naming.labelPage": "Rename by page number",
		"naming.labelSeq": "Rename in download order",
		"naming.labelOriginal": "Keep original names",
		"naming.digits": "{count} digits",
		"naming.examplePage": "e.g. {first}.{ext}, {second}.{ext} — original page numbers, so pages 10–20 become 010–020",
		"naming.exampleSeq": "e.g. the first file is {first}.{ext}, independent of the original page numbers",
		"naming.exampleOriginal": "e.g. keep DLsite's original filename, extension corrected to .{ext}",
		"concurrency.title": "Concurrency",
		"concurrency.value": "{count} threads",
		"actions.start": "Start download",
		"actions.cancel": "Cancel",
		"actions.restart": "Download again",
		"actions.saveZip": "Save ZIP",
		"actions.savePartial": "Save partial ZIP",
		"progress.title": "Progress",
		"progress.ok": "{count} ok",
		"progress.fail": "{count} failed",
		"progress.skip": "{count} skipped",
		"progress.zipping": "Packing…",
		"progress.cancelling": "Cancelling…",
		"progress.filterAll": "All {count}",
		"progress.filterFailed": "Failed {count}",
		"row.pending": "Queued",
		"row.active": "Downloading…",
		"row.skipped": "Skipped",
		"log.detecting": "Detecting encryption…",
		"log.detected": "Detected {method} · {count} pages",
		"log.detectFailed": "Detection failed: {message}",
		"log.start": "Starting {count} pages ({mode} · {format} · {naming})",
		"log.savedTo": "Saving to: {name}",
		"log.cancelNoDir": "Cancelled: no folder selected",
		"log.dirUnavailable": "Folder picker unavailable — saving file by file",
		"log.cancelNotStarted": "Cancelled before starting",
		"log.noDirSerial": "No folder selected: the browser would block bulk downloads, so pages are saved one at a time",
		"log.pageError": "✗ Page {page}: {message}",
		"log.zipStart": "Packing ZIP…",
		"log.zipDone": "ZIP ready: {size} MB",
		"log.cancelled": "Cancelled: {summary}",
		"log.zipFinished": "ZIP finished: {summary}",
		"log.downloadFinished": "Download finished: {summary}",
		"log.failed": "Download failed: {message}",
		"log.cancelRequested": "Cancel requested — stopping…",
		"summary.basic": "{ok} ok / {fail} failed",
		"summary.skipSuffix": " / {skip} skipped",
		"summary.partialSuffix": " (partial ZIP available)",
		"error.noDetector": "No detection method available",
		"error.unknownScheme": "Could not identify this work's encryption scheme",
		"error.allPagesFailed": "All pages failed — cannot build the ZIP",
		"error.metaTimeout": "Timed out waiting for page data: no page-file requests were captured; this work may use an unsupported encryption scheme",
		"error.noPageRequests": "No page-file requests were captured — cannot determine the download URLs"
	}
};
function dpdReadStoredLang() {
	try {
		var forced = typeof _unsafeWindow !== "undefined" && _unsafeWindow && _unsafeWindow.__dpdLang;
		if (forced === "zh" || forced === "en") return forced;
	} catch (err) {}
	try {
		var saved = localStorage.getItem(DPD_LANG_KEY);
		if (saved === "zh" || saved === "en") return saved;
	} catch (err) {}
	var lang = typeof navigator !== "undefined" && navigator && navigator.language ? String(navigator.language) : "";
	return /^zh/i.test(lang) ? "zh" : "en";
}
var dpdLang = dpdReadStoredLang();
function dpdPersistLang(lang) {
	try {
		localStorage.setItem(DPD_LANG_KEY, lang);
	} catch (err) {}
}
/** 取文案：{name} 占位符按 vars 替换；缺键回退中文，再回退键名。 */
function dpdText(key, vars, lang) {
	var table = DPD_STRINGS[lang] || DPD_STRINGS.zh;
	var text = table[key];
	if (text == null) text = DPD_STRINGS.zh[key];
	if (text == null) return key;
	if (vars) {
		text = String(text).replace(/\{(\w+)\}/g, function (match, name) {
			return vars[name] == null ? match : String(vars[name]);
		});
	}
	return text;
}
/** 供内核/检测链路（不在组件作用域内）使用，跟随面板当前语言。 */
function dpdT(key, vars) {
	return dpdText(key, vars, dpdLang);
}
// 页面真实 window（unsafeWindow）：既用于跨帧判断，也用于跨实例去重标记。
var DPD_REAL_WINDOW = _unsafeWindow || window;
/** 是否运行在 iframe 里（跨域取不到 top 时按顶层处理，避免整块 UI 不显示）。 */
function dpdIsSubFrame() {
	try {
		return DPD_REAL_WINDOW.top !== DPD_REAL_WINDOW.self;
	} catch (err) {
		return false;
	}
}
/** 读取顶层帧公开的下载器状态；拿不到（跨域/顶层没装脚本）时返回 null。 */
function dpdTopHostState() {
	try {
		const top = DPD_REAL_WINDOW.top;
		if (!top || top === DPD_REAL_WINDOW) return null;
		return top.__dpdHostState || null;
	} catch (err) {
		return null;
	}
}
var App_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
	__name: "App",
	setup(__props) {
		const state = reactive({
			attaching: false,
			detected: false,
			method: "",
			platform: "dlsite",
			lang: dpdLang,
			zipFileName: "",
			error: "",
			mode: "image",
			format: "jpg",
			naming: "page",
			digits: 3,
			concurrency: 3,
			from: 1,
			to: 1,
			pageCount: 0,
			total: 0,
			collapsed: false,
			running: false,
			zipping: false,
			cancelled: false,
			finished: false,
			finishedMode: "",
			partialMode: "",
			success: 0,
			failed: 0,
			skipped: 0,
			progress: 0,
			onlyFailed: false,
			frameYield: false,
			entries: [],
			logs: []
		});
		// 顶层帧对外公开「是否已检测到作品」，子帧据此让位，避免 iframe 里再挂一个下载器。
		/** 取文案：跟随 state.lang，切换语言时整块面板重新渲染。 */
		function t(key, vars) {
			return dpdText(key, vars, state.lang);
		}
		function toggleLang() {
			const next = state.lang === "zh" ? "en" : "zh";
			state.lang = next;
			dpdLang = next;
			dpdPersistLang(next);
		}
		const isSubFrame = dpdIsSubFrame();
		let hostState = null;
		if (isSubFrame) {
			hostState = dpdTopHostState();
		} else {
			hostState = {
				detected: false,
				yieldToSubFrame: () => {
					state.frameYield = true;
				}
			};
			try {
				DPD_REAL_WINDOW.__dpdHostState = hostState;
			} catch (err) {
				hostState = null;
			}
		}
		let job = null;
		let saveFunc = null;
		let lastBlobUrl = null;
		let stateVersion = 0;
		let pastLocationKey = null;
		let entryMap = /* @__PURE__ */ new Map();
		function addLog(text) {
			state.logs.unshift(`${new Date().toLocaleTimeString()}  ${text}`);
			if (state.logs.length > 120) state.logs.length = 120;
		}
		if (_unsafeWindow) _unsafeWindow.add_log = addLog;
		function updateProgress() {
			const done = state.success + state.failed + state.skipped;
			state.progress = state.total > 0 ? Math.min(100, Math.round(done / state.total * 100)) : 0;
		}
		/** 丢弃上一轮未保存的 ZIP，避免整包 blob 常驻内存。 */
		function releaseArchive() {
			if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
			lastBlobUrl = null;
			saveFunc = null;
			state.partialMode = "";
		}
		function normalizedRange() {
			const max = Math.max(1, state.pageCount);
			const from = Math.max(1, Math.min(max, Math.floor(Number(state.from) || 1)));
			const to = Math.max(from, Math.min(max, Math.floor(Number(state.to) || max)));
			return { from, to };
		}
		function selectedCount() {
			const range = normalizedRange();
			return range.to - range.from + 1;
		}
		/**
		 * 取第一个「真的拿到作品数据」的检测结果。
		 * 单个检测器可能因为当前作品/接口不存在而解析出空结果，不能让它把整体拖住，
		 * 只有全部检测器都失败（或返回空）时才报错。
		 */
		function waitForUsableDetector(detectors) {
			return new Promise((resolve, reject) => {
				const list = detectors.filter(Boolean);
				if (list.length === 0) {
					reject(new Error("没有可用的检测方式"));
					return;
				}
				let pending = list.length;
				let lastError = null;
				let done = false;
				list.forEach((item) => {
					Promise.resolve(item).then((value) => {
						if (done) return;
						if (value && value.data) {
							done = true;
							resolve(value);
							return;
						}
						pending -= 1;
						if (pending === 0) reject(lastError || new Error("没能识别该作品的加密方式"));
					}).catch((err) => {
						lastError = err;
						pending -= 1;
						if (!done && pending === 0) reject(lastError);
					});
				});
			});
		}
		function attachEncMethod() {
			if (state.attaching || state.detected) return;
			const version = stateVersion;
			state.attaching = true;
			addLog(t("log.detecting"));
			const workNo = extractDlsiteId(window.location.href);
			// comipo Play：优先自己解析内容接口（不依赖页面请求的时机），失败再等页面自身的请求。
			const detectors = state.platform === "comipo" ? [resolveComipoPages(workNo), hookXorEnc()] : [hookXorEnc(), hookFetchPuzzle()];
			waitForUsableDetector(detectors).then((result) => {
				if (version !== stateVersion) return;
				const data = result.data || {};
				job = data;
				state.method = result.method;
				state.zipFileName = data.zipFileName || "download";
				state.pageCount = Array.isArray(data.pages) ? data.pages.length : 0;
				state.total = state.pageCount;
				state.from = 1;
				state.to = state.pageCount || 1;
				state.detected = true;
				state.error = "";
				if (hostState) {
					if (isSubFrame) {
						// 本帧拿到了作品信息而顶层还没拿到：请顶层让位，否则会留下一个空面板遮挡。
						if (!hostState.detected && typeof hostState.yieldToSubFrame === "function") hostState.yieldToSubFrame();
					} else {
						hostState.detected = true;
					}
				}
				addLog(t("log.detected", { method: t(result.method === "xor" ? "method.xor" : "method.puzzle"), count: state.pageCount }));
			}).catch((err) => {
				if (version !== stateVersion) return;
				origConsole.error(err);
				state.error = err && err.message ? err.message : String(err);
				addLog(t("log.detectFailed", { message: state.error }));
			}).finally(() => {
				if (version !== stateVersion) return;
				state.attaching = false;
			});
		}
		function resetState() {
			stateVersion++;
			job = null;
			releaseArchive();
			entryMap = /* @__PURE__ */ new Map();
			state.attaching = false;
			state.detected = false;
			state.method = "";
			state.zipFileName = "";
			state.error = "";
			state.running = false;
			state.zipping = false;
			state.cancelled = false;
			state.finished = false;
			state.finishedMode = "";
			state.success = 0;
			state.failed = 0;
			state.skipped = 0;
			state.progress = 0;
			state.pageCount = 0;
			state.total = 0;
			state.from = 1;
			state.to = 1;
			state.entries = [];
			state.onlyFailed = false;
			state.logs = [];
		}
		async function start() {
			if (state.running || !job) return;
			const version = stateVersion;
			const range = normalizedRange();
			state.from = range.from;
			state.to = range.to;
			const selected = job.pages.filter((page) => page.pageNo >= range.from && page.pageNo <= range.to);
			state.entries = selected.map((page, index) => ({
				pageNo: page.pageNo,
				seq: index + 1,
				name: "",
				status: "pending",
				error: ""
			}));
			entryMap = new Map(state.entries.map((entry) => [entry.pageNo, entry]));
			state.total = selected.length;
			state.running = true;
			state.finished = false;
			state.finishedMode = "";
			state.cancelled = false;
			state.zipping = false;
			releaseArchive();
			state.success = 0;
			state.failed = 0;
			state.skipped = 0;
			state.error = "";
			state.onlyFailed = false;
			updateProgress();
			addLog(t("log.start", { count: selected.length, mode: t(state.mode === "image" ? "mode.image" : "mode.zip"), format: state.format.toUpperCase(), naming: namingLabel() }));
			let directory = null;
			if (state.mode === "image" && _unsafeWindow && typeof _unsafeWindow.showDirectoryPicker === "function") {
				try {
					directory = await _unsafeWindow.showDirectoryPicker({
						id: "dlsite-play-downloader",
						mode: "readwrite"
					});
					addLog(t("log.savedTo", { name: directory.name }));
				} catch (err) {
					if (err && err.name === "AbortError") {
						addLog(t("log.cancelNoDir"));
						state.running = false;
						state.entries = [];
						state.total = 0;
						updateProgress();
						return;
					}
					addLog(t("log.dirUnavailable"));
					origConsole.warn("[download] showDirectoryPicker failed", err);
				}
			}
			if (state.cancelled) {
				addLog(t("log.cancelNotStarted"));
				state.running = false;
				state.entries = [];
				state.total = 0;
				updateProgress();
				return;
			}
			if (version !== stateVersion) return;
			if (state.mode === "image" && !directory) {
				addLog(t("log.noDirSerial"));
			}
			try {
				const result = await executeDownloadJob({
					pages: selected,
					zipFileName: state.zipFileName
				}, {
					mode: state.mode,
					naming: state.naming,
					digits: state.digits,
					format: state.format,
					concurrency: state.concurrency,
					quality: 0.92,
					directory,
					from: range.from,
					to: range.to,
					isCancelled: () => state.cancelled || version !== stateVersion
				}, {
					onEvent: (event) => {
						if (version !== stateVersion) return;
						if (event.type === "start") {
							const entry = entryMap.get(event.pageNo);
							if (entry) entry.status = "active";
						} else if (event.type === "success") {
							const entry = entryMap.get(event.pageNo);
							if (entry) {
								entry.status = "ok";
								entry.name = event.name;
								entry.bytes = event.bytes;
							}
							state.success++;
							updateProgress();
						} else if (event.type === "error") {
							const entry = entryMap.get(event.pageNo);
							if (entry) {
								entry.status = "error";
								entry.error = event.message;
							}
							state.failed++;
							updateProgress();
							addLog(t("log.pageError", { page: event.pageNo, message: event.message }));
						} else if (event.type === "skipped") {
							const entry = entryMap.get(event.pageNo);
							if (entry) entry.status = "skipped";
							state.skipped++;
							updateProgress();
						} else if (event.type === "zip-start") {
							state.zipping = true;
							addLog(t("log.zipStart"));
						} else if (event.type === "zip-done") {
							state.zipping = false;
							addLog(t("log.zipDone", { size: (event.bytes / 1048576).toFixed(1) }));
						} else if (event.type === "zip-skipped") {
							state.zipping = false;
						}
					}
				});
				if (version !== stateVersion) return;
				saveFunc = result.save;
				lastBlobUrl = result.blobUrl;
				const summary = t("summary.basic", { ok: result.successCount, fail: result.failCount }) + (result.skippedCount ? t("summary.skipSuffix", { skip: result.skippedCount }) : "");
				const incomplete = result.cancelled && result.successCount + result.failCount < result.total;
				if (incomplete) {
					state.cancelled = true;
					state.finished = false;
					state.finishedMode = "";
					state.partialMode = result.save ? state.mode : "";
					addLog(t("log.cancelled", { summary }) + (state.partialMode ? t("summary.partialSuffix") : ""));
				} else {
					state.cancelled = false;
					state.finished = true;
					state.finishedMode = state.mode;
					state.partialMode = "";
					addLog(state.mode === "zip" ? t("log.zipFinished", { summary }) : t("log.downloadFinished", { summary }));
				}
			} catch (err) {
				if (version !== stateVersion) return;
				origConsole.error(err);
				state.error = err && err.message ? err.message : String(err);
				addLog(t("log.failed", { message: state.error }));
			} finally {
				if (version === stateVersion) {
					state.running = false;
					state.zipping = false;
				}
			}
		}
		function cancel() {
			state.cancelled = true;
			addLog(t("log.cancelRequested"));
		}
		function save() {
			if (saveFunc) saveFunc();
		}
		function selectAllPages() {
			state.from = 1;
			state.to = state.pageCount || 1;
		}
		function headerSubtitle() {
			if (state.error) return t("sub.error");
			if (state.attaching) return t("sub.detecting");
			if (!state.detected) return state.platform === "comipo" ? t("sub.waitingComipo") : t("sub.waiting");
			const done = state.success + state.failed + state.skipped;
			if (state.running) return t("sub.running", { done, total: state.total }) + (state.zipping ? t("sub.zippingSuffix") : "") + (state.cancelled ? t("sub.cancellingSuffix") : "");
			if (state.cancelled) return t("sub.cancelled", { ok: state.success, fail: state.failed }) + (state.skipped ? t("summary.skipSuffix", { skip: state.skipped }) : "");
			if (state.finished) return t("sub.finished", { ok: state.success, fail: state.failed });
			return `${t(state.method === "xor" ? "method.short.xor" : "method.short.puzzle")} · ${t("common.pages", { count: state.pageCount })}`;
		}
		function visibleEntries() {
			const list = state.onlyFailed ? state.entries.filter((entry) => entry.status === "error") : state.entries;
			if (list.length <= 400) return list;
			return state.onlyFailed ? list.slice(0, 400) : list.slice(list.length - 400);
		}
		const NAMING_OPTIONS = [
			["page", "naming.page"],
			["seq", "naming.seq"],
			["original", "naming.original"]
		];
		function namingLabel() {
			if (state.naming === "seq") return t("naming.labelSeq");
			if (state.naming === "original") return t("naming.labelOriginal");
			return t("naming.labelPage");
		}
		function namingExample() {
			const ext = state.format;
			if (state.naming === "seq") return t("naming.exampleSeq", { first: padPageNumber(1, state.digits), ext });
			if (state.naming === "original") return t("naming.exampleOriginal", { ext });
			return t("naming.examplePage", { first: padPageNumber(1, state.digits), second: padPageNumber(12, state.digits), ext });
		}
		/** 进度列表左侧编号：顺序模式显示下载序号，其余显示原始页号。 */
		function rowLabel(entry) {
			if (state.naming === "original") return String(entry.pageNo);
			return padPageNumber(state.naming === "seq" ? entry.seq || entry.pageNo : entry.pageNo, state.digits);
		}
		function optionSwitch(key, value, label, current, disabled) {
			return h("button", {
				class: ["dpd-switch-item", current === value ? "is-on" : ""],
				disabled,
				onClick: () => {
					state[key] = value;
				}
			}, label);
		}
		function sectionRange() {
			return h("div", { class: "dpd-block" }, [
				h("div", { class: "dpd-label" }, [
					h("span", null, t("range.title")),
					h("span", { class: "dpd-label-extra" }, t("common.pages", { count: state.pageCount }))
				]),
				h("div", { class: "dpd-range" }, [
					h("input", {
						class: "dpd-input",
						type: "number",
						min: 1,
						max: state.pageCount,
						value: state.from,
						disabled: state.running,
						onInput: (event) => {
							state.from = Number(event.target.value);
						}
					}),
					h("span", { class: "dpd-range-sep" }, "→"),
					h("input", {
						class: "dpd-input",
						type: "number",
						min: 1,
						max: state.pageCount,
						value: state.to,
						disabled: state.running,
						onInput: (event) => {
							state.to = Number(event.target.value);
						}
					}),
					h("button", {
						class: "dpd-mini",
						disabled: state.running,
						onClick: selectAllPages
					}, t("range.all"))
				]),
				h("div", { class: "dpd-tip" }, t("range.selected", { count: selectedCount() }))
			]);
		}
		function sectionMode() {
			return h("div", { class: "dpd-block" }, [
				h("div", { class: "dpd-label" }, [
					h("span", null, t("mode.title")),
					h("span", { class: "dpd-label-extra" }, t(state.format === "png" ? "mode.png" : "mode.jpg"))
				]),
				h("div", { class: "dpd-row-inline" }, [
					h("div", { class: ["dpd-switch", state.mode === "zip" ? "is-right" : "is-left"] }, [
						h("div", { class: "dpd-switch-knob" }),
						optionSwitch("mode", "image", t("mode.image"), state.mode, state.running),
						optionSwitch("mode", "zip", t("mode.zip"), state.mode, state.running)
					]),
					h("div", { class: ["dpd-switch", "dpd-format", state.format === "png" ? "is-right" : "is-left"] }, [
						h("div", { class: "dpd-switch-knob" }),
						optionSwitch("format", "jpg", "JPG", state.format, state.running),
						optionSwitch("format", "png", "PNG", state.format, state.running)
					])
				]),
				h("div", { class: "dpd-tip" }, modeTip())
			]);
		}
		function modeTip() {
			const upper = state.format.toUpperCase();
			if (state.mode === "zip") return t("mode.tipZip", { format: upper });
			if (typeof (_unsafeWindow && _unsafeWindow.showDirectoryPicker) === "function") return t("mode.tipDir", { format: upper });
			return t("mode.tipDownload", { format: upper });
		}
		function sectionNaming() {
			const position = Math.max(0, NAMING_OPTIONS.findIndex((option) => option[0] === state.naming));
			return h("div", { class: "dpd-block" }, [
				h("div", { class: "dpd-label" }, [
					h("span", null, t("naming.title")),
					h("span", { class: "dpd-label-extra" }, namingLabel())
				]),
				h("div", { class: "dpd-row-inline" }, [
					h("div", { class: ["dpd-switch", "is-3grid", "pos-" + position] }, [
						h("div", { class: "dpd-switch-knob" }),
						...NAMING_OPTIONS.map(([value, label]) => optionSwitch("naming", value, t(label), state.naming, state.running))
					]),
					state.naming === "original" ? null : h("select", {
						class: "dpd-select",
						disabled: state.running,
						value: state.digits,
						onChange: (event) => {
							state.digits = Number(event.target.value);
						}
					}, [2, 3, 4, 5].map((count) => h("option", {
						value: count,
						selected: state.digits === count
					}, t("naming.digits", { count }))))
				]),
				h("div", { class: "dpd-tip" }, namingExample())
			]);
		}
		function sectionConcurrency() {
			return h("div", { class: "dpd-block" }, [
				h("div", { class: "dpd-label" }, [
					h("span", null, t("concurrency.title")),
					h("span", { class: "dpd-label-extra" }, t("concurrency.value", { count: state.concurrency }))
				]),
				h("input", {
					class: "dpd-slider",
					type: "range",
					min: 1,
					max: 8,
					step: 1,
					value: state.concurrency,
					disabled: state.running,
					style: { "--dpd-fill": `${(((state.concurrency - 1) / 7) * 100).toFixed(1)}%` },
					onInput: (event) => {
						state.concurrency = Number(event.target.value);
					}
				})
			]);
		}
		function sectionActions() {
			const buttons = [];
			const finishedHere = state.finished && state.finishedMode === state.mode;
			const saveAvailable = state.mode === "zip" && saveFunc && (finishedHere || state.partialMode === "zip");
			if (state.running) {
				buttons.push(h("button", {
					class: "dpd-btn is-danger",
					onClick: cancel
				}, t("actions.cancel")));
			} else if (saveAvailable) {
				buttons.push(h("button", {
					class: "dpd-btn is-primary",
					onClick: save
				}, t(state.partialMode === "zip" ? "actions.savePartial" : "actions.saveZip")));
				buttons.push(h("button", {
					class: "dpd-btn is-ghost",
					onClick: start
				}, t("actions.restart")));
			} else {
				buttons.push(h("button", {
					class: "dpd-btn is-primary",
					disabled: !state.detected,
					onClick: start
				}, t(finishedHere ? "actions.restart" : "actions.start")));
			}
			return h("div", { class: "dpd-actions" }, buttons);
		}
		function sectionProgress() {
			return h("div", { class: "dpd-block dpd-progress-block" }, [
				h("div", { class: "dpd-label" }, [
					h("span", null, t("progress.title")),
					h("span", { class: "dpd-label-extra" }, `${state.success + state.failed + state.skipped}/${state.total || 0}`)
				]),
				h("div", { class: "dpd-bar" }, [
					h("div", {
						class: "dpd-bar-fill",
						style: { width: state.progress + "%" }
					})
				]),
				h("div", { class: "dpd-stats" }, [
					h("span", { class: "dpd-stat is-ok" }, t("progress.ok", { count: state.success })),
					h("span", { class: "dpd-stat is-err" }, t("progress.fail", { count: state.failed })),
					state.skipped ? h("span", { class: "dpd-stat is-warn" }, t("progress.skip", { count: state.skipped })) : null,
					h("span", { class: "dpd-stat" }, `${state.progress}%`),
					state.zipping ? h("span", { class: "dpd-stat is-warn" }, t("progress.zipping")) : null,
					state.cancelled && state.running ? h("span", { class: "dpd-stat is-warn" }, t("progress.cancelling")) : null
				]),
				h("div", { class: "dpd-filters" }, [
					h("button", {
						class: ["dpd-mini", state.onlyFailed ? "" : "is-on"],
						onClick: () => {
							state.onlyFailed = false;
						}
					}, t("progress.filterAll", { count: state.entries.length })),
					h("button", {
						class: ["dpd-mini", state.onlyFailed ? "is-on" : ""],
						onClick: () => {
							state.onlyFailed = true;
						}
					}, t("progress.filterFailed", { count: state.failed }))
				]),
				h("div", { class: "dpd-list" }, visibleEntries().map((entry) => h("div", {
					class: ["dpd-row", "is-" + entry.status],
					key: entry.pageNo
				}, [
					h("span", { class: "dpd-row-no" }, rowLabel(entry)),
					h("span", { class: "dpd-row-icon" }, entry.status === "ok" ? "✓" : entry.status === "error" ? "✗" : entry.status === "skipped" ? "⏹" : entry.status === "active" ? "•" : "·"),
					h("span", { class: "dpd-row-text" }, entry.status === "error" ? entry.error : entry.name || (entry.status === "skipped" ? t("row.skipped") : entry.status === "active" ? t("row.active") : t("row.pending")))
				])))
			]);
		}
		function pathnameUpdated() {
			pastLocationKey = window.location.href;
			state.platform = detectPlayPlatform(window.location.href);
			resetState();
			if (extractDlsiteId(window.location.href)) attachEncMethod();
		}
		function locationUpdated() {
			if (pastLocationKey !== window.location.href) pathnameUpdated();
		}
		pathnameUpdated();
		const wrapHistory = (type) => {
			const original = history[type];
			return function() {
				const rv = original.apply(this, arguments);
				window.dispatchEvent(new Event(type));
				return rv;
			};
		};
		history.pushState = wrapHistory("pushState");
		history.replaceState = wrapHistory("replaceState");
		window.addEventListener("pushState", locationUpdated);
		window.addEventListener("replaceState", locationUpdated);
		window.addEventListener("popstate", locationUpdated);
		window.addEventListener("hashchange", locationUpdated);
		return () => {
			if (isSubFrame) {
				// 子帧只有在本帧拿到作品、且顶层还没拿到时才显示面板，避免 iframe 里多出一个空下载器。
				if (!state.detected || (hostState && hostState.detected)) return null;
			} else if (state.frameYield && !state.detected) {
				// 作品信息在子帧里检测到了，顶层让位，避免空面板遮挡。
				return null;
			}
			return h("div", { class: ["dpd-panel", state.collapsed ? "is-collapsed" : "", state.platform === "comipo" ? "is-comipo" : ""] }, [
			h("div", {
				class: "dpd-head",
				title: state.collapsed ? t("header.expandTitle") : t("header.collapseTitle"),
				onClick: () => {
					state.collapsed = !state.collapsed;
				}
			}, [
				h("div", { class: "dpd-mark" }, "DL"),
				h("div", { class: "dpd-head-text" }, [
					h("div", { class: "dpd-title" }, "DLscrape"),
					h("div", { class: "dpd-sub" }, headerSubtitle())
				]),
				h("div", { class: "dpd-head-actions" }, [
					state.detected || state.platform === "comipo" ? h("span", { class: ["dpd-chip", state.method === "xor" ? "is-xor" : ""] }, state.platform === "comipo" ? "comipo" : state.detected ? state.method === "xor" ? "XOR" : t("chip.puzzle") : t("chip.detecting")) : null,
					h("button", { class: "dpd-ghost dpd-lang", title: state.lang === "zh" ? "Switch to English" : "切换为中文", onClick: (event) => { event.stopPropagation(); toggleLang(); } }, state.lang === "zh" ? "EN" : "中"),
					h("button", { class: "dpd-ghost", title: state.collapsed ? t("header.expand") : t("header.collapse") }, state.collapsed ? "‹" : "›")
				])
			]),
			h("div", { class: "dpd-body" }, [
				state.error ? h("div", { class: "dpd-alert" }, state.error) : null,
				!state.detected ? h("div", { class: "dpd-hint" }, state.attaching ? t("hint.detecting") : state.platform === "comipo" ? t("hint.comipo") : t("hint.dlsite")) : null,
				state.detected ? sectionRange() : null,
				state.detected ? sectionMode() : null,
				state.detected ? sectionNaming() : null,
				state.detected ? sectionConcurrency() : null,
				state.detected ? sectionActions() : null,
				state.entries.length > 0 || state.running || state.zipping || state.finished ? sectionProgress() : null,
				h("div", { class: "dpd-logs" }, state.logs.map((line, index) => h("div", {
					class: "dpd-log-line",
					key: index
				}, line)))
			])
			]);
		};
	}
}, [["__scopeId", "data-v-fe414780"]]);
/**
 * 清理页面上「不是本次挂载」的下载器节点。
 * 出现第二个面板的常见原因：脚本被重复安装/重复注入，或页面里还装着原版脚本的 UI，
 * 两个面板都固定在右侧同一位置，就会互相遮挡（表现为「前面有个废面板挡住下载器」）。
 * 宿主容器 `.dlsite-play-downloader-vue`（原版脚本用的也是这个类名）整体移除；
 * 只找到面板本身时，连带最近的宿主容器一起移除，找不到宿主容器就只移除面板。
 */
function removeForeignPanels(keep) {
	if (!document.body) return;
	const nodes = document.querySelectorAll(".dlsite-play-downloader-vue, .dpd-panel, .plugin-area");
	for (let index = nodes.length - 1; index >= 0; index--) {
		const node = nodes[index];
		let root = node;
		const isHost = node.classList && node.classList.contains("dlsite-play-downloader-vue");
		if (!isHost) {
			let host = node.parentNode;
			while (host && host !== document.body && !(host.classList && host.classList.contains("dlsite-play-downloader-vue"))) host = host.parentNode;
			if (host && host !== document.body) root = host;
		}
		if (root === keep || !root.parentNode) continue;
		root.parentNode.removeChild(root);
	}
}
function mountApp() {
	if (!document.body) {
		requestAnimationFrame(mountApp);
		return;
	}
	// 同一个文档里只允许挂载一个下载器：重复注入的实例直接退出。
	if (DPD_REAL_WINDOW.__dpdPanelHost) return;
	DPD_REAL_WINDOW.__dpdPanelHost = true;
	const container = document.createElement("div");
	container.className = "dlsite-play-downloader-vue";
	document.body.appendChild(container);
	removeForeignPanels(container);
	createApp(App_default).mount(container);
	// 原版脚本或旧版实例可能稍后才挂载，再清两次，确保最后只剩这一个面板。
	setTimeout(() => removeForeignPanels(container), 1500);
	setTimeout(() => removeForeignPanels(container), 4e3);
}
