/**
 * PM2 生态系统配置文件
 * 用于宝塔面板 PM2 管理器部署
 *
 * 部署步骤:
 * 1. cd /www/wwwroot/Ink_Light
 * 2. npm install
 * 3. npm run build   <-- 必须先构建
 * 4. pm2 start ecosystem.config.js
 * 5. pm2 save
 */

module.exports = {
  apps: [
    {
      name: 'ink-light-blog',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',

      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // 实例数量 (根据服务器配置调整，建议设为 CPU 核心数或 1)
      instances: 1,

      // 执行模式
      exec_mode: 'fork',

      // 不监听文件变化
      watch: false,

      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,

      // 重启策略
      max_memory_restart: '500M',
      restart_delay: 3000,
      autorestart: true,
      max_restarts: 10,

      // 启动超时
      listen_timeout: 30000,
      kill_timeout: 5000,

      // 崩溃时不立即重启，等待 restart_delay
      exp_backoff_restart_delay: true,
    }
  ]
}
