/** 作品元数据（只用来凑文件名）的等待上限：拿不到也不能拖住整个检测流程。 */
var DPD_META_TIMEOUT_MS = 6000;
/**
 * hook Worker的postMessage方法，尝试截获xor key以判断是否为xor加密方式
 * comipo Play 走的是同一条链路：把 decryption.key 的内容当 { method: "xor", key } 传给 worker。
 * @returns {Promise<encDetectorResult>}
 */
var hookXorKey = () => {
	return new Promise((resolve) => {
		let settled = false;
		const origPostMessage = Worker.prototype.postMessage;
		const finish = (key) => {
			if (settled) return;
			settled = true;
			Worker.prototype.postMessage = origPostMessage;
			resolve({ key });
		};
		Worker.prototype.postMessage = function(msg, ...rest) {
			if (msg && msg.param && msg.param.key && msg.param.method === "xor") finish(msg.param.key);
			return origPostMessage.call(this, msg, ...rest);
		};
		const originalDecrypt = crypto.subtle.decrypt;
		crypto.subtle.decrypt = async function(algorithm, key, data) {
			const result = await originalDecrypt.call(this, algorithm, key, data);
			if (settled) return result;
			try {
				const text = new TextDecoder("utf-8").decode(result).trim();
				// 只接受「看起来像密钥」的结果：hex 串，或较短的可见 ASCII。
				// 否则 RSA / 口令解密的明文会被误当成 XOR 密钥。
				if (/^[0-9a-f]{16,}$/i.test(text)) finish(text);
				else if (/^[\x20-\x7e]{8,128}$/.test(text) && /[0-9]/.test(text)) finish(text);
			} catch (err) {
				origConsole.debug("[hookXorKey] decrypt 结果无法当作密钥", err);
			}
			return result;
		};
	});
};
var hookEncBinUrl = () => {
	return new Promise((resolve) => {
		let settled = false;
		const finish = (url) => {
			if (settled) return;
			settled = true;
			unhooks.forEach((unhook) => {
				if (typeof unhook === "function") unhook();
			});
			resolve({ url });
		};
		const unhooks = [
			// DLsite Play 与 comipo Play 的页面文件都是 *.enc（comipo 后面还带一串 S3 签名 query）
			/\/[^/?]+\.enc(?:\?|$)/,
			// comipo 图片型作品的兜底：只看 viewer/content 目录下的图片，避免命中站内缩略图
			/https?:\/\/[^/]*comipo\.app\/(?:viewer|content)\/[^?#]*\.(?:jpe?g|png|webp|avif)(?:\?|$)/
		].map((pattern) => registerRequestHook(pattern, (json, response, url) => finish(url), true));
	});
};
var hookViewerMeta = () => {
	return new Promise((resolve) => {
		registerRequestHook(/\/viewer\-meta\.json\b/, (json, response, url) => {
			resolve({ json });
		}, true);
	});
};
var hookApiV2Work = () => {
	return new Promise((resolve) => {
		let unregisterFns = [];
		let settled = false;
		const finish = (json) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			unregisterFns.forEach((unhook) => {
				if (typeof unhook === "function") unhook();
			});
			unregisterFns.length = 0;
			resolve({ json });
		};
		[
			/\/api\/v2\/work\/.+$/,
			/\/api\/viewer\/work\/.+$/,
			/\/api\/comipo\/v2\/work\/.+$/,
			// comipo Play：作品元数据接口（试读作品未登录也会返回 200）
			/\/api\/comipo\/viewer\/work\/.+$/,
			/\/api\/comipo\/v3\/work\/.+$/
		].forEach((pattern) => {
			unregisterFns.push(registerRequestHook(pattern, (json) => finish(json), true));
		});
		const timer = setTimeout(() => finish(null), DPD_META_TIMEOUT_MS);
	});
};
