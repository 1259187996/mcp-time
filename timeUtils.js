/**
 * timeUtils.js - 时间处理工具函数
 * 
 * 本文件包含处理时间和日期的各种实用函数，用于 MCP-Time 服务器
 */

// 常用时区映射表（城市名到时区标识符）
const TIMEZONE_MAP = {
  '北京': 'Asia/Shanghai',
  '上海': 'Asia/Shanghai',
  '广州': 'Asia/Shanghai',
  '香港': 'Asia/Hong_Kong',
  '台北': 'Asia/Taipei',
  '东京': 'Asia/Tokyo',
  '首尔': 'Asia/Seoul',
  '新加坡': 'Asia/Singapore',
  '悉尼': 'Australia/Sydney',
  '莫斯科': 'Europe/Moscow',
  '伦敦': 'Europe/London',
  '巴黎': 'Europe/Paris',
  '柏林': 'Europe/Berlin',
  '罗马': 'Europe/Rome',
  '纽约': 'America/New_York',
  '洛杉矶': 'America/Los_Angeles',
  '芝加哥': 'America/Chicago',
  '多伦多': 'America/Toronto',
  '墨西哥城': 'America/Mexico_City',
  '里约热内卢': 'America/Sao_Paulo',
  '开罗': 'Africa/Cairo',
  '约翰内斯堡': 'Africa/Johannesburg',
  '迪拜': 'Asia/Dubai',
  '孟买': 'Asia/Kolkata',
  '曼谷': 'Asia/Bangkok'
};

// 中文星期几映射
const WEEKDAY_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/**
 * 获取当前时间，可指定时区
 * @param {string} timezone - 时区标识符，默认为本地时区
 * @returns {Object} 包含格式化时间信息的对象
 */
export function getCurrentTime(timezone = undefined) {
  const now = new Date();
  
  let formattedTime;
  let formattedDate;
  let weekday;
  
  if (timezone) {
    // 使用指定时区格式化时间
    const options = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    formattedTime = now.toLocaleTimeString('zh-CN', options);
    
    // 格式化日期
    const dateOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    formattedDate = now.toLocaleDateString('zh-CN', dateOptions);
    
    // 获取星期几
    const weekdayOptions = {
      timeZone: timezone,
      weekday: 'long'
    };
    weekday = now.toLocaleDateString('zh-CN', weekdayOptions).split(' ')[0];
  } else {
    // 使用本地时区
    formattedTime = now.toLocaleTimeString('zh-CN', { hour12: false });
    formattedDate = now.toLocaleDateString('zh-CN');
    weekday = WEEKDAY_CN[now.getDay()];
  }
  
  return {
    time: formattedTime,
    date: formattedDate,
    weekday: weekday,
    timestamp: now.getTime(),
    iso: now.toISOString()
  };
}

/**
 * 根据城市名获取时区标识符
 * @param {string} city - 城市名称
 * @returns {string|null} 时区标识符或 null（如果未找到）
 */
export function getTimezoneByCity(city) {
  return TIMEZONE_MAP[city] || null;
}

/**
 * 获取指定城市的当前时间
 * @param {string} city - 城市名称
 * @returns {Object|null} 时间信息对象或 null（如果城市未找到）
 */
export function getCityTime(city) {
  const timezone = getTimezoneByCity(city);
  if (!timezone) return null;
  
  const timeInfo = getCurrentTime(timezone);
  return {
    ...timeInfo,
    city: city,
    timezone: timezone
  };
}

/**
 * 计算两个城市之间的时差（小时）
 * @param {string} cityA - 第一个城市名称
 * @param {string} cityB - 第二个城市名称
 * @returns {Object|null} 时差信息或 null（如果任一城市未找到）
 */
export function getTimeDifference(cityA, cityB) {
  const timezoneA = getTimezoneByCity(cityA);
  const timezoneB = getTimezoneByCity(cityB);
  
  if (!timezoneA || !timezoneB) return null;
  
  const now = new Date();
  
  // 获取两个城市的当前时间
  const optionsA = { timeZone: timezoneA, hour: 'numeric', minute: 'numeric', hour12: false };
  const optionsB = { timeZone: timezoneB, hour: 'numeric', minute: 'numeric', hour12: false };
  
  const timeA = new Date(now.toLocaleString('en-US', optionsA));
  const timeB = new Date(now.toLocaleString('en-US', optionsB));
  
  // 计算时差（小时）
  const diffHours = (timeB - timeA) / (1000 * 60 * 60);
  
  return {
    cityA: cityA,
    cityB: cityB,
    timezoneA: timezoneA,
    timezoneB: timezoneB,
    diffHours: diffHours,
    diffMinutes: diffHours * 60,
    message: `${cityB}比${cityA}${diffHours > 0 ? '快' : '慢'}${Math.abs(diffHours)}小时`
  };
}

/**
 * 计算特定日期
 * @param {number} days - 天数偏移量（正数为未来，负数为过去）
 * @param {string} timezone - 可选时区
 * @returns {Object} 日期信息
 */
export function getRelativeDate(days, timezone = undefined) {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + days);
  
  let formattedDate;
  let weekday;
  
  if (timezone) {
    // 使用指定时区格式化日期
    const dateOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    formattedDate = targetDate.toLocaleDateString('zh-CN', dateOptions);
    
    // 获取星期几
    const weekdayOptions = {
      timeZone: timezone,
      weekday: 'long'
    };
    weekday = targetDate.toLocaleDateString('zh-CN', weekdayOptions).split(' ')[0];
  } else {
    // 使用本地时区
    formattedDate = targetDate.toLocaleDateString('zh-CN');
    weekday = WEEKDAY_CN[targetDate.getDay()];
  }
  
  const relativeText = days === 0 ? '今天' : 
                       days === 1 ? '明天' : 
                       days === 2 ? '后天' : 
                       days === -1 ? '昨天' : 
                       days === -2 ? '前天' : 
                       days > 0 ? `${days}天后` : `${Math.abs(days)}天前`;
  
  return {
    date: formattedDate,
    weekday: weekday,
    relativeText: relativeText,
    iso: targetDate.toISOString()
  };
}

/**
 * 获取指定日期的星期几
 * @param {string} dateString - 日期字符串（格式：YYYY-MM-DD 或 YYYY/MM/DD）
 * @returns {Object} 日期信息
 */
export function getWeekday(dateString) {
  // 处理中文日期格式（如 2023年1月1日）
  if (dateString.includes('年')) {
    dateString = dateString
      .replace('年', '-')
      .replace('月', '-')
      .replace('日', '');
  }
  
  // 处理斜杠分隔的日期
  if (dateString.includes('/')) {
    dateString = dateString.replace(/\//g, '-');
  }
  
  const date = new Date(dateString);
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return { error: '无效的日期格式' };
  }
  
  const weekday = WEEKDAY_CN[date.getDay()];
  const formattedDate = date.toLocaleDateString('zh-CN');
  
  return {
    date: formattedDate,
    weekday: weekday,
    iso: date.toISOString().split('T')[0]
  };
}

/**
 * 解析自然语言时间查询
 * @param {string} query - 自然语言时间查询
 * @returns {Object} 解析结果
 */
export function parseTimeQuery(query) {
  // 当前时间查询
  if (/现在几点|当前时间|现在时间|几点了/.test(query)) {
    return {
      type: 'current_time',
      data: getCurrentTime()
    };
  }
  
  // 特定城市时间查询
  const cityMatch = query.match(/(北京|上海|广州|香港|东京|纽约|伦敦|巴黎|洛杉矶|悉尼|莫斯科|新加坡|柏林|罗马|首尔|多伦多|墨西哥城|里约热内卢|开罗|约翰内斯堡|迪拜|孟买|曼谷|台北)(?:的)?(?:时间|几点了)/);
  if (cityMatch) {
    const city = cityMatch[1];
    return {
      type: 'city_time',
      city: city,
      data: getCityTime(city)
    };
  }
  
  // 时差查询
  const diffMatch = query.match(/(北京|上海|广州|香港|东京|纽约|伦敦|巴黎|洛杉矶|悉尼|莫斯科|新加坡|柏林|罗马|首尔|多伦多|墨西哥城|里约热内卢|开罗|约翰内斯堡|迪拜|孟买|曼谷|台北)和(北京|上海|广州|香港|东京|纽约|伦敦|巴黎|洛杉矶|悉尼|莫斯科|新加坡|柏林|罗马|首尔|多伦多|墨西哥城|里约热内卢|开罗|约翰内斯堡|迪拜|孟买|曼谷|台北)(?:之间)?(?:的)?时差/);
  if (diffMatch) {
    return {
      type: 'time_difference',
      cityA: diffMatch[1],
      cityB: diffMatch[2],
      data: getTimeDifference(diffMatch[1], diffMatch[2])
    };
  }
  
  // 相对日期查询（明天、后天、三天后等）
  const relativeDayMatch = query.match(/(今天|明天|后天|大后天|昨天|前天|大前天|(\d+)天[后前])/);
  if (relativeDayMatch) {
    let days = 0;
    if (relativeDayMatch[1] === '今天') days = 0;
    else if (relativeDayMatch[1] === '明天') days = 1;
    else if (relativeDayMatch[1] === '后天') days = 2;
    else if (relativeDayMatch[1] === '大后天') days = 3;
    else if (relativeDayMatch[1] === '昨天') days = -1;
    else if (relativeDayMatch[1] === '前天') days = -2;
    else if (relativeDayMatch[1] === '大前天') days = -3;
    else if (relativeDayMatch[1].includes('天后')) days = parseInt(relativeDayMatch[2]);
    else if (relativeDayMatch[1].includes('天前')) days = -parseInt(relativeDayMatch[2]);
    
    return {
      type: 'relative_date',
      days: days,
      data: getRelativeDate(days)
    };
  }
  
  // 特定日期星期查询
  const dateWeekdayMatch = query.match(/(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}[日]?)(?:是)?(?:星期几|周几|礼拜几)/);
  if (dateWeekdayMatch) {
    return {
      type: 'date_weekday',
      date: dateWeekdayMatch[1],
      data: getWeekday(dateWeekdayMatch[1])
    };
  }
  
  // 无法识别的查询
  return {
    type: 'unknown',
    query: query
  };
}

// 导出所有函数
export default {
  getCurrentTime,
  getTimezoneByCity,
  getCityTime,
  getTimeDifference,
  getRelativeDate,
  getWeekday,
  parseTimeQuery,
  TIMEZONE_MAP,
  WEEKDAY_CN
}; 