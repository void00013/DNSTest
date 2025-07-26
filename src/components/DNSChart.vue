<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { DNSPerformanceData } from '../utils/dns-types';

const props = defineProps<{
  dnsList: DNSPerformanceData[];
  isRunning?: boolean;
}>();

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 检查是否有数据
const hasData = computed(() => {
  return props.dnsList && props.dnsList.length > 0;
});

// 检查测试是否完成
const isTestCompleted = computed(() => {
  return !props.isRunning && hasData.value;
});


// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    // 如果已有实例，先销毁
    if (chartInstance) {
      chartInstance.dispose();
    }
    
    // 初始化新的图表实例
    chartInstance = echarts.init(chartContainer.value);
    updateChart();
  }
};

// 更新图表
const updateChart = () => {
  if (!chartInstance || !hasData.value) return;

  // 准备图表数据
  const sortedDNSList = [...props.dnsList].sort((a, b) => b.score - a.score);
  const topDNSList = sortedDNSList.slice(0, 10); // 只显示前10名

  const option = {
    backgroundColor: 'transparent', // 使用透明背景以适配容器
    title: {
      text: 'DNS性能排行榜（前10名）',
      left: 'center',
      textStyle: {
        color: '#e2e8f0',
        fontSize: 16,
        fontWeight: 600
      },
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: {
        color: '#e2e8f0'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: 60
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      name: '得分',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#94a3b8'
      },
      axisLine: {
        lineStyle: {
          color: '#334155'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      },
      splitLine: {
        lineStyle: {
          color: '#1e293b'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: topDNSList.map(dns => dns.name),
      inverse: true,
      axisLine: {
        lineStyle: {
          color: '#334155'
        }
      },
      axisLabel: {
        color: '#e2e8f0'
      }
    },
    series: [
      {
        name: '得分',
        type: 'bar',
        data: topDNSList.map(dns => {
          // 确保数据是数值类型
          const score = typeof dns.score === 'number' ? dns.score : 0;
          return parseFloat(score.toFixed(2));
        }),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#86efac' },
            { offset: 1, color: '#22d3ee' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        barWidth: 20,
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#22d3ee' },
              { offset: 1, color: '#86efac' }
            ])
          }
        }
      }
    ]
  };

  chartInstance.setOption(option);
  
  // 强制渲染图表
  chartInstance.resize();
};

// 监听测试完成状态变化
watch(
  () => isTestCompleted.value,
  async (newVal) => {
    if (newVal) {
      // 等待DOM更新完成后再初始化图表
      await nextTick();
      initChart();
    }
  }
);


// 监听数据变化
watch(
  () => props.dnsList,
  () => {
    if (isTestCompleted.value && chartInstance) {
      updateChart();
    }
  },
  { deep: true }
);

// 窗口大小变化时重置图表大小
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 组件挂载时添加事件监听器
onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  // 如果已经有数据且测试完成，初始化图表
  if (isTestCompleted.value) {
    initChart();
  }
});

// 组件卸载前销毁图表实例和事件监听器
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="dns-chart" id="dns-performance-chart">
    <div class="chart-header">
      <h2 class="chart-title">性能图表</h2>
      <div class="header-decoration"></div>
    </div>
    
    <!-- 没有数据时显示 -->
    <div v-if="!hasData && !isTestRunning" class="chart-placeholder">
      <div class="placeholder-icon">📊</div>
      <p class="placeholder-text">点击"开始测试"按钮开始测试DNS性能</p>
    </div>
    
    <!-- 测试进行中 -->
    <div v-else-if="isTestRunning" class="chart-placeholder">
      <div class="loading-animation">
        <div class="pulse-circle"></div>
        <div class="pulse-circle" style="animation-delay: 0.2s"></div>
        <div class="pulse-circle" style="animation-delay: 0.4s"></div>
      </div>
      <p class="placeholder-text">测试进行中，图表将在测试完成后显示...</p>
    </div>
    
    <!-- 测试完成 -->
    <div v-else-if="isTestCompleted">
      <div class="test-completed-message">
        <i class="completion-icon">✅</i>
        <span class="completion-text">测试已完成，以下是DNS性能图表：</span>
      </div>
      <div ref="chartContainer" class="chart-container"></div>
    </div>
    
    <!-- 有数据但测试未完成 -->
    <div v-else class="chart-placeholder">
      <div class="placeholder-icon">🕒</div>
      <p class="placeholder-text">测试完成后将在此处显示性能图表</p>
    </div>
  </div>
</template>

<style scoped>
.dns-chart {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(128, 255, 128, 0.2);
  transition: all 0.3s ease;
  color: #e2e8f0;
}

.dns-chart:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
  border: 1px solid rgba(128, 255, 128, 0.4);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-title {
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

.chart-placeholder {
  text-align: center;
  padding: 3rem 1rem;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #94a3b8;
}

.loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pulse-circle {
  width: 12px;
  height: 12px;
  background: #86efac;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

.placeholder-text {
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
}

.completion-icon {
  font-size: 1.2rem;
}

.chart-container {
  width: 100%;
  height: 400px;
  background: transparent;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
  
  .chart-title {
    font-size: 1.3rem;
  }
  
  .placeholder-text {
    font-size: 1rem;
  }
}
</style>