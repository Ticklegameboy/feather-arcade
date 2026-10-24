# 羽夜奇譚 · Feather Arcade

[立即游玩](https://ticklegameboy.github.io/feather-arcade/)

当前版本 r89 暂时只开放 **隆、红战士**。首位对手选择、战斗出场和地牢展示均限定这两名角色。旧存档中的隐藏角色记录保留，之后可以恢复。

仓库根目录就是完整游戏，无需构建、账号或 API 密钥。所有当前使用的图片、动画、声音、背景及可编辑 JavaScript 源码均已包含。GitHub Pages 从 `main /` 发布。

下载仓库 ZIP 并解压，运行 `python -m http.server 8014`，然后打开 http://localhost:8014/ 。存档保存在浏览器本地；本地预览和在线网站属于不同网址，存档不会自动互通。

淘汰图稿、重复原始压缩包、未实装 CG、隐藏角色素材和历史预览没有加入本次发布，仍保留在开发者本地。`RESOURCE_MANIFEST.json` 列出当前游戏文件及 SHA-256。

保留红战士专属台词、无头盔形态、鞋袜状态、两版大笑及破防值高于 50 转头的规则、鼠标工具与衣物覆盖判定。

验证：安装 Node.js 和 Playwright 后运行 `node tools/verify-active-roster.cjs`；可用 `GAME_URL` 指定测试网址，默认 http://127.0.0.1:8014/。测试使用 Microsoft Edge。

素材署名：隆战斗素材 Umihei，来自 [Tatayecorp/demo_mugenJS](https://github.com/Tatayecorp/demo_mugenJS)，原角色和美术 CAPCOM；红战士素材 Chuchoryu。背景与音频署名详见对应目录的 CREDITS.txt。第三方角色及素材权利归原作者所有。

加载改进 r89：显示素材加载进度；下载失败自动重试，单次请求限时 45 秒、最多 3 次；失败时提供重新加载按钮并保留存档。红战士鞋袜和无头盔素材并行加载。可运行 `node tools/verify-loading.cjs` 验证网络故障恢复。

统计接入 r90：访问、开始游戏、游玩时间和加载结果的 GA4 事件已准备。尚未配置衡量 ID，不会收集数据。统计后台通过账号登录查看，详见 [设置说明](ANALYTICS_SETUP.md)。
