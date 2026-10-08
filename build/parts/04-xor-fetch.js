function normalizeDetectedExt(ext) {
	if (!ext) return null;
	const lower = String(ext).toLowerCase();
	return lower === "jpeg" ? "jpg" : lower;
}
/**
 * 下载单个 XOR 加密页并解密，返回 { blob, ext, mime }。
 * options.format 为目标格式（"jpg" 默认 / "png"）：原文件已是目标格式时直接复用原始字节，
 * 不做任何重编码；否则用 canvas 转码为 jpg 或 png。
 */
async function fetchXorPage({ url }, keyHex, options = {}) {
	const arrayBuffer = await downloadArrayBuffer(url);
	const decrypted = xorDecrypt(new Uint8Array(arrayBuffer), keyHex);
	const type = await fileTypeFromBuffer(decrypted);
	const mime = (type && type.mime) || "application/octet-stream";
	const ext = normalizeDetectedExt(type && type.ext);
	let blob = new Blob([decrypted], { type: mime });
	const format = resolveImageFormat(options);
	if (ext !== format && mime.indexOf("image/") === 0) {
		try {
			blob = await imageBlobToFormat(blob, format, options.quality ?? 0.92);
			return {
				blob,
				ext: format,
				mime: format === "png" ? "image/png" : "image/jpeg",
				converted: true
			};
		} catch (err) {
			origConsole.warn(`[xor] ${format.toUpperCase()} conversion failed, keeping original format`, err);
		}
	}
	return {
		blob,
		ext: ext || "bin",
		mime
	};
}
