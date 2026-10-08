// 验证改进版产物：拼接完整性 + 悬挂引用 + 下载内核行为测试
// 用法： node build/verify.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const buildDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(buildDir, "..");
const out = readFileSync(path.join(root, "DLscrape.user.js"), "utf8");
const engineCode = readFileSync(path.join(buildDir, "parts", "02-engine.js"), "utf8");
const appCode = readFileSync(path.join(buildDir, "parts", "05-app.js"), "utf8");

let failures = 0;
const check = (name, fn) => {
	try {
		fn();
		console.log(`  PASS  ${name}`);
	} catch (err) {
		failures++;
		console.log(`  FAIL  ${name}\n        ${err.message}`);
	}
};

console.log("[1] 拼接完整性");
for (const [name, file] of [
	["00-work-id", "00-work-id.js"],
	["01-puzzle-resolve", "01-puzzle-resolve.js"],
	["02-engine", "02-engine.js"],
	["04-xor-fetch", "04-xor-fetch.js"],
	["05-app", "05-app.js"],
	["06-content-api", "06-content-api.js"],
	["07-xor-enc", "07-xor-enc.js"],
	["08-enc-bin-urls", "08-enc-bin-urls.js"],
	["09-xor-hooks", "09-xor-hooks.js"]
]) {
	const part = readFileSync(path.join(buildDir, "parts", file), "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "");
	check(`part ${name} 逐字出现在产物中`, () => {
		assert.ok(out.includes(part), "未找到该片段的逐字内容");
	});
}

console.log("[2] 悬挂引用与导入");
check("不再引用已删除的旧下载函数", () => {
	for (const dead of ["downloadPuzzleImagesToZip", "downloadAndDecryptToZip", "restorePuzzleImage("]) {
		assert.ok(!out.includes(dead), `仍存在引用：${dead}`);
	}
});
check("Vue 命名空间已补 h", () => {
	assert.ok(out.includes("var ref,createApp,h,warn,"), "解构声明未更新");
	assert.ok(out.includes("h=module.h;"), "setter 赋值未更新");
});
check("新内核函数均已导出到产物", () => {
	for (const fn of ["function padPageNumber(", "function executeDownloadJob(", "async function fetchXorPage(", "async function restorePuzzlePage("]) {
		assert.ok(out.includes(fn), `缺少：${fn}`);
	}
});
check("旧的一次性 API 已替换为页列表", () => {
	assert.ok(out.includes("pages: files.map("), "拼图页列表缺失");
	assert.ok(out.includes("pages: encBinUrls.map("), "XOR 页列表缺失");
});
check("comipo Play 已有独立解析链路", () => {
	for (const token of [
		"function detectPlayPlatform(",
		"COMIPO_CONTENT_ORIGIN",
		"/viewer\\/(?:free|sample)\\/([A-Z\\d]+)/",
		"async function resolveComipoPages(",
		"/api/comipo/sample/viewer/token/",
		"/api/comipo/free/viewer/token/",
		"loadComipoViewerMeta",
		"makeComipoSaveName"
	]) {
		assert.ok(out.includes(token), `缺少：${token}`);
	}
});
check("comipo 检测不再依赖单一路由/单一接口", () => {
	assert.ok(out.includes("function waitForUsableDetector("), "缺少非空结果竞速器");
	assert.ok(appCode.includes('state.platform === "comipo" ? [resolveComipoPages(workNo), hookXorEnc()]'), "comipo 未走主动解析 + XOR 被动检测");
	assert.ok(appCode.includes('state.platform = detectPlayPlatform(window.location.href)'), "未在路由变化时记录平台");
	assert.ok(appCode.includes("if (extractDlsiteId(window.location.href)) attachEncMethod();"), "路由门禁异常");
});
check("XOR 链路对 comipo 的兼容改造已就位", () => {
	for (const token of [
		"DPD_DETECT_TIMEOUT_MS",
		"DPD_META_TIMEOUT_MS",
		"/\\/api\\/comipo\\/viewer\\/work\\/.+$/",
		"function looksLikeHexText(",
		"function xorKeyToBytes(",
		"const tail = /^([\\s\\S]*\\/)[^/?#]*(\\?[\\s\\S]*)?$/"
	]) {
		assert.ok(out.includes(token), `缺少：${token}`);
	}
	assert.ok(out.includes("item.key ?? keyHex"), "单页密钥未支持逐页密钥");
});
check("comipo 面板使用绿色 M3 主题", () => {
	for (const token of [".dpd-panel.is-comipo{--md-primary:#1B6C2D", ".dpd-panel.is-comipo{--md-primary:#8AD68F", 'state.platform === "comipo" ? "is-comipo" : ""', 'state.platform === "comipo" ? "comipo" : state.detected ? state.method === "xor" ? "XOR" : "拼图" : "检测中"', "打开 comipo Play 作品阅读页后自动检测"]) {
		assert.ok(appCode.includes(token), `绿色主题缺少：${token}`);
	}
});
check("UI 关键控件已渲染", () => {
	for (const token of ["页码范围", 'optionSwitch("mode", "image", "逐页"', 'optionSwitch("mode", "zip", "压缩"', "按页号重命名", "任务进度", "dpd-switch", "dpd-bar-fill", 'h("div", { class: "dpd-title" }, "DLscrape")']) {
		assert.ok(appCode.includes(token), `UI 缺少：${token}`);
	}
});
check("JPG/PNG 输出格式选择已渲染", () => {
	for (const token of ['optionSwitch("format", "jpg"', 'optionSwitch("format", "png"', "dpd-format", "PNG · 无损、体积较大", "JPG · 体积小、有损"]) {
		assert.ok(appCode.includes(token), `UI 缺少：${token}`);
	}
});
check("三种命名方式已渲染（页号/顺序/原始）", () => {
	for (const token of ['["page", "页号"]', '["seq", "顺序"]', '["original", "原始"]', "按下载顺序重命名", "保留原始名称"]) {
		assert.ok(appCode.includes(token), `UI 缺少：${token}`);
	}
});
check("重复注入去重逻辑已注入产物", () => {
	for (const token of ["function removeForeignPanels(", "__dpdPanelHost", "__dpdHostState", "function dpdIsSubFrame(", ".plugin-area"]) {
		assert.ok(out.includes(token), `缺少：${token}`);
	}
});
check("Material Design 主题已生效", () => {
	for (const token of ["--md-primary:#6750A4", "--md-surface-container-low:#F7F2FA", "color-scheme:light dark", "@media (prefers-color-scheme:dark)", "Roboto"]) {
		assert.ok(appCode.includes(token), `主题缺少：${token}`);
	}
	for (const dead of ["--dpd-accent", "--dpd-bg", ".dpd-toggle", "backdrop-filter"]) {
		assert.ok(!appCode.includes(dead), `仍残留旧样式：${dead}`);
	}
});
check("控件内文字居中（滑块档位与按钮）", () => {
	assert.ok(appCode.includes(".dpd-switch-item{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;text-align:center;"), "滑块档位文字未居中");
	assert.ok(appCode.includes(".dpd-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;text-align:center;"), "按钮文字未居中");
	assert.ok(appCode.includes(".dpd-mini{display:inline-flex;align-items:center;justify-content:center;text-align:center;"), "小按钮文字未居中");
	assert.ok(appCode.includes(".dpd-select{min-width:80px;text-align:center;text-align-last:center}"), "下拉框文字未居中");
	// 只居中控件内部文字，不再改动区块标题/说明/统计/列表的整体排版
	assert.ok(appCode.includes(".dpd-label{display:flex;align-items:center;justify-content:space-between;"), "区块标题应恢复两头对齐");
	assert.ok(appCode.includes(".dpd-tip{font-size:12px;line-height:1.45;letter-spacing:.4px;color:"), "说明文字应恢复左对齐");
	assert.ok(appCode.includes(".dpd-stats{display:flex;flex-wrap:wrap;gap:8px}"), "统计条应恢复左对齐");
	assert.ok(appCode.includes(".dpd-row{display:flex;align-items:center;gap:10px;"), "进度明细行应恢复左对齐");
	assert.ok(appCode.includes(".dpd-row-text{flex:1;min-width:0;"), "进度明细文本应恢复占满");
});

console.log("[3] 下载内核行为");

const blobCalls = [];
const anchorClicks = [];
const zipCalls = [];
const fakeDocument = {
	createElement: () => ({
		style: {},
		click() {
			anchorClicks.push(this.download);
		},
		remove() {}
	}),
	body: {
		appendChild() {},
		removeChild() {}
	}
};
const fakeURL = {
	createObjectURL: () => "blob:fake",
	revokeObjectURL: () => {}
};
const fakeZip = (files, cb) => {
	zipCalls.push(files);
	cb(null, new Uint8Array([80, 75, 3, 4]));
};
const fakeConsole = {
	log() {},
	warn() {},
	error() {},
	info() {},
	debug() {}
};
const normalizeZipPath = (input) => String(input || "image").replace(/\\/g, "/").split("/").filter((part) => part && part !== "." && part !== "..").map((part) => part.replace(/[<>:"|?*\x00-\x1f]/g, "_")).join("/") || "image";

const factory = new Function(
	"zip",
	"origConsole",
	"normalizeZipPath",
	"document",
	"URL",
	"Blob",
	"createImageBitmap",
	`${engineCode}
	return { padPageNumber, replaceExtension, ensureExtension, addUniqueZipFile, appendSuffix, runWithConcurrency, saveBlobToTarget, buildZip, executeDownloadJob };`
);
const api = factory(fakeZip, fakeConsole, normalizeZipPath, fakeDocument, fakeURL, Blob, undefined);

const makeJob = (count, behavior = () => ({ blob: new Blob([new Uint8Array([1, 2, 3])]), ext: "jpg" })) => ({
	zipFileName: "test-work",
	pages: Array.from({ length: count }, (_, i) => ({
		pageNo: i + 1,
		originalName: `raw/hash_${i + 1}.enc`,
		load: async () => behavior(i + 1)
	}))
});

check("padPageNumber 默认 3 位补零", () => {
	assert.equal(api.padPageNumber(1, 3), "001");
	assert.equal(api.padPageNumber(12, 3), "012");
	assert.equal(api.padPageNumber(1234, 2), "1234");
	assert.equal(api.padPageNumber(7, 5), "00007");
});

await (async () => {
	let events = [];
	let loadedPages = [];
	const job = makeJob(10, (pageNo) => {
		loadedPages.push(pageNo);
		return { blob: new Blob([new Uint8Array([pageNo])]), ext: "jpg" };
	});
	const result = await api.executeDownloadJob(job, { mode: "zip", rename: true, digits: 3, concurrency: 4, from: 3, to: 6 }, {
		onEvent: (event) => events.push(event)
	});
	check("页码范围只下载 3-6 页", () => {
		assert.deepEqual(loadedPages.slice().sort((a, b) => a - b), [3, 4, 5, 6]);
		assert.equal(result.total, 4);
		assert.equal(result.successCount, 4);
		assert.equal(result.failCount, 0);
	});
	check("ZIP 条目按页号 3 位补零命名", () => {
		assert.deepEqual(Object.keys(zipCalls.at(-1)).sort(), ["003.jpg", "004.jpg", "005.jpg", "006.jpg"]);
	});
	check("ZIP 模式返回 save 句柄且能触发下载", () => {
		assert.equal(typeof result.save, "function");
		result.save();
		assert.equal(anchorClicks.at(-1), "test-work.zip");
	});
	check("进度事件覆盖每一页", () => {
		const starts = events.filter((event) => event.type === "start").map((event) => event.pageNo).sort((a, b) => a - b);
		const ok = events.filter((event) => event.type === "success").map((event) => event.pageNo).sort((a, b) => a - b);
		assert.deepEqual(starts, [3, 4, 5, 6]);
		assert.deepEqual(ok, [3, 4, 5, 6]);
	});
})();

await (async () => {
	const written = [];
	const directory = {
		name: "Manga",
		async getFileHandle(filename) {
			return {
				async createWritable() {
					return {
						async write(blob) {
							written.push([filename, blob.size]);
						},
						async close() {}
					};
				}
			};
		}
	};
	const job = makeJob(3);
	const result = await api.executeDownloadJob(job, { mode: "image", rename: true, digits: 2, concurrency: 2, directory, from: 1, to: 3 }, {});
	check("图片模式写入文件夹并按位数命名", () => {
		assert.deepEqual(written.map((item) => item[0]).sort(), ["01.jpg", "02.jpg", "03.jpg"]);
		assert.equal(result.save, null);
		assert.equal(anchorClicks.length, 1, "图片模式不应触发压缩包下载");
	});
})();

await (async () => {
	anchorClicks.length = 0;
	const job = makeJob(3);
	await api.executeDownloadJob(job, { mode: "image", rename: true, digits: 3, concurrency: 1, directory: null, from: 1, to: 3 }, {});
	check("无目录权限时退化为逐个下载", () => {
		assert.deepEqual(anchorClicks, ["001.jpg", "002.jpg", "003.jpg"]);
	});
})();

await (async () => {
	const job = makeJob(4);
	const result = await api.executeDownloadJob(job, { mode: "zip", rename: false, concurrency: 2, from: 1, to: 4 }, {});
	check("关闭重命名时保留原始名称并替换扩展名", () => {
		assert.deepEqual(Object.keys(zipCalls.at(-1)).sort(), ["raw/hash_1.jpg", "raw/hash_2.jpg", "raw/hash_3.jpg", "raw/hash_4.jpg"]);
		assert.equal(result.successCount, 4);
	});
})();

await (async () => {
	const events = [];
	const job = makeJob(5, (pageNo) => {
		if (pageNo === 2 || pageNo === 4) throw new Error("HTTP 404");
		return { blob: new Blob([new Uint8Array([pageNo])]), ext: "jpg" };
	});
	const result = await api.executeDownloadJob(job, { mode: "zip", rename: true, digits: 3, concurrency: 2, from: 1, to: 5 }, {
		onEvent: (event) => events.push(event)
	});
	check("单页失败不影响其余页面", () => {
		assert.equal(result.successCount, 3);
		assert.equal(result.failCount, 2);
		const errors = events.filter((event) => event.type === "error");
		assert.deepEqual(errors.map((event) => event.pageNo).sort((a, b) => a - b), [2, 4]);
		assert.equal(errors[0].message, "HTTP 404");
	});
})();

await (async () => {
	const job = makeJob(3, () => {
		throw new Error("boom");
	});
	let threw = false;
	try {
		await api.executeDownloadJob(job, { mode: "zip", rename: true, digits: 3, concurrency: 2, from: 1, to: 3 }, {});
	} catch (err) {
		threw = /全部页面下载失败/.test(err.message);
	}
	check("全部失败时抛出可读错误", () => {
		assert.ok(threw, "未抛出预期错误");
	});
})();

await (async () => {
	let cancelled = false;
	let loaded = 0;
	const events = [];
	const job = makeJob(20, () => {
		loaded++;
		cancelled = true;
		return { blob: new Blob([new Uint8Array([1])]), ext: "jpg" };
	});
	const result = await api.executeDownloadJob(job, { mode: "image", rename: true, digits: 3, concurrency: 1, from: 1, to: 20, isCancelled: () => cancelled }, {
		onEvent: (event) => events.push(event)
	});
	check("取消后停止抓取后续页面", () => {
		assert.ok(result.cancelled, "结果未标记取消");
		assert.equal(loaded, 1, `仍抓取了 ${loaded} 页`);
	});
	check("取消后每个未抓取页面都记为 skipped（总数守恒）", () => {
		assert.equal(result.skippedCount, 19);
		assert.equal(result.successCount + result.failCount + result.skippedCount, result.total);
		assert.equal(events.filter((event) => event.type === "skipped").length, 19);
	});
})();

await (async () => {
	const job = makeJob(5, () => {
		throw new Error("取消后不应再发起请求");
	});
	let threw = false;
	let result = null;
	try {
		result = await api.executeDownloadJob(job, { mode: "zip", rename: true, digits: 3, concurrency: 1, from: 1, to: 5, isCancelled: () => true }, {});
	} catch (err) {
		threw = true;
	}
	check("零成功的取消不算失败、不抛错", () => {
		assert.ok(!threw, "取消不应抛错");
		assert.ok(result && result.cancelled);
		assert.equal(result.save, null);
		assert.equal(result.skippedCount, 5);
	});
})();

await (async () => {
	let inFlight = 0;
	let peak = 0;
	const job = makeJob(6, async () => {
		inFlight++;
		peak = Math.max(peak, inFlight);
		await new Promise((resolve) => setTimeout(resolve, 5));
		inFlight--;
		return { blob: new Blob([new Uint8Array([1])]), ext: "jpg" };
	});
	const result = await api.executeDownloadJob(job, { mode: "image", rename: true, digits: 3, concurrency: 5, directory: null, from: 1, to: 6 }, {});
	check("无目录时强制串行，避免浏览器拦截批量下载", () => {
		assert.equal(peak, 1, `并发峰值 ${peak}`);
		assert.equal(result.serial, true);
		assert.equal(result.successCount, 6);
	});
})();

await (async () => {
	const dirs = [];
	const files = [];
	const makeDir = (prefix) => ({
		name: prefix || "root",
		async getDirectoryHandle(segment) {
			dirs.push(`${prefix}/${segment}`);
			return makeDir(`${prefix}/${segment}`);
		},
		async getFileHandle(leaf) {
			files.push(`${prefix}/${leaf}`);
			return {
				async createWritable() {
					return {
						async write() {},
						async close() {}
					};
				}
			};
		}
	});
	const job = makeJob(2);
	await api.executeDownloadJob(job, { mode: "image", rename: false, concurrency: 1, directory: makeDir(""), from: 1, to: 2 }, {});
	check("关闭重命名 + 目录写入时逐层创建子目录", () => {
		assert.ok(dirs.length === 2 && dirs.every((dir) => dir === "/raw"), `目录创建异常：${dirs.join(",")}`);
		assert.deepEqual(files, ["/raw/hash_1.jpg", "/raw/hash_2.jpg"]);
	});
})();

check("ZIP 条目名不会与 Object 原型属性冲突", () => {
	const files = /* @__PURE__ */ Object.create(null);
	api.addUniqueZipFile(files, "__proto__", 1);
	api.addUniqueZipFile(files, "constructor", 2);
	api.addUniqueZipFile(files, "constructor", 3);
	const keys = Object.keys(files).sort();
	assert.deepEqual(keys, ["__proto__", "constructor", "constructor_2"]);
});

await (async () => {
	const loadedFormats = [];
	const job = {
		zipFileName: "seq-work",
		pages: Array.from({ length: 4 }, (_, index) => ({
			pageNo: index + 10,
			originalName: `raw/hash_${index + 10}.enc`,
			load: async (options) => {
				loadedFormats.push(options && options.format);
				return { blob: new Blob([new Uint8Array([index + 1])]), ext: options && options.format };
			}
		}))
	};
	const result = await api.executeDownloadJob(job, { mode: "zip", naming: "seq", format: "png", digits: 3, concurrency: 2, from: 10, to: 13 }, {});
	check("naming=seq 时按选中顺序从 1 编号（与原始页号无关）", () => {
		assert.deepEqual(Object.keys(zipCalls.at(-1)).sort(), ["001.png", "002.png", "003.png", "004.png"]);
		assert.equal(result.successCount, 4);
	});
	check("format=png 透传到 page.load 且条目扩展名随 result.ext", () => {
		assert.deepEqual([...new Set(loadedFormats)], ["png"]);
	});
})();

await (async () => {
	const job = {
		zipFileName: "raw-work",
		pages: [{ pageNo: 7, originalName: "raw/very_long_hash_name.enc", load: async () => ({ blob: new Blob([new Uint8Array([1])]), ext: "jpg" }) }]
	};
	await api.executeDownloadJob(job, { mode: "image", naming: "original", digits: 3, concurrency: 1, directory: null, from: 7, to: 7 }, {});
	check("naming=original 保留原始名称，只校正扩展名（anchor 下载取文件名）", () => {
		assert.deepEqual(anchorClicks.slice(-1), ["very_long_hash_name.jpg"]);
	});
})();

await (async () => {
	const written = [];
	const directory = {
		name: "M",
		async getFileHandle(filename) {
			return {
				async createWritable() {
					return {
						async write() {
							written.push(filename);
						},
						async close() {}
					};
				}
			};
		}
	};
	const job = makeJob(3, () => ({ blob: new Blob([new Uint8Array([9])]), ext: "png" }));
	await api.executeDownloadJob(job, { mode: "image", naming: "page", format: "png", digits: 3, concurrency: 1, directory, from: 2, to: 3 }, {});
	check("图片模式 + PNG 写出 002.png / 003.png（用原始页号）", () => {
		assert.deepEqual(written.sort(), ["002.png", "003.png"]);
	});
})();

await (async () => {
	const job = makeJob(2);
	const result = await api.executeDownloadJob(job, { mode: "zip", rename: false, digits: 3, concurrency: 1, from: 1, to: 2 }, {});
	check("旧参数 rename:false 等价于 naming=original（向后兼容）", () => {
		assert.deepEqual(Object.keys(zipCalls.at(-1)).sort(), ["raw/hash_1.jpg", "raw/hash_2.jpg"]);
		assert.equal(result.successCount, 2);
	});
})();

await (async () => {
	const seen = [];
	const makeProbeJob = () => ({
		zipFileName: "format-probe",
		pages: [{
			pageNo: 1,
			originalName: "p1.enc",
			load: async (options) => {
				seen.push(options && options.format);
				return { blob: new Blob([new Uint8Array([1])]), ext: "jpg" };
			}
		}]
	});
	await api.executeDownloadJob(makeProbeJob(), { mode: "zip", naming: "page", digits: 3, concurrency: 1, from: 1, to: 1 }, {});
	check("未提供 format 时默认按 jpg 请求", () => {
		assert.deepEqual(seen, ["jpg"]);
	});
	await api.executeDownloadJob(makeProbeJob(), { mode: "zip", rename: true, asJpeg: false, digits: 3, concurrency: 1, from: 1, to: 1 }, {});
	check("旧参数 asJpeg:false 仍映射为 png（向后兼容）", () => {
		assert.deepEqual(seen, ["jpg", "png"]);
	});
})();

await (async () => {
	// comipo 的 decryption.key 是 64 个 ASCII hex 字符，密钥既可能是这段文本、也可能是它的字节，
	// 两种形态都必须解出同一串 32 字节密钥；再用真实布局验证「嗅探 + 按目标格式转码」。
	const xorCode = readFileSync(path.join(buildDir, "parts", "04-xor-fetch.js"), "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "");
	const requested = [];
	let payload = new Uint8Array([0]);
	const xorFactory = new Function(
		"Blob",
		"origConsole",
		"fileTypeFromBuffer",
		"resolveImageFormat",
		"imageBlobToFormat",
		"downloadArrayBuffer",
		`${xorCode}
		return { fetchXorPage, xorKeyToBytes, xorWithKeyBytes, looksLikeHexText };`
	);
	const xorApi = xorFactory(
		Blob,
		fakeConsole,
		async (bytes) => (bytes[0] === 0x52 && bytes[1] === 0x49 ? { ext: "webp", mime: "image/webp" } : { ext: "bin", mime: "application/octet-stream" }),
		(options = {}) => (options.format === "png" ? "png" : "jpg"),
		async () => new Blob([new Uint8Array([0xff, 0xd8, 0xff])]),
		async (url) => {
			requested.push(url);
			return payload.buffer;
		}
	);
	const keyText = "b83cbc45512c27e80ea3cfffdb9a03b3a693eb4139cd5b9b5e2a52a798d64e60";
	const keyFromText = xorApi.xorKeyToBytes(keyText);
	const keyFromAsciiBytes = xorApi.xorKeyToBytes(new TextEncoder().encode(keyText));
	check("comipo 的 hex 密钥文本与 ASCII 字节两种形态解出同一密钥", () => {
		assert.ok(xorApi.looksLikeHexText(new TextEncoder().encode(keyText)), "未识别 ASCII hex 字节");
		assert.equal(keyFromText.length, 32, `密钥长度应为 32，实际 ${keyFromText.length}`);
		assert.equal(keyFromText[0], 0xb8);
		assert.deepEqual(Array.from(keyFromAsciiBytes), Array.from(keyFromText), "ASCII 字节形态未按 hex 解码");
	});
	check("XOR 加解密可逆", () => {
		const data = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3]);
		const once = xorApi.xorWithKeyBytes(data, keyFromText);
		assert.notDeepEqual(Array.from(once), Array.from(data), "密文不应与明文相同");
		assert.deepEqual(Array.from(xorApi.xorWithKeyBytes(once, keyFromText)), Array.from(data));
	});
	// 按 comipo 的布局造一页：明文是 RIFF/WEBP，密钥来自 decryption.key 文本。
	payload = xorApi.xorWithKeyBytes(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x6e, 0x88, 0x03, 0x00, 0x57, 0x45, 0x42, 0x50]), keyFromText);
	const converted = await xorApi.fetchXorPage({ url: "https://dl.comipo.app/viewer/ebook_fixed/v2/sample/books/BJ03046000/BJ03045050/p1.enc?Policy=x", key: keyText }, "deadbeef", { format: "jpg" });
	check("comipo 单页解密后嗅探为图片并按目标格式转码", () => {
		assert.equal(requested.length, 1, "应请求一次页面文件");
		assert.equal(converted.ext, "jpg", `扩展名应为 jpg，实际 ${converted.ext}`);
		assert.equal(converted.converted, true, "应发生转码");
	});
	payload = new Uint8Array([9, 9, 9, 9]);
	const passthrough = await xorApi.fetchXorPage({ url: "plain" }, null, { format: "jpg" });
	check("没有密钥时按明文透传（不做无意义的转码）", () => {
		assert.equal(passthrough.ext, "bin", `扩展名应为 bin，实际 ${passthrough.ext}`);
		assert.notEqual(passthrough.converted, true);
	});
})();

console.log("[4] UI 逻辑（无 Vue 的渲染树桩测试）");

const walk = (node, visit) => {
	if (node == null || node === false) return;
	if (Array.isArray(node)) {
		node.forEach((child) => walk(child, visit));
		return;
	}
	if (typeof node === "object" && node.tag) {
		visit(node);
		walk(node.children, visit);
	}
};
const textOf = (node) => {
	if (node == null || node === false || node === true) return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOf).join(" ");
	if (typeof node === "object" && node.tag) return textOf(node.children);
	return "";
};
const findByText = (node, label, tag = null) => {
	let found = null;
	walk(node, (candidate) => {
		if (found) return;
		if (tag && candidate.tag !== tag) return;
		if (textOf(candidate) === label) found = candidate;
	});
	return found;
};
const findByClass = (node, className) => {
	let found = null;
	walk(node, (candidate) => {
		if (found) return;
		const classes = Array.isArray(candidate.props.class) ? candidate.props.class : String(candidate.props.class || "").split(" ");
		if (classes.includes(className)) found = candidate;
	});
	return found;
};
/** 共享的 App_default 工厂：同时暴露挂载与去重函数，供 UI 交互 / 单例挂载测试使用。 */
const appFactoryOf = new Function(
	"_plugin_vue_export_helper_default", "_css", "reactive", "h", "createApp", "extractDlsiteId",
	"detectPlayPlatform", "resolveComipoPages",
	"hookXorEnc", "hookFetchPuzzle", "padPageNumber", "_unsafeWindow", "window", "history", "document",
	"requestAnimationFrame", "origConsole", "executeDownloadJob",
	`${appCode}
	return { App_default, mountApp, removeForeignPanels, dpdIsSubFrame };`
);

{
	const pages = Array.from({ length: 5 }, (_, index) => ({
		pageNo: index + 1,
		originalName: `p${index + 1}.enc`,
		load: async () => ({ blob: new Blob([new Uint8Array([index])]), ext: "jpg" })
	}));
	const windowStub = {
		location: { href: "https://play.dlsite.com/work/BJ123456/viewer" },
		addEventListener() {},
		dispatchEvent() {}
	};
	const documentStub = {
		body: { appendChild() {} },
		createElement: () => ({ style: {}, click() {}, remove() {} })
	};
	const execStub = async (job, options, handlers) => {
		for (const page of job.pages) {
			handlers.onEvent({ type: "start", pageNo: page.pageNo, total: job.pages.length });
			await page.load({ asJpeg: true });
			handlers.onEvent({
				type: "success",
				pageNo: page.pageNo,
				total: job.pages.length,
				name: `${String(page.pageNo).padStart(3, "0")}.jpg`,
				bytes: 3
			});
		}
		return {
			mode: options.mode,
			total: job.pages.length,
			successCount: job.pages.length,
			failCount: 0,
			save: null,
			blobUrl: null
		};
	};
	const appFactory = new Function(
		"_plugin_vue_export_helper_default",
		"_css",
		"reactive",
		"h",
		"createApp",
		"extractDlsiteId",
		"detectPlayPlatform",
		"resolveComipoPages",
		"hookXorEnc",
		"hookFetchPuzzle",
		"padPageNumber",
		"_unsafeWindow",
		"window",
		"history",
		"document",
		"requestAnimationFrame",
		"origConsole",
		"executeDownloadJob",
		`${appCode}
		return { App_default };`
	);
	const { App_default } = appFactory(
		(sfc) => sfc,
		() => {},
		(object) => object,
		(tag, props, children) => ({ tag, props: props || {}, children }),
		() => ({ mount() {} }),
		() => "BJ123456",
		() => "dlsite",
		async () => null,
		() => new Promise(() => {}),
		() => Promise.resolve({ method: "puzzle", data: { zipFileName: "wk", pages } }),
		(value, width) => String(value).padStart(width, "0"),
		{},
		windowStub,
		{ pushState() {}, replaceState() {} },
		documentStub,
		() => {},
		fakeConsole,
		execStub
	);
	const render = App_default.setup({});
	const first = render();
	check("进入作品页时立即进入检测态", () => {
		const text = textOf(first);
		assert.ok(text.includes("正在检测该作品的加密方式…"), text);
	});
	await new Promise((resolve) => setImmediate(resolve));
	const second = render();
	check("检测完成后渲染全部设置区", () => {
		const text = textOf(second);
		for (const label of ["页码范围", "输出方式", "逐页", "压缩", "文件命名", "按页号重命名", "并发数", "开始下载"]) {
			assert.ok(text.includes(label), `缺少：${label}`);
		}
		assert.ok(text.includes("共 5 页"), "未显示总页数");
	});
	const startButton = findByText(second, "开始下载", "button");
	check("开始按钮可点击", () => {
		assert.ok(startButton, "未找到开始下载按钮");
		assert.equal(typeof startButton.props.onClick, "function");
	});
	await startButton.props.onClick();
	const third = render();
	check("下载完成后进度面板显示成功明细", () => {
		const text = textOf(third);
		assert.ok(text.includes("任务进度"), "缺少进度面板");
		assert.ok(text.includes("成功 5"), `计数不正确：${text}`);
		assert.ok(text.includes("001.jpg"), "缺少逐页文件名");
		assert.ok(text.includes("重新下载"), "缺少重新下载按钮");
	});
}

{
	const appFactory = new Function(
		"_plugin_vue_export_helper_default",
		"_css",
		"reactive",
		"h",
		"createApp",
		"extractDlsiteId",
		"detectPlayPlatform",
		"resolveComipoPages",
		"hookXorEnc",
		"hookFetchPuzzle",
		"padPageNumber",
		"_unsafeWindow",
		"window",
		"history",
		"document",
		"requestAnimationFrame",
		"origConsole",
		"executeDownloadJob",
		`${appCode}
		return { App_default };`
	);
	const { App_default } = appFactory(
		(sfc) => sfc,
		() => {},
		(object) => object,
		(tag, props, children) => ({ tag, props: props || {}, children }),
		() => ({ mount() {} }),
		() => null,
		() => "dlsite",
		async () => null,
		() => new Promise(() => {}),
		() => new Promise(() => {}),
		(value, width) => String(value).padStart(width, "0"),
		{},
		{ location: { href: "https://play.dlsite.com/" }, addEventListener() {}, dispatchEvent() {} },
		{ pushState() {}, replaceState() {} },
		{ body: { appendChild() {} }, createElement: () => ({ style: {}, click() {}, remove() {} }) },
		() => {},
		fakeConsole,
		async () => ({ save: null })
	);
	const tree = App_default.setup({})();
	check("非作品页渲染空闲提示", () => {
		assert.ok(textOf(tree).includes("打开 DLsite Play 作品阅读页后自动检测"), textOf(tree));
	});
}

{
	const pages = Array.from({ length: 12 }, (_, index) => ({
		pageNo: index + 1,
		originalName: `p${index + 1}.enc`,
		load: async () => ({ blob: new Blob([new Uint8Array([index])]), ext: "jpg" })
	}));
	let lastOptions = null;
	const windowStub = { location: { href: "https://play.dlsite.com/work/BJ123456/viewer" }, addEventListener() {}, dispatchEvent() {} };
	const execStub = async (job, options, handlers) => {
		lastOptions = options;
		job.pages.forEach((page, index) => {
			handlers.onEvent({ type: "start", pageNo: page.pageNo, total: job.pages.length });
			handlers.onEvent({
				type: "success",
				pageNo: page.pageNo,
				total: job.pages.length,
				name: `${String(index + 1).padStart(options.digits, "0")}.${options.format}`,
				bytes: 3
			});
		});
		return { mode: options.mode, total: job.pages.length, successCount: job.pages.length, failCount: 0, save: null, blobUrl: null };
	};
	const { App_default } = appFactoryOf(
		(sfc) => sfc,
		() => {},
		(object) => object,
		(tag, props, children) => ({ tag, props: props || {}, children }),
		() => ({ mount() {} }),
		() => "BJ123456",
		() => "dlsite",
		async () => null,
		() => new Promise(() => {}),
		() => Promise.resolve({ method: "puzzle", data: { zipFileName: "wk", pages } }),
		(value, width) => String(value).padStart(width, "0"),
		{},
		windowStub,
		{ pushState() {}, replaceState() {} },
		{ body: { appendChild() {} }, createElement: () => ({ style: {}, click() {}, remove() {} }) },
		() => {},
		fakeConsole,
		execStub
	);
	const render = App_default.setup({});
	render();
	await new Promise((resolve) => setImmediate(resolve));
	const detected = render();
	const seqButton = findByText(detected, "顺序", "button");
	const pngButton = findByText(detected, "PNG", "button");
	check("命名三档与 JPG/PNG 双档都是可点击按钮", () => {
		assert.ok(seqButton && pngButton, "未找到顺序 / PNG 控件");
		assert.equal(seqButton.props.disabled, false);
		assert.equal(typeof seqButton.props.onClick, "function");
		assert.equal(typeof pngButton.props.onClick, "function");
	});
	const modeSwitcher = findByClass(detected, "dpd-switch");
	const formatSwitcher = findByClass(detected, "dpd-format");
	check("输出方式与格式选择是两组独立滑块", () => {
		assert.ok(modeSwitcher && formatSwitcher, "未找到两组滑块");
		assert.notEqual(modeSwitcher, formatSwitcher);
		assert.ok(formatSwitcher.props.class.includes("is-left"), "默认 JPG 时格式滑块应在左档");
		assert.ok(modeSwitcher.props.class.includes("is-left"), "默认逐页图片时模式滑块应在左档");
	});
	const slider = findByClass(detected, "dpd-slider");
	check("并发滑块带 Material 轨道填充变量", () => {
		assert.ok(slider, "未找到并发滑块");
		assert.equal(slider.props.style["--dpd-fill"], "28.6%");
	});
	seqButton.props.onClick();
	pngButton.props.onClick();
	const configured = render();
	check("切到顺序命名 + PNG 后提示同步更新", () => {
		const text = textOf(configured);
		assert.ok(text.includes("按下载顺序重命名"), text);
		assert.ok(text.includes("第一个文件 001.png"), text);
		assert.ok(text.includes("PNG · 无损、体积较大"), text);
		assert.ok(findByClass(configured, "dpd-format").props.class.includes("is-right"), "PNG 时格式滑块应在右档");
	});
	const fromInput = findByClass(configured, "dpd-input");
	const inputs = [];
	walk(configured, (candidate) => {
		const classes = String(candidate.props.class || "");
		if (classes.includes("dpd-input")) inputs.push(candidate);
	});
	inputs[0].props.onInput({ target: { value: 10 } });
	inputs[1].props.onInput({ target: { value: 12 } });
	const ranged = render();
	await findByText(ranged, "开始下载", "button").props.onClick();
	const finished = render();
	check("顺序命名下只下 10–12 页，文件名从 001 重新编号", () => {
		assert.equal(lastOptions.naming, "seq");
		assert.equal(lastOptions.format, "png");
		assert.equal(lastOptions.from, 10);
		assert.equal(lastOptions.to, 12);
		const text = textOf(finished);
		assert.ok(text.includes("001.png") && text.includes("002.png"), text);
		assert.ok(!text.includes("010.png"), "顺序模式不应沿用原始页号");
	});
}

{
	const pages = Array.from({ length: 4 }, (_, index) => ({
		pageNo: index + 1,
		originalName: `0e25_kyoran_2048_09_00${index + 1}.enc`,
		load: async () => ({ blob: new Blob([new Uint8Array([index])]), ext: "jpg" })
	}));
	const makeComipoApp = (resolveComipo, xorStub) => appFactoryOf(
		(sfc) => sfc,
		() => {},
		(object) => object,
		(tag, props, children) => ({ tag, props: props || {}, children }),
		() => ({ mount() {} }),
		() => "BJ03045050",
		() => "comipo",
		resolveComipo,
		xorStub,
		() => { throw new Error("comipo 不应启动 DLsite 拼图检测"); },
		(value, width) => String(value).padStart(width, "0"),
		{},
		{ location: { href: "https://play.comipo.app/viewer/sample/BJ03045050" }, addEventListener() {}, dispatchEvent() {} },
		{ pushState() {}, replaceState() {} },
		{ body: { appendChild() {} }, createElement: () => ({ style: {}, click() {}, remove() {} }) },
		() => {},
		fakeConsole,
		async () => ({ save: null })
	);
	const { App_default } = makeComipoApp(
		async () => ({ method: "xor", data: { zipFileName: "[BJ03045050] (テスト) 作品", key: "b83cbc45512c27e80ea3cfffdb9a03b3a693eb4139cd5b9b5e2a52a798d64e60", pages } }),
		() => new Promise(() => {})
	);
	const render = App_default.setup({});
	const before = render();
	check("comipo 作品页在检测阶段就带绿色主题", () => {
		assert.ok(findByClass(before, "is-comipo"), "面板未加 is-comipo 类");
		const text = textOf(before);
		assert.ok(text.includes("正在检测该作品的加密方式…"), text);
		assert.ok(text.includes("comipo"), `面板未体现 comipo 平台：${text}`);
	});
	await new Promise((resolve) => setImmediate(resolve));
	const detected = render();
	check("comipo 检测完成后显示 comipo 标识与页数", () => {
		const text = textOf(detected);
		assert.ok(text.includes("comipo"), text);
		assert.ok(text.includes("共 4 页"), text);
	});
	check("comipo 面板保留 DLsite 那套下载设置区", () => {
		const text = textOf(detected);
		for (const label of ["页码范围", "输出方式", "逐页", "压缩", "JPG", "PNG", "文件命名", "并发数", "开始下载"]) {
			assert.ok(text.includes(label), `缺少：${label}`);
		}
	});
	// 兜底链路：主动解析返回 null（例如接口变了）时，仍要让「等页面自身请求」的 XOR 检测接管。
	const { App_default: FallbackApp } = makeComipoApp(async () => null, () => Promise.resolve({ method: "xor", data: { zipFileName: "fallback", key: "", pages } }));
	const fallbackRender = FallbackApp.setup({});
	fallbackRender();
	await new Promise((resolve) => setImmediate(resolve));
	const fallbackDetected = fallbackRender();
	check("comipo 主动解析失败时回退到被动 XOR 检测", () => {
		const text = textOf(fallbackDetected);
		assert.ok(text.includes("共 4 页"), `兜底检测未完成：${text}`);
		assert.ok(text.includes("comipo"), text);
	});
}

console.log("[5] 重复注入去重与单例挂载");

{
	const removed = [];
	const body = {
		appendChild() {},
		removeChild(child) {
			removed.push(child);
			child.parentNode = null;
		}
	};
	const makeNode = (className) => ({
		className,
		style: {},
		classList: { contains: (name) => String(className).split(" ").includes(name) },
		parentNode: null,
		remove() {}
	});
	const keep = makeNode("dlsite-play-downloader-vue");
	const foreign = makeNode("dlsite-play-downloader-vue");
	const foreignPanel = makeNode("dpd-panel");
	const legacy = makeNode("plugin-area");
	keep.parentNode = body;
	foreign.parentNode = body;
	foreignPanel.parentNode = foreign;
	legacy.parentNode = body;
	const nodes = [keep, foreign, foreignPanel, legacy];
	const documentStub = {
		body,
		createElement: () => makeNode("dlsite-play-downloader-vue"),
		querySelectorAll: () => nodes
	};
	const mounted = [];
	const { mountApp, removeForeignPanels } = appFactoryOf(
		(sfc) => sfc,
		() => {},
		(object) => object,
		(tag, props, children) => ({ tag, props: props || {}, children }),
		() => ({ mount(element) { mounted.push(element); } }),
		() => "BJ123456",
		() => "dlsite",
		async () => null,
		() => new Promise(() => {}),
		() => new Promise(() => {}),
		(value, width) => String(value).padStart(width, "0"),
		{},
		{ location: { href: "https://play.dlsite.com/work/BJ123456/viewer" }, addEventListener() {}, dispatchEvent() {} },
		{ pushState() {}, replaceState() {} },
		documentStub,
		() => {},
		fakeConsole,
		async () => ({ save: null })
	);
	removeForeignPanels(keep);
	check("清场只移除别人的下载器面板，不动自己", () => {
		assert.ok(removed.includes(foreign), "未移除重复注入的宿主容器");
		assert.ok(removed.includes(legacy), "未移除原版脚本的旧面板");
		assert.ok(!removed.includes(keep), "误删了自己的容器");
	});
	check("mountApp 在同一文档只挂载一个面板", () => {
		mountApp();
		mountApp();
		assert.equal(mounted.length, 1, `实际挂载 ${mounted.length} 次`);
	});
}

console.log("[6] 头部元数据（fork 版）");

const outLines = out.split("\n");
const head = outLines.slice(0, 21).join("\n");

check("油猴头已换成 fork 版元数据", () => {
	for (const token of [
		"// ==UserScript==",
		"// @name         DLscrape",
		"// @namespace    https://github.com/operLin/DLscrape",
		"// @version      2.4.0",
		"// @author       cpufan,",
		"// @license      MIT",
		"// @match        https://play.dlsite.com/*",
		"// @match        https://play.comipo.app/*",
		"// @grant        unsafeWindow"
	]) {
		assert.ok(head.includes(token), `头部缺少：${token}`);
	}
	assert.ok(!out.includes("greasyfork.org"), "仍残留上游 GreasyFork 更新频道（会被自动更新覆盖）");
	assert.ok(!out.includes("scripts/480281"), "仍残留上游 GreasyFork 脚本编号");
	assert.ok(head.includes("https://github.com/operLin/DLscrape/raw/main/DLscrape.user.js"), "自更新地址未指向本仓库 raw");
});

check("头部改写没有移动行号锚点", () => {
	assert.equal(outLines[0], "// ==UserScript==");
	assert.equal(outLines[20], "// ==/UserScript==", "头部行数变了");
	assert.equal(outLines[21], "", "头部后应为空行");
	assert.ok(outLines[22].startsWith("System.addImportMap("), `第 23 行异常：${outLines[22].slice(0, 60)}`);
	assert.ok(outLines[24].includes('System.register("./___monkey.entry.js"'), `第 25 行锚点异常：${outLines[24].slice(0, 60)}`);
});

console.log(failures === 0 ? "\n全部通过" : `\n${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
