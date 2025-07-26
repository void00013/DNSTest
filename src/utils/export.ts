import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// 导出为CSV格式
export async function exportToCSV(data: any[], filename: string): Promise<void> {
  if (!data || data.length === 0) {
    throw new Error('没有数据可导出');
  }

  // 创建CSV内容
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName];
        // 处理包含逗号或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 创建并下载文件
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

// 导出为JSON格式
export async function exportToJSON(data: any[], filename: string): Promise<void> {
  if (!data || data.length === 0) {
    throw new Error('没有数据可导出');
  }

  // 创建JSON内容
  const jsonContent = JSON.stringify(data, null, 2);
  
  // 创建并下载文件
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, `${filename}.json`);
}

// 导出为PNG格式
export async function exportToPNG(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`未找到ID为"${elementId}"的元素`);
  }

  try {
    // 等待一段时间确保ECharts图表完全渲染
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 使用html2canvas截图，确保背景色正确
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f172a', // 使用与网站一致的背景色
      scale: 2, // 提高截图质量
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // 确保克隆文档中的元素也具有正确的背景色
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.backgroundColor = '#0f172a';
        }
        
        // 特别处理图表容器
        const chartContainers = clonedElement?.querySelectorAll('.chart-container') || [];
        chartContainers.forEach(container => {
          (container as HTMLElement).style.backgroundColor = 'transparent';
        });
        
        // 确保所有子元素也有正确的背景色
        const allElements = clonedElement?.querySelectorAll('*') || [];
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el as Element);
          if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && computedStyle.backgroundColor !== 'transparent') {
            (el as HTMLElement).style.backgroundColor = computedStyle.backgroundColor;
          }
          
          // 确保文字颜色正确
          if (computedStyle.color) {
            (el as HTMLElement).style.color = computedStyle.color;
          }
        });
      }
    });

    // 转换为PNG并下载
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, filename);
      }
    }, 'image/png');
  } catch (error) {
    console.error('导出PNG失败:', error);
    throw new Error('导出PNG失败');
  }
}