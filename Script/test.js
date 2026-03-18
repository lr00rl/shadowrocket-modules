/*
 * HTTP 响应拦截测试脚本
 *
 * 触发条件：Safari 访问 https://httpbin.org/get
 * 验证方式：查看响应 body，应包含 shadowrocket_test 字段
 */

const body = JSON.parse($response.body);

body.shadowrocket_test = {
  ok: true,
  time: new Date().toLocaleString(),
  script: "test.js"
};

$done({ body: JSON.stringify(body) });
