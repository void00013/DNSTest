<script setup lang="ts">
import { ref } from 'vue'
import { exportToCSV, exportToJSON, exportToPNG } from '../utils/export'

const props = defineProps<{
  dnsList: any[]
}>()

const isExporting = ref(false)

const handleExportCSV = async () => {
  isExporting.value = true
  try {
    await exportToCSV(props.dnsList, 'dns-ranking')
  } catch (error) {
    console.error('导出CSV失败:', error)
  } finally {
    isExporting.value = false
  }
}

const handleExportJSON = async () => {
  isExporting.value = true
  try {
    await exportToJSON(props.dnsList, 'dns-ranking')
  } catch (error) {
    console.error('导出JSON失败:', error)
  } finally {
    isExporting.value = false
  }
}

const handleExportPNG = async () => {
  isExporting.value = true
  try {
    // 导出整个应用区域
    await exportToPNG('app', 'dns-ranking.png')
  } catch (error) {
    console.error('导出PNG失败:', error)
  } finally {
    isExporting.value = false
  }
}

// 导出整个页面为PNG
</script>

<template>
  <div class="export-panel">
    <div class="panel-header">
      <h2 class="panel-title">导出数据</h2>
      <div class="header-decoration"></div>
    </div>
    
    <div class="export-buttons">
      <button 
        @click="handleExportCSV" 
        :disabled="isExporting || !props.dnsList || props.dnsList.length === 0"
        class="export-button csv-button"
      >
        <span class="button-content">
          <i class="button-icon">📄</i>
          <span class="button-text">导出 CSV</span>
        </span>
      </button>
      
      <button 
        @click="handleExportJSON" 
        :disabled="isExporting || !props.dnsList || props.dnsList.length === 0"
        class="export-button json-button"
      >
        <span class="button-content">
          <i class="button-icon">⚙️</i>
          <span class="button-text">导出 JSON</span>
        </span>
      </button>
      
      <button 
        @click="handleExportPNG" 
        :disabled="isExporting || !props.dnsList || props.dnsList.length === 0"
        class="export-button png-button"
      >
        <span class="button-content">
          <i class="button-icon">🖼️</i>
          <span class="button-text">导出 PNG</span>
        </span>
      </button>
    </div>
    
    <div v-if="isExporting" class="export-status">
      <div class="spinner"></div>
      <span class="status-text">正在导出...</span>
    </div>
  </div>
</template>

<style scoped>
.export-panel {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(128, 255, 128, 0.2);
  transition: all 0.3s ease;
  color: #e2e8f0;
}

.export-panel:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
  border: 1px solid rgba(128, 255, 128, 0.4);
}

.panel-header {
  margin-bottom: 1.5rem;
}

.panel-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #e2e8f0;
  text-align: center;
  background: linear-gradient(45deg, #86efac, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #86efac, #22d3ee);
  border-radius: 2px;
  margin: 0 auto;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

@media (min-width: 576px) {
  .export-buttons {
    flex-direction: row;
  }
}

.export-button {
  flex: 1;
  padding: 0;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  height: 3.5rem;
}

.csv-button {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.csv-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.json-button {
  background: linear-gradient(45deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.json-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.png-button {
  background: linear-gradient(45deg, #0ea5e9, #0284c7);
  color: white;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
}

.png-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
}

.export-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.export-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(134, 239, 172, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(134, 239, 172, 0.2);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(134, 239, 172, 0.2);
  border-top: 2px solid #86efac;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-text {
  color: #86efac;
  font-weight: 500;
}
</style>