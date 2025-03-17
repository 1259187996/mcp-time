/**
 * MCP-Time 服务器
 * 
 * 这是一个基于模型上下文协议（Model Context Protocol）的 Node.js 服务器，
 * 专门用于处理时间相关的查询。当大语言模型在对话中遇到时间相关的问题时，
 * 它会调用这个 MCP 服务器来获取准确的时间信息。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";
import { z } from "zod";
import timeUtils from './timeUtils.js';
import http from 'http';

// 创建 MCP 服务器
const server = new McpServer({
  name: "MCP-Time",
  version: "1.0.0",
  description: "时间查询服务，提供当前时间、日期、时区转换等功能"
});

// 获取当前时间工具
server.tool(
  "getCurrentTime",
  {
    timezone: z.string().optional().describe("时区标识符，如 'Asia/Shanghai'")
  },
  async ({ timezone }) => {
    const timeInfo = timeUtils.getCurrentTime(timezone);
    
    let responseText = `当前时间是 ${timeInfo.time}，${timeInfo.date} ${timeInfo.weekday}`;
    if (timezone) {
      responseText += `（${timezone}时区）`;
    }
    
    return {
      content: [{ type: "text", text: responseText }],
      data: timeInfo
    };
  }
);

// 获取指定城市时间工具
server.tool(
  "getCityTime",
  {
    city: z.string().describe("城市名称，如'北京'、'纽约'等")
  },
  async ({ city }) => {
    const cityTimeInfo = timeUtils.getCityTime(city);
    
    if (!cityTimeInfo) {
      return {
        content: [{ type: "text", text: `抱歉，我不知道${city}的时区信息。` }]
      };
    }
    
    const responseText = `${city}当前时间是 ${cityTimeInfo.time}，${cityTimeInfo.date} ${cityTimeInfo.weekday}`;
    
    return {
      content: [{ type: "text", text: responseText }],
      data: cityTimeInfo
    };
  }
);

// 计算城市时差工具
server.tool(
  "getTimeDifference",
  {
    cityA: z.string().describe("第一个城市名称"),
    cityB: z.string().describe("第二个城市名称")
  },
  async ({ cityA, cityB }) => {
    const diffInfo = timeUtils.getTimeDifference(cityA, cityB);
    
    if (!diffInfo) {
      return {
        content: [{ type: "text", text: `抱歉，我无法计算${cityA}和${cityB}之间的时差。请确保城市名称正确。` }]
      };
    }
    
    return {
      content: [{ type: "text", text: diffInfo.message }],
      data: diffInfo
    };
  }
);

// 计算相对日期工具
server.tool(
  "getRelativeDate",
  {
    days: z.number().describe("天数偏移量，正数为未来，负数为过去"),
    timezone: z.string().optional().describe("时区标识符")
  },
  async ({ days, timezone }) => {
    const dateInfo = timeUtils.getRelativeDate(days, timezone);
    
    let responseText = `${dateInfo.relativeText}是 ${dateInfo.date} ${dateInfo.weekday}`;
    if (timezone) {
      responseText += `（${timezone}时区）`;
    }
    
    return {
      content: [{ type: "text", text: responseText }],
      data: dateInfo
    };
  }
);

// 获取指定日期星期几工具
server.tool(
  "getWeekday",
  {
    date: z.string().describe("日期字符串，如 '2023-01-01' 或 '2023年1月1日'")
  },
  async ({ date }) => {
    const weekdayInfo = timeUtils.getWeekday(date);
    
    if (weekdayInfo.error) {
      return {
        content: [{ type: "text", text: weekdayInfo.error }]
      };
    }
    
    const responseText = `${date} 是 ${weekdayInfo.weekday}`;
    
    return {
      content: [{ type: "text", text: responseText }],
      data: weekdayInfo
    };
  }
);

// 自然语言时间查询解析工具
server.tool(
  "parseTimeQuery",
  {
    query: z.string().describe("自然语言时间查询，如'现在几点了'、'北京时间'等")
  },
  async ({ query }) => {
    const result = timeUtils.parseTimeQuery(query);
    
    let responseText = "";
    let data = null;
    
    switch (result.type) {
      case 'current_time':
        data = result.data;
        responseText = `当前时间是 ${data.time}，${data.date} ${data.weekday}`;
        break;
        
      case 'city_time':
        data = result.data;
        if (!data) {
          responseText = `抱歉，我不知道${result.city}的时区信息。`;
        } else {
          responseText = `${result.city}当前时间是 ${data.time}，${data.date} ${data.weekday}`;
        }
        break;
        
      case 'time_difference':
        data = result.data;
        if (!data) {
          responseText = `抱歉，我无法计算${result.cityA}和${result.cityB}之间的时差。`;
        } else {
          responseText = data.message;
        }
        break;
        
      case 'relative_date':
        data = result.data;
        responseText = `${data.relativeText}是 ${data.date} ${data.weekday}`;
        break;
        
      case 'date_weekday':
        data = result.data;
        if (data.error) {
          responseText = data.error;
        } else {
          responseText = `${result.date} 是 ${data.weekday}`;
        }
        break;
        
      case 'unknown':
      default:
        responseText = `抱歉，我无法理解您的时间查询："${query}"`;
        break;
    }
    
    return {
      content: [{ type: "text", text: responseText }],
      data: data
    };
  }
);

// 获取所有支持的城市列表
server.tool(
  "getSupportedCities",
  {},
  async () => {
    const cities = Object.keys(timeUtils.TIMEZONE_MAP);
    const responseText = `支持的城市列表：${cities.join('、')}`;
    
    return {
      content: [{ type: "text", text: responseText }],
      data: { cities }
    };
  }
);

// 配置服务器端口
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 创建 HTTP 服务器
const httpServer = http.createServer();
const transport = new HttpServerTransport(httpServer);

// 启动服务器
try {
  await server.connect(transport);
  httpServer.listen(PORT, HOST, () => {
    console.log(`MCP-Time 服务器已启动，监听 ${HOST}:${PORT}`);
  });
} catch (error) {
  console.error("MCP-Time 服务器启动失败:", error);
  process.exit(1);
}