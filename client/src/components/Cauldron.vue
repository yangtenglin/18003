<template>
  <div
    class="cauldron-container"
    @dragover.prevent
    @drop="onDrop"
  >
    <div class="panel-header">
      <h2 class="panel-title">⚗️ 魔法坩埚</h2>
      <button class="clear-btn" @click="$emit('clear-cauldron')" :disabled="cauldronItems.length === 0">
        🗑️ 清空
      </button>
    </div>

    <div class="cauldron-wrapper">
      <canvas ref="canvasRef" class="cauldron-canvas" width="400" height="400"></canvas>
      
      <div class="cauldron-items-overlay">
        <div
          v-for="(item, index) in cauldronItems"
          :key="item.instanceId"
          class="cauldron-item"
          :style="getItemStyle(index)"
        >
          <span class="item-icon">{{ item.icon }}</span>
          <button class="remove-btn" @click="$emit('remove-item', item.instanceId)">×</button>
        </div>
      </div>
    </div>

    <div class="cauldron-info">
      <div class="item-count">
        材料: {{ cauldronItems.length }} / 5
      </div>
      <button
        class="brew-btn"
        :class="{ brewing: isBrewing }"
        :disabled="cauldronItems.length === 0 || isBrewing"
        @click="$emit('brew')"
      >
        <span v-if="isBrewing" class="brewing-text">
          <span class="bubble">🔮</span> 熬制中...
        </span>
        <span v-else>🔥 开始熬制</span>
      </button>
    </div>

    <div class="brew-hint">
      <p>💡 将材料拖入坩埚或点击材料添加</p>
      <p>🎯 尝试不同组合发现新配方</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps({
  cauldronItems: {
    type: Array,
    default: () => []
  },
  isBrewing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove-item', 'clear-cauldron', 'brew', 'add-item'])

const canvasRef = ref(null)
let animationId = null
let time = 0
let bubbles = []

function getItemStyle(index) {
  const count = props.cauldronItems.length
  const angle = (index / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2
  const radius = 80 + count * 5
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius * 0.6
  return {
    transform: `translate(${x}px, ${y}px)`,
    animationDelay: `${index * 0.2}s`
  }
}

function onDrop(event) {
  try {
    const materialData = event.dataTransfer.getData('material')
    if (materialData) {
      const material = JSON.parse(materialData)
      emit('add-item', material)
    }
  } catch (e) {
    console.error('拖拽失败:', e)
  }
}

function initBubbles() {
  bubbles = []
  for (let i = 0; i < 15; i++) {
    bubbles.push({
      x: Math.random() * 200 - 100,
      y: Math.random() * 80,
      size: Math.random() * 8 + 3,
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2
    })
  }
}

function updateBubbles() {
  bubbles.forEach(bubble => {
    bubble.y += bubble.speed
    bubble.x += Math.sin(time * 0.03 + bubble.y * 0.05) * 0.5
    if (bubble.y > 100) {
      bubble.y = -10
      bubble.x = Math.random() * 200 - 100
      bubble.size = Math.random() * 8 + 3
      bubble.speed = Math.random() * 1.5 + 0.5
    }
  })
}

function draw(ctx) {
  const canvas = canvasRef.value
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  drawCauldronGlow(ctx, cx, cy)
  drawCauldronBody(ctx, cx, cy)
  drawLiquid(ctx, cx, cy)
  drawBubbles(ctx, cx, cy)
  
  if (props.isBrewing) {
    drawBrewingEffect(ctx, cx, cy)
  }
}

function drawCauldronGlow(ctx, cx, cy) {
  const gradient = ctx.createRadialGradient(cx, cy + 30, 0, cx, cy + 30, 150)
  gradient.addColorStop(0, 'rgba(147, 112, 219, 0.3)')
  gradient.addColorStop(0.5, 'rgba(147, 112, 219, 0.1)')
  gradient.addColorStop(1, 'rgba(147, 112, 219, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(cx - 160, cy - 130, 320, 320)
}

function drawCauldronBody(ctx, cx, cy) {
  ctx.save()
  
  const bodyGradient = ctx.createLinearGradient(cx - 100, cy, cx + 100, cy)
  bodyGradient.addColorStop(0, '#2a2a4a')
  bodyGradient.addColorStop(0.3, '#4a4a6a')
  bodyGradient.addColorStop(0.7, '#3a3a5a')
  bodyGradient.addColorStop(1, '#1a1a3a')
  
  ctx.beginPath()
  ctx.ellipse(cx, cy + 60, 110, 90, 0, 0, Math.PI * 2)
  ctx.fillStyle = bodyGradient
  ctx.fill()
  
  ctx.beginPath()
  ctx.ellipse(cx, cy + 65, 105, 85, 0, 0, Math.PI * 2)
  ctx.strokeStyle = '#6B48C7'
  ctx.lineWidth = 2
  ctx.stroke()
  
  const rimGradient = ctx.createLinearGradient(cx - 110, cy - 20, cx + 110, cy + 20)
  rimGradient.addColorStop(0, '#5a5a7a')
  rimGradient.addColorStop(0.5, '#8a8aaa')
  rimGradient.addColorStop(1, '#4a4a6a')
  
  ctx.beginPath()
  ctx.ellipse(cx, cy - 20, 115, 25, 0, 0, Math.PI * 2)
  ctx.fillStyle = rimGradient
  ctx.fill()
  ctx.strokeStyle = '#9370DB'
  ctx.lineWidth = 2
  ctx.stroke()
  
  ctx.restore()
}

function drawLiquid(ctx, cx, cy) {
  const itemCount = props.cauldronItems.length
  const liquidHeight = 20 + itemCount * 12
  const liquidY = cy + 50 - liquidHeight / 2
  
  ctx.save()
  
  let liquidColor1 = '#4B0082'
  let liquidColor2 = '#9370DB'
  
  if (itemCount > 0) {
    const colors = props.cauldronItems.map(item => item.color || '#9370DB')
    const avgColor = blendColors(colors)
    liquidColor1 = avgColor
    liquidColor2 = lightenColor(avgColor, 30)
  }
  
  const liquidGradient = ctx.createLinearGradient(cx, liquidY - 30, cx, liquidY + 50)
  liquidGradient.addColorStop(0, liquidColor2)
  liquidGradient.addColorStop(0.7, liquidColor1)
  liquidGradient.addColorStop(1, darkenColor(liquidColor1, 30))
  
  ctx.beginPath()
  const waveOffset = Math.sin(time * 0.05) * 3
  
  for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
    const x = cx + Math.cos(angle) * (95 + waveOffset * Math.sin(angle * 2))
    const y = liquidY + Math.sin(angle) * 40
    
    if (angle === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.closePath()
  ctx.fillStyle = liquidGradient
  ctx.fill()
  
  const shineGradient = ctx.createRadialGradient(
    cx - 20, liquidY - 10, 0,
    cx - 20, liquidY - 10, 40
  )
  shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
  shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = shineGradient
  ctx.beginPath()
  ctx.ellipse(cx - 20, liquidY - 5, 35, 15, -0.3, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.restore()
}

function drawBubbles(ctx, cx, cy) {
  const itemCount = props.cauldronItems.length
  const liquidY = cy + 50 - (20 + itemCount * 12) / 2
  
  ctx.save()
  bubbles.forEach(bubble => {
    const y = liquidY - bubble.y
    if (y < liquidY + 30) {
      ctx.beginPath()
      ctx.arc(cx + bubble.x, y, bubble.size, 0, Math.PI * 2)
      const bubbleGradient = ctx.createRadialGradient(
        cx + bubble.x - bubble.size * 0.3, y - bubble.size * 0.3, 0,
        cx + bubble.x, y, bubble.size
      )
      bubbleGradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity})`)
      bubbleGradient.addColorStop(0.5, `rgba(200, 180, 255, ${bubble.opacity * 0.7})`)
      bubbleGradient.addColorStop(1, `rgba(150, 120, 200, 0)`)
      ctx.fillStyle = bubbleGradient
      ctx.fill()
    }
  })
  ctx.restore()
}

function drawBrewingEffect(ctx, cx, cy) {
  const itemCount = props.cauldronItems.length
  const liquidY = cy + 50 - (20 + itemCount * 12) / 2
  
  ctx.save()
  
  for (let i = 0; i < 8; i++) {
    const angle = (time * 0.02 + i * Math.PI / 4) % (Math.PI * 2)
    const radius = 50 + Math.sin(time * 0.03 + i) * 20
    const x = cx + Math.cos(angle) * radius
    const y = liquidY - 40 - Math.abs(Math.sin(time * 0.04 + i)) * 60
    const size = 5 + Math.sin(time * 0.05 + i) * 3
    
    const sparkGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
    sparkGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)')
    sparkGradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)')
    sparkGradient.addColorStop(1, 'rgba(255, 100, 0, 0)')
    
    ctx.fillStyle = sparkGradient
    ctx.beginPath()
    ctx.arc(x, y, size * 2, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const steamGradient = ctx.createRadialGradient(cx, liquidY - 80, 0, cx, liquidY - 80, 80)
  steamGradient.addColorStop(0, `rgba(200, 180, 255, ${0.3 + Math.sin(time * 0.05) * 0.1})`)
  steamGradient.addColorStop(1, 'rgba(200, 180, 255, 0)')
  ctx.fillStyle = steamGradient
  ctx.beginPath()
  ctx.ellipse(cx, liquidY - 80, 60 + Math.sin(time * 0.04) * 10, 80 + Math.cos(time * 0.03) * 15, 0, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.restore()
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function blendColors(colors) {
  if (colors.length === 0) return '#9370DB'
  let r = 0, g = 0, b = 0
  colors.forEach(color => {
    const rgb = hexToRgb(color)
    if (rgb) {
      r += rgb.r
      g += rgb.g
      b += rgb.b
    }
  })
  return rgbToHex(r / colors.length, g / colors.length, b / colors.length)
}

function lightenColor(color, amount) {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  return rgbToHex(rgb.r + amount, rgb.g + amount, rgb.b + amount)
}

function darkenColor(color, amount) {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  return rgbToHex(rgb.r - amount, rgb.g - amount, rgb.b - amount)
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  time++
  
  if (props.isBrewing || props.cauldronItems.length > 0) {
    updateBubbles()
  }
  
  draw(ctx)
  animationId = requestAnimationFrame(animate)
}

watch(() => props.cauldronItems.length, (newVal, oldVal) => {
  if (newVal > oldVal) {
    for (let i = 0; i < 3; i++) {
      bubbles.push({
        x: Math.random() * 100 - 50,
        y: 80,
        size: Math.random() * 10 + 5,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      })
    }
  }
})

watch(() => props.isBrewing, (val) => {
  if (val) {
    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * 160 - 80,
        y: Math.random() * 100,
        size: Math.random() * 12 + 4,
        speed: Math.random() * 3 + 1,
        opacity: Math.random() * 0.7 + 0.2
      })
    }
  }
})

onMounted(() => {
  initBubbles()
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.cauldron-container {
  background: linear-gradient(145deg, rgba(40, 40, 70, 0.6) 0%, rgba(30, 30, 55, 0.8) 100%);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(147, 112, 219, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-title {
  font-size: 22px;
  color: #E6E6FA;
}

.clear-btn {
  padding: 8px 16px;
  background: rgba(255, 100, 100, 0.2);
  color: #ff7777;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 100, 100, 0.3);
}

.clear-btn:hover:not(:disabled) {
  background: rgba(255, 100, 100, 0.3);
}

.clear-btn:disabled {
  opacity: 0.4;
}

.cauldron-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 380px;
  margin-bottom: 20px;
}

.cauldron-canvas {
  max-width: 100%;
  height: auto;
}

.cauldron-items-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
}

.cauldron-item {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(145deg, rgba(60, 60, 90, 0.9), rgba(40, 40, 70, 0.9));
  border-radius: 50%;
  margin: -25px 0 0 -25px;
  border: 2px solid rgba(186, 85, 211, 0.6);
  animation: float 3s ease-in-out infinite;
  pointer-events: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.05);
  }
}

.item-icon {
  font-size: 24px;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: #ff5555;
  color: white;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 11;
}

.cauldron-item:hover .remove-btn {
  opacity: 1;
}

.cauldron-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
}

.item-count {
  font-size: 14px;
  color: #B8B8D1;
}

.brew-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  color: white;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
  position: relative;
  overflow: hidden;
}

.brew-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 107, 53, 0.6);
}

.brew-btn:active:not(:disabled) {
  transform: translateY(0);
}

.brew-btn.brewing {
  background: linear-gradient(135deg, #9370DB 0%, #BA55D3 100%);
  box-shadow: 0 4px 20px rgba(147, 112, 219, 0.5);
}

.brewing-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bubble {
  animation: pulse 0.8s ease-in-out infinite;
  display: inline-block;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.brew-hint {
  text-align: center;
  color: #888;
  font-size: 13px;
  line-height: 1.8;
}

.brew-hint p {
  margin: 4px 0;
}

@media (max-width: 600px) {
  .cauldron-wrapper {
    height: 300px;
  }
  
  .cauldron-canvas {
    width: 280px;
    height: 280px;
  }
}
</style>
