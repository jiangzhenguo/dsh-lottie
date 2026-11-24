# Lottie player for DeepSeek Harness

一个运行在 DeepSeek Harness（DSH）右侧栏中的 Lottie 动画播放器。插件使用 `lottie-web` 的 SVG 渲染器，提供内置示例、本地文件加载、远程 URL 加载和常用播放控制，适合快速检查动画内容、循环效果与播放速度。

- 包名：`@jiangzhenguo/dsh-lottie-player`
- 当前版本：`1.3.0`
- GitHub：[`jiangzhenguo/dsh-lottie`](https://github.com/jiangzhenguo/dsh-lottie)
- npm：[`@jiangzhenguo/dsh-lottie-player`](https://www.npmjs.com/package/@jiangzhenguo/dsh-lottie-player)
- 许可证：MIT
- 插件入口：右侧栏工具选择页中的 **Lottie 播放器**
- 渲染方式：浏览器内 SVG，无需单独启动服务
- 界面语言：中文、英文

## 功能

- 内置一个轨道旋转示例，打开页面后即可查看。
- 通过系统文件选择器打开本地 Lottie JSON 或 `.lottie` 文件。
- 将一个 JSON 或 `.lottie` 文件拖放到动画区域进行加载。
- 从 HTTP 或 HTTPS 地址加载 JSON 或 `.lottie` 内容。
- 解析 `.lottie` 的 ZIP、`manifest.json` 和包内图片资源。
- 多动画 `.lottie` 包提供动画选择器，优先打开 `activeAnimationId`。
- 播放、暂停、从头重播、循环开关和倍速控制。
- 可拖动的帧进度条，以及当前时间和总时长显示。
- 支持 0.5×、0.75×、1×、1.5×、2× 播放速度。
- 右侧栏变窄时通过容器查询调整布局，不依赖浏览器窗口宽度。
- 使用 DSH 主题变量，随宿主界面切换亮色和暗色外观。
- 遵循系统的“减少动态效果”偏好。
- 显示加载、格式错误、网络错误、超时和渲染错误等状态。

## 安装

### 从 npm 获取发布包

在任意用于存放 DSH 插件的工作目录中执行：

```sh
npm install @jiangzhenguo/dsh-lottie-player
```

然后在 DSH 的 **Plugins > Add plugin** 中选择该工作目录下的：

```text
node_modules/@jiangzhenguo/dsh-lottie-player
```

npm 包包含已经构建好的 `client.js`，普通安装后不需要再次执行构建。也可以从 [GitHub 仓库](https://github.com/jiangzhenguo/dsh-lottie) 获取源码；源码方式需要先运行 `npm install` 和 `npm run build`。

### 当前 Desktop Profile

本插件已经安装并启用在当前 DSH Desktop Profile 中。插件管理器使用本地目录链接，因此保留当前项目目录即可继续使用。

如果修改代码后界面仍显示旧内容，请先重新构建，再刷新当前 DSH 页面。

### 安装到其他 Profile

1. 确保项目目录中已经存在构建产物 `client.js`；如果不存在，先执行本文的构建命令。
2. 打开 DSH 的 **Plugins** 页面。
3. 选择 **Add plugin**，然后选择本项目的本地目录：

   ```text
   /Users/jiangzhenguo/ai/dsh-lottie
   ```

4. 在插件列表中确认 **Lottie 播放器** 已启用。
5. 打开一个会话，使用右侧栏入口打开播放器。

不需要为插件单独启动 Web 服务器，也不要把插件目录移动到 DSH Profile 内部手动安装。

## 打开播放器

1. 在 DSH 中打开或创建一个会话。
2. 展开会话右侧栏。
3. 如果当前显示的是其他工具，打开右侧栏的工具选择页。
4. 点击 **Lottie 播放器**。
5. 播放器会在右侧栏标签页中显示，并加载内置示例。

右侧栏标签页使用 `keepMounted`：切换到其他标签页、折叠右侧栏或切换会话时，已经创建的播放器视图可以保留。后台不可见的动画会暂停；重新显示时，如果之前处于播放状态，会继续播放。

**页面重新加载不会保存当前动画。** 刷新浏览器页面后，播放器会回到内置示例；播放进度、URL 输入、倍速和循环设置不会作为插件数据持久化。右侧栏自身的标签页布局由 DSH 管理，与动画内容状态是两个独立层次。

## 加载动画

### 内置示例

点击顶部的 **示例** 按钮即可恢复内置动画。

如果另一个本地文件或 URL 仍在加载，点击 **示例** 会取消或取代该请求，然后显示内置动画。

### 本地 JSON 或 .lottie 文件

1. 点击 **打开文件**。
2. 在系统文件选择器中选择一个 `.json` 或 `.lottie` 文件。
3. 文件通过验证后，动画区域会切换到新内容。
4. 加载失败时保留上一动画，并在下方显示错误原因。

也可以直接将**一个** JSON 或 `.lottie` 文件拖放到动画区域：

- 只有检测到文件拖放时才显示放置高亮。
- 同时拖入多个文件或拖入非文件内容时，会提示只拖放一个 Lottie 文件。
- 新拖入的文件会取代仍在进行的加载流程。

本地文件通过浏览器的 File API 读取，不会上传到 DSH Host，也不会因为打开本地文件而向远程服务器发送请求。

### .lottie 多动画包

`.lottie` 是基于 ZIP 的封装格式。插件会读取根目录的 `manifest.json` 和 `animations/<id>.json`，并按以下规则选择内容：

1. 如果 `activeAnimationId` 指向包内动画，优先打开该动画。
2. 如果该字段缺失或无效，打开 `animations` 列表中的第一个动画。
3. 包内有多个动画时，顶部出现 **选择包内动画** 下拉框，可随时切换。
4. 动画引用的 `images/` 包内图片会转换成 data URL，再交给 `lottie-web` 渲染。

文件扩展名不是唯一判断依据：即使远程下载地址没有 `.lottie` 后缀，插件也会通过 ZIP 文件头识别内容。清单缺失、动画文件缺失、包内图片缺失、ZIP 损坏或资源超限时，都会显示对应错误并保留上一动画。

### 远程 JSON 或 .lottie URL

1. 在地址输入框中填写完整的 HTTP(S) URL，例如：

   ```text
   https://example.com/animations/loading.lottie
   ```

2. 点击 **加载** 或提交表单。
3. 加载期间可以点击 **取消** 停止等待。
4. 也可以点击 **示例** 或选择本地文件，用新内容取代当前请求。

远程加载规则：

- 仅接受 `http:` 和 `https:` 协议。
- 请求由当前浏览器直接发出，不经过 DSH Host 代理。
- 目标服务必须允许当前 DSH 页面来源的跨域请求（CORS）。
- 响应使用流式读取并累计实际字节；超过 10 MiB 时立即取消读取，不依赖 `Content-Length` 是否存在或准确。
- 插件不会附加自定义认证请求头，也不会自动携带目标站点的登录配置。
- 15 秒未完成时会中止请求并显示超时提示。
- 响应状态不是成功状态、内容超过大小限制或内容不是有效 Lottie JSON / `.lottie` 时，不会替换当前动画。
- 远程服务器可以按照普通 HTTP 请求获得网络地址、请求时间等常规访问信息；请只加载自己信任或有权访问的资源。

## 播放控制

| 控件 | 行为 |
| --- | --- |
| **播放 / 暂停** | 切换当前动画的播放状态；非循环动画播放到末尾后会显示“播放”。 |
| **重播** | 从第 0 帧开始播放，并将状态切换为播放中。 |
| **播放进度** | 显示当前帧位置和 `当前时间 / 总时长`；拖动可按帧定位，保持原来的播放或暂停状态。 |
| **循环** | 开启后循环播放；关闭后播放到末尾停止。 |
| **倍速选择器** | 可选 0.5×、0.75×、1×、1.5×、2×，立即作用于当前动画。 |
| **示例** | 放弃当前内容并恢复内置示例。 |

进度条通过 `lottie-web` 的 `enterFrame` 事件更新。加载新文件或切换包内动画时会回到起点；动画不可见时随播放一起暂停更新。时间由当前帧、总帧数和帧率计算。

动画初始化或渲染失败时，播放、重播和进度条会被禁用，避免出现看似可点击但没有效果的控件。

### 减少动态效果

当操作系统或浏览器启用 `prefers-reduced-motion: reduce` 时：

- 内置示例和新加载的动画默认停在首帧。
- 用户仍可明确点击 **播放** 或 **重播** 来启动动画。
- 如果在面板打开期间将系统偏好切换为“减少动态效果”，当前动画会立即暂停。
- 关闭该偏好不会擅自恢复播放，以免覆盖用户手动暂停的选择。

## 文件格式与限制

### 独立 Lottie JSON

独立 JSON 使用 `lottie-web` 5.13 的 SVG 渲染能力。基本要求：

- 文件内容必须是合法 JSON。
- 顶层对象必须包含数值类型的 `w` 和 `h`。
- 顶层对象必须包含数组类型的 `layers`。
- 输入文件不能超过 **10 MiB**。
- 外部图片必须嵌入为 `data:image/png;base64,...` 等 data URL。

独立 JSON 不支持依赖外部相对路径图片。检测到非 data URL 的图片资源时，插件会显示错误并保留上一动画，避免相对路径被错误解析到 DSH 页面地址。

### dotLottie .lottie

`.lottie` 文件按 ZIP 读取，当前支持：

- 根目录 `manifest.json`。
- `animations` 清单及 `animations/<id>.json`。
- `activeAnimationId` 默认动画选择。
- 多动画下拉切换。
- `images/` 目录中的包内图片，并自动内联到动画资源。
- PNG、JPEG、GIF、WebP、SVG 和 AVIF 图片扩展名的 MIME 映射。

大小与安全限制：

- 输入 `.lottie` 压缩包不能超过 **10 MiB**。
- 清单、单个动画或单个包内图片的展开大小不能超过 **10 MiB**。
- 插件实际读取的清单、动画和图片总展开大小不能超过 **50 MiB**。
- 只展开 `manifest.json`、`animations/` 和 `images/` 中的内容，其他条目不会交给渲染器。
- 动画 ID 不能包含路径分隔符或 `..`，避免把清单 ID 当成任意路径读取。
- ZIP 损坏、清单无效、动画缺失、图片缺失或资源超限都会在渲染前被拒绝。

具体 Lottie 动画特性是否可用，还取决于 `lottie-web` 及其 SVG 渲染器。并非所有 After Effects 或 Bodymovin 特性都能得到完全一致的结果。

### 当前不支持的格式或能力

- 纯 GIF、APNG、独立 SVG 动画或视频文件。
- 超过上述输入或展开大小限制的文件。
- 独立 JSON 的外部相对路径图片。
- `.lottie` 主题切换、状态机和交互逻辑；当前只播放包内动画及其图片资源。
- `.lottie` 中需要额外解码流程的音频播放。
- 需要自定义请求认证或 Host 代理才能访问的远程资源。

## 错误与故障排查

| 现象或提示 | 可能原因与处理方式 |
| --- | --- |
| 右侧栏没有 **Lottie 播放器** | 确认插件已在 **Plugins** 中启用；重新构建后刷新 DSH 页面；确认当前已经打开一个会话。 |
| “这不是有效的 Lottie JSON 动画” | 检查 JSON 语法，以及 `w`、`h`、`layers` 字段；如果打开的是 `.lottie`，还要检查包内动画 JSON。 |
| “独立 JSON 必须将外部图片嵌入” | 将外部图片嵌入为 data URL；或者使用包含 `images/` 资源的 `.lottie` 包。 |
| “不是可读取的 ZIP 压缩包” | 确认文件确实是 `.lottie` / ZIP，而不是仅修改了扩展名。 |
| “清单或动画列表缺失或无效” | 检查根目录 `manifest.json`、`animations` 列表和对应的 `animations/<id>.json`。 |
| “引用的图片在压缩包中缺失” | 检查动画的 `u` / `p` 资源路径与 `images/` 内文件是否一致。 |
| “超过 10 MiB” | 减小输入文件或包内资源；`.lottie` 还有 50 MiB 的总展开限制。 |
| “请输入完整有效的 HTTP(S) URL” | 补全协议、主机名和资源路径，例如以 `https://` 开头。 |
| “无法加载该地址” | 检查 URL、HTTP 状态、网络连接和目标服务的 CORS 响应头。 |
| “加载超时” | 请求已超过 15 秒；重试、检查服务速度，或下载后改为本地打开。 |
| “Lottie 无法渲染该动画” | JSON 可能通过了基础字段检查，但包含渲染器无法处理的数据；尝试重新导出或简化动画。 |
| 加载报错后仍显示旧动画 | 这是预期行为：只有验证成功的新内容才会替换当前动画。 |
| 动画没有自动播放 | 检查系统是否启用了“减少动态效果”；也可以手动点击 **播放**。 |
| 播放或重播按钮不可用 | 当前动画尚未成功初始化，或最近一次渲染失败；请加载其他有效 JSON。 |
| 修改源码后界面没有变化 | 执行 `npm run build` 生成新的 `client.js`，然后刷新 DSH 页面。 |

## 开发与构建

### 环境

- 当前安装依据：DSH `0.2.2-rc.5` 的右侧栏扩展 API。
- 构建工具：Node.js 与 npm。
- 运行时 React 由 DSH 浏览器模块表提供，不需要在插件中重复安装或打包 React。

### 安装依赖

```sh
npm install
```

主要依赖：

- `lottie-web`：Lottie 解析与 SVG 渲染。
- `fflate`：在浏览器中读取 `.lottie` ZIP 条目，并通过过滤器限制展开内容。
- `esbuild`：将 Client 源码、Lottie 运行库、ZIP 解析器和内置示例打包成单个浏览器文件。

### 构建

```sh
npm run build
```

该命令读取 `client.source.js`，生成可部署的 `client.js`。

**不要直接手工编辑 `client.js`。** 它是压缩后的生成文件，下次构建会被覆盖。功能修改应写入 `client.source.js`，内置示例修改应写入 `sample.json`。

### 静态检查

```sh
npm run check
```

检查范围：

- `index.js` 的 JavaScript 语法。
- `loader.js` 的 JavaScript 语法。
- `client.source.js` 的 JavaScript 语法。
- 构建后 `client.js` 的 JavaScript 语法。

### 自动化测试

```sh
npm test
```

测试使用 Node.js 内置测试运行器，并通过 `fflate` 在本地生成 `.lottie` 测试包，不依赖外部网络样例。覆盖：

- 独立 JSON 解析与外部图片拒绝。
- `activeAnimationId` 和默认动画回退。
- 多动画清单读取。
- 包内图片 data URL 内联。
- 无扩展名 ZIP 内容识别。
- 缺失图片、损坏 ZIP、无效清单、重复或不安全动画 ID。
- ZIP 路径规范化、常见图片路径及已有 data URL。
- 输入、单资源和总展开大小限制。
- 有界响应流读取及超限取消。

### 检查打包清单

```sh
npm pack --dry-run
```

用于确认清单、Client 产物、语言资源、图标、示例和 README 都包含在包中。本地目录安装使用链接，不会按照 `files` 字段复制一份裁剪后的目录，但发布或打包前仍应检查实际产物。

## 目录结构

```text
dsh-lottie/
├── package.json          # 包清单、构建脚本和 DSH Client 声明
├── cordis.patch.yml      # 将插件插入当前 Cordis Profile
├── index.js              # Host 半端；本插件无需 Host 业务逻辑
├── client.source.js      # 右侧栏注册、React 界面、加载与播放逻辑
├── loader.js             # JSON 校验、.lottie ZIP、清单和图片解析
├── loader.test.js        # 本地自动化测试（不会打入运行时包）
├── client.js             # esbuild 生成的完整浏览器产物
├── sample.json           # 内置 Lottie 示例
├── icon.svg              # 插件管理器图标
├── locale/
│   ├── en.json           # 英文插件标题与说明
│   └── zh.json           # 中文插件标题与说明
└── README.md             # 本文档
```

## 实现说明

### 右侧栏注册

Client 半端通过 `ctx.sidebarRightTabs.register()` 注册 `lottie-player` 页面类型，并向工具选择页贡献 **Lottie 播放器** 入口。

页面主体和标签标题分别注册到：

- `sidebar.right.pane.tab`
- `sidebar.right.pane.tab.title`

这两个插槽由 DSH 的右侧栏包 `@deepseek-ai/dsh-client-ui-sidebar-right` 提供。

### 界面与主题

- React 组件通过 DSH 模块加载器获取。
- 可见文字通过 DSH Client locale 服务注册和翻译。
- 容器、边框、文字和控件使用 DSH 主题 token。
- 插件没有导入 DSH 私有 UI 组件包，而是在自身命名空间下实现所需样式。
- Lottie 动画自身的颜色由动画 JSON 决定，不随宿主主题改写。

### 浏览器产物

`client.js` 包含：

- 插件界面和注册逻辑。
- `lottie-web` 运行库。
- `fflate` ZIP 解析能力及 `.lottie` 清单、资源处理逻辑。
- 内置示例 JSON。

因此运行时不依赖 CDN，也不需要从 npm 包目录动态读取 `sample.json`。

### Host 半端

`index.js` 仅提供标准 Host 插件入口。本地文件读取、远程请求、ZIP 解压、图片内联和动画渲染全部发生在浏览器 Client 半端，没有新增 Host RPC 方法。

## 隐私与数据边界

- 本地文件只由当前浏览器读取，用于 JSON / `.lottie` 解析和动画渲染。
- 插件不会把本地动画内容发送给 Agent，也不会将其追加到会话日志。
- 插件不会把本地文件上传到 DSH Host。
- 只有用户主动提交远程 URL 时，浏览器才会向该地址发起请求。
- 插件自身不写入数据库，也不保存动画、播放进度或 URL 历史。
- DSH 右侧栏可能按照宿主自身机制保存标签页布局；这不等于保存动画内容。

## 验证状态

本项目已完成：

- npm 依赖安装与漏洞检查。
- `npm run build` 构建验证。
- `npm run check` 语法检查。
- `npm test` 的 16 项 JSON / `.lottie` 解析与响应流测试。
- `npm pack --dry-run` 包内容检查。
- 插件安装与启用结果检查。
- 运行时右侧栏主体与标题插槽检查，两个注册项均为 `active`。
- 独立 UI/UX 静态审查及复查。

尚未完成浏览器中的完整视觉与交互实测，包括真实远程服务超时、不同主题下的实际画面对比、所有窄栏尺寸和各类第三方 Lottie 文件的兼容性测试。因此，静态检查与插槽激活不应被理解为对所有动画内容和显示效果的保证。

## 禁用或卸载

在 DSH **Plugins** 页面中可以禁用或卸载 **Lottie 播放器**。

禁用后，插件贡献的右侧栏页面类型、工具入口和标签渲染注册会随插件生命周期移除。卸载只影响插件包及其注册，不会删除用户自行保存在其他位置的 Lottie JSON 文件。
