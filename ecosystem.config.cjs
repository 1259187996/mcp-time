module.exports = {
  apps: [{
    name: "mcp-time",
    script: "./index.js",
    instances: 1,
    exec_mode: "cluster",
    watch: true,
    env: {
      NODE_ENV: "production",
      DEFAULT_TIMEZONE: "Asia/Shanghai"
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    time: true
  }]
};