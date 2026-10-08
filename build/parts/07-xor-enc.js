/** 等待页面自身请求（页面文件 / viewer-meta / 作品元数据）的整体超时。 */
var DPD_DETECT_TIMEOUT_MS = 20000;
var hookXorEnc = () => {
	return new Promise((resolve, reject) => {
		let settled = false;
		const finish = (fn, value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			fn(value);
		};
		const timer = setTimeout(() => {
			finish(reject, new Error("等待页面数据超时：没有捕获到页面文件请求，该作品可能使用了尚未支持的加密方式"));
		}, DPD_DETECT_TIMEOUT_MS);
		Promise.all([
			hookXorKey(),
			hookEncBinUrl(),
			hookViewerMeta(),
			hookApiV2Work()
		]).then(([{ key: encDetectorKey }, { url: binUrl }, { json: viewerMeta }, { json: apiV2WorkMeta }]) => {
			origConsole.log("viewerMeta ", viewerMeta);
			origConsole.log("xor key ", encDetectorKey);
			origConsole.log("binUrl  ", binUrl);
			if (!binUrl) {
				finish(reject, new Error("没有捕获到页面文件请求，无法确定下载地址"));
				return;
			}
			const encBinUrls = makeEncBinUrls(binUrl, viewerMeta);
			origConsole.log("encBinUrls  ", encBinUrls.length);
			const saveName = makeArtworkSaveName(viewerMeta, apiV2WorkMeta);
			origConsole.log("makeArtworkSaveName ", saveName);
			finish(resolve, {
				method: "xor",
				data: {
					zipFileName: saveName,
					pages: encBinUrls.map((item, index) => ({
						pageNo: index + 1,
						// makeEncBinUrls 用的是 0 基下标（0-0001.jpg）。重命名关闭时直接暴露给用户会很怪，
						// 这里按 1 基页号改写前缀，与 pageNo 保持一致。
						originalName: /^\d+-/.test(item.name) ? `${index + 1}-${item.name.replace(/^\d+-/, "")}` : item.name,
						load: (loadOptions) => fetchXorPage(item, encDetectorKey, loadOptions)
					}))
				}
			});
		}).catch((err) => finish(reject, err));
	});
};
function makeArtworkSaveName(viewerMeta, apiV2WorkMeta) {
	origConsole.log("apiV2WorkMeta ", apiV2WorkMeta);
	const metaData = viewerMeta?.meta_data || {};
	let creator = void 0;
	if (Array.isArray(metaData.creator) && metaData.creator.length > 0) creator = metaData.creator.join(" ");
	else if (typeof metaData.creator === "string" && metaData.creator.length > 0) creator = metaData.creator;
	let apiV2_maker = "";
	if (apiV2WorkMeta?.maker?.name?.ja_JP) apiV2_maker = apiV2WorkMeta.maker?.name?.ja_JP;
	let apiV2_name = "";
	if (apiV2WorkMeta?.name?.ja_JP) apiV2_name = apiV2WorkMeta?.name?.ja_JP;
	let publisher = "";
	if (metaData.publisher) publisher = metaData.publisher;
	let title = void 0;
	if (metaData.title) title = metaData.title;
	let no = "";
	const NO = extractDlsiteId(window.location.href);
	if (NO) no = NO;
	return `[${no}] (${publisher})(${creator ?? apiV2_maker}) ${title ?? apiV2_name}`;
}
