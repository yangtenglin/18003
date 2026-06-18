<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">🔮 法术配方实验室</h1>
      <div class="header-stats">
        <span class="stat-item">
          <span class="stat-label">实验次数</span>
          <span class="stat-value">{{ stats.totalExperiments }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">成功率</span>
          <span class="stat-value">{{ stats.successRate }}%</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">总经验</span>
          <span class="stat-value">{{ stats.totalExp }}</span>
        </span>
      </div>
    </header>

    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <main class="main-content">
      <div v-show="activeTab === 'lab'" class="lab-section">
        <div class="lab-layout">
          <MaterialPanel
            :materials="availableMaterials"
            @draw-materials="drawMaterials"
            @add-to-cauldron="addToCauldron"
          />
          <Cauldron
            :cauldronItems="cauldronItems"
            :is-brewing="isBrewing"
            @remove-item="removeFromCauldron"
            @clear-cauldron="clearCauldron"
            @brew="startBrewing"
            @add-item="addToCauldron"
          />
        </div>

        <ResultModal
          v-if="showResult"
          :result="lastResult"
          @close="closeResult"
          @toggle-favorite="toggleFavorite"
          :is-favorite="isFavorite(lastResult?.recipeId)"
        />
      </div>

      <div v-show="activeTab === 'recipes'" class="recipes-section">
        <RecipeBook
          :discovered-recipes="discoveredRecipes"
          :all-recipes="allRecipes"
          :favorites="favorites"
          @toggle-favorite="toggleFavorite"
        />
      </div>

      <div v-show="activeTab === 'history'" class="history-section">
        <ExperimentHistory
          :experiments="experiments"
          @replay="replayExperiment"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MaterialPanel from './components/MaterialPanel.vue'
import Cauldron from './components/Cauldron.vue'
import ResultModal from './components/ResultModal.vue'
import RecipeBook from './components/RecipeBook.vue'
import ExperimentHistory from './components/ExperimentHistory.vue'

const activeTab = ref('lab')
const availableMaterials = ref([])
const cauldronItems = ref([])
const isBrewing = ref(false)
const showResult = ref(false)
const lastResult = ref(null)
const experiments = ref([])
const allRecipes = ref([])
const discoveredRecipes = ref([])
const favorites = ref([])
const stats = ref({
  totalExperiments: 0,
  successfulExperiments: 0,
  successRate: 0,
  totalExp: 0,
  uniqueDiscovered: 0
})

const tabs = [
  { id: 'lab', label: '实验室', icon: '⚗️' },
  { id: 'recipes', label: '配方书', icon: '📖' },
  { id: 'history', label: '历史记录', icon: '📜' }
]

async function fetchData() {
  try {
    const [expRes, recipesRes, favRes, statsRes] = await Promise.all([
      fetch('/api/experiments').then(r => r.json()),
      fetch('/api/recipes/discovered').then(r => r.json()),
      fetch('/api/favorites').then(r => r.json()),
      fetch('/api/stats').then(r => r.json())
    ])
    experiments.value = expRes.experiments || []
    discoveredRecipes.value = recipesRes.recipes || []
    favorites.value = favRes.favorites || []
    stats.value = statsRes
  } catch (e) {
    console.error('获取数据失败:', e)
  }
}

async function fetchAllRecipes() {
  try {
    const res = await fetch('/api/recipes')
    const data = await res.json()
    allRecipes.value = data.recipes || []
  } catch (e) {
    console.error('获取配方失败:', e)
  }
}

async function drawMaterials() {
  try {
    const res = await fetch('/api/materials/draw?count=6')
    const data = await res.json()
    availableMaterials.value = data.materials || []
  } catch (e) {
    console.error('抽取材料失败:', e)
  }
}

function addToCauldron(material) {
  if (cauldronItems.value.length < 5) {
    cauldronItems.value.push({ ...material, instanceId: Date.now() + Math.random() })
  }
}

function removeFromCauldron(instanceId) {
  cauldronItems.value = cauldronItems.value.filter(m => m.instanceId !== instanceId)
}

function clearCauldron() {
  cauldronItems.value = []
}

async function startBrewing() {
  if (cauldronItems.value.length === 0 || isBrewing.value) return
  
  isBrewing.value = true
  
  setTimeout(async () => {
    try {
      const ingredientIds = cauldronItems.value.map(m => m.id)
      const res = await fetch('/api/experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientIds })
      })
      const result = await res.json()
      lastResult.value = result
      showResult.value = true
      isBrewing.value = false
      cauldronItems.value = []
      fetchData()
    } catch (e) {
      console.error('实验失败:', e)
      isBrewing.value = false
    }
  }, 2000)
}

function closeResult() {
  showResult.value = false
}

function isFavorite(recipeId) {
  if (!recipeId) return false
  return favorites.value.includes(recipeId)
}

async function toggleFavorite(recipeId) {
  if (!recipeId) return
  try {
    if (favorites.value.includes(recipeId)) {
      await fetch(`/api/favorites/${recipeId}`, { method: 'DELETE' })
      favorites.value = favorites.value.filter(id => id !== recipeId)
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      })
      if (!favorites.value.includes(recipeId)) {
        favorites.value.push(recipeId)
      }
    }
  } catch (e) {
    console.error('收藏操作失败:', e)
  }
}

function replayExperiment(experiment) {
  if (!experiment.ingredients) return
  const materialMap = {}
  allRecipes.value.forEach(r => {})
  availableMaterials.value.forEach(m => {
    materialMap[m.id] = m
  })
  cauldronItems.value = []
  activeTab.value = 'lab'
}

onMounted(() => {
  fetchData()
  fetchAllRecipes()
  drawMaterials()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(180deg, rgba(30, 30, 60, 0.95) 0%, rgba(20, 20, 40, 0.8) 100%);
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(138, 43, 226, 0.3);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title {
  font-size: 28px;
  background: linear-gradient(90deg, #9370DB, #BA55D3, #DDA0DD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(147, 112, 219, 0.5);
}

.header-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #DDA0DD;
}

.tab-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(20, 20, 40, 0.6);
  border-bottom: 1px solid rgba(100, 100, 150, 0.2);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(60, 60, 100, 0.3);
  color: #aaa;
  border-radius: 30px;
  font-size: 15px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.tab-btn:hover {
  background: rgba(100, 100, 160, 0.4);
  color: #ddd;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6B48C7 0%, #9370DB 100%);
  color: white;
  border-color: #BA55D3;
  box-shadow: 0 4px 20px rgba(147, 112, 219, 0.4);
}

.tab-icon {
  font-size: 18px;
}

.main-content {
  flex: 1;
  padding: 30px;
}

.lab-section {
  max-width: 1200px;
  margin: 0 auto;
}

.lab-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.recipes-section,
.history-section {
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .lab-layout {
    grid-template-columns: 1fr;
  }
  
  .app-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }
  
  .header-stats {
    gap: 20px;
  }
}
</style>
