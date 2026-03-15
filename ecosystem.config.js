/**
 * PM2 生态系统配置文件
 * 用于宝塔面板 PM2 管理器部署
 *
 * 宝塔面板配置步骤:
 * 1. 软件商店 -> PM2管理器 -> 设置
 * 2. 添加项目 -> 选择项目目录 (如: /www/wwwroot/ink-light-blog)
 * 3. 启动文件选择: ecosystem.config.js
 * 4. 项目名称: ink-light-blog
 * 5. 端口: 3000
 * 6. 提交
 *
 * 注意: 确保项目目录下已执行过 npm install 和 npm run build
 */

const path = require('path')

module.exports = {
  apps: [
    {
      name: 'ink-light-blog',
      // 使用 npm run start 启动，更可靠
      script: 'npm',
      args: 'run start',
      // 使用绝对路径
      cwd: __dirname,

      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // 实例数量
      instances: 1,

      // 执行模式
      exec_mode: 'fork',

      // 不监听文件变化
      watch: false,

      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: path.join(__dirname, 'logs', 'pm2-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2-out.log'),
      merge_logs: true,

      // 重启策略
      max_memory_restart: '500M',
      restart_delay: 3000,
      autorestart: true,
      max_restarts: 10,

      // 启动超时
      listen_timeout: 30000,
      kill_timeout: 5000,
    }
  ]
}
