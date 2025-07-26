// DNS 测试相关类型定义
export interface DNSPerformanceData {
  ip: string;
  name: string;
  dohUrl?: string; // 可选属性，与dns-list.ts保持一致
  // 测试结果
  latency: number[]; // 每轮延迟
  averageLatency: number; // 平均延迟
  successCount: number; // 成功次数
  totalCount: number; // 总测试次数
  qps: number; // 查询每秒
  score: number; // 最终得分
  // 状态
  isTesting: boolean;
  isCompleted: boolean;
}

export interface TestOptions {
  domain: string;
  rounds: number;
  retry: number;
  interval: number;
}

export interface TestResult {
  dnsList: DNSPerformanceData[];
  isRunning: boolean;
  currentRound: number;
  totalRounds: number;
}