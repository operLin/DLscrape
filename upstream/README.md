# upstream/ — 上游只读产物

## `dlsite-play-downloader-v2.2.1.user.js`

这是本 fork 的**构建输入**：上游 [DLsite Play Downloader](https://greasyfork.org/scripts/480281) v2.2.1 的
发布产物（Vite + vite-plugin-monkey 打出的 SystemJS bundle），264172 字节。

它不是手写源码，也**不要修改**：

- `build/apply.mjs` 按**行区间**把 `build/parts/*.js` 拼到这份文件上生成 `DLscrape.user.js`；
  每个区间的起始行都有内容断言，行号一旦漂移构建会直接报错。
- `.gitattributes` 里的 `* -text` 保证它不会被换行转换改写。
- 想改行为请在 `build/parts/*` 里改，然后 `node build/apply.mjs`。

改动前请确认字节数仍是 **264172**（或直接跳过它看 `git diff`）：

```powershell
git diff --stat -- upstream/
node build/apply.mjs        # 应稳定输出 9477 行 / 316557 字节
node build/verify.mjs       # 68 项
node build/dom-test.mjs     # 32 项
```

上游后续版本（v2.2.2+）若要用作新基线，需重新核对 `build/apply.mjs` 里的所有行号锚点与
`build/verify.mjs` 的断言，不能直接替换文件。
