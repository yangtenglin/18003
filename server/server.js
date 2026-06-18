const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');

function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function checkRecipe(ingredients, recipes) {
  const sortedInput = [...ingredients].sort();
  for (const recipe of recipes) {
    const sortedRecipe = [...recipe.ingredients].sort();
    if (sortedInput.length === sortedRecipe.length &&
        sortedInput.every((item, idx) => item === sortedRecipe[idx])) {
      return recipe;
    }
  }
  return null;
}

app.get('/api/materials', (req, res) => {
  const data = readJSON('materials.json');
  res.json(data);
});

app.get('/api/recipes', (req, res) => {
  const data = readJSON('recipes.json');
  res.json(data);
});

app.get('/api/recipes/discovered', (req, res) => {
  const experiments = readJSON('experiments.json').experiments;
  const allRecipes = readJSON('recipes.json').recipes;
  const discoveredIds = new Set();
  experiments.forEach(exp => {
    if (exp.success && exp.recipeId) {
      discoveredIds.add(exp.recipeId);
    }
  });
  const discovered = allRecipes.filter(r => discoveredIds.has(r.id));
  res.json({ recipes: discovered });
});

app.get('/api/experiments', (req, res) => {
  const data = readJSON('experiments.json');
  res.json(data);
});

app.post('/api/experiment', (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Invalid ingredients' });
  }

  const recipes = readJSON('recipes.json').recipes;
  const matched = checkRecipe(ingredients, recipes);
  const experimentData = readJSON('experiments.json');
  const experiment = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ingredients,
    success: !!matched,
    recipeId: matched ? matched.id : null,
    recipe: matched || null,
    result: matched ? matched.result : null,
    expGained: matched ? matched.exp : 0,
    failurePenalty: matched ? 0 : Math.floor(Math.random() * 10) + 5
  };
  experimentData.experiments.unshift(experiment);
  if (experimentData.experiments.length > 100) {
    experimentData.experiments = experimentData.experiments.slice(0, 100);
  }
  writeJSON('experiments.json', experimentData);
  
  const codexData = readJSON('codex.json');
  const now = new Date().toISOString();
  ingredients.forEach(ingId => {
    if (!codexData.discovered[ingId]) {
      codexData.discovered[ingId] = true;
    }
    if (!codexData.usageCount[ingId]) {
      codexData.usageCount[ingId] = 0;
    }
    codexData.usageCount[ingId]++;
    codexData.lastUsed[ingId] = now;
  });
  writeJSON('codex.json', codexData);
  
  res.json(experiment);
});

app.get('/api/favorites', (req, res) => {
  const data = readJSON('favorites.json');
  res.json(data);
});

app.post('/api/favorites', (req, res) => {
  const { recipeId } = req.body;
  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe ID required' });
  }
  const data = readJSON('favorites.json');
  if (!data.favorites.includes(recipeId)) {
    data.favorites.push(recipeId);
    writeJSON('favorites.json', data);
  }
  res.json(data);
});

app.delete('/api/favorites/:recipeId', (req, res) => {
  const { recipeId } = req.params;
  const data = readJSON('favorites.json');
  data.favorites = data.favorites.filter(id => id !== recipeId);
  writeJSON('favorites.json', data);
  res.json(data);
});

app.get('/api/materials/draw', (req, res) => {
  const { count = 5, tier = null } = req.query;
  const materials = readJSON('materials.json').materials;
  let pool = materials;
  if (tier) {
    pool = materials.filter(m => m.tier === parseInt(tier));
  }
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, parseInt(count));
  
  const codexData = readJSON('codex.json');
  let newlyDiscovered = [];
  drawn.forEach(m => {
    if (!codexData.discovered[m.id]) {
      codexData.discovered[m.id] = true;
      newlyDiscovered.push(m.id);
    }
  });
  writeJSON('codex.json', codexData);
  
  res.json({ materials: drawn, newlyDiscovered });
});

app.get('/api/codex', (req, res) => {
  const codexData = readJSON('codex.json');
  const allMaterials = readJSON('materials.json').materials;
  
  const result = allMaterials.map(m => {
    const discovered = !!codexData.discovered[m.id];
    const usageCount = codexData.usageCount[m.id] || 0;
    const lastUsed = codexData.lastUsed[m.id] || null;
    return {
      ...m,
      discovered,
      usageCount,
      lastUsed
    };
  });
  
  const totalDiscovered = result.filter(m => m.discovered).length;
  res.json({ materials: result, totalDiscovered, totalMaterials: result.length });
});

app.get('/api/stats', (req, res) => {
  const experiments = readJSON('experiments.json').experiments;
  const successes = experiments.filter(e => e.success).length;
  const total = experiments.length;
  const totalExp = experiments.reduce((sum, e) => sum + e.expGained, 0);
  const uniqueRecipes = new Set(
    experiments.filter(e => e.success).map(e => e.recipeId)
  ).size;
  res.json({
    totalExperiments: total,
    successfulExperiments: successes,
    successRate: total > 0 ? (successes / total * 100).toFixed(1) : 0,
    totalExp,
    uniqueDiscovered: uniqueRecipes
  });
});

app.listen(PORT, () => {
  console.log(`法术配方实验室服务器运行在 http://localhost:${PORT}`);
});
