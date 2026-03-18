# Shadowrocket Modules

个人 Shadowrocket 脚本模块仓库。

## 模块列表

| 模块 | 说明 |
|------|------|
| [TestTools.sgmodule](#testtools) | 脚本功能验证工具：HTTP 请求拦截测试 + 定时任务测试 |

---

## TestTools

> 用于验证 Shadowrocket 脚本环境是否正常工作，包含两个最小化测试用例。

### 安装

在 Safari 中打开以下链接，选择「添加模块」：

```
https://raw.githubusercontent.com/lr00rl/shadowrocket-modules/refs/heads/main/TestTools.sgmodule
```

或在 Shadowrocket → 模块 → 右上角 `+` → 粘贴链接后确认。

### 包含脚本

#### 1. HTTP 请求拦截测试（`baidu-test.js`）

- **触发方式**：HTTP 请求拦截（`http-request`）
- **触发条件**：Safari 访问 `https://httpbin.org/get`
- **依赖**：需要 MITM，模块已自动将 `httpbin.org` 加入 hostname
- **预期结果**：收到系统通知「✅ 脚本测试成功」

> **为什么不用 baidu.com？**
> Safari 访问 Baidu 时会优先走 **QUIC（HTTP/3，UDP 443）**。
> Shadowrocket 的 MITM 只能拦截 TCP 连接，QUIC 流量完全绕过，脚本永远不触发。
> `httpbin.org` 不支持 HTTP/3，稳定走 TCP，是可靠的测试目标。

#### 2. 定时任务测试（`cron-test.js`）

- **触发方式**：定时任务（`cron`）
- **触发条件**：每分钟自动执行一次
- **依赖**：无需 MITM
- **预期结果**：每分钟收到系统通知「⏰ 定时任务触发」，通知副标题显示执行时间

---

## 安装前提

1. **MITM 证书已安装并信任**
   - Shadowrocket → 设置 → 证书 → 生成新的 CA 证书 → 安装证书
   - 前往 iOS 设置 → 通用 → VPN 与设备管理 → 找到证书 → 信任

2. **通知权限已开启**
   - iOS 设置 → 通知 → Shadowrocket → 允许通知

3. **模块中脚本功能已启用**
   - Shadowrocket → 配置 → 已选配置右侧编辑图标 → 确认「脚本」开关开启

---

## 使用步骤

1. 确保 Shadowrocket 已连接代理
2. 确认 TestTools 模块已启用（模块列表中勾选状态）
3. 用 **Safari** 访问 `https://httpbin.org/get`
4. 等待 2–3 秒，观察是否收到通知

---

## Debug 指南

### 第一步：定位请求有没有进入 Shadowrocket

Shadowrocket → 首页 → 最近请求，访问测试 URL 后查看：

| 情况 | 说明 |
|------|------|
| 请求完全不出现 | 流量没走代理，或走了 QUIC（UDP）绕过了拦截 |
| 请求出现，但无 🔒 图标 | MITM 未生效 |
| 请求出现且有 🔒，但无通知 | 脚本 pattern 不匹配或脚本未加载 |

这一步能快速缩小问题范围。

---

### 请求拦截测试收不到通知

| 现象 | 可能原因 | 排查方法 |
|------|----------|----------|
| 请求不出现（见上） | QUIC 绕过 | 换用 `httpbin.org`，它不支持 HTTP/3 |
| 请求不出现（见上） | 代理未连接 | 确认 Shadowrocket 已开启并能正常联网 |
| 请求出现但无 🔒 | 证书未信任 | iOS 设置 → 通用 → VPN 与设备管理 → Shadowrocket 证书 → 信任 |
| 请求出现但无 🔒 | MITM 开关未开 | Shadowrocket → HTTPS 解密，确认开关开启 |
| 请求出现且有 🔒，无通知 | 模块未启用 | Shadowrocket → 模块，确认 TestTools 已勾选 |
| 请求出现且有 🔒，无通知 | 通知权限关闭 | iOS 设置 → 通知 → Shadowrocket → 允许通知 |
| 请求出现且有 🔒，无通知 | 脚本从 GitHub 加载失败 | 确认 GitHub raw 链接可访问；模块更新后脚本需重新下载 |

### 关于 QUIC / HTTP3 的说明

如果你坚持想测试某个支持 QUIC 的域名，可以在 Shadowrocket 规则中添加：

```
QUIC,目标域名,REJECT
```

强制拒绝 QUIC 请求，浏览器会自动降级到 HTTP/2（TCP），此时 MITM 才能生效。

### 定时任务收不到通知

| 现象 | 可能原因 | 排查方法 |
|------|----------|----------|
| 超过 1 分钟未触发 | Shadowrocket 被系统挂起 | 把 Shadowrocket 拉到前台等待 |
| 始终不触发 | 通知权限关闭 | iOS 设置 → 通知 → Shadowrocket |

### 查看脚本日志

Shadowrocket → 首页 → 最近请求 → 点击对应条目 → 查看 `console.log` 输出。

也可开启实时日志：Shadowrocket → 设置 → 详细日志。

---

## 文件结构

```
shadowrocket-modules/
├── TestTools.sgmodule      # 模块配置文件
└── Script/
    ├── baidu-test.js       # HTTP 请求拦截测试脚本（触发：httpbin.org/get）
    └── cron-test.js        # 定时任务测试脚本（每分钟执行）
```
