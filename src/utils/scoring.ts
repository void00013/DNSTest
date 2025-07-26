// 评分计算工具函数
import type { DNSPerformanceData } from './dns-types';

// 定义评分相关常量
const BASE_LATENCY = 100; // 基准延迟（ms）
const LATENCY_TO_SCORE_RATIO = 50; // 延迟评分转换比例
const MAX_QPS = 100; // 满分对应的QPS
const LATENCY_WEIGHT = 0.4; // 延迟权重
const ACCURACY_WEIGHT = 0.3; // 正确性权重
const QPS_WEIGHT = 0.3; // QPS权重

// 定义评分相关常量
const BASE_LATENCY = 100; // 基准延迟（ms）
const LATENCY_TO_SCORE_RATIO = 50; // 延迟评分转换比例
const MAX_QPS = 100; // 满分对应的QPS
const LATENCY_WEIGHT = 0.4; // 延迟权重
const ACCURACY_WEIGHT = 0.3; // 正确性权重
const QPS_WEIGHT = 0.3; // QPS权重

// 计算最终得分
export function calculateScore(data: DNSPerformanceData, testDuration: number): number {
  // 确保有测试数据
  if (data.totalCount === 0) {
    return 0;
  }

  // 延迟评分 (延迟越小得分越高)
  // 将延迟映射到0-100分，使用基准延迟进行计算
  const latencyScore = Math.max(0, 100 - (data.averageLatency / BASE_LATENCY * LATENCY_TO_SCORE_RATIO));

  // 正确性评分 (成功率)
  const accuracyScore = (data.successCount / data.totalCount) * 100;

  // QPS评分 (使用 calculateQPS 计算当前QPS，并映射到0-100分)
  const qps = calculateQPS(data, testDuration);
  const qpsScore = Math.min(100, (qps / MAX_QPS) * 100);

  // 加权计算总分
  const finalScore = (
    latencyScore * LATENCY_WEIGHT +
    accuracyScore * ACCURACY_WEIGHT +
    qpsScore * QPS_WEIGHT
  );

  return Math.max(0, Math.min(100, finalScore)); // 限制在0-100之间
}

// 计算QPS (查询每秒)
export function calculateQPS(data: DNSPerformanceData, testDuration: number): number {
  // 确保返回值为数字类型
  const qps = data.successCount / (testDuration / 1000);
  return isNaN(qps) ? 0 : qps;
  // testDuration 是测试总时间(毫秒)
  if (testDuration <= 0) {
    return 0;
  }

  // QPS = 成功查询次数 / 测试时间(秒)
  return data.successCount / (testDuration / 1000);
}