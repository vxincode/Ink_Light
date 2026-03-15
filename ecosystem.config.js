/**
 * PM2 生态系统配置文件
 * 用于宝塔面板 PM2 管理器部署
 *
 * 使用方法:
 * 1. 宝塔面板 -> 软件商店 -> PM2管理器 -> 设置
 * 2. 添加项目 -> 选择项目目录 -> 选择此配置文件
 *
 * 或命令行:
 * pm2 start ecosystem.config.js
 * pm2 save
 */

module.exports = {
  apps: [
    {
      name: 'ink-light-blog',
      script: 'npm',
      args: 'run start',
      cwd: './',

      // 环境变量 (可选，优先使用 .env 文件)
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // 实例数量 (根据服务器配置调整)
      instances: 1,

      // 执行模式
      exec_mode: 'fork',

      // 自动重启
      watch: false,
      ignore_watch: ['node_modules', '.next', 'public/uploads'],

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
      listen_timeout: 10000,
      kill_timeout: 5000,

      // 环境变量文件
      env_file: '.env',
    }
  ]
}
