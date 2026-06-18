<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" :class="[`rarity-${material.rarity}`, `element-${material.element}`]">
      <button class="close-x" @click="$emit('close')">✕</button>

      <div class="material-header">
        <div class="material-icon">{{ material.icon }}</div>
        <h2 class="material-name">{{ material.name }}</h2>
        <div class="material-tier">
          <span v-for="n in material.tier" :key="n" class="tier-star">⭐</span>
          <span class="tier-label">{{ getTierLabel(material.tier) }}</span>
        </div>
      </div>

      <div class="material-badges">
        <span class="badge element-badge">
          <span class="badge-icon">{{ getElementIcon(material.element) }}</span>
          {{ getElementName(material.element) }}
        </span>
        <span class="badge rarity-badge">
          {{ getRarityName(material.rarity) }}
        </span>
      </div>

      <p class="material-description">{{ material.description }}</p>

      <div class="detail-section">
        <h3 class="section-title">属性信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-icon">⚖️</span>
            <span class="stat-label">稳定性</span>
            <div class="stat-bar-container">
              <div class="stat-bar" :style="{ width: material.stability + '%' }" :class="getStabilityClass(material.stability)"></div>
            </div>
            <span class="stat-value">{{ material.stability }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🔬</span>
            <span class="stat-label">使用次数</span>
            <span class="stat-value big">{{ material.usageCount || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3 class="section-title">⚠️ 副作用</h3>
        <p class="side-effect-text">{{ material.sideEffect }}</p>
      </div>

      <div v-if="material.lore" class="detail-section lore-section">
        <h3 class="section-title">📖 图鉴记载</h3>
        <p class="lore-text">{{ material.lore }}</p>
      </div>

      <div v-if="material.lastUsed" class="last-used">
        <span class="clock-icon">🕐</span>
        最近使用: {{ formatDate(material.lastUsed) }}
      </div>

      <button class="close-btn" @click="$emit('close')">
        关闭
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  material: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const elementNames = {
  fire: '火',
  water: '水',
  earth: '土',
  wind: '风',
  nature: '自然',
  light: '光',
  dark: '暗',
  arcane: '奥术'
}

const elementIcons = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  wind: '🪶',
  nature: '🌿',
  light: '🌙',
  dark: '🌑',
  arcane: '📜'
}

const rarityNames = {
  common: '普通',
  uncommon: '非凡',
  rare: '稀有',
  legendary: '传说'
}

const tierLabels = {
  1: '初级材料',
  2: '中级材料',
  3: '高级材料'
}

function getElementName(element) {
  return elementNames[element] || element
}

function getElementIcon(element) {
  return elementIcons[element] || '✨'
}

function getRarityName(rarity) {
  return rarityNames[rarity] || rarity
}

function getTierLabel(tier) {
  return tierLabels[tier] || `${tier}阶`
}

function getStabilityClass(stability) {
  if (stability >= 80) return 'high'
  if (stability >= 60) return 'medium'
  return 'low'
}

function formatDate(dateStr) {
  if (!dateStr) return '从未使用'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 30) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(145deg, rgba(50, 50, 80, 0.95) 0%, rgba(30, 30, 55, 0.98) 100%);
  border-radius: 25px;
  padding: 35px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  border: 2px solid rgba(147, 112, 219, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s ease;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content.rarity-legendary {
  border-color: rgba(255, 193, 7, 0.6);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 193, 7, 0.2);
}

.modal-content.rarity-rare {
  border-color: rgba(33, 150, 243, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(33, 150, 243, 0.15);
}

.modal-content.rarity-uncommon {
  border-color: rgba(76, 175, 80, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 25px rgba(76, 175, 80, 0.1);
}

.close-x {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.material-header {
  margin-bottom: 20px;
}

.material-icon {
  font-size: 72px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.4));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.material-name {
  font-size: 26px;
  color: #E6E6FA;
  margin-bottom: 8px;
}

.element-fire .material-name { color: #FF8A65; }
.element-water .material-name { color: #4DD0E1; }
.element-earth .material-name { color: #A1887F; }
.element-wind .material-name { color: #80CBC4; }
.element-nature .material-name { color: #81C784; }
.element-light .material-name { color: #E0E0E0; }
.element-dark .material-name { color: #B39DDB; }
.element-arcane .material-name { color: #CE93D8; }

.material-tier {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tier-star {
  font-size: 14px;
  color: #FFD700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.tier-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.material-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-icon {
  font-size: 14px;
}

.element-badge {
  background: rgba(147, 112, 219, 0.2);
  color: #9370DB;
}

.element-fire .element-badge { background: rgba(255, 107, 53, 0.2); color: #FF6B35; }
.element-water .element-badge { background: rgba(78, 205, 196, 0.2); color: #4ECDC4; }
.element-earth .element-badge { background: rgba(160, 82, 45, 0.2); color: #A0522D; }
.element-wind .element-badge { background: rgba(152, 216, 200, 0.2); color: #98D8C8; }
.element-nature .element-badge { background: rgba(124, 179, 66, 0.2); color: #7CB342; }
.element-light .element-badge { background: rgba(232, 228, 240, 0.2); color: #E8E4F0; }
.element-dark .element-badge { background: rgba(147, 112, 219, 0.2); color: #9370DB; }
.element-arcane .element-badge { background: rgba(186, 85, 211, 0.2); color: #BA55D3; }

.rarity-badge {
  background: rgba(150, 150, 150, 0.2);
  color: #999;
}

.rarity-common .rarity-badge { background: rgba(150, 150, 150, 0.2); color: #999; }
.rarity-uncommon .rarity-badge { background: rgba(76, 175, 80, 0.2); color: #4CAF50; }
.rarity-rare .rarity-badge { background: rgba(33, 150, 243, 0.2); color: #2196F3; }
.rarity-legendary .rarity-badge { background: rgba(255, 193, 7, 0.2); color: #FFC107; }

.material-description {
  color: #B8B8D1;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.detail-section {
  text-align: left;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  color: #DDA0DD;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(147, 112, 219, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-icon {
  font-size: 18px;
}

.stat-label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 14px;
  color: #B8B8D1;
  font-weight: 500;
}

.stat-value.big {
  font-size: 24px;
  font-weight: bold;
  color: #DDA0DD;
}

.stat-bar-container {
  height: 8px;
  background: rgba(60, 60, 100, 0.5);
  border-radius: 10px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.stat-bar.high { background: linear-gradient(90deg, #4CAF50, #8BC34A); }
.stat-bar.medium { background: linear-gradient(90deg, #FF9800, #FFC107); }
.stat-bar.low { background: linear-gradient(90deg, #f44336, #FF5722); }

.side-effect-text {
  color: #FFAB91;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.lore-section {
  background: rgba(147, 112, 219, 0.1);
  border: 1px solid rgba(147, 112, 219, 0.2);
}

.lore-text {
  color: #B39DDB;
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
  font-style: italic;
}

.last-used {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.clock-icon {
  font-size: 14px;
}

.close-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6B48C7 0%, #9370DB 100%);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 72, 199, 0.4);
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 72, 199, 0.6);
}

@media (max-width: 600px) {
  .modal-content {
    padding: 25px 20px;
  }
  
  .material-icon {
    font-size: 56px;
  }
  
  .material-name {
    font-size: 22px;
  }
}
</style>
