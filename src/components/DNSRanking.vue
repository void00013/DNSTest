<template>
  <div class="dns-ranking" id="dns-ranking-table">
    <div class="ranking-header">
      <h2 class="ranking-title">DNS 性能排行榜</h2>
      <div class="header-decoration"></div>
    </div>
    
    <div v-if="props.isRunning" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring spinner-ring-2"></div>
        <div class="spinner-ring spinner-ring-3"></div>
      </div>
      <p class="loading-text">测试进行中，请稍候...</p>
    </div>
    
    <div v-else-if="!hasData" class="empty-state">
      <div class="empty-icon">🔍</div>
      <p class="empty-text">点击"开始测试"按钮开始测试DNS性能</p>
    </div>
    
    <div v-else class="ranking-content">
      <div class="test-completed-message">
        <i class="completion-icon">✅</i>
        <span class="completion-text">测试已完成，以下是DNS性能排行榜：</span>
      </div>
      
      <div class="ranking-table-container">
        <table class="ranking-table">
          <thead>
            <tr>
              <th class="rank-header">排名</th>
              <th class="ip-header">IP地址</th>
              <th class="name-header">服务商</th>
              <th class="latency-header">平均延迟</th>
              <th class="success-header">成功率</th>
              <th class="qps-header">QPS</th>
              <th class="score-header">得分</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(dns, index) in sortedDNSList" 
              :key="dns.ip" 
              :class="{ 'testing': dns.isTesting, 'top-rank': index < 3 }"
              class="ranking-row"
              :style="{ background: getRankBackground(index) }"
            >
              <td class="rank-cell" :style="{ color: getRankColor(index) }">
                <span class="rank-number">{{ index + 1 }}</span>
                <div v-if="index < 3" class="rank-badge" :class="'rank-' + (index + 1)">
                  <span v-if="index === 0">🥇</span>
                  <span v-else-if="index === 1">🥈</span>
                  <span v-else>🥉</span>
                </div>
              </td>
              <td class="ip-cell">{{ dns.ip }}</td>
              <td class="name-cell">{{ dns.name }}</td>
              <td class="latency-cell" :class="{ 'failed': dns.averageLatency >= 9999 }">
                {{ formatLatency(dns.averageLatency) }}
              </td>
              <td class="success-cell">{{ formatSuccessRate(dns.successCount, dns.totalCount) }}</td>
              <td class="qps-cell">{{ formatQPS(dns.qps) }}</td>
              <td class="score-cell">
                <div class="score-wrapper">
                  <span class="score-value">{{ formatScore(dns.score) }}</span>
                  <div class="score-bar">
                    <div 
                      class="score-fill" 
                      :style="getScoreBarStyle(dns.score, index)"
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DNSPerformanceData } from '../utils/dns-types'

const props = defineProps<{
  dnsList: DNSPerformanceData[]
  isRunning: boolean
}>()

// 格式化延迟显示
const formatLatency = (latency: number): string => {
  if (latency >= 9999 || isNaN(latency) || latency === null) return '失败'
  return `${latency.toFixed(2)} ms`
}

// 格式化成功率显示
const formatSuccessRate = (success: number, total: number): string => {
  if (total === 0) return '0%'
  return `${((success / total) * 100).toFixed(1)}% (${success}/${total})`
}

// 格式化QPS显示
const formatQPS = (qps: number): string => {
  if (isNaN(qps) || qps === null) return '0.00'
  return qps.toFixed(2)
}

// 格式化得分显示
const formatScore = (score: number): string => {
  if (isNaN(score) || score === null) return '0.00'
  return score.toFixed(2)
}

// 检查是否有数据
const hasData = computed(() => {
  return props.dnsList && props.dnsList.length > 0
})


// 按得分排序DNS列表
const sortedDNSList = computed(() => {
  if (!props.dnsList) return []
  return [...props.dnsList].sort((a, b) => b.score - a.score)
})

// 获取排名颜色
const getRankColor = (index: number): string => {
  switch (index) {
    case 0: return '#fde047'; // 金牌
    case 1: return '#e5e7eb'; // 银牌
    case 2: return '#fcd34d'; // 铜牌
    default: return '#94a3b8';
  }
}

// 获取评分条样式
// const getScoreBarStyle = (score: number, index: number): object => {
//   return { 
//     width: Math.min(100, Math.max(0, (score / 100) * 100)) + '%',
//     background: `linear-gradient(90deg, 
//       ${index === 0 ? '#fde047' : index === 1 ? '#e5e7eb' : index === 2 ? '#fcd34d' : '#86efac'}, 
//       ${index === 0 ? '#facc15' : index === 1 ? '#d1d5db' : index === 2 ? '#fbbf24' : '#22d3ee'})`
//   }
// }

// 获取排名背景色
const getRankBackground = (index: number): string => {
  switch (index) {
    case 0: return 'rgba(253, 224, 71, 0.1)';
    case 1: return 'rgba(229, 231, 235, 0.1)';
    case 2: return 'rgba(252, 211, 77, 0.1)';
    default: return 'transparent';
  }
}

// 获取得分条样式
const getScoreBarStyle = (score: number, index: number): any => {
  const width = Math.min(100, Math.max(0, (score / 100) * 100)) + '%';
  
  let background = '';
  if (index === 0) {
    background = 'linear-gradient(90deg, #fde047, #facc15)';
  } else if (index === 1) {
    background = 'linear-gradient(90deg, #e5e7eb, #d1d5db)';
  } else if (index === 2) {
    background = 'linear-gradient(90deg, #fcd34d, #fbbf24)';
  } else {
    background = 'linear-gradient(90deg, #86efac, #22d3ee)';
  }
  
  return {
    width: width,
    background: background
  };
}

</script>

<style scoped>
.dns-ranking {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(128, 255, 128, 0.2);
  transition: all 0.3s ease;
  color: #e2e8f0;
  position: relative;
  overflow: hidden;
}

.dns-ranking::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #86efac, #22d3ee);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1;
}

.dns-ranking:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
  border: 1px solid rgba(128, 255, 128, 0.4);
}

.ranking-header {
  margin-bottom: 1.5rem;
}

.ranking-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #e2e8f0;
  text-align: center;
  background: linear-gradient(45deg, #86efac, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.ranking-title::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #86efac, #22d3ee);
  border-radius: 2px;
}

.header-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #86efac, #22d3ee);
  border-radius: 2px;
  margin: 0 auto;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  position: relative;
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top-color: #86efac;
  animation: spin 1.5s linear infinite;
}

.spinner-ring-2 {
  border-top-color: #22d3ee;
  animation-delay: -0.5s;
}

.spinner-ring-3 {
  border-top-color: #a78bfa;
  animation-delay: -1s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #94a3b8;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.empty-text {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
}

.test-completed-message {
  background: linear-gradient(45deg, #047857, #10b981);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  border: 1px solid rgba(128, 255, 128, 0.3);
  animation: slideIn 0.5s ease-out;
}

.completion-icon {
  font-size: 1.2rem;
}

.ranking-table-container {
  overflow-x: auto;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.ranking-table th {
  background: linear-gradient(180deg, #1e293b, #0f172a);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #e2e8f0;
  border-bottom: 2px solid #334155;
  position: sticky;
  top: 0;
  backdrop-filter: blur(5px);
}

.rank-header {
  text-align: center;
  width: 60px;
}

.ip-header {
  width: 120px;
}

.name-header {
  min-width: 150px;
}

.latency-header, .success-header, .qps-header {
  width: 120px;
}

.score-header {
  width: 150px;
}

.ranking-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #334155;
  position: relative;
}

.ranking-row:hover {
  background: rgba(134, 239, 172, 0.15) !important;
  transform: translateX(5px);
}

.ranking-row.top-rank:hover {
  background: rgba(253, 224, 71, 0.2) !important;
}

.ranking-row:last-child {
  border-bottom: none;
}

.ranking-row:nth-child(odd) {
  background: rgba(30, 41, 59, 0.3);
}

.rank-cell {
  text-align: center;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 1rem;
  position: relative;
}

.rank-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 0.8rem;
}

.rank-1 {
  color: #fde047;
}

.rank-2 {
  color: #e5e7eb;
}

.rank-3 {
  color: #fcd34d;
}

.ip-cell, .name-cell {
  padding: 1rem;
  color: #e2e8f0;
}

.latency-cell, .success-cell, .qps-cell {
  padding: 1rem;
  font-weight: 500;
}

.latency-cell.failed {
  color: #f87171;
  animation: errorPulse 2s infinite;
}

@keyframes errorPulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.score-cell {
  padding: 1rem;
}

.score-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.score-value {
  font-weight: 700;
  color: #86efac;
  font-size: 1.1rem;
  text-shadow: 0 0 5px rgba(134, 239, 172, 0.5);
}

.score-bar {
  width: 100%;
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.score-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.score-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease-out;
}

@media (max-width: 768px) {
  .ranking-table {
    font-size: 0.8rem;
  }
  
  .ranking-table th,
  .ranking-table td {
    padding: 0.5rem;
  }
  
  .name-header {
    min-width: 100px;
  }
  
  .score-header {
    width: 100px;
  }
  
  .rank-cell {
    font-size: 1rem;
  }
}
</style>