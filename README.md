# Shadowrocket Modules

个人 Shadowrocket 脚本模块仓库，用于学习和验证模块/脚本功能。

## 模块列表

| 模块 | 说明 |
|------|------|
| [TestModule](#testmodule) | 脚本功能验证：HTTP 响应拦截测试 + 定时任务测试 |

---

## 概念说明

### 模块是什么

模块是为 Shadowrocket 提供额外功能的插件，写法与配置文件相同，但**优先级高于配置文件**。一般只包含完整配置中的特定部分（规则、脚本、MITM hostname 等），以实现特定功能而不影响其他设置。

安装方式：
- **远程模块**：配置 → 模块 → 右上角 `+` → 填写链接 → 下载
- **本地新建**：配置 → 模块 → 新建模块 → 编辑后保存

> 大多数模块仅在全局路由设为**配置**时生效，不含规则类的模块除外。

模块的 `[MITM]` 部分必须加 `%APPEND%`，表示追加而非覆盖其他模块的同类配置：

```
[MITM]
hostname = %APPEND% 主机名
```

### MITM 是什么

MITM（Man-in-the-Middle，中间人）是 Shadowrocket 解密 HTTPS 流量的方式。对于需要拦截和修改 HTTPS 请求/响应的脚本，必须先启用 MITM 并信任 CA 证书，否则 Shadowrocket 只能看到加密流量，脚本无法读取或修改内容。

自版本 `2.2.81` 起支持通过 HTTP/2 进行 MITM，在模块 `[MITM]` 中用 `h2 = true` 启用（若模块包含此字段，会覆盖配置文件中的对应设置）。

### HTTPS 解密配置

**HTTPS 解密只对启用了该功能的配置文件生效。** 切换或新建配置文件后需要重新配置。

手动安装证书的步骤：

1. 点击当前配置文件后面的 `ⓘ` 图标 → **HTTPS 解密** → **证书** → **生成新的 CA 证书** → **安装证书**
2. 跳转系统设置后：**已下载描述文件** → 点击安装
3. iOS 设置 → **通用** → **关于本机** → **证书信任设置** → 找到 Shadowrocket 证书，开启信任

> 安装证书时如果弹出「输入身份证书密码」，尝试输入：`Shadowrocket`

**多设备共用同一配置文件**：需要用证书 `ⓘ` 图标的复制功能，把同一证书在每台设备上分别安装并信任。

### 证书模块（进阶）

频繁切换配置文件时，每次都要重装证书很繁琐。解决方案是使用**证书模块**：把已生效的证书内容放进一个独立模块，因为模块优先级高于配置文件，证书状态不再受配置切换影响。

新建方式：配置 → 模块 → 新建模块，粘贴以下模板：

```
#!name=证书
[MITM]
enable=true

# 在下方粘贴证书密码
ca-passphrase=

# 在下方粘贴证书内容
ca-p12=
```

证书内容获取：点击「已安装证书的配置文件」后的 `ⓘ` → HTTPS 解密 → 证书后的 `ⓘ` → 复制，粘贴到 `ca-p12=` 后面保存。

---

## 脚本机制

### 脚本类型

| 类型 | 触发时机 | 典型用途 |
|------|----------|----------|
| `http-request` | 请求发出前 | 修改请求头、URL、Body |
| `http-response` | 响应返回后 | 修改响应内容、注入字段、去广告 |
| `cron` | 按时间自动执行 | 定时通知、数据拉取 |

### `[Script]` 常用参数

```
脚本名 = type=http-response,pattern=<URL正则>,requires-body=1,script-path=<脚本URL>
```

| 参数 | 说明 |
|------|------|
| `type` | 脚本类型：`http-request` / `http-response` / `cron` |
| `pattern` | URL 匹配正则，`request`/`response` 类型必填 |
| `requires-body` | 是否需要读取 body，修改响应内容时必须设为 `1` |
| `script-path` | 脚本文件地址，需是可直接访问的原始文本链接 |
| `cronexp` | cron 表达式，`cron` 类型必填，如 `"* * * * *"` 表示每分钟 |
| `timeout` | 脚本执行超时时间（秒） |
| `max-size` | 可处理的 body 大小上限 |
| `binary-body-mode` | 以二进制模式处理 body（用于 protobuf 等） |
| `wake-system` | cron 任务是否允许唤醒系统执行 |
| `script-update-interval` | 脚本缓存更新间隔（秒），`-1` 表示不自动更新，`0` 表示每次都更新 |
| `argument` | 向脚本传递的参数 |

### 脚本可用的 JS API

标准 JS 语法（`JSON.parse`、`Array.map`、正则、`async/await` 等）均可使用。此外 Shadowrocket 注入了以下宿主对象：

| 对象 | 可用场景 | 说明 |
|------|----------|------|
| `$request` | `http-request` | 请求信息：`url`、`method`、`headers`、`body` |
| `$response` | `http-response` | 响应信息：`status`、`headers`、`body` |
| `$done({...})` | 所有类型 | 结束脚本，传入修改后的请求/响应 |
| `$notification.post(title, subtitle, body)` | 所有类型 | 发送系统通知 |
| `$httpClient.get/post(opts, callback)` | 所有类型 | 发起 HTTP 请求 |
| `$persistentStore.read(key)` | 所有类型 | 读取持久化存储 |
| `$persistentStore.write(value, key)` | 所有类型 | 写入持久化存储 |

> 社区脚本中常见的 `Env`、`$.msg`、`$.getdata` 等**不是** Shadowrocket 原生 API，而是脚本作者自己封装的兼容层。

### 最小脚本示例

**cron 脚本**（定时弹通知）：
```javascript
$notification.post("测试", "cron 触发了", new Date().toString());
$done();
```

**http-response 脚本**（修改响应 JSON）：
```javascript
let obj = JSON.parse($response.body);
obj.test = true;
$done({ body: JSON.stringify(obj) });
```

### 关于 QUIC / HTTP3 的坑

Safari 访问支持 HTTP/3 的域名（如 Baidu）时会走 **QUIC（UDP 443）**，而 Shadowrocket MITM 只能拦截 TCP 连接，QUIC 流量完全绕过，脚本永远不触发。

如果必须拦截某个走 QUIC 的域名，可以在配置规则中加：
```
AND,((DOMAIN-SUFFIX,目标域名),(PROTOCOL,UDP)),REJECT
```
强制拒绝 UDP，浏览器会自动降级到 HTTP/2（TCP），MITM 才能生效。

---

## TestModule

验证 Shadowrocket 脚本环境是否正常工作，包含两个最小化测试用例。

### 安装步骤

**1. 安装并信任 HTTPS 证书**（参考上方「HTTPS 解密配置」）

**2. 安装模块**

配置 → 模块 → 右上角 `+`，粘贴链接：

```
https://raw.githubusercontent.com/lr00rl/shadowrocket-modules/refs/heads/main/TestTools.sgmodule
```

下载后勾选启用。

**3. 开启通知权限**（定时任务需要）

iOS 设置 → **通知** → **Shadowrocket** → 允许通知

---

### 包含脚本

#### HTTP 响应拦截测试（`test.js`）

- **类型**：`http-response`
- **触发**：Safari 访问 `https://httpbin.org/get`
- **需要 MITM**：是（模块已将 `httpbin.org` 加入解密 hostname）
- **预期结果**：响应 JSON 中新增 `shadowrocket_test` 字段

```json
{
  "shadowrocket_test": {
    "ok": true,
    "test_msg": "Hello from shadowrocket!",
    "script": "test.js"
  }
}
```

#### 定时任务测试（`cron-test.js`）

- **类型**：`cron`
- **触发**：每分钟执行一次
- **需要 MITM**：否
- **预期结果**：每分钟收到系统通知「⏰ 定时任务触发」，副标题显示执行时间

---

### Debug 指南

#### 第一步：定位请求层级

访问 `https://httpbin.org/get` 后，去 Shadowrocket 首页查看**最近请求**：

| 日志情况 | 说明 |
|----------|------|
| httpbin.org 完全不出现 | 流量没走代理，或代理未连接 |
| 请求出现，无 🔒 图标 | MITM 未生效，证书问题 |
| 请求出现且有 🔒，响应无变化 | 脚本未执行 |

#### HTTP 响应测试无效

| 可能原因 | 排查方法 |
|----------|----------|
| 证书未安装或未信任 | 重新走完整三步流程，第 3 步「证书信任设置」容易漏 |
| MITM 总开关未开 | 配置 `ⓘ` → HTTPS 解密，确认开关开启 |
| 模块未启用 | 配置 → 模块，确认 TestModule 已勾选 |
| 使用了非 Safari 浏览器 | 改用 Safari，部分浏览器会绕过系统代理 |
| 脚本拉取失败 | 见下方 |

#### 脚本拉取失败

Shadowrocket 拉取远程脚本时**走直连，不经过自身 VPN 隧道**。`raw.githubusercontent.com` 直连可能不稳定，脚本会报网络或 SSL 错误。

排查：
1. Shadowrocket → 设置 → 开启**详细日志**
2. 手动触发脚本，观察日志中 `script update script url` 这行是否报错
3. 若是网络问题，考虑切换节点或将脚本改为 jsDelivr CDN 链接（`cdn.jsdelivr.net/gh/...`）

#### 定时任务收不到通知

| 可能原因 | 排查方法 |
|----------|----------|
| Shadowrocket 被系统挂起 | 把 Shadowrocket 切到前台，等下一分钟 |
| 通知权限关闭 | iOS 设置 → 通知 → Shadowrocket |

#### 查看脚本日志

首页 → **最近请求** → 点击条目，可看到 `console.log` 输出。

实时查看：设置 → 开启**详细日志**。

---

## 文件结构

```
shadowrocket-modules/
├── TestTools.sgmodule      # 模块配置文件
└── Script/
    ├── test.js             # HTTP 响应拦截测试（修改 httpbin.org 响应 body）
    └── cron-test.js        # 定时任务测试（每分钟执行）
```

---

## 参考资料

- [Shadowrocket 使用手册（LOWERTOP）](https://lowertop.github.io/Shadowrocket/)
- [HTTPS 解密](https://lowertop.github.io/Shadowrocket/#https%E8%A7%A3%E5%AF%86)
- [模块](https://lowertop.github.io/Shadowrocket/#%E6%A8%A1%E5%9D%97)
- [证书模块](https://lowertop.github.io/Shadowrocket/#%E8%AF%81%E4%B9%A6%E6%A8%A1%E5%9D%97)
- [脚本](https://lowertop.github.io/Shadowrocket/#%E8%84%9A%E6%9C%AC)
