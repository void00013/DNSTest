// DNS 测试 Web Worker
import { 
  testDNS, 
  initDNSPerformanceData, 
  updateDNSPerformanceData 
} from '../utils/dns-test'
import dnsList from '../utils/dns-list'
import type { DNSRecord, DNSPerformanceData, TestOptions } from '../utils/dns-types'

// 监听来自主线程的消息
self.addEventListener('message', async (event) => {
  const { action, payload } = event.data

  switch (action) {
    case 'START_TEST':
      await startTest(payload)
      break
    default:
      break
  }
})

// 执行测试
const startTest = async (options: TestOptions) => {
  const { domain, rounds, retry, interval } = options
  
  // 发送测试开始消息
  self.postMessage({ type: 'TEST_STARTED' })
  
  // 初始化DNS性能数据
  let dnsPerformanceList: DNSPerformanceData[] = dnsList.map(record => initDNSPerformanceData(record))
  
  // 记录测试开始时间
  const testStartTime = Date.now()
  
  // 执行多轮测试 (注意：rounds是轮次数，从1开始计数)
  for (let round = 0; round < rounds; round++) {
    // 发送轮次开始消息
    self.postMessage({ 
      type: 'ROUND_STARTED', 
      payload: { round: round + 1, totalRounds: rounds } 
    })
    
    // 执行单轮测试
    await runTestRound(round, domain, retry, dnsPerformanceList)
    
    // 发送轮次结果更新
    self.postMessage({ 
      type: 'ROUND_COMPLETED', 
      payload: { round: round + 1, dnsList: dnsPerformanceList } 
    })
    
    // 轮次间隔（最后一轮不需要间隔）
    if (round < rounds - 1) {
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
  
  // 计算测试总时间
  const testDuration = Date.now() - testStartTime
  
  // 更新QPS和得分（不调用updateDNSPerformanceData以避免增加totalCount）
  dnsPerformanceList.forEach(data => {
    // 直接计算QPS，不调用updateDNSPerformanceData
    data.qps = data.successCount / (testDuration / 1000);
    
    // 计算得分
    const latencyScore = Math.max(0, 100 - (data.averageLatency / 10))
    const accuracyScore = data.totalCount > 0 ? (data.successCount / data.totalCount) * 100 : 0
    const qpsScore = Math.min(100, data.qps * 10)
    data.score = (
      latencyScore * 0.4 +
      accuracyScore * 0.3 +
      qpsScore * 0.3
    )
  })
  
  // 按得分排序
  dnsPerformanceList.sort((a, b) => b.score - a.score)
  
  // 发送测试完成消息
  self.postMessage({ 
    type: 'TEST_COMPLETED', 
    payload: { dnsList: dnsPerformanceList } 
  })
}

// 执行单轮测试
const runTestRound = async (
  round: number, 
  domain: string, 
  retry: number, 
  dnsList: DNSPerformanceData[]
) => {
  // 创建所有测试Promise
  const testPromises = dnsList.map(async (data) => {
    for (let attempt = 0; attempt < retry; attempt++) {
      try {
        const latency = await testDNS(
          { ip: data.ip, name: data.name, dohUrl: data.dohUrl },
          domain
        )

        console.log(latency);
        
        
        // 更新性能数据
        updateDNSPerformanceData(data, latency, 1000) // 简化处理，假设每次测试1秒
        break // 成功则跳出重试循环
      } catch (error) {
        console.warn(`测试失败 (${data.name}, 轮次${round+1}, 尝试${attempt+1}):`, error.message || error)
        // 最后一次尝试失败，记录失败数据
        if (attempt === retry) {
          updateDNSPerformanceData(data, null, 1000) // 记录失败
        }
        // 指数退避
        if (attempt < retry) {
          const backoff = Math.pow(2, attempt) * 500 // 500ms, 1s, 2s...
          await new Promise(resolve => setTimeout(resolve, backoff))
        }
      }
    }
  })
  
  // 并发执行所有测试
  await Promise.all(testPromises)
}

export default {}