<template>
  <div class="background-container">
    <div ref="background" class="background"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const background = ref<HTMLDivElement | null>(null)
let animationFrameId: number | null = null

// 创建粒子系统
const createParticles = () => {
  if (!background.value) return
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 设置画布大小
  const resizeCanvas = () => {
    canvas.width = background.value!.clientWidth
    canvas.height = background.value!.clientHeight
  }
  
  resizeCanvas()
  background.value.appendChild(canvas)
  
  // 粒子类
  class Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    color: string
    
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * 2 + 0.5
      this.speedX = Math.random() * 1 - 0.5
      this.speedY = Math.random() * 1 - 0.5
      this.color = `rgba(${Math.floor(Math.random() * 100 + 155)}, 
                         ${Math.floor(Math.random() * 100 + 155)}, 
                         ${Math.floor(Math.random() * 100 + 155)}, 
                         ${Math.random() * 0.5 + 0.1})`
    }
    
    update() {
      this.x += this.speedX
      this.y += this.speedY
      
      if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX
      if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY
    }
    
    draw() {
      if (!ctx) return
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  // 创建粒子数组
  const particles: Particle[] = []
  const particleCount = Math.floor((canvas.width * canvas.height) / 5000)
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }
  
  // 连线距离
  const connectDistance = 100
  
  // 动画循环
  const animate = () => {
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 更新和绘制粒子
    for (let i = 0; i < particles.length; i++) {
      particles[i].update()
      particles[i].draw()
      
      // 绘制粒子之间的连线
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < connectDistance) {
          const opacity = 1 - distance / connectDistance
          ctx.strokeStyle = `rgba(134, 239, 172, ${opacity * 0.2})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
  }
  
  // 窗口大小变化时重置画布
  const handleResize = () => {
    resizeCanvas()
  }
  
  window.addEventListener('resize', handleResize)
  
  // 开始动画
  animate()
  
  // 清理函数
  onBeforeUnmount(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    window.removeEventListener('resize', handleResize)
  })
}

onMounted(() => {
  createParticles()
})
</script>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a, #1e293b);
}
</style>