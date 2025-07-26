const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// DoH代理端点
app.post('/doh-proxy', async (req, res) => {
  // 动态导入node-fetch
  const fetch = (await import('node-fetch')).default;
  
  const { url, body } = req.body;
  
  // 验证URL是否为合法的DoH端点
  const validDoHUrls = [
    'https://dns.alidns.com/dns-query',
    'https://doh.pub/dns-query',
    'https://doh.360.cn/dns-query',
    'https://dns.189.cn/dns-query'
    // 注释掉有问题的DNS服务器
    // 'https://dns.114dns.com/dns-query',
    // 'https://cmcc-dns.do/dns-query',
    // 'https://doh.onedns.net/dns-query'
  ];
  
  if (!validDoHUrls.includes(url)) {
    return res.status(400).json({ error: 'Invalid DoH URL' });
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/dns-message',
        'Accept': 'application/dns-message'
      },
      body: Buffer.from(body.data)
    });
    
    // 对于所有响应，包括412错误，我们都应该将响应传递回前端
    const arrayBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'application/dns-message');
    res.status(response.status).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('DoH请求错误:', error);
    res.status(502).json({ 
      error: 'DoH request failed', 
      message: error.message,
      type: error.type || 'unknown',
      code: error.code || 'UNKNOWN'
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`DNS代理服务器运行在端口 ${PORT}`);
});