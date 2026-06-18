<template>
  <div class="material-panel">
    <div class="panel-header">
      <h2 class="panel-title">🧪 材料库存</h2>
      <button class="draw-btn" @click="$emit('draw-materials')">
        <span>🎲</span>
        抽取材料
      </button>
    </div>

    <div class="materials-grid">
      <div
        v-for="material in materials"
        :key="material.id"
        class="material-card"
        :class="[`rarity-${material.rarity}`, `element-${material.element}`]"
        draggable="true"
        @dragstart="onDragStart($event, material)"
        @click="$emit('add-to-cauldron', material)"
      >
        <div class="material-icon">{{ material.icon }}</div>
        <div class="material-name">{{ material.name }}</div>
        <div class="material-tier">
          <span v-for="n in material.tier" :key="n" class="tier-star">⭐</span>
        </div>
        <div class="material-element">{{ getElementName(material.element) }}</div>
        <div class="material-desc">{{ material.description }}</div>
        <div class="add-hint">点击添加 →</div>
      </div>

      <div v-if="materials.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>暂无材料</p>
        <p class="empty-hint">点击"抽取材料"获得魔法材料</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  materials: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['draw-materials', 'add-to-cauldron'])

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

function getElementName(element) {
  return elementNames[element] || element
}

function onDragStart(event, material) {
  event.dataTransfer.setData('material', JSON.stringify(material))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.material-panel {
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
  margin-bottom: 20px;
}

.panel-title {
  font-size: 22px;
  color: #E6E6FA;
}

.draw-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6B48C7 0%, #9370DB 100%);
  color: white;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 72, 199, 0.4);
}

.draw-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 72, 199, 0.6);
}

.draw-btn:active {
  transform: translateY(0);
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.material-card {
  background: linear-gradient(145deg, rgba(50, 50, 80, 0.8) 0%, rgba(35, 35, 60, 0.9) 100%);
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.material-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.material-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(186, 85, 211, 0.6);
  box-shadow: 0 8px 25px rgba(147, 112, 219, 0.3);
}

.material-card:active {
  transform: translateY(-2px) scale(0.98);
}

.rarity-common {
  border-color: rgba(150, 150, 150, 0.3);
}

.rarity-uncommon {
  border-color: rgba(76, 175, 80, 0.5);
  box-shadow: inset 0 0 20px rgba(76, 175, 80, 0.1);
}

.rarity-rare {
  border-color: rgba(33, 150, 243, 0.5);
  box-shadow: inset 0 0 20px rgba(33, 150, 243, 0.15);
}

.rarity-legendary {
  border-color: rgba(255, 193, 7, 0.6);
  box-shadow: inset 0 0 25px rgba(255, 193, 7, 0.2);
  animation: legendary-glow 2s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% {
    box-shadow: inset 0 0 25px rgba(255, 193, 7, 0.2), 0 0 15px rgba(255, 193, 7, 0.3);
  }
  50% {
    box-shadow: inset 0 0 35px rgba(255, 193, 7, 0.3), 0 0 25px rgba(255, 193, 7, 0.5);
  }
}

.material-icon {
  font-size: 40px;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.material-name {
  font-size: 14px;
  font-weight: 600;
  color: #E6E6FA;
  margin-bottom: 6px;
}

.material-tier {
  margin-bottom: 6px;
}

.tier-star {
  font-size: 12px;
  color: #FFD700;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.material-element {
  font-size: 11px;
  color: #9370DB;
  background: rgba(147, 112, 219, 0.15);
  padding: 3px 8px;
  border-radius: 10px;
  display: inline-block;
  margin-bottom: 8px;
}

.element-fire .material-element { color: #FF6B35; background: rgba(255, 107, 53, 0.15); }
.element-water .material-element { color: #4ECDC4; background: rgba(78, 205, 196, 0.15); }
.element-earth .material-element { color: #A0522D; background: rgba(160, 82, 45, 0.15); }
.element-wind .material-element { color: #98D8C8; background: rgba(152, 216, 200, 0.15); }
.element-nature .material-element { color: #7CB342; background: rgba(124, 179, 66, 0.15); }
.element-light .material-element { color: #E8E4F0; background: rgba(232, 228, 240, 0.15); }
.element-dark .material-element { color: #9370DB; background: rgba(147, 112, 219, 0.15); }
.element-arcane .material-element { color: #BA55D3; background: rgba(186, 85, 211, 0.15); }

.material-desc {
  font-size: 11px;
  color: #888;
  line-height: 1.4;
  margin-bottom: 8px;
  min-height: 30px;
}

.add-hint {
  font-size: 11px;
  color: #BA55D3;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.material-card:hover .add-hint {
  opacity: 1;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-state p {
  margin: 5px 0;
}

.empty-hint {
  font-size: 13px;
  color: #888;
}

@media (max-width: 1100px) {
  .materials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .materials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
