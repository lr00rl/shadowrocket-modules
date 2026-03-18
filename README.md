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

#### 1. 百度请求测试（`baidu-test.js`）

- **触发方式**：HTTP 请求拦截（`http-request`）
- **触发条件**：访问 `https://www.baidu.com`
- **依赖**：需要 MITM（中间人解密），模块已自动将 `www.baidu.com` 加入 hostname
- **预期结果**：收到系统通知「✅ 脚本测试成功」

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

## 使用步骤（百度测试）

1. 确保 Shadowrocket 已连接代理
2. 确认 TestTools 模块已启用（模块列表中勾选状态）
3. 用 **Safari** 访问 `https://www.baidu.com`（不要用 Chrome，部分第三方浏览器会绕过代理）
4. 等待 2–3 秒，观察是否收到通知

---

## Debug 指南

### 百度测试收不到通知

| 现象 | 可能原因 | 排查方法 |
|------|----------|----------|
| 完全没有通知 | MITM 未生效 | 前往 Shadowrocket → HTTPS 解密，确认开关开启且 `www.baidu.com` 在列表中 |
| 完全没有通知 | 证书未信任 | iOS 设置 → 通用 → VPN 与设备管理，找到 Shadowrocket 证书，确认为「已信任」 |
| 完全没有通知 | 脚本未加载 | Shadowrocket → 模块，确认 TestTools 处于勾选状态 |
| 完全没有通知 | 通知权限关闭 | iOS 设置 → 通知 → Shadowrocket，确认允许通知 |
| 完全没有通知 | 用了非 Safari 浏览器 | 改用 Safari 触发，确保请求走代理 |
| 模块安装时报错 | 网络问题或链接失效 | 确认 GitHub 可访问，或检查仓库 raw 链接是否正确 |

### 定时任务收不到通知

| 现象 | 可能原因 | 排查方法 |
|------|----------|----------|
| 超过 1 分钟未触发 | Shadowrocket 被系统挂起 | 进入 Shadowrocket 前台后等待，或检查后台刷新设置 |
| 通知权限关闭 | 同上 | iOS 设置 → 通知 → Shadowrocket |

### 查看脚本日志

Shadowrocket → 首页 → 最近请求 → 找到对应条目 → 点击查看详情，可看到 `console.log` 输出。

也可以用以下方法实时查看：
- Shadowrocket → 设置 → 开启「详细日志」

---

## 文件结构

```
shadowrocket-modules/
├── TestTools.sgmodule      # 模块配置文件
└── Script/
    ├── baidu-test.js       # 百度请求拦截测试脚本
    └── cron-test.js        # 定时任务测试脚本
```
