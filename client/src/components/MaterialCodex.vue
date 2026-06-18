<template>
  <div class="material-codex">
    <div class="codex-header">
      <h2 class="codex-title">📚 材料图鉴</h2>
      <div class="codex-stats">
        <span class="stat">已发现: {{ totalDiscovered }} / {{ totalMaterials }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <span class="filter-label">元素:</span>
        <button
          v-for="elem in elementFilters"
          :key="elem.id"
          :class="['filter-btn', 'element-filter', { active: activeElement === elem.id }]"
          @click="activeElement = elem.id"
        >
          <span class="filter-icon">{{ elem.icon }}</span>
          <span class="filter-name">{{ elem.name }}</span>
        </button>
      </div>

      <div class="filter-group">
        <span class="filter-label">稀有度:</span>
        <button
          v-for="rar in rarityFilters"
          :key="rar.id"
          :class="['filter-btn', 'rarity-filter', { active: activeRarity === rar.id }]"
          @click="activeRarity = rar.id"
        >
          {{ rar.name }}
        </button>
      </div>
    </div>

    <div class="codex-grid">
      <div
        v-for="material in filteredMaterials"
        :key="material.id"
        class="codex-card"
        :class="[
          `rarity-${material.rarity}`,
          `element-${material.element}`,
          { discovered: material.discovered, 'undiscovered': !material.discovered }
        ]"
        @click="handleCardClick(material)"
      >
        <div v-if="material.discovered" class="card-content">
          <div class="card-icon">{{ material.icon }}</div>
          <div class="card-name">{{ material.name }}</div>
          <div class="card-tier">
            <span v-for="n in material.tier" :key="n" class="tier-star">⭐</span>
          </div>
          <div class="card-element">{{ getElementName(material.element) }}</div>
          <div class="card-usage">
            <span class="usage-icon">🔬</span>
            使用 {{ material.usageCount }} 次
          </div>
        </div>

        <div v-else class="card-content undiscovered-content">
          <div class="card-icon unknown-icon">❓</div>
          <div class="card-name">???</div>
          <div class="card-tier">
            <span v-for="n in material.tier" :key="n" class="tier-star faded">⭐</span>
          </div>
          <div class="card-element">{{ getElementName(material.element) }}</div>
          <div class="unlock-hint">
            <span class="lock-icon">🔒</span>
            {{ material.unlockCondition }}
          </div>
        </div>
      </div>
    </div>

    <MaterialDetailModal
      v-if="selectedMaterial"
      :material="selectedMaterial"
      @close="selectedMaterial = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MaterialDetailModal from './MaterialDetailModal.vue'

const props = defineProps({
  materials: {
    type: Array,
    default: () => []
  },
  totalDiscovered: {
    type: Number,
    default: 0
  },
  totalMaterials: {
    type: Number,
    default: 0
  }
})

const selectedMaterial = ref(null)
const activeElement = ref('all')
const activeRarity = ref('all')

const elementFilters = [
  { id: 'all', name: '全部', icon: '✨' },
  { id: 'fire', name: '火', icon: '🔥' },
  { id: 'water', name: '水', icon: '💧' },
  { id: 'earth', name: '土', icon: '🌍' },
  { id: 'wind', name: '风', icon: '🪶' },
  { id: 'nature', name: '自然', icon: '🌿' },
  { id: 'light', name: '光', icon: '🌙' },
  { id: 'dark', name: '暗', icon: '🌑' },
  { id: 'arcane', name: '奥术', icon: '📜' }
]

const rarityFilters = [
  { id: 'all', name: '全部' },
  { id: 'common', name: '普通' },
  { id: 'uncommon', name: '非凡' },
  { id: 'rare', name: '稀有' },
  { id: 'legendary', name: '传说' }
]

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

const progressPercent = computed(() => {
  if (props.totalMaterials === 0) return 0
  return (props.totalDiscovered / props.totalMaterials) * 100
})

const filteredMaterials = computed(() => {
  let result = props.materials
  if (activeElement.value !== 'all') {
    result = result.filter(m => m.element === activeElement.value)
  }
  if (activeRarity.value !== 'all') {
    result = result.filter(m => m.rarity === activeRarity.value)
  }
  return result
})

function getElementName(element) {
  return elementNames[element] || element
}

function handleCardClick(material) {
  if (material.discovered) {
    selectedMaterial.value = material
  }
}
</script>

<style scoped>
.material-codex {
  background: linear-gradient(145deg, rgba(40, 40, 70, 0.6) 0%, rgba(30, 30, 55, 0.8) 100%);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(147, 112, 219, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.codex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.codex-title {
  font-size: 24px;
  color: #E6E6FA;
}

.codex-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.codex-stats .stat {
  color: #B8B8D1;
  font-size: 14px;
  background: rgba(147, 112, 219, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(60, 60, 100, 0.5);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6B48C7, #BA55D3);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(100, 100, 150, 0.2);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 60px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(60, 60, 90, 0.5);
  color: #aaa;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.filter-btn:hover {
  background: rgba(100, 100, 140, 0.5);
  color: #ddd;
}

.filter-btn.active {
  background: linear-gradient(135deg, #6B48C7 0%, #9370DB 100%);
  color: white;
  border-color: #BA55D3;
}

.filter-icon {
  font-size: 14px;
}

.codex-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.codex-card {
  background: linear-gradient(145deg, rgba(50, 50, 80, 0.6) 0%, rgba(35, 35, 60, 0.8) 100%);
  border-radius: 16px;
  padding: 18px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(100, 100, 140, 0.3);
  position: relative;
  overflow: hidden;
  user-select: none;
}

.codex-card.discovered {
  border-color: rgba(147, 112, 219, 0.5);
  cursor: pointer;
}

.codex-card.discovered:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(147, 112, 219, 0.25);
  border-color: rgba(186, 85, 211, 0.7);
}

.codex-card.undiscovered {
  opacity: 0.6;
  cursor: default;
  filter: grayscale(0.5);
}

.rarity-common { border-color: rgba(150, 150, 150, 0.3); }
.rarity-uncommon { 
  border-color: rgba(76, 175, 80, 0.5);
  box-shadow: inset 0 0 15px rgba(76, 175, 80, 0.1);
}
.rarity-rare { 
  border-color: rgba(33, 150, 243, 0.5);
  box-shadow: inset 0 0 20px rgba(33, 150, 243, 0.15);
}
.rarity-legendary { 
  border-color: rgba(255, 193, 7, 0.6);
  box-shadow: inset 0 0 25px rgba(255, 193, 7, 0.2);
  animation: legendary-pulse 2s ease-in-out infinite;
}

@keyframes legendary-pulse {
  0%, 100% {
    box-shadow: inset 0 0 25px rgba(255, 193, 7, 0.2), 0 0 12px rgba(255, 193, 7, 0.25);
  }
  50% {
    box-shadow: inset 0 0 35px rgba(255, 193, 7, 0.3), 0 0 20px rgba(255, 193, 7, 0.4);
  }
}

.card-icon {
  font-size: 48px;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.unknown-icon {
  opacity: 0.4;
  font-size: 40px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: #E6E6FA;
  margin-bottom: 6px;
}

.undiscovered-content .card-name {
  color: #666;
}

.card-tier {
  margin-bottom: 8px;
}

.tier-star {
  font-size: 12px;
  color: #FFD700;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.tier-star.faded {
  color: #555;
  text-shadow: none;
}

.card-element {
  font-size: 11px;
  color: #9370DB;
  background: rgba(147, 112, 219, 0.15);
  padding: 3px 10px;
  border-radius: 10px;
  display: inline-block;
  margin-bottom: 10px;
}

.element-fire .card-element { color: #FF6B35; background: rgba(255, 107, 53, 0.15); }
.element-water .card-element { color: #4ECDC4; background: rgba(78, 205, 196, 0.15); }
.element-earth .card-element { color: #A0522D; background: rgba(160, 82, 45, 0.15); }
.element-wind .card-element { color: #98D8C8; background: rgba(152, 216, 200, 0.15); }
.element-nature .card-element { color: #7CB342; background: rgba(124, 179, 66, 0.15); }
.element-light .card-element { color: #E8E4F0; background: rgba(232, 228, 240, 0.15); }
.element-dark .card-element { color: #9370DB; background: rgba(147, 112, 219, 0.15); }
.element-arcane .card-element { color: #BA55D3; background: rgba(186, 85, 211, 0.15); }

.card-usage {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(100, 100, 140, 0.2);
}

.usage-icon {
  font-size: 12px;
}

.unlock-hint {
  font-size: 11px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(60, 60, 80, 0.3);
  line-height: 1.4;
}

.lock-icon {
  font-size: 14px;
}

@media (max-width: 600px) {
  .codex-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .codex-stats {
    width: 100%;
    align-items: flex-start;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .codex-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
