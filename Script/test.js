/*
 * HTTP 请求拦截测试脚本
 *
 * 触发条件：Safari 访问 https://httpbin.org/get
 * 收到通知 → 脚本功能正常
 * 无通知   → 见 README Debug 指南
 *
 * 为什么不用 baidu.com：
 * Safari 访问 Baidu 会优先走 QUIC（HTTP/3，UDP 443），
 * Shadowrocket MITM 只拦截 TCP，QUIC 流量完全绕过，脚本永远不触发。
 */

$notification.post(
    "✅ 脚本测试成功",
    "Shadowrocket 脚本功能正常",
    "URL: " + $request.url
);

console.log("[HttpbinTest] 触发，URL: " + $request.url);

$done({});
