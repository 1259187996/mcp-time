module.exports = {
    apps: [{
      name: 'mcp-time',
      script: 'index.js',
      env: {
        PORT: 3000,
        HOST: '0.0.0.0',
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true
    }]
  };