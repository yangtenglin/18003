<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" :class="{ success: result.success, failure: !result.success }">
      <div class="modal-icon">
        <span v-if="result.success">✨</span>
        <span v-else>💥</span>
      </div>
      
      <h2 class="modal-title">
        {{ result.success ? '实验成功！' : '实验失败...' }}
      </h2>

      <div v-if="result.success" class="result-success">
        <div class="result-name">{{ getRecipeName() }}</div>
        <div class="result-type">{{ getCategoryName() }}</div>
        
        <div class="result-desc">
          {{ getRecipeDescription() }}
        </div>

        <div class="result-result" v-if="result.result">
          <div class="result-effect">
            <span class="effect-label">效果</span>
            <span class="effect-value">{{ getEffectName() }}</span>
          </div>
          <div class="result-power">
            <span class="power-label">威力</span>
            <span class="power-value">{{ result.result.power }}</span>
          </div>
        </div>

        <div class="rewards">
          <div class="reward-item">
            <span class="reward-icon">⭐</span>
            <span class="reward-text">+{{ result.expGained }} 经验</span>
          </div>
        </div>

        <button
          class="favorite-btn"
          :class="{ favorited: isFavorite }"
          @click="$emit('toggle-favorite', result.recipeId)"
        >
          <span>{{ isFavorite ? '❤️' : '🤍' }}</span>
          {{ isFavorite ? '已收藏' : '收藏配方' }}
        </button>
      </div>

      <div v-else class="result-failure">
        <p class="failure-text">材料组合产生了不稳定的反应...</p>
        <div class="penalty">
          <span class="penalty-icon">💀</span>
          <span class="penalty-text">-{{ result.failurePenalty }} 经验惩罚</span>
        </div>
        <p class="failure-hint">提示：尝试不同的材料组合，也许会有惊喜！</p>
      </div>

      <button class="close-btn" @click="$emit('close')">
        继续实验
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'toggle-favorite'])

const categoryNames = {
  potion: '药水',
  scroll: '卷轴',
  charm: '护符',
  elixir: '药剂',
  artifact: '神器',
  spell: '法术',
  buff: '增益',
  attack: '攻击',
  defense: '防御',
  utility: '实用',
  legendary: '传说'
}

const effectNames = {
  heal: '治疗',
  fire_damage: '火焰伤害',
  shield: '魔法护盾',
  speed: '速度提升',
  invisibility: '隐身',
  light_damage: '圣光伤害',
  revive: '复活',
  water_damage: '水流伤害',
  defense_boost: '防御强化',
  arcane_damage: '奥术伤害'
}

function getCategoryName() {
  const recipe = getRecipe()
  if (!recipe) return ''
  return categoryNames[recipe.category] || recipe.category
}

function getEffectName() {
  if (!props.result.result) return ''
  return effectNames[props.result.result.effect] || props.result.result.effect
}

function getRecipe() {
  return props.result.recipe || null
}

function getRecipeName() {
  const recipe = getRecipe()
  return recipe ? recipe.name : '未知配方'
}

function getRecipeDescription() {
  const recipe = getRecipe()
  return recipe ? recipe.description : ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(145deg, rgba(50, 50, 80, 0.95) 0%, rgba(30, 30, 55, 0.98) 100%);
  border-radius: 25px;
  padding: 40px;
  max-width: 450px;
  width: 90%;
  text-align: center;
  border: 2px solid rgba(147, 112, 219, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s ease;
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

.modal-content.success {
  border-color: rgba(76, 175, 80, 0.6);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(76, 175, 80, 0.2);
}

.modal-content.failure {
  border-color: rgba(244, 67, 54, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(244, 67, 54, 0.15);
}

.modal-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.modal-title {
  font-size: 28px;
  margin-bottom: 25px;
  color: #E6E6FA;
}

.success .modal-title {
  color: #81C784;
}

.failure .modal-title {
  color: #E57373;
}

.result-name {
  font-size: 24px;
  font-weight: bold;
  color: #BA55D3;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(186, 85, 211, 0.5);
}

.result-type {
  display: inline-block;
  padding: 5px 15px;
  background: rgba(147, 112, 219, 0.2);
  color: #9370DB;
  border-radius: 15px;
  font-size: 13px;
  margin-bottom: 20px;
}

.result-desc {
  color: #B8B8D1;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.result-result {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 25px;
}

.result-effect,
.result-power {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.effect-label,
.power-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.effect-value,
.power-value {
  font-size: 20px;
  font-weight: bold;
  color: #DDA0DD;
}

.rewards {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 215, 0, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.reward-icon {
  font-size: 18px;
}

.reward-text {
  color: #FFD700;
  font-weight: 600;
  font-size: 15px;
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: rgba(147, 112, 219, 0.2);
  color: #B8B8D1;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  border: 1px solid rgba(147, 112, 219, 0.3);
  margin-bottom: 20px;
}

.favorite-btn:hover {
  background: rgba(147, 112, 219, 0.3);
  color: #E6E6FA;
}

.favorite-btn.favorited {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.4);
  color: #E57373;
}

.result-failure {
  margin-bottom: 25px;
}

.failure-text {
  color: #B8B8D1;
  font-size: 16px;
  margin-bottom: 20px;
}

.penalty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(244, 67, 54, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 54, 0.3);
  margin-bottom: 20px;
}

.penalty-icon {
  font-size: 24px;
}

.penalty-text {
  color: #E57373;
  font-size: 18px;
  font-weight: 600;
}

.failure-hint {
  color: #888;
  font-size: 13px;
  font-style: italic;
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
</style>
