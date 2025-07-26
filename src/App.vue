<script setup lang="ts">
import Background from './components/Background.vue'
import TestControls from './components/TestControls.vue'
import DNSRanking from './components/DNSRanking.vue'
import DNSChart from './components/DNSChart.vue'
import ExportPanel from './components/ExportPanel.vue'
import { useDNSTest } from './composables/useDNSTest'
import { computed, watch } from 'vue'

const { testOptions, testResult } = useDNSTest()

// 监听testResult的变化
watch(() => testResult, (newVal) => {
  console.log('testResult changed:', newVal);
}, { deep: true })

// 监听isRunning状态变化
watch(() => testResult.isRunning, (newVal) => {
  console.log('isRunning changed:', newVal);
})

const isTesting = computed(() => {
  return testResult.isRunning;
})

// 检查测试是否完成
const isTestCompleted = computed(() => {
  return !testResult.isRunning && testResult.dnsList && testResult.dnsList.length > 0
})
</script>

<template>
  <div class="app" id="app">
    <Background />
    
    <div class="app-content">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <span class="title-main">DNS</span>
            <span class="title-sub">测速排行榜</span>
          </h1>
          <p class="app-subtitle">测试中国常用公共 DNS 的速度与可靠性</p>
        </div>
      </header>
      
      <main class="app-main">
        <div class="container">
          <TestControls />
          
          <!-- 测试完成提示 -->
          <div v-if="isTestCompleted" class="completion-notice">
            <div class="completion-content">
              <i class="completion-icon">✅</i>
              <span class="completion-text">DNS测速测试已完成！</span>
            </div>
          </div>
          
          <div class="content-grid">
            <div class="ranking-section">
              <DNSRanking 
                :dns-list="testResult.dnsList" 
                :is-running="testResult.isRunning"
              />
            </div>
            
            <div class="chart-section">
              <DNSChart 
                :dns-list="testResult.dnsList" 
                :is-running="testResult.isRunning"
              />
            </div>
          </div>
          
          <div class="export-section">
            <ExportPanel :dns-list="testResult.dnsList" />
          </div>
        </div>
      </main>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>🚀 纯前端、离线可用、一键导出</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
}

.app-content {
  position: relative;
  z-index: 2;
}

.app-header {
  background: rgba(30, 41, 59, 0.8);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(128, 255, 128, 0.2);
  padding: 1rem 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 1rem;
}

.app-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #86efac, #4ade80, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px rgba(134, 239, 172, 0.5), 0 0 10px rgba(134, 239, 172, 0.3);
  }
  to {
    text-shadow: 0 0 10px rgba(134, 239, 172, 0.8), 0 0 20px rgba(134, 239, 172, 0.5), 0 0 30px rgba(134, 239, 172, 0.3);
  }
}

.title-main {
  display: block;
  font-size: 3rem;
}

.title-sub {
  display: block;
  font-size: 1.5rem;
  font-weight: 300;
}

.app-subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.app-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.completion-notice {
  background: linear-gradient(45deg, #047857, #10b981);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  animation: slideIn 0.5s ease-out, pulse 2s infinite;
  border: 1px solid rgba(128, 255, 128, 0.3);
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(16, 185, 129, 0.6);
  }
  100% {
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }
}

.completion-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.completion-icon {
  font-size: 1.5rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.completion-text {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.chart-section, .ranking-section {
  animation: fadeIn 0.8s ease-out;
}

.export-wrapper {
  order: 1;
  animation: fadeIn 1.2s ease-out;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .chart-section {
    grid-column: 1 / -1;
  }
  
  .ranking-section {
    grid-column: 1 / -1;
  }
}

.app-footer {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(5px);
  padding: 1.5rem 0;
  margin-top: 2rem;
  border-top: 1px solid rgba(128, 255, 128, 0.2);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 1rem;
}

.footer-content p {
  color: #94a3b8;
  margin: 0;
  font-size: 1rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .chart-section {
    grid-column: 1 / -1;
  }
  
  .ranking-section {
    grid-column: 1 / -1;
  }
}
</style>