/*
 * 百度请求测试脚本
 *
 * 触发条件：访问 https://www.baidu.com
 * 收到通知 → 脚本功能正常
 * 无通知   → 检查 MITM 证书是否安装并信任
 */

$notification.post(
    "✅ 脚本测试成功",
    "Shadowrocket 脚本功能正常",
    "URL: " + $request.url
);

console.log("[BaiduTest] 触发，URL: " + $request.url);

$done({});
