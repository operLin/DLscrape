		resolve({
			method: "puzzle",
			data: {
				zipFileName,
				pages: files.map((file, index) => ({
					pageNo: index + 1,
					originalName: replaceExtension(file.filename, ".png"),
					load: (loadOptions) => restorePuzzlePage(downloadPrefix, file, loadOptions)
				}))
			}
		});
