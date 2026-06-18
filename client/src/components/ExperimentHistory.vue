<template>
  <div class="history-container">
    <div class="history-header">
      <h2 class="history-title">📜 实验历史</h2>
      <div class="history-stats">
        <span class="stat success">成功: {{ successCount }}</span>
        <span class="stat failure">失败: {{ failureCount }}</span>
      </div>
    </div>

    <div v-if="experiments.length === 0" class="empty-history">
      <div class="empty-icon">🔬</div>
      <p>还没有进行过实验</p>
      <p class="hint">去实验室开始你的第一次炼金实验吧！</p>
    </div>

    <div v-else class="experiment-list">
      <div
        v-for="exp in experiments"
        :key="exp.id"
        class="experiment-item"
        :class="{ success: exp.success, failure: !exp.success }"
      >
        <div class="exp-header">
          <div class="exp-icon">
            {{ exp.success ? '✅' : '❌' }}
          </div>
          <div class="exp-info">
            <div class="exp-title">
              {{ exp.success ? getRecipeName(exp.recipeId) : '实验失败' }}
            </div>
            <div class="exp-time">{{ formatTime(exp.timestamp) }}</div>
          </div>
          <div class="exp-result">
            <span v-if="exp.success" class="exp-gain">+{{ exp.expGained }} EXP</span>
            <span v-else class="exp-penalty">-{{ exp.failurePenalty }} EXP</span>
          </div>
        </div>

        <div class="exp-ingredients">
          <span class="ing-label">材料:</span>
          <div class="ing-list">
            <span
              v-for="ingId in exp.ingredients"
              :key="ingId"
              class="ing-tag"
            >
              {{ getIngredientName(ingId) }}
            </span>
          </div>
        </div>

        <div class="exp-actions">
          <button class="replay-btn" @click="$emit('replay', exp)">
            🔄 再试一次
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  experiments: {
    type: Array,
    default: () => []
  }
})

defineEmits(['replay'])

const ingredientNames = {
  fire_essence: '🔥 火焰精华',
  water_crystal: '💧 水晶',
  earth_dust: '🌍 大地之尘',
  wind_feather: '🪶 风之羽',
  mandrake_root: '🌿 曼德拉草根',
  moonstone: '🌙 月光石',
  shadow_ink: '🌑 暗影墨水',
  phoenix_feather: '🪶 凤凰羽毛',
  dragon_scale: '🐉 龙鳞',
  mermaid_tear: '🧜 人鱼之泪',
  ancient_rune: '📜 远古符文',
  star_dust: '✨ 星尘'
}

const recipeNames = {
  health_potion: '💚 治疗药水',
  fire_bolt_spell: '🔥 火球术卷轴',
  shield_charm: '🛡️ 护盾护符',
  speed_elixir: '💨 疾风药剂',
  shadow_cloak: '👤 暗影斗篷',
  starlight_beam: '⭐ 星光术',
  phoenix_rebirth: '🔥 凤凰重生药剂',
  tidal_wave: '🌊 潮汐巨浪',
  stone_skin: '🪨 石肤术',
  arcane_explosion: '💥 奥术爆发'
}

const successCount = computed(() => 
  props.experiments.filter(e => e.success).length
)

const failureCount = computed(() => 
  props.experiments.filter(e => !e.success).length
)

function getIngredientName(id) {
  return ingredientNames[id] || id
}

function getRecipeName(id) {
  return recipeNames[id] || id
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
</script>

<style scoped>
.history-container {
  background: linear-gradient(145deg, rgba(40, 40, 70, 0.6) 0%, rgba(30, 30, 55, 0.8) 100%);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(147, 112, 219, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.history-title {
  font-size: 24px;
  color: #E6E6FA;
}

.history-stats {
  display: flex;
  gap: 15px;
}

.stat {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.stat.success {
  background: rgba(76, 175, 80, 0.15);
  color: #81C784;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.stat.failure {
  background: rgba(244, 67, 54, 0.15);
  color: #E57373;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.empty-history {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-history p {
  margin: 10px 0;
  font-size: 16px;
}

.empty-history .hint {
  font-size: 14px;
  color: #666;
}

.experiment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.experiment-item {
  background: linear-gradient(145deg, rgba(50, 50, 80, 0.6) 0%, rgba(35, 35, 60, 0.8) 100%);
  border-radius: 14px;
  padding: 18px;
  border-left: 4px solid #666;
  transition: all 0.3s ease;
}

.experiment-item:hover {
  transform: translateX(5px);
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
}

.experiment-item.success {
  border-left-color: #4CAF50;
}

.experiment-item.failure {
  border-left-color: #f44336;
}

.exp-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
}

.exp-icon {
  font-size: 28px;
}

.exp-info {
  flex: 1;
}

.exp-title {
  font-size: 16px;
  font-weight: 600;
  color: #E6E6FA;
  margin-bottom: 4px;
}

.success .exp-title {
  color: #81C784;
}

.failure .exp-title {
  color: #E57373;
}

.exp-time {
  font-size: 12px;
  color: #888;
}

.exp-result {
  text-align: right;
}

.exp-gain {
  color: #81C784;
  font-weight: 600;
  font-size: 14px;
}

.exp-penalty {
  color: #E57373;
  font-weight: 600;
  font-size: 14px;
}

.exp-ingredients {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.ing-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
  flex-shrink: 0;
}

.ing-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.ing-tag {
  padding: 4px 10px;
  background: rgba(147, 112, 219, 0.15);
  color: #B8B8D1;
  border-radius: 12px;
  font-size: 12px;
}

.exp-actions {
  display: flex;
  justify-content: flex-end;
}

.replay-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(147, 112, 219, 0.2);
  color: #B8B8D1;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.3s ease;
  border: 1px solid rgba(147, 112, 219, 0.3);
}

.replay-btn:hover {
  background: rgba(147, 112, 219, 0.3);
  color: #E6E6FA;
}

@media (max-width: 600px) {
  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .exp-header {
    flex-wrap: wrap;
  }
  
  .exp-result {
    width: 100%;
    text-align: left;
  }
}
</style>
