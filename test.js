/**
 * MCP-Time 服务器测试脚本
 * 
 * 这个脚本用于测试 MCP-Time 服务器的各种功能
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';
import { PipeClientTransport } from '@modelcontextprotocol/sdk/client/pipe.js';

// 测试查询列表
const TEST_QUERIES = [
  "现在几点了？",
  "北京时间是几点？",
  "纽约和东京的时差是多少？",
  "三天后是几月几号？",
  "2023年1月1日是星期几？"
];

async function runTest() {
  console.log("启动 MCP-Time 服务器测试...");
  
  // 启动 MCP 服务器进程
  const serverProcess = spawn('node', ['index.js'], {
    stdio: ['pipe', 'pipe', process.stderr]
  });
  
  // 创建 MCP 客户端
  const transport = new PipeClientTransport({
    toServer: serverProcess.stdin,
    fromServer: serverProcess.stdout
  });
  
  const client = new McpClient();
  await client.connect(transport);
  
  console.log("MCP 客户端已连接到服务器");
  console.log("服务器信息:", client.serverInfo);
  console.log("可用工具:", Object.keys(client.tools));
  
  // 测试各个工具
  console.log("\n===== 工具测试 =====");
  
  // 测试 getCurrentTime
  console.log("\n1. 测试 getCurrentTime 工具");
  const currentTimeResult = await client.tools.getCurrentTime({});
  console.log("结果:", currentTimeResult.content[0].text);
  
  // 测试 getCityTime
  console.log("\n2. 测试 getCityTime 工具");
  const cityTimeResult = await client.tools.getCityTime({ city: "北京" });
  console.log("结果:", cityTimeResult.content[0].text);
  
  // 测试 getTimeDifference
  console.log("\n3. 测试 getTimeDifference 工具");
  const timeDiffResult = await client.tools.getTimeDifference({ cityA: "北京", cityB: "纽约" });
  console.log("结果:", timeDiffResult.content[0].text);
  
  // 测试 getRelativeDate
  console.log("\n4. 测试 getRelativeDate 工具");
  const relativeDateResult = await client.tools.getRelativeDate({ days: 3 });
  console.log("结果:", relativeDateResult.content[0].text);
  
  // 测试 getWeekday
  console.log("\n5. 测试 getWeekday 工具");
  const weekdayResult = await client.tools.getWeekday({ date: "2023-01-01" });
  console.log("结果:", weekdayResult.content[0].text);
  
  // 测试 parseTimeQuery
  console.log("\n6. 测试 parseTimeQuery 工具");
  console.log("测试自然语言查询:");
  
  for (const query of TEST_QUERIES) {
    console.log(`\n查询: "${query}"`);
    const parseResult = await client.tools.parseTimeQuery({ query });
    console.log("结果:", parseResult.content[0].text);
  }
  
  // 测试 getSupportedCities
  console.log("\n7. 测试 getSupportedCities 工具");
  const citiesResult = await client.tools.getSupportedCities({});
  console.log("结果:", citiesResult.content[0].text);
  
  // 关闭连接和进程
  await transport.close();
  serverProcess.kill();
  
  console.log("\n测试完成！");
}

// 运行测试
runTest().catch(error => {
  console.error("测试失败:", error);
  process.exit(1);
}); 