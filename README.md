网页版 浙大树洞：

## 安装方式
```bash
git clone https://github.com/zjuhollow/webhole
cd webhole
git submodule update --init --recursive

# Edit environment configs
vim .env

# Build
VERSION_NUMBER="v$(grep -oP '"version": "\K[^"]+' package.json | head -n1)"
REACT_APP_BUILD_INFO=$VERSION_NUMBER npm run build
```

后端安装方式请见 [zjuhollow/zjuhollow-go-backend](https://github.com/zjuhollow/zjuhollow-go-backend )。

## CDN说明

使用优秀的免费jsdelivr CDN加速主页.css/.js静态内容.

## 浏览器兼容

下表为当前 浙大树洞 网页版的浏览器兼容目标：

| 平台     | Desktop |                            |         | Windows  |      | macOS  | iOS    |                     | Android |                         |
| -------- | ------- | -------------------------- | ------- | -------- | ---- | ------ | ------ | ------------------- | ------- | ----------------------- |
| 浏览器   | Chrome  | Chromium<br />(国产浏览器) | Firefox | EdgeHTML | IE   | Safari | Safari | 微信<br />(WebView) | Chrome  | Chromium<br />(WebView) |
| 优先兼容 | 76+     | 无                         | 最新版  | 无       | 无   | 无     | 12+    | 无                  | 最新版  | 无                      |
| 兼容     | 56+     | 最新版                     | 56+     | 最新版   | 无   | 10+    | 10+    | 最新版              | 56+     | 最新版                  |
| 不兼容   | 其他    | 其他                       | 其他    | 其他     | 全部 | 其他   | 其他   | 其他                | 其他    | 其他                    |


**优先兼容** 指不应有 bug 和性能问题，可以 Polyfill 的功能尽可能提供，若发现问题会立刻修复。

**兼容** 指不应有恶性 bug 和严重性能问题，若发现问题会在近期修复。

**不兼容** 指在此种浏览器上访问本网站是未定义行为，问题反馈一般会被忽略。

`num+` 指符合版本号 `num` 的最新版本及后续所有版本。`最新版` 以 stable 分支为准。

## 问题反馈

对 浙大树洞 网页版的 bug 反馈请在相应仓库提交 Issue。

欢迎提出功能和 UI 建议，但可能不会被采纳。根据 GPL，你有权自行实现你的想法。

不方便在 GitHub 上说明的问题可以邮件 zjuhollow@protonmail.com。邮件内容可能会被公开。

对 浙大树洞 后端服务、账号、树洞内容的反馈请联系邮件 zjuhollow@protonmail.com。

## branch说明：
- master branch: 主分支
- dev branch: 开发分支
- gh-pages branch: dev分支的部署分支，用于测试
- gh-pages-master branch: master分支的部署分支，用于jsdelivr CDN

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.zh-cn.html) for more details.
