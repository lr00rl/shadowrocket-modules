/*
 * 定时任务测试脚本
 *
 * 触发条件：每分钟执行一次（cronexp="* * * * *"）
 */

const now = new Date().toLocaleString();

$notification.post(
    "⏰ 定时任务触发",
    now,
    "脚本执行成功"
);

console.log("[CronTest] 执行时间: " + now);

$done();
