<template>
  <div class="recipe-book">
    <div class="book-header">
      <h2 class="book-title">📖 配方书</h2>
      <div class="book-stats">
        <span class="stat">已发现: {{ discoveredRecipes.length }} / {{ allRecipes.length }}</span>
      </div>
    </div>

    <div class="category-filters">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['filter-btn', { active: activeCategory === cat.id }]"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <div class="recipes-grid">
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="recipe-card"
        :class="{ discovered: isDiscovered(recipe.id), favorite: isFavorite(recipe.id) }"
      >
        <div class="recipe-header">
          <h3 class="recipe-name">
            {{ isDiscovered(recipe.id) ? recipe.name : '???' }}
          </h3>
          <button
            v-if="isDiscovered(recipe.id)"
            class="fav-btn"
            @click="$emit('toggle-favorite', recipe.id)"
          >
            {{ isFavorite(recipe.id) ? '❤️' : '🤍' }}
          </button>
        </div>

        <div v-if="isDiscovered(recipe.id)" class="recipe-details">
          <div class="recipe-desc">{{ recipe.description }}</div>
          
          <div class="recipe-ingredients">
            <span class="ingredients-label">材料:</span>
            <div class="ingredient-list">
              <span
                v-for="ingId in recipe.ingredients"
                :key="ingId"
                class="ingredient-tag"
              >
                {{ getIngredientName(ingId) }}
              </span>
            </div>
          </div>

          <div class="recipe-stats">
            <span class="stat-item">
              <span class="stat-icon">⚡</span>
              {{ recipe.result.power }}
            </span>
            <span class="stat-item">
              <span class="stat-icon">⭐</span>
              {{ recipe.exp }} EXP
            </span>
            <span class="stat-item">
              <span class="stat-icon">📊</span>
              难度 {{ recipe.difficulty }}
            </span>
          </div>
        </div>

        <div v-else class="recipe-undiscovered">
          <div class="unknown-icon">🔒</div>
          <p>尚未发现此配方</p>
          <p class="hint">尝试不同的材料组合来解锁</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  discoveredRecipes: {
    type: Array,
    default: () => []
  },
  allRecipes: {
    type: Array,
    default: () => []
  },
  favorites: {
    type: Array,
    default: () => []
  }
})

defineEmits(['toggle-favorite'])

const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '全部', icon: '📚' },
  { id: 'potion', name: '药水', icon: '🧪' },
  { id: 'attack', name: '攻击', icon: '⚔️' },
  { id: 'defense', name: '防御', icon: '🛡️' },
  { id: 'buff', name: '增益', icon: '✨' },
  { id: 'utility', name: '实用', icon: '🔧' },
  { id: 'legendary', name: '传说', icon: '👑' }
]

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

const filteredRecipes = computed(() => {
  if (activeCategory.value === 'all') {
    return props.allRecipes
  }
  return props.allRecipes.filter(r => r.category === activeCategory.value)
})

function isDiscovered(recipeId) {
  return props.discoveredRecipes.some(r => r.id === recipeId)
}

function isFavorite(recipeId) {
  return props.favorites.includes(recipeId)
}

function getIngredientName(id) {
  return ingredientNames[id] || id
}
</script>

<style scoped>
.recipe-book {
  background: linear-gradient(145deg, rgba(40, 40, 70, 0.6) 0%, rgba(30, 30, 55, 0.8) 100%);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(147, 112, 219, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.book-title {
  font-size: 24px;
  color: #E6E6FA;
}

.book-stats .stat {
  color: #B8B8D1;
  font-size: 14px;
  background: rgba(147, 112, 219, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.filter-btn {
  padding: 8px 16px;
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

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.recipe-card {
  background: linear-gradient(145deg, rgba(50, 50, 80, 0.6) 0%, rgba(35, 35, 60, 0.8) 100%);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(100, 100, 140, 0.3);
  transition: all 0.3s ease;
}

.recipe-card.discovered {
  border-color: rgba(147, 112, 219, 0.5);
  background: linear-gradient(145deg, rgba(60, 60, 90, 0.7) 0%, rgba(45, 45, 70, 0.9) 100%);
}

.recipe-card.discovered:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(147, 112, 219, 0.2);
  border-color: rgba(186, 85, 211, 0.7);
}

.recipe-card.favorite {
  border-color: rgba(244, 67, 54, 0.6) !important;
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.15);
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.recipe-name {
  font-size: 18px;
  color: #E6E6FA;
  flex: 1;
}

.discovered .recipe-name {
  color: #BA55D3;
}

.fav-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s ease;
}

.fav-btn:hover {
  transform: scale(1.2);
}

.recipe-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-desc {
  color: #B8B8D1;
  font-size: 13px;
  line-height: 1.5;
}

.recipe-ingredients {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredients-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ingredient-tag {
  padding: 4px 10px;
  background: rgba(147, 112, 219, 0.2);
  color: #DDA0DD;
  border-radius: 12px;
  font-size: 12px;
}

.recipe-stats {
  display: flex;
  gap: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(100, 100, 140, 0.3);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #B8B8D1;
}

.stat-icon {
  font-size: 14px;
}

.recipe-undiscovered {
  text-align: center;
  padding: 20px 10px;
  color: #666;
}

.unknown-icon {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.recipe-undiscovered p {
  margin: 5px 0;
  font-size: 14px;
}

.recipe-undiscovered .hint {
  font-size: 12px;
  color: #555;
}

@media (max-width: 600px) {
  .book-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
