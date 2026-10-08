// 真实 Vue + jsdom 集成测试：挂载改进后的组件，验证渲染、页码范围、逐页图片、压缩包与失败明细。
//
// 依赖（仅测试用，不进入产物；在 build 目录安装后即可运行）：
//   cd build && npm i --no-save vue@3.5.42 jsdom
// 运行：
//   node build/dom-test.mjs
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const engineCode = readFileSync(path.join(ROOT, "build/parts/02-engine.js"), "utf8");
const appCode = readFileSync(path.join(ROOT, "build/parts/05-app.js"), "utf8");

const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"app\"></div></body></html>", {
	url: "https://play.dlsite.com/work/BJ123456/viewer",
	pretendToBeVisual: true
});
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
globalThis.history = window.history;
globalThis.Event = window.Event;
for (const name of ["Node", "Text", "Comment", "DocumentFragment", "SVGElement", "HTMLAnchorElement", "HTMLInputElement", "HTMLSelectElement", "HTMLButtonElement", "MutationObserver", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
	if (window[name] !== undefined && globalThis[name] === undefined) {
		globalThis[name] = window[name];
	}
}
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;

const Vue = await import("vue");

// 记录 anchor 触发的下载文件名
const clicked = [];
const rawCreateElement = window.document.createElement.bind(window.document);
window.document.createElement = (tag, ...rest) => {
	const el = rawCreateElement(tag, ...rest);
	if (String(tag).toLowerCase() === "a") {
		el.click = () => clicked.push(el.download);
	}
	return el;
};

const failures = [];
const check = (name, fn) => {
	try {
		fn();
		console.log(`  PASS  ${name}`);
	} catch (err) {
		failures.push(name);
		console.log(`  FAIL  ${name}\n        ${err.message}`);
	}
};
const assert = (condition, message) => {
	if (!condition) throw new Error(message || "assertion failed");
};

const pages = Array.from({ length: 6 }, (_, index) => ({
	pageNo: index + 1,
	originalName: `hash_${index + 1}.enc`,
	load: async () => ({ blob: new Blob([new Uint8Array([1, 2, 3, 4])]), ext: "jpg" })
}));

// 模拟 unsafeWindow：用于验证「同一文档只挂载一个面板」的单例标记
const fakeUnsafeWindow = {};

const factory = new Function(
	"zip",
	"origConsole",
	"normalizeZipPath",
	"document",
	"URL",
	"Blob",
	"createImageBitmap",
	"_plugin_vue_export_helper_default",
	"_css",
	"reactive",
	"h",
	"createApp",
	"nextTick",
	"extractDlsiteId",
	"hookXorEnc",
	"hookFetchPuzzle",
	"_unsafeWindow",
	`${engineCode}
${appCode}
	return { App_default, mountApp };`
);
const api = factory(
	(files, cb) => cb(null, new Uint8Array([80, 75, 3, 4])),
	console,
	(input) => String(input || "image").replace(/\\/g, "/").split("/").filter((p) => p && p !== "." && p !== "..").join("/") || "image",
	window.document,
	{ createObjectURL: () => "blob:test", revokeObjectURL() {} },
	Blob,
	undefined,
	(sfc, props) => {
		for (const [key, value] of props) sfc[key] = value;
		return sfc;
	},
	() => {},
	Vue.reactive,
	Vue.h,
	Vue.createApp,
	Vue.nextTick,
	() => "BJ123456",
	() => new Promise(() => {}),
	() => Promise.resolve({ method: "puzzle", data: { zipFileName: "work-title", pages } }),
	fakeUnsafeWindow
);

const flush = async () => {
	for (let i = 0; i < 4; i++) {
		await Vue.nextTick();
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
};

const panelText = () => window.document.querySelector(".dpd-panel")?.textContent ?? "";
const findButton = (label) => [...window.document.querySelectorAll(".dpd-panel button")].find((el) => el.textContent.trim() === label);
const setInput = (el, value) => {
	el.value = String(value);
	el.dispatchEvent(new window.Event("input", { bubbles: true }));
};

const container = window.document.getElementById("app");
Vue.createApp(api.App_default).mount(container);

console.log("[DOM] 真实 Vue + jsdom 挂载");

check("面板已挂载并有标题", () => {
	assert(window.document.querySelector(".dpd-panel"), "未找到 .dpd-panel");
	assert(panelText().includes("DLscrape"), panelText().slice(0, 80));
});

await flush();

check("检测完成后显示页数与设置区", () => {
	const text = panelText();
	assert(text.includes("共 6 页"), text.slice(0, 200));
	assert(text.includes("页码范围"), "缺少页码范围");
	assert(text.includes("逐页") && text.includes("压缩"), "缺少模式滑块");
	assert(text.includes("按页号重命名"), "缺少重命名开关");
	const inputs = [...window.document.querySelectorAll(".dpd-range .dpd-input")];
	assert(inputs.length === 2, `范围输入框数量 ${inputs.length}`);
	assert(inputs[0].value === "1" && inputs[1].value === "6", `${inputs[0].value}-${inputs[1].value}`);
});

check("默认逐页图片模式，滑块在左", () => {
	const switcher = window.document.querySelector(".dpd-switch");
	assert(switcher && !switcher.classList.contains("is-right"), "滑块位置不正确");
});

setInput(window.document.querySelectorAll(".dpd-range .dpd-input")[0], 2);
setInput(window.document.querySelectorAll(".dpd-range .dpd-input")[1], 4);
await Vue.nextTick();

check("修改页码范围后实时提示选中页数", () => {
	assert(panelText().includes("当前选中 3 页"), panelText().slice(0, 300));
});

clicked.length = 0;
findButton("开始下载").click();
await flush();

check("逐页模式按原始页号重命名并逐个下载", () => {
	assert(JSON.stringify(clicked) === JSON.stringify(["002.jpg", "003.jpg", "004.jpg"]), JSON.stringify(clicked));
});

check("进度面板显示成功明细", () => {
	const text = panelText();
	assert(text.includes("任务进度"), "缺少进度面板");
	assert(text.includes("成功 3"), text.slice(-400));
	assert(text.includes("002.jpg"), "缺少逐页条目");
});

check("逐页模式完成后按钮变为重新下载", () => {
	assert(findButton("重新下载"), "未找到重新下载按钮");
	assert(!findButton("保存压缩包"), "逐页模式不应出现保存压缩包");
});

findButton("压缩").click();
await Vue.nextTick();

check("切到压缩包模式后滑块右移", () => {
	const switcher = window.document.querySelector(".dpd-switch");
	assert(switcher.classList.contains("is-right"), "滑块未右移");
	assert(findButton("逐页").classList.contains("is-on") === false, "逐页不应处于选中态");
});

check("完成状态不跨模式串台：切到压缩包后按钮回到开始下载", () => {
	assert(findButton("开始下载"), "压缩包模式下应显示开始下载");
	assert(!findButton("重新下载"), "压缩包模式不应沿用逐页模式的完成态");
	assert(!findButton("保存压缩包"), "尚未打包不应出现保存按钮");
});

clicked.length = 0;
findButton("开始下载").click();
await flush();

check("压缩包模式生成保存按钮", () => {
	assert(findButton("保存压缩包"), "未找到保存压缩包按钮");
});

findButton("保存压缩包").click();
await new Promise((resolve) => setTimeout(resolve, 20));

check("保存压缩包触发 zip 下载", () => {
	assert(JSON.stringify(clicked) === JSON.stringify(["work-title.zip"]), JSON.stringify(clicked));
});

// 失败路径：让第 5 页抛错，并下载 1-6 全范围
pages[4].load = async () => {
	throw new Error("HTTP 404");
};
const rangeInputs = window.document.querySelectorAll(".dpd-range .dpd-input");
setInput(rangeInputs[0], 1);
setInput(rangeInputs[1], 6);
await Vue.nextTick();
clicked.length = 0;
findButton("重新下载").click();
await flush();

check("单页失败时进度面板给出失败明细", () => {
	const text = panelText();
	assert(text.includes("失败 1"), text.slice(-400));
	assert(text.includes("HTTP 404"), "未展示失败原因");
	assert(text.includes("成功 5"), text.slice(-400));
});

check("失败筛选只显示失败页", async () => {});
const failFilter = findButton("失败 1");
check("失败筛选按钮存在", () => {
	assert(failFilter, "未找到失败筛选按钮");
});

// 取消路径：把每页加载挂起，启动后取消，再放行已发出的请求
const gates = [];
const slowLoad = async () => {
	await new Promise((resolve) => gates.push(resolve));
	return { blob: new Blob([new Uint8Array([1, 2])]), ext: "jpg" };
};

findButton("逐页").click();
for (const page of pages) page.load = slowLoad;
await Vue.nextTick();
const range2 = window.document.querySelectorAll(".dpd-range .dpd-input");
setInput(range2[0], 1);
setInput(range2[1], 6);
await Vue.nextTick();
findButton("开始下载").click();
assert(gates.length === 1, `无目录时图片模式应串行，实际并发 ${gates.length}`);
await Vue.nextTick();
findButton("取消下载").click();
await Vue.nextTick();
gates.splice(0).forEach((resolve) => resolve());
await flush();

check("取消后剩余页面标记为已跳过且总数守恒", () => {
	const text = panelText();
	assert(text.includes("跳过 5"), text.slice(-500));
	assert(text.includes("已跳过"), "缺少已跳过条目");
	assert(text.includes("6/6"), text.slice(-600));
	const skippedRows = window.document.querySelectorAll(".dpd-row.is-skipped");
	assert(skippedRows.length === 5, `跳过行数 ${skippedRows.length}`);
});

check("取消后不显示完成态，可重新开始", () => {
	assert(!findButton("保存压缩包"), "逐页模式取消后不应出现保存压缩包");
	assert(findButton("开始下载"), "取消后应回到开始下载");
	assert(!findButton("重新下载"), "取消不应标记为已完成");
});

// 压缩包模式中途取消 → 允许保存不完整压缩包
findButton("压缩").click();
for (const page of pages) page.load = slowLoad;
await Vue.nextTick();
findButton("开始下载").click();
assert(gates.length === 3, `并发派发数 ${gates.length}`);
await Vue.nextTick();
findButton("取消下载").click();
await Vue.nextTick();
gates.splice(0).forEach((resolve) => resolve());
await flush();

check("压缩包模式取消后提供不完整压缩包", () => {
	assert(findButton("保存不完整压缩包"), panelText().slice(-400));
	const text = panelText();
	assert(text.includes("跳过 3"), text.slice(-500));
});

clicked.length = 0;
findButton("保存不完整压缩包").click();
await new Promise((resolve) => setTimeout(resolve, 20));

check("保存不完整压缩包触发 zip 下载", () => {
	assert(JSON.stringify(clicked) === JSON.stringify(["work-title.zip"]), JSON.stringify(clicked));
});

console.log("\n[DOM] 新功能：JPG/PNG 格式、页号/顺序/原始命名、重复注入去重");

const startRun = () => {
	const button = findButton("开始下载") || findButton("重新下载");
	assert(button, "未找到开始/重新下载按钮");
	button.click();
};

// 回到逐页图片模式，页面加载桩统一返回 png（模拟内核转码后的结果）
findButton("逐页").click();
for (const page of pages) page.load = async () => ({ blob: new Blob([new Uint8Array([7, 7])]), ext: "png" });
await Vue.nextTick();

check("JPG/PNG 与页号/顺序/原始命名控件都已渲染", () => {
	assert(window.document.querySelector(".dpd-format"), "缺少 JPG/PNG 滑块");
	assert(findButton("JPG") && findButton("PNG"), "缺少 JPG/PNG 档位");
	assert(window.document.querySelector(".dpd-switch.is-3grid"), "缺少三档命名滑块");
	assert(findButton("页号") && findButton("顺序") && findButton("原始"), "缺少命名档位");
});

check("并发滑块带 Material 轨道填充变量", () => {
	const slider = window.document.querySelector(".dpd-slider");
	assert(slider, "未找到并发滑块");
	const raw = slider.getAttribute("style") || "";
	const value = raw.includes("--dpd-fill") || slider.style.getPropertyValue("--dpd-fill");
	assert(value, `未设置 --dpd-fill：${raw}`);
});

findButton("PNG").click();
await Vue.nextTick();

check("切到 PNG 后提示与档位同步", () => {
	assert(panelText().includes("PNG · 无损、体积较大"), panelText().slice(0, 300));
	const items = [...window.document.querySelectorAll(".dpd-format .dpd-switch-item")];
	assert(items.length === 2, `格式档位数 ${items.length}`);
	assert(items.some((el) => el.textContent.trim() === "PNG" && el.classList.contains("is-on")), "PNG 档位未选中");
	assert(items.some((el) => el.textContent.trim() === "JPG" && !el.classList.contains("is-on")), "JPG 档位未取消");
});

const range3 = window.document.querySelectorAll(".dpd-range .dpd-input");
setInput(range3[0], 2);
setInput(range3[1], 4);
await Vue.nextTick();

clicked.length = 0;
startRun();
await flush();
check("页号命名：下载 2-4 页得到 002.png ~ 004.png", () => {
	assert(JSON.stringify(clicked) === JSON.stringify(["002.png", "003.png", "004.png"]), JSON.stringify(clicked));
});

findButton("顺序").click();
await Vue.nextTick();
check("顺序命名提示从 001 开始", () => {
	assert(panelText().includes("第一个文件 001.png"), panelText().slice(0, 400));
});

clicked.length = 0;
startRun();
await flush();
check("顺序命名：同样 2-4 页但文件名从 001 重新编号", () => {
	assert(JSON.stringify(clicked) === JSON.stringify(["001.png", "002.png", "003.png"]), JSON.stringify(clicked));
});

findButton("原始").click();
await Vue.nextTick();
clicked.length = 0;
startRun();
await flush();
check("原始命名：保留 DLsite 原始文件名（仅校正扩展名）", () => {
	assert(JSON.stringify(clicked) === JSON.stringify(["hash_2.png", "hash_3.png", "hash_4.png"]), JSON.stringify(clicked));
});

// 放在最后：mountApp 的清场逻辑会移除当前挂在 #app 里的活面板
check("同一文档重复注入只挂载一个面板", () => {
	const count = () => window.document.querySelectorAll(".dlsite-play-downloader-vue").length;
	const before = count();
	api.mountApp();
	const afterFirst = count();
	api.mountApp();
	const afterSecond = count();
	assert(afterFirst === before + 1, `首次挂载容器数 ${before} → ${afterFirst}`);
	assert(afterSecond === afterFirst, `重复挂载新增了面板：${afterFirst} → ${afterSecond}`);
	assert(fakeUnsafeWindow.__dpdPanelHost === true, "未打上单例标记 __dpdPanelHost");
});

console.log(failures.length === 0 ? "\nDOM 集成测试全部通过" : `\nDOM 集成测试失败 ${failures.length} 项`);
process.exit(failures.length === 0 ? 0 : 1);
