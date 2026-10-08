async function getDownloadCredential(workNo) {
	const platform = detectPlayPlatform(_unsafeWindow.location.href);
	const url = platform === "comipo" ? new URL(`${COMIPO_CONTENT_ORIGIN}/api/comipo/v3/download/sign/cookie`) : new URL("https://play.dl.dlsite.com/api/download/sign/cookie");
	url.searchParams.set("workno", workNo);
	const response = await pageFetch(url.href, {
		method: "GET",
		credentials: "include",
		referrer: platform === "comipo" ? `${COMIPO_ORIGIN}/` : "https://play.dlsite.com/",
		headers: { Accept: "*/*" }
	});
	if (!response.ok) throw new Error(`download credential failed: ${response.status} ${response.statusText}`);
	return response.json();
}
async function getZipTree(downloadPrefix) {
	const platform = detectPlayPlatform(_unsafeWindow.location.href);
	const response = await pageFetch(`${downloadPrefix}ziptree.json`, {
		method: "GET",
		credentials: "include",
		referrer: platform === "comipo" ? `${COMIPO_ORIGIN}/` : "https://play.dlsite.com/",
		headers: { Accept: "application/json,*/*" }
	});
	if (!response.ok) throw new Error(`ziptree download failed: ${response.status} ${response.statusText}`);
	return response.json();
}
async function getWorkMeta(workNo) {
	const platform = detectPlayPlatform(_unsafeWindow.location.href);
	const targets = platform === "comipo" ? [`${COMIPO_ORIGIN}/api/comipo/viewer/work/${workNo}`, `${COMIPO_ORIGIN}/api/comipo/v3/work/${workNo}`] : Array.from(/* @__PURE__ */ new Set([`${_unsafeWindow.location.origin}/api/work/${workNo}`, `https://play.dlsite.com/api/work/${workNo}`]));
	for (const target of targets) {
		const response = await pageFetch(target, {
			method: "GET",
			credentials: "include",
			referrer: `${target.split("/api/")[0]}/`,
			headers: { Accept: "application/json,*/*" }
		}).catch(() => null);
		if (response?.ok) return response.json();
	}
	return null;
}
function pageFetch(...args) {
	return (_unsafeWindow.fetch || fetch).apply(_unsafeWindow, args);
}
function normalizeDownloadPrefix(url) {
	if (typeof url !== "string" || url.length === 0) return null;
	return url.endsWith("/") ? url : `${url}/`;
}
/**
 * comipo Play（DLsite Play 换皮版）内容解析。
 *
 * comipo 的阅读页与 DLsite Play 一样是「viewer-meta.json 描述页面 + 逐页 .enc 文件 + XOR 密钥」：
 *   POST /api/comipo/sample/viewer/token/<workno>  -> { prefix, parameters }（试读，公开）
 *   POST /api/comipo/free/viewer/token/<workno>    -> { prefix, parameters, key }（免费作品）
 *   GET  /api/comipo/free/token/<workno>           -> 下载用的前缀（注意：它下面没有 viewer-meta.json）
 *   GET  <prefix>/viewer-meta.json?<parameters>    -> { meta_data, pages: [{ src, key, page_number }] }
 *   GET  <prefix>/decryption.key?<parameters>      -> 64 位 hex 文本，即 XOR 密钥
 *   GET  <prefix>/<pages[].src>?<parameters>       -> XOR 加密的页面文件（WebP/JPEG/PNG）
 * 这些接口都不需要 hook 页面请求就能拿到，所以 comipo 上优先直接解析；失败时再退回等页面自身请求。
 * @returns {Promise<null|{method: string, data: object}>}
 */
async function resolveComipoPages(workNo) {
	if (!workNo || detectPlayPlatform(_unsafeWindow.location.href) !== "comipo") return null;
	const pathname = String(_unsafeWindow.location.pathname || "");
	const isFreeViewer = /\/viewer\/free\//.test(pathname);
	// 依次尝试几种 token 接口，只有「拿到的前缀下真能读到 viewer-meta.json」的那个才算数：
	// GET 版 token 返回的是下载前缀，viewer 前缀只由 POST 版给出，所以不能只看接口是否 200。
	const candidates = isFreeViewer ? [() => postComipoFreeViewerToken(workNo), () => getComipoSampleToken(workNo), () => getComipoFreeToken(workNo)] : [() => getComipoSampleToken(workNo), () => postComipoFreeViewerToken(workNo)];
	let content = null;
	for (const getToken of candidates) {
		let token = null;
		try {
			token = await getToken();
		} catch (err) {
			origConsole.debug("[comipo] 该 token 接口不可用", err);
			continue;
		}
		const prefix = typeof token?.prefix === "string" ? token.prefix.replace(/\/+$/, "") : "";
		if (!prefix) continue;
		const viewerMeta = await loadComipoViewerMeta(prefix, token.parameters);
		if (!viewerMeta) continue;
		content = {
			prefix,
			search: buildContentSearch(token.parameters),
			viewerMeta
		};
		break;
	}
	if (!content) return null;
	const { prefix, search, viewerMeta } = content;
	const contentUrl = (file) => `${prefix}/${String(file).replace(/^\/+/, "")}${search}`;
	let key = "";
	try {
		const keyFile = viewerMeta.pages.find((page) => page && typeof page.key === "string" && page.key.length > 0)?.key || "decryption.key";
		const response = await pageFetch(contentUrl(keyFile), {
			method: "GET",
			credentials: "include",
			referrer: `${COMIPO_ORIGIN}/`,
			headers: { Accept: "*/*" }
		});
		if (response.ok) key = (await response.text()).trim();
	} catch (err) {
		origConsole.warn("[comipo] XOR 密钥读取失败，将按未加密处理", err);
	}
	const workMeta = await getWorkMeta(workNo).catch(() => null);
	const pages = viewerMeta.pages.filter((page) => page && typeof page.src === "string" && page.src.length > 0).map((page, index) => ({
		pageNo: index + 1,
		originalName: String(page.src),
		load: (loadOptions) => fetchXorPage({ url: contentUrl(page.src) }, key, loadOptions)
	}));
	if (pages.length === 0) return null;
	// 免费作品的 token 里带回的是 RSA 处理过的密钥，我们未必解得开。先试下第一页：
	// 解出来不是图片就说明这条路走不通，交回给「等页面自身请求」的 hook 链路。
	if (isFreeViewer) {
		const probe = await pages[0].load({ format: "jpg", quality: 0.8 }).catch(() => null);
		if (!probe || String(probe.mime || "").indexOf("image/") !== 0) {
			origConsole.warn("[comipo] 免费作品的内容前缀能读到，但密钥对不上，改为等待页面自身的请求");
			return null;
		}
	}
	origConsole.log(`[comipo] 直接解析成功：${pages.length} 页${key ? "（含 XOR 密钥）" : "（无密钥）"}`);
	return {
		method: "xor",
		data: {
			zipFileName: makeComipoSaveName(workNo, viewerMeta, workMeta),
			key,
			pages
		}
	};
}
/** 读取 comipo 内容前缀下的 viewer-meta.json，拿不到（或页数为空）返回 null。 */
async function loadComipoViewerMeta(prefix, parameters) {
	const url = `${prefix}/viewer-meta.json${buildContentSearch(parameters)}`;
	try {
		const response = await pageFetch(url, {
			method: "GET",
			credentials: "include",
			referrer: `${COMIPO_ORIGIN}/`,
			headers: { Accept: "application/json,*/*" }
		});
		if (!response.ok) {
			origConsole.debug(`[comipo] viewer-meta.json ${response.status}：${url}`);
			return null;
		}
		const json = await response.json();
		return json && Array.isArray(json.pages) && json.pages.length > 0 ? json : null;
	} catch (err) {
		origConsole.debug("[comipo] viewer-meta.json 请求异常", err);
		return null;
	}
}
/** comipo 内容 token：试读作品走 POST sample/viewer/token。 */
async function getComipoSampleToken(workNo) {
	const response = await pageFetch(`${COMIPO_ORIGIN}/api/comipo/sample/viewer/token/${encodeURIComponent(workNo)}`, {
		method: "POST",
		credentials: "include",
		referrer: `${COMIPO_ORIGIN}/`,
		headers: { Accept: "application/json,*/*", "Content-Type": "application/json" },
		body: "{}"
	});
	if (!response.ok) throw new Error(`comipo sample token failed: ${response.status} ${response.statusText}`);
	return response.json();
}
/** comipo 内容 token：免费作品的阅读页走 POST free/viewer/token（body 情形未知，失败就换下一个候选）。 */
async function postComipoFreeViewerToken(workNo) {
	const response = await pageFetch(`${COMIPO_ORIGIN}/api/comipo/free/viewer/token/${encodeURIComponent(workNo)}`, {
		method: "POST",
		credentials: "include",
		referrer: `${COMIPO_ORIGIN}/`,
		headers: { Accept: "application/json,*/*", "Content-Type": "application/json" },
		body: JSON.stringify({
			play_type: 2,
			revision: 0,
			public_key: ""
		})
	});
	if (!response.ok) throw new Error(`comipo free viewer token failed: ${response.status} ${response.statusText}`);
	return response.json();
}
/** comipo 内容 token：免费作品的下载前缀（GET 版）。 */
async function getComipoFreeToken(workNo) {
	const response = await pageFetch(`${COMIPO_ORIGIN}/api/comipo/free/token/${encodeURIComponent(workNo)}`, {
		method: "GET",
		credentials: "include",
		referrer: `${COMIPO_ORIGIN}/`,
		headers: { Accept: "application/json,*/*" }
	});
	if (!response.ok) throw new Error(`comipo free token failed: ${response.status} ${response.statusText}`);
	return response.json();
}
function buildContentSearch(parameters) {
	const search = new URLSearchParams();
	Object.entries(parameters || {}).forEach(([name, value]) => {
		if (value !== void 0 && value !== null) search.set(name, String(value));
	});
	const text = search.toString();
	return text ? `?${text}` : "";
}
function makeComipoSaveName(workNo, viewerMeta, workMeta) {
	const meta = viewerMeta?.meta_data || {};
	const title = meta.title || pickLocalized(workMeta?.name) || workNo;
	const creator = Array.isArray(meta.creator) ? meta.creator.filter(Boolean).join(" ") : pickLocalized(meta.creator);
	const maker = creator || pickLocalized(workMeta?.maker?.name);
	return sanitizeFileName(maker ? `[${workNo}] (${maker}) ${title}` : `[${workNo}] ${title}`);
}
