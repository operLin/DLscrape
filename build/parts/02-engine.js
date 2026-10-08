/**
 * ===================================================================
 *  下载内核（改进版）
 *  统一「逐页抓取 → 命名 → 输出」，支持：
 *    - 页码范围（由 UI 过滤后传入）
 *    - 图片直出（File System Access 目录 / 逐个下载）或 ZIP 打包
 *    - 三种命名：页号补零 / 顺序编号 / 保留原始名（页号与顺序默认 3 位）
 *    - JPG / PNG 目标格式统一交给各页 loader 处理
 *    - 实时进度事件回调
 * ===================================================================
 */
function padPageNumber(pageNo, digits) {
	const width = Math.max(1, Math.min(8, Number(digits) || 3));
	return String(pageNo).padStart(width, "0");
}
function replaceExtension(filename, ext) {
	const slashIndex = filename.lastIndexOf("/");
	const dotIndex = filename.lastIndexOf(".");
	if (dotIndex > slashIndex) return `${filename.slice(0, dotIndex)}${ext}`;
	return `${filename}${ext}`;
}
function ensureExtension(filename, ext) {
	if (!ext) return filename;
	const name = String(filename);
	const slashIndex = name.lastIndexOf("/");
	const dotIndex = name.lastIndexOf(".");
	if (dotIndex > slashIndex) return replaceExtension(name, `.${ext}`);
	return `${name}.${ext}`;
}
function addUniqueZipFile(zipFiles, filename, data) {
	let name = filename;
	let count = 2;
	while (Object.prototype.hasOwnProperty.call(zipFiles, name)) {
		name = appendSuffix(filename, `_${count}`);
		count++;
	}
	zipFiles[name] = data;
}
function appendSuffix(filename, suffix) {
	const slashIndex = filename.lastIndexOf("/");
	const dotIndex = filename.lastIndexOf(".");
	if (dotIndex > slashIndex) return `${filename.slice(0, dotIndex)}${suffix}${filename.slice(dotIndex)}`;
	return `${filename}${suffix}`;
}
function loadImage(blob) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(blob);
		img.onload = () => {
			URL.revokeObjectURL(objectUrl);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(/* @__PURE__ */ new Error("failed to decode image"));
		};
		img.src = objectUrl;
	});
}
function canvasToBlob(canvas, type = "image/png", quality) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(/* @__PURE__ */ new Error("failed to encode image"));
		}, type, quality);
	});
}
/**
 * 把任意图片重新编码为目标格式（jpg / png）。
 * format 解析规则：options.format 优先，"png" 之外的取值一律按 jpg 处理；
 * 未提供 format 时兼容旧的 options.asJpeg === false 表示 PNG。
 */
function resolveImageFormat(options = {}) {
	if (options.format === "png" || options.format === "jpg") return options.format;
	return options.asJpeg === false ? "png" : "jpg";
}
async function imageBlobToFormat(blob, format = "jpg", quality = 0.92) {
	let source = null;
	if (typeof createImageBitmap === "function") {
		try {
			source = await createImageBitmap(blob);
		} catch (err) {
			source = null;
		}
	}
	if (!source) source = await loadImage(blob);
	const canvas = document.createElement("canvas");
	canvas.width = source.width;
	canvas.height = source.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("failed to create canvas context");
	ctx.drawImage(source, 0, 0);
	if (typeof source.close === "function") source.close();
	return format === "png" ? canvasToBlob(canvas, "image/png") : canvasToBlob(canvas, "image/jpeg", quality);
}
function imageBlobToJpeg(blob, quality = 0.92) {
	return imageBlobToFormat(blob, "jpg", quality);
}
/**
 * 抓取并还原单张拼图页。
 * options.format === "png" 时输出 PNG，否则输出 JPEG（默认）。
 */
async function restorePuzzlePage(downloadPrefix, { optimized }, options = {}) {
	const response = await pageFetch(`${downloadPrefix}optimized/${optimized.name}`, {
		method: "GET",
		credentials: "include",
		referrer: "https://play.dlsite.com/",
		headers: { Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" }
	});
	if (!response.ok) throw new Error(`image download failed: ${response.status} ${response.statusText}`);
	const img = await loadImage(await response.blob());
	const canvas = document.createElement("canvas");
	canvas.width = optimized.width;
	canvas.height = optimized.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("failed to create canvas context");
	const { sourceCropSize, cropCount, coordinates } = getDecryptedImageData(optimized);
	const overflow = {
		w: Math.max(0, img.width - optimized.width),
		h: Math.max(0, img.height - optimized.height)
	};
	for (const coordinate of coordinates) {
		const width = coordinate.dx + sourceCropSize === sourceCropSize * cropCount.w ? sourceCropSize - overflow.w : sourceCropSize;
		const height = coordinate.dy + sourceCropSize === sourceCropSize * cropCount.h ? sourceCropSize - overflow.h : sourceCropSize;
		if (width <= 0 || height <= 0) continue;
		ctx.drawImage(img, coordinate.sx, coordinate.sy, width, height, coordinate.dx, coordinate.dy, width, height);
	}
	const format = resolveImageFormat(options);
	const blob = format === "png" ? await canvasToBlob(canvas, "image/png") : await canvasToBlob(canvas, "image/jpeg", options.quality ?? 0.92);
	return {
		blob,
		ext: format
	};
}
async function runWithConcurrency(items, maxConcurrent, runTask, isCancelled) {
	const executing = /* @__PURE__ */ new Set();
	const results = [];
	for (let index = 0; index < items.length; index++) {
		if (typeof isCancelled === "function" && isCancelled()) break;
		if (executing.size >= maxConcurrent) await Promise.race(executing);
		const taskPromise = runTask(items[index], index).finally(() => {
			executing.delete(taskPromise);
		});
		executing.add(taskPromise);
		results.push(taskPromise);
	}
	return Promise.allSettled(results);
}
function saveBlobViaAnchor(blob, filename) {
	const blobUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = blobUrl;
	anchor.download = filename;
	anchor.rel = "noopener";
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(blobUrl), 4e3);
}
async function saveBlobToTarget(blob, filename, directory) {
	const segments = String(filename).split("/").filter(Boolean);
	const leaf = segments.pop() || "download";
	if (directory && typeof directory.getFileHandle === "function") {
		let dir = directory;
		let nested = true;
		for (const segment of segments) {
			if (typeof dir.getDirectoryHandle !== "function") {
				nested = false;
				break;
			}
			dir = await dir.getDirectoryHandle(segment, { create: true });
		}
		if (nested) {
			const handle = await dir.getFileHandle(leaf, { create: true });
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return;
		}
	}
	saveBlobViaAnchor(blob, leaf);
}
function buildZip(files) {
	return new Promise((resolve, reject) => {
		zip(files, (err, zipped) => {
			if (err) reject(err);
			else resolve(zipped);
		});
	});
}
/**
 * 统一任务执行器。
 * job: { pages: [{ pageNo, originalName, load(options) -> {blob, ext} }], zipFileName }
 * options: { mode: "image"|"zip", naming: "page"|"seq"|"original", digits, format: "jpg"|"png",
 *            concurrency, quality, from, to,
 *            directory?: FileSystemDirectoryHandle, isCancelled?: () => boolean }
 *   - naming 未提供时兼容旧参数 rename（true → page，false → original）
 * handlers: { onEvent(event) } —— event.type ∈ start|success|error|skipped|zip-start|zip-done|zip-skipped
 */
async function executeDownloadJob(job, options, handlers) {
	const pages = Array.isArray(job && job.pages) ? job.pages : [];
	const mode = options.mode === "image" ? "image" : "zip";
	const naming = options.naming === "page" || options.naming === "seq" || options.naming === "original" ? options.naming : options.rename === false ? "original" : "page";
	const format = resolveImageFormat(options);
	const from = Number(options.from);
	const to = Number(options.to);
	const selected = pages.filter((page) => page.pageNo >= from && page.pageNo <= to);
	const total = selected.length;
	// 用无原型对象，否则名为 __proto__ / constructor 的条目会与 Object 原型属性冲突。
	const zipFiles = /* @__PURE__ */ Object.create(null);
	let successCount = 0;
	let failCount = 0;
	let skippedCount = 0;
	const isCancelled = typeof options.isCancelled === "function" ? options.isCancelled : () => false;
	const emit = (event) => {
		try {
			if (handlers && typeof handlers.onEvent === "function") handlers.onEvent(event);
		} catch (err) {
			origConsole.error("[download] progress callback failed", err);
		}
	};
	/**
	 * 命名规则：
	 *   page     —— 原始页号补零（只下 10–20 页 → 010–020）
	 *   seq      —— 按选中顺序从 1 开始编号，与原始页号无关
	 *   original —— 保留原始名称（含 `目录/文件` 结构），只校正扩展名
	 */
	const entryNameFor = (page, index, ext) => {
		if (naming === "original") return ensureExtension(page.originalName, ext);
		const number = naming === "seq" ? index + 1 : page.pageNo;
		return `${padPageNumber(number, options.digits)}.${ext}`;
	};
	const runTask = async (page, index) => {
		if (isCancelled()) {
			skippedCount++;
			emit({ type: "skipped", pageNo: page.pageNo, total });
			return;
		}
		emit({ type: "start", pageNo: page.pageNo, total });
		try {
			const loaded = await page.load({ format, quality: options.quality });
			const ext = loaded.ext || "bin";
			let entryName = normalizeZipPath(entryNameFor(page, index, ext));
			if (mode === "image") await saveBlobToTarget(loaded.blob, entryName, options.directory);
			else addUniqueZipFile(zipFiles, entryName, new Uint8Array(await loaded.blob.arrayBuffer()));
			successCount++;
			emit({ type: "success", pageNo: page.pageNo, total, name: entryName, bytes: loaded.blob.size });
		} catch (err) {
			failCount++;
			emit({ type: "error", pageNo: page.pageNo, total, message: err && err.message ? err.message : String(err) });
		}
	};
	/**
	 * 注意：这里**不**把 isCancelled 传给 runWithConcurrency。
	 * 取消时仍要把每个选中页面派发完，让它们各自走 runTask 的取消分支并发出 skipped，
	 * 否则 UI 永远无法把「跳过」计入总数（进度条停在半途却显示已完成）。
	 * runTask 的取消分支不做任何网络请求，因此派发剩余页面是零成本的。
	 * 逐页图片模式若没有目录写入句柄，只能靠 <a download> 逐个触发；浏览器会拦截
	 * 同一时刻的批量下载，所以强制单线程串行。
	 */
	const requested = Math.max(1, Number(options.concurrency) || 3);
	const concurrency = mode === "image" && !options.directory ? 1 : requested;
	await runWithConcurrency(selected, concurrency, runTask);
	const cancelled = isCancelled();
	const result = {
		mode,
		total,
		successCount,
		failCount,
		skippedCount,
		serial: concurrency !== requested,
		cancelled,
		blobUrl: null,
		save: null
	};
	if (mode === "zip") {
		if (Object.keys(zipFiles).length === 0) {
			if (cancelled) {
				emit({ type: "zip-skipped", total });
				return result;
			}
			throw new Error("全部页面下载失败，无法生成压缩包");
		}
		emit({ type: "zip-start", total });
		const zipped = await buildZip(zipFiles);
		const blob = new Blob([zipped], { type: "application/zip" });
		const blobUrl = URL.createObjectURL(blob);
		result.blobUrl = blobUrl;
		result.bytes = blob.size;
		result.save = () => {
			const anchor = document.createElement("a");
			anchor.href = blobUrl;
			anchor.download = `${job.zipFileName || "download"}.zip`;
			anchor.style.display = "none";
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			setTimeout(() => URL.revokeObjectURL(blobUrl), 4e3);
		};
		emit({ type: "zip-done", total, bytes: blob.size });
	}
	return result;
}
