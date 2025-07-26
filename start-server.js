// 后端服务启动脚本
const { spawn } = require('child_process');
const path = require('path');

// 启动后端服务
const backend = spawn('node', ['server.js'], {
  cwd: path.resolve(__dirname),
  stdio: 'inherit'
});

backend.on('error', (error) => {
  console.error('后端服务启动失败:', error);
});

backend.on('close', (code) => {
  console.log(`后端服务退出，退出码: ${code}`);
});