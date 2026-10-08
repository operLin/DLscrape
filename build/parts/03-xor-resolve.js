		resolve({
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
