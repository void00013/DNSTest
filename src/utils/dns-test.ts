import type { DNSRecord, DNSPerformanceData, TestOptions } from './dns-types';
import { calculateQPS } from './scoring';

// 构造DNS查询请求
function buildDNSQuery(domain: string): ArrayBuffer {
  // 创建一个简单的DNS查询报文 (RFC 1035)
  const query = new Uint8Array(12 + domain.length + 2 + 4);
  let offset = 0;

  // Transaction ID (随机)
  const transactionId = Math.floor(Math.random() * 0xFFFF);
  query[offset++] = (transactionId >> 8) & 0xFF;
  query[offset++] = transactionId & 0xFF;

  // Flags (标准查询)
  query[offset++] = 0x01; // QR=0, Opcode=0, AA=0, TC=0, RD=1
  query[offset++] = 0x00; // RA=0, Z=0, RCODE=0

  // Questions (1个问题)
  query[offset++] = 0x00;
  query[offset++] = 0x01;

  // Answer RRs (0个回答)
  query[offset++] = 0x00;
  query[offset++] = 0x00;

  // Authority RRs (0个授权)
  query[offset++] = 0x00;
  query[offset++] = 0x00;

  // Additional RRs (0个附加)
  query[offset++] = 0x00;
  query[offset++] = 0x00;

  // QNAME (域名)
  const parts = domain.split('.');
  for (const part of parts) {
    query[offset++] = part.length;
    for (let i = 0; i < part.length; i++) {
      query[offset++] = part.charCodeAt(i);
    }
  }
  query[offset++] = 0x00; // 结束符

  // QTYPE (A记录)
  query[offset++] = 0x00;
  query[offset++] = 0x01;

  // QCLASS (IN)
  query[offset++] = 0x00;
  query[offset++] = 0x01;

  return query.buffer;
}

// 执行单次DNS查询测试（通过后端代理）
export async function testDNS(record: DNSRecord, domain: string, timeout: number = 5000): Promise<number> {
  const queryBuffer = buildDNSQuery(domain);
  const startTime = performance.now();

  try {
    // 使用后端代理而不是直接请求DoH端点
    const response = await fetch('/doh-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: record.dohUrl,
        body: {
          data: Array.from(new Uint8Array(queryBuffer))
        }
      })
    });

    // 对于412错误，我们将其视为测试失败而不是应用错误
    if (response.status === 412) {
      throw new Error('DNS server returned Precondition Failed (412)');
    }

    // 检查其他错误响应
    if (response.status >= 400 && response.status !== 412) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const endTime = performance.now();
    return endTime - startTime;
  } catch (error) {
    console.error(`测试 ${record.name} 失败:`, error);
    throw error;
  }
}

// 初始化DNS性能数据
export function initDNSPerformanceData(record: DNSRecord): DNSPerformanceData {
  return {
    ip: record.ip,
    name: record.name,
    dohUrl: record.dohUrl,
    latency: [],
    averageLatency: 0,
    successCount: 0,
    totalCount: 0,
    qps: 0,
    score: 0,
    isTesting: false,
    isCompleted: false
  };
}

// 计算平均延迟
export function calculateAverageLatency(latencies: (number | null | undefined)[]): number {
  if (latencies.length === 0) return 0;
  
  // 过滤掉无效值（null、undefined、9999等表示失败的值）
  const validLatencies = latencies.filter((latency): latency is number => 
    latency !== null && 
    latency !== undefined && 
    typeof latency === 'number' && 
    latency < 9999
  );
  
  if (validLatencies.length === 0) return 9999; // 如果没有有效值，返回失败标记值
  
  return validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length;
}

// 更新DNS性能数据
export function updateDNSPerformanceData(
  data: DNSPerformanceData, 
  latency: number | null, 
  testDuration: number
): void {
  // 注意：这个函数应该只在每次实际测试后调用一次
  if (latency !== null && latency < 9999) {
    // 成功的测试
    data.latency.push(latency);
    data.successCount++;
  } else {
    // 失败的测试
    data.latency.push(9999); // 记录高延迟表示失败
  }
  
  data.totalCount++;
  data.averageLatency = calculateAverageLatency(data.latency);
  data.qps = calculateQPS(data, testDuration);
}