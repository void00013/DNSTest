<script setup lang="ts">
import { computed } from 'vue'
import { useDNSTest } from '../composables/useDNSTest'

const { testOptions, testResult, startTest, stopTest } = useDNSTest()

// 使用testResult.isRunning作为测试状态
const isTesting = computed(() => testResult.isRunning)

const handleStartTest = async () => {
  try {
    await startTest()
  } catch (error) {
    console.error('测试启动失败:', error)
  }
}

const handleStopTest = () => {
  stopTest()
}
</script>

<template>
  <div 
    class="test-controls"
  >
    <div class="controls-header">
      <h2 class="controls-title">测试配置</h2>
      <div class="header-accent"></div>
    </div>
    
    <div class="input-group">
      <label for="domain" class="input-label">测试域名</label>
      <div class="input-wrapper">
        <input 
          id="domain" 
          v-model="testOptions.domain" 
          type="text" 
          :disabled="isTesting"
          placeholder="请输入域名，如 www.baidu.com"
          class="domain-input"
        />
        <div class="input-icon">🌐</div>
      </div>
    </div>
    
    <div class="progress-info" v-if="isTesting">
      <div class="progress-header">
        <span class="progress-label">测试进度</span>
        <span class="progress-percent">{{ testResult.totalRounds > 0 ? Math.round((testResult.currentRound / testResult.totalRounds) * 100) : 0 }}%</span>
      </div>
      <div class="progress-bar-container">
        <div 
          class="progress-bar" 
          :style="{ width: testResult.totalRounds > 0 ? (testResult.currentRound / testResult.totalRounds * 100) + '%' : '0%' }"
        ></div>
        <div class="progress-particles"></div>
      </div>
      <div class="progress-text">
        第 {{ testResult.currentRound }} 轮 / 共 {{ testResult.totalRounds }} 轮
      </div>
    </div>
    
    <div class="button-group">
      <button 
        @click="handleStartTest" 
        :disabled="isTesting"
        class="start-button"
        :class="{ 'button-loading': isTesting }"
      >
        <span class="button-content">
          <i v-if="isTesting" class="button-icon">⏱️</i>
          <i v-else class="button-icon">🚀</i>
          {{ isTesting ? `测试中...` : '开始测试' }}
        </span>
      </button>
      
      <button 
        v-if="isTesting" 
        @click="handleStopTest"
        class="stop-button"
      >
        <span class="button-content">
          <i class="button-icon">⏹️</i>
          停止测试
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.test-controls {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(128, 255, 128, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.test-controls::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #86efac, #22d3ee);
}

.test-controls:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
  border: 1px solid rgba(128, 255, 128, 0.4);
}

.controls-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.controls-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #e2e8f0;
  background: linear-gradient(45deg, #86efac, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-accent {
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #86efac, #22d3ee);
  border-radius: 2px;
  margin: 0 auto;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #94a3b8;
  font-size: 1rem;
}

.input-wrapper {
  position: relative;
}

.domain-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #334155;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #1e293b;
  color: #e2e8f0;
  position: relative;
}

.domain-input:focus {
  outline: none;
  border-color: #22d3ee;
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
  background: #0f172a;
}

.domain-input:disabled {
  background: #1e293b;
  cursor: not-allowed;
  opacity: 0.7;
}

.domain-input::placeholder {
  color: #64748b;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.progress-info {
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-weight: 500;
  color: #94a3b8;
}

.progress-percent {
  font-weight: 600;
  color: #86efac;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: #334155;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  margin-bottom: 0.5rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #86efac, #22d3ee);
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

.progress-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.progress-particles::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: flow 3s linear infinite;
}

@keyframes flow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

@media (min-width: 576px) {
  .button-group {
    flex-direction: row;
  }
}

button {
  padding: 0;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

button:active:not(:disabled) {
  transform: translateY(-1px);
}

.start-button {
  background: linear-gradient(45deg, #0ea5e9, #06b6d4, #86efac);
  color: #0f172a;
  flex: 1;
  height: 3.5rem;
}

.start-button:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(134, 239, 172, 0.4);
}

.start-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.stop-button {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
  flex: 1;
  height: 3.5rem;
}

.stop-button:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
}

.button-icon {
  font-size: 1.2rem;
}

.button-loading {
  position: relative;
}

.button-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>