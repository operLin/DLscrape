var COMIPO_ORIGIN = "https://play.comipo.app";
var COMIPO_CONTENT_ORIGIN = "https://dl.comipo.app";
/**
 * 判断当前页面属于哪个平台。
 * - comipo Play 是 DLsite Play 的换皮版（play.comipo.app / dl.comipo.app），
 *   路由为 /viewer/sample/:id、/viewer/free/:id，品牌色是绿色 (#43c453)。
 * - 其余按 DLsite Play 处理。
 * @param url
 * @returns {"comipo"|"dlsite"}
 */
function detectPlayPlatform(url) {
	const href = typeof url === "string" && url.length > 0 ? url : String(_unsafeWindow.location.href);
	try {
		const parsed = new URL(href, _unsafeWindow.location.href);
		const host = parsed.hostname.toLowerCase();
		if (/(^|\.)comipo\.app$/.test(host)) return "comipo";
		if (/(^|\.)dlsite\.com$/.test(host)) return "dlsite";
		if (/^\/viewer\/(sample|free)\//.test(parsed.pathname)) return "comipo";
	} catch (err) {
		origConsole.debug("[platform] URL 解析失败，按字符串判断", err);
	}
	if (/(^|\/\/|\.)comipo\.app\//i.test(href) || /\/viewer\/(sample|free)\//.test(href)) return "comipo";
	return "dlsite";
}
/**
 * 从作品阅读页 URL 中提取作品号。
 * - DLsite Play：https://play.dlsite.com/work/BJ366185/viewer
 * - DLsite Play 免费试读：https://play.dlsite.com/viewer/free/BJ366185
 * - comipo Play：https://play.comipo.app/viewer/sample/BJ03045050
 *   https://play.comipo.app/viewer/free/BJ03045050
 * @param url
 */
function extractDlsiteId(url) {
	const text = typeof url === "string" ? url : String(url || "");
	return text.match(/work\/([A-Z\d]+)\//)?.[1] ?? text.match(/\/viewer\/(?:free|sample)\/([A-Z\d]+)/)?.[1] ?? text.match(/[?&]workno=([A-Z\d]+)/i)?.[1] ?? null;
}
