function extractNumberOrKeepOriginal(str) {
	const match = str.match(/\d+/);
	return match ? match[0] : str;
}
/**
 * 用「第一张被抓到的页面文件 URL」当模板，套上 viewer-meta 里的每一页 src。
 * - DLsite Play：模板形如 …/0-0001.enc，命中编号规则时替换编号段；
 * - comipo：模板形如 …/0e25_kyoran_2048_09_001.enc?Policy=…&Signature=…，
 *   文件名与编号规则不匹配，此时只替换最后一段文件名，并保留后面的签名 query（所有页共用同一份签名）。
 */
function makeEncBinUrls(binUrlExample, viewerMeta) {
	const binUrls = [];
	const example = String(binUrlExample || "");
	const pages = Array.isArray(viewerMeta?.pages) ? viewerMeta.pages : [];
	const numberedPattern = /\/((i-\d+)|cover|\d+)\.enc\b/;
	const matched = numberedPattern.test(example);
	const tail = /^([\s\S]*\/)[^/?#]*(\?[\s\S]*)?$/.exec(example);
	pages.forEach((page, index) => {
		const file = String(page?.src || "").replace(/^\/+/, "");
		if (!file) return;
		let url;
		let name;
		if (matched) {
			url = example.replace(numberedPattern, `/${file}`);
			name = `${index}-${extractNumberOrKeepOriginal(file.replace(/\.enc$/, ""))}`;
		} else if (tail) {
			url = `${tail[1]}${file}${tail[2] || ""}`;
			name = file.replace(/\.enc$/, "");
		} else {
			url = `${file}`;
			name = file.replace(/\.enc$/, "");
		}
		binUrls.push({
			url,
			name
		});
	});
	return binUrls;
}
