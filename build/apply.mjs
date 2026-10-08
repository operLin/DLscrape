// 把 build/parts/*.js 按行区间拼接到原始 bundle 上，生成改进版 userscript。
// 用法： node build/apply.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const buildDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(buildDir, "..");
const sourcePath = path.join(root, "upstream", "dlsite-play-downloader-v2.2.1.user.js");
// 产物文件名同时用于油猴头的自更新地址
const assetName = "DLscrape.user.js";
const outputPath = path.join(root, assetName);

const part = (name) => {
	const text = readFileSync(path.join(buildDir, "parts", name), "utf8").replace(/\r\n/g, "\n");
	return text.replace(/\n$/, "");
};

// 行号基于上游产物 upstream/dlsite-play-downloader-v2.2.1.user.js（1 起，含端点）。
const replacements = [
	{ name: "work-id", start: 3013, end: 3015, text: part("00-work-id.js") },
	{ name: "puzzle-page-list", start: 3051, end: 3058, text: part("01-puzzle-resolve.js") },
	{ name: "content-api", start: 3071, end: 3112, text: part("06-content-api.js") },
	{ name: "download-engine", start: 3195, end: 3336, text: part("02-engine.js") },
	// 7956-7999 覆盖了原区间 7971-7979（原 03-xor-resolve.js 的内容已并入 07-xor-enc.js）
	{ name: "xor-enc", start: 7956, end: 7999, text: part("07-xor-enc.js") },
	{ name: "enc-bin-urls", start: 8000, end: 8024, text: part("08-enc-bin-urls.js") },
	{ name: "xor-hooks", start: 8025, end: 8084, text: part("09-xor-hooks.js") },
	{ name: "xor-page-fetch", start: 8115, end: 8194, text: part("04-xor-fetch.js") },
	{ name: "ui-rewrite", start: 8253, end: 8446, text: part("05-app.js") }
];

const raw = readFileSync(sourcePath, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
let lines = raw.replace(/\r\n/g, "\n").split("\n");

const expectedLines = 8449; // 8448 行 + 结尾换行产生的空串
if (lines.length !== expectedLines) {
	throw new Error(`源文件行数不符：期望 ${expectedLines}，实际 ${lines.length}`);
}

// 端点自检，避免行号漂移导致误替换
const expectStart = (line, needle) => {
	if (!lines[line - 1].includes(needle)) {
		throw new Error(`第 ${line} 行起点校验失败，期望包含 ${JSON.stringify(needle)}，实际为 ${JSON.stringify(lines[line - 1].slice(0, 80))}`);
	}
};
expectStart(3013, "function extractDlsiteId(url) {");
expectStart(3051, "resolve({");
expectStart(3071, "async function getDownloadCredential(workNo) {");
expectStart(3195, "async function downloadPuzzleImagesToZip");
expectStart(7956, "var hookXorEnc = () => {");
expectStart(8000, "function extractNumberOrKeepOriginal(str) {");
expectStart(8025, "/**");
expectStart(8115, "var downloadAndDecryptToZip");
expectStart(8253, "var _hoisted_1");
expectStart(8446, "}");

for (const item of [...replacements].sort((a, b) => b.start - a.start)) {
	lines.splice(item.start - 1, item.end - item.start + 1, ...item.text.split("\n"));
}

let text = lines.join("\n");

// 1) 给 SystemJS 的 vue 命名空间补上 h（渲染函数用）
const beforeImport = "var ref,createApp,warn,";
const afterImport = "var ref,createApp,h,warn,";
if (text.split(beforeImport).length !== 2) throw new Error("未找到唯一的 vue 解构声明");
text = text.replace(beforeImport, afterImport);

const beforeSetter = "ref=module.ref;createApp=module.createApp;";
const afterSetter = "ref=module.ref;createApp=module.createApp;h=module.h;";
if (text.split(beforeSetter).length !== 2) throw new Error("未找到唯一的 vue setter 赋值");
text = text.replace(beforeSetter, afterSetter);

// —— fork 元数据：发布到自己的仓库时只需改这里 ——
// 只重写输出文件的油猴头，上游产物始终保持字节不变（行号锚点依赖它）。
const FORK = {
	name: "DLscrape",
	author: "cpufan, operLin",
	version: "2.4.0",
	repo: "https://github.com/operLin/DLscrape",
	description: "在浏览器完成DLsite Play漫画的下载、拼图或解密和保存（改进版：Material Design、页码范围、逐页、JPG/PNG、三种命名、支持 comipo Play）"
};

const headerRewrites = [
	["// @name         DLsite Play Downloader", `// @name         ${FORK.name}`],
	["// @namespace    https://github.com/cpuopt/DLsite-Play-Downloader", `// @namespace    ${FORK.repo}`],
	["// @version      2.2.1", `// @version      ${FORK.version}`],
	["// @author       cpufan", `// @author       ${FORK.author}`],
	["// @description  在浏览器完成DLsite Play漫画的下载、拼图或解密和保存", `// @description  ${FORK.description}`],
	["// @supportURL   https://github.com/cpuopt/DLsite-Play-Downloader/issues", `// @supportURL   ${FORK.repo}/issues`],
	// 原作者的 GreasyFork 更新频道：必须换掉，否则装上的改进版会被自动更新覆盖回去
	["// @downloadURL https://update.greasyfork.org/scripts/480281/DLsite%20Play%20Downloader.user.js", `// @downloadURL ${FORK.repo}/raw/main/${assetName}`],
	["// @updateURL https://update.greasyfork.org/scripts/480281/DLsite%20Play%20Downloader.meta.js", `// @updateURL ${FORK.repo}/raw/main/${assetName}`]
];

const linesBeforeHeader = text.split("\n").length;
for (const [from, to] of headerRewrites) {
	if (to.includes("\n")) throw new Error("头部替换必须保持单行，否则会移动后续行号锚点");
	if (text.split(from).length !== 2) throw new Error(`头部元数据未找到唯一匹配：${JSON.stringify(from)}`);
	text = text.replace(from, to);
}
if (text.split("\n").length !== linesBeforeHeader) throw new Error("头部替换改变了行数，行号锚点已失效");
if (text.includes("greasyfork.org")) throw new Error("头部仍残留上游更新频道 greasyfork.org");

writeFileSync(outputPath, text, "utf8");

const outLines = text.split("\n").length - 1;
const size = statSync(outputPath).size;
console.log(`源文件: ${sourcePath}`);
console.log(`输出文件: ${outputPath}`);
console.log(`替换区间: ${replacements.map((r) => `${r.name}(${r.start}-${r.end})`).join(", ")}`);
console.log(`头部元数据: ${FORK.name} v${FORK.version} → ${FORK.repo}`);
console.log(`输出行数: ${outLines}  字节: ${size}  EOL: ${JSON.stringify(eol)}`);
