import { DNSPerformanceData } from './dns-types';
import { ref, reactive } from 'vue';
import { DNSRecord, DNSPerformanceData, TestOptions, TestResult } from '../utils/dns-types';
import dnsList from '../utils/dns-list';
import { testDNS, initDNSPerformanceData, updateDNSPerformanceData } from '../utils/dns-test';
import { calculateScore } from '../utils/scoring';

// 默认测试选项
const DEFAULT_OPTIONS: TestOptions = {
  domain: 'www.baidu.com',
  rounds: 3,
  retry: 3,
  interval: 1000
};

// 测试结果
const testResult = reactive<TestResult>({
  dnsList: [],
  isRunning: false,
  currentRound: 0,
  totalRounds: 0
});

// 测试选项
const testOptions = reactive<TestOptions>({ ...DEFAULT_OPTIONS });

// 初始化测试数据
const initTestData = () => {
  testResult.dnsList = dnsList.map(initDNSPerformanceData);
  testResult.currentRound = 0;
  testResult.totalRounds = 0;
};

// 开始测试
const startTest = async () => {
  if (testResult.isRunning) return;

  // 重置测试数据
  initTestData();
  
  testResult.isRunning = true;
  testResult.totalRounds = testOptions.rounds;
  
  try {
    // 执行多轮测试
    for (let round = 1; round <= testOptions.rounds; round++) {
      if (!testResult.isRunning) break;
      
      testResult.currentRound = round;
      
      // 并发测试所有DNS服务器
      const testPromises = testResult.dnsList.map(async (dns) => {
        if (!testResult.isRunning) return;
        
        let success = false;
        let latency: number | null = null;
        
        // 重试机制
        for (let retry = 0; retry < testOptions.retry && !success; retry++) {
          if (!testResult.isRunning) break;
          
          try {
            const startTime = Date.now();
            const result = await testDNS(dns, testOptions.domain);
            const endTime = Date.now();
            
            latency = result;
            success = true;
            
            // 更新DNS性能数据
            updateDNSPerformanceData(dns, latency, endTime - startTime);
          } catch (error) {
            console.error(`测试 ${dns.name} 失败 (尝试 ${retry + 1}/${testOptions.retry}):`, error);
            
            // 如果是最后一次重试，记录失败
            if (retry === testOptions.retry - 1) {
              updateDNSPerformanceData(dns, null, 0);
            }
          }
        }
      });
      
      // 等待本轮所有测试完成
      await Promise.all(testPromises);
      
      // 轮次间隔
      if (round < testOptions.rounds && testResult.isRunning) {
        await new Promise(resolve => setTimeout(resolve, testOptions.interval));
      }
    }
    
    // 计算最终得分
    const testEndTime = Date.now();
    testResult.dnsList.forEach(dns => {
      dns.score = calculateScore(dns, testEndTime);
      dns.isCompleted = true;
    });
    
    // 按得分排序
    testResult.dnsList.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  } finally {
    testResult.isRunning = false;
    testResult.currentRound = testResult.totalRounds;
  }
};

// 停止测试
const stopTest = () => {
  testResult.isRunning = false;
};

// 重置测试
const resetTest = () => {
  stopTest();
  initTestData();
};

// 初始化测试数据
initTestData();

// 导出函数，创建并返回测试相关的响应式数据和方法
export function useDNSTest() {
  return {
    testOptions,
    testResult,
    startTest,
    stopTest,
    resetTest
  };
}

/**
 * 模拟DNS查询测试
 * @param dnsServer DNS服务器信息
 * @param domain 要查询的域名
 * @param timeout 超时时间（毫秒）
 * @returns 返回延迟时间（毫秒）
 */
export function testDNS(dnsServer: { ip: string; name: string; dohUrl?: string }, domain: string, timeout: number = 5000): Promise<number> {
  return new Promise((resolve, reject) => {
    // 模拟不同DNS服务器的延迟
    // 实际实现应使用真实的DNS查询
    const simulatedLatency = Math.random() * 100; // 模拟0-100ms的延迟
    
    // 模拟网络请求
    setTimeout(() => {
      // 模拟一些失败情况
      if (Math.random() < 0.1) { // 10% 的失败率
        reject(new Error('Network error'));
      } else {
        resolve(simulatedLatency);
      }
    }, simulatedLatency);
  });
}

/**
 * 计算DNS得分
 * @param data DNS性能数据
 * @returns 得分
 */
export function calculateScore(data: DNSPerformanceData): number {
  if (data.latency.length === 0) return 0;
  
  // 计算平均延迟
  const avgLatency = data.latency.reduce((a, b) => a + b, 0) / data.latency.length;
  
  // 计算成功率
  const successRate = data.successCount / data.totalCount;
  
  // 得分计算公式：
  // 70% 权重给平均延迟（越低越好）
  // 30% 权重给成功率（越高越好）
  const latencyScore = Math.max(0, 100 - (avgLatency / 10)); // 假设平均延迟最大值为1000ms
  const successRateScore = successRate * 100;
  
  return Math.round((latencyScore * 0.7) + (successRateScore * 0.3));
}

/**
 * 初始化DNS性能数据
 * @param record DNS记录
 * @returns 初始化后的性能数据
 */
export function initDNSPerformanceData(record: { ip: string; name: string; dohUrl?: string }): DNSPerformanceData {
  return {
    ...record,
    latency: [],
    averageLatency: 0,
    successCount: 0,
    totalCount: 0,
    score: 0,
    isTesting: false,
    isCompleted: false
  };
}

/**
 * 更新DNS性能数据
 * @param dns DNS性能数据
 * @param latency 延迟时间（毫秒）
 * @param duration 测试持续时间（毫秒）
 */
export function updateDNSPerformanceData(dns: DNSPerformanceData, latency: number | null, duration: number) {
  dns.totalCount++;
  dns.isTesting = false;
  
  if (latency !== null) {
    dns.latency.push(latency);
    dns.successCount++;
  }
  
  dns.averageLatency = dns.latency.length > 0 ? dns.latency.reduce((a, b) => a + b, 0) / dns.latency.length : 0;
}

/**
 * DNS记录类型
 */
export interface DNSRecord {
  ip: string;
  name: string;
  dohUrl?: string;
}

/**
 * DNS性能数据类型
 */
export interface DNSPerformanceData {
  ip: string;
  name: string;
  dohUrl?: string;
  latency: number[];
  averageLatency: number;
  successCount: number;
  totalCount: number;
  score: number;
  isTesting?: boolean;
  isCompleted?: boolean;
}

/**
 * 测试选项类型
 */
export interface TestOptions {
  domain: string;
  rounds: number;
  retry: number;
  interval: number;
}

/**
 * 测试结果类型
 */
export interface TestResult {
  dnsList: DNSPerformanceData[];
  isRunning: boolean;
  currentRound: number;
  totalRounds: number;
}

/**
 * 测试消息类型
 */
export interface TestMessage {
  type: string;
  payload?: any;
}
