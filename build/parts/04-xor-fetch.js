function normalizeDetectedExt(ext) {
	if (!ext) return null;
	const lower = String(ext).toLowerCase();
	return lower === "jpeg" ? "jpg" : lower;
}
/** 判断一段字节是否其实是一串 ASCII hex 文本（comipo 的 decryption.key 就是这种内容）。 */
function looksLikeHexText(bytes) {
	if (bytes.length < 16 || bytes.length % 2 !== 0) return false;
	for (let i = 0; i < bytes.length; i++) {
		const value = bytes[i];
		const isDigit = value >= 48 && value <= 57;
		const isLower = value >= 97 && value <= 102;
		const isUpper = value >= 65 && value <= 70;
		if (!isDigit && !isLower && !isUpper) return false;
	}
	return true;
}
function hexTextToBytes(text) {
	const matched = text.match(/.{1,2}/g);
	return matched ? Uint8Array.from(matched.map((part) => parseInt(part, 16))) : null;
}
/**
 * 把各种形态的 XOR 密钥统一成字节数组。
 * 支持 hex 文本（原版 DLsite Play 的约定）、普通文本、Uint8Array / ArrayBuffer / 数字数组，
 * 以及「内容是 ASCII hex 文本的字节数组」（comipo 的 decryption.key）。
 * @returns {Uint8Array|null}
 */
function xorKeyToBytes(key) {
	if (key === null || key === void 0 || key === "") return null;
	if (typeof key === "string") {
		const text = key.trim();
		if (text.length >= 2 && text.length % 2 === 0 && /^[0-9a-f]+$/i.test(text)) return hexTextToBytes(text);
		return new TextEncoder().encode(text);
	}
	if (key instanceof Uint8Array) return looksLikeHexText(key) ? hexTextToBytes(new TextDecoder("utf-8").decode(key)) : key;
	if (key instanceof ArrayBuffer) {
		const bytes = new Uint8Array(key);
		return looksLikeHexText(bytes) ? hexTextToBytes(new TextDecoder("utf-8").decode(bytes)) : bytes;
	}
	if (Array.isArray(key)) return xorKeyToBytes(Uint8Array.from(key.map(Number)));
	if (typeof key === "object" && key.buffer instanceof ArrayBuffer) return xorKeyToBytes(new Uint8Array(key.buffer, key.byteOffset || 0, key.byteLength));
	origConsole.warn("[xor] 无法识别的密钥类型，按未加密处理", key);
	return null;
}
function xorWithKeyBytes(data, keyBytes) {
	const result = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) result[i] = data[i] ^ keyBytes[i % keyBytes.length];
	return result;
}
/**
 * 下载单个 XOR 加密页并解密，返回 { blob, ext, mime }。
 * options.format 为目标格式（"jpg" 默认 / "png"）：原文件已是目标格式时直接复用原始字节，
 * 不做任何重编码；否则用 canvas 转码为 jpg 或 png。
 * 没有密钥时按明文处理（comipo 的部分内容不加密）。
 */
async function fetchXorPage(item, keyHex, options = {}) {
	const arrayBuffer = await downloadArrayBuffer(item.url);
	const raw = new Uint8Array(arrayBuffer);
	const keyBytes = xorKeyToBytes(item.key ?? keyHex);
	const decrypted = keyBytes && keyBytes.length > 0 ? xorWithKeyBytes(raw, keyBytes) : raw;
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
