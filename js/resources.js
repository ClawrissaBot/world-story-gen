// === Natural Resources ===

const RESOURCE_TYPES = {
  timber:     { name: 'Timber',      emoji: '🌲', category: 'raw',   baseYield: 3, ages: [0,8] },
  stone:      { name: 'Stone',       emoji: '🪨', category: 'raw',   baseYield: 2, ages: [0,8] },
  iron:       { name: 'Iron',        emoji: '⛏️', category: 'metal', baseYield: 1, ages: [2,8] },
  copper:     { name: 'Copper',      emoji: '🟤', category: 'metal', baseYield: 2, ages: [1,8] },
  gold:       { name: 'Gold',        emoji: '🥇', category: 'luxury',baseYield: 0.5, ages: [1,8] },
  gems:       { name: 'Gems',        emoji: '💎', category: 'luxury',baseYield: 0.3, ages: [2,8] },
  fertile:    { name: 'Fertile Land', emoji: '🌾', category: 'food', baseYield: 5, ages: [0,8] },
  fish:       { name: 'Fish',        emoji: '🐟', category: 'food',  baseYield: 4, ages: [0,8] },
  game:       { name: 'Game',        emoji: '🦌', category: 'food',  baseYield: 3, ages: [0,4] },
  clay:       { name: 'Clay',        emoji: '🏺', category: 'raw',   baseYield: 2, ages: [0,8] },
  herbs:      { name: 'Herbs',       emoji: '🌿', category: 'special', baseYield: 1, ages: [0,8] },
  coal:       { name: 'Coal',        emoji: '⚫', category: 'fuel',  baseYield: 2, ages: [5,8] },
  oil:        { name: 'Oil',         emoji: '🛢️', category: 'fuel', baseYield: 3, ages: [6,8] },
  horses:     { name: 'Horses',      emoji: '🐴', category: 'special', baseYield: 1, ages: [1,6] },
  salt:       { name: 'Salt',        emoji: '🧂', category: 'trade', baseYield: 2, ages: [0,8] },
};

// Terrain types that determine resource distribution
const TERRAIN_PROFILES = [
  { name: 'Forest',     resources: ['timber','game','herbs','fertile'],     weights: [5,3,2,1] },
  { name: 'Mountains',  resources: ['stone','iron','copper','gold','gems','coal'], weights: [4,3,3,1,1,2] },
  { name: 'Plains',     resources: ['fertile','game','horses','herbs'],     weights: [5,3,2,1] },
  { name: 'Coastal',    resources: ['fish','salt','clay','timber'],         weights: [5,3,2,1] },
  { name: 'River Valley', resources: ['fertile','fish','clay','gold'],      weights: [5,4,2,1] },
  { name: 'Desert Edge', resources: ['salt','gems','stone','herbs'],        weights: [3,2,3,1] },
  { name: 'Hills',      resources: ['stone','iron','copper','game','herbs'],weights: [3,3,2,2,1] },
  { name: 'Wetlands',   resources: ['fish','herbs','clay','fertile'],       weights: [3,3,2,2] },
];

function generateRegionResources() {
  // Pick a random terrain profile
  const terrain = TERRAIN_PROFILES[Math.floor(Math.random() * TERRAIN_PROFILES.length)];
  const resources = {};
  
  // Assign 2-4 resources based on terrain weights
  const numResources = 2 + Math.floor(Math.random() * 3);
  const available = [...terrain.resources];
  const weights = [...terrain.weights];
  
  for (let i = 0; i < numResources && available.length > 0; i++) {
    const totalWeight = weights.reduce((a,b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    let idx = 0;
    for (; idx < weights.length - 1; idx++) {
      roll -= weights[idx];
      if (roll <= 0) break;
    }
    
    const resKey = available[idx];
    const resType = RESOURCE_TYPES[resKey];
    const abundance = 0.5 + Math.random() * 1.5; // 0.5x to 2x
    resources[resKey] = {
      ...resType,
      key: resKey,
      abundance: Math.round(abundance * 10) / 10,
      depleted: false
    };
    
    available.splice(idx, 1);
    weights.splice(idx, 1);
  }
  
  // Ensure at least one food source
  const hasFood = Object.values(resources).some(r => r.category === 'food');
  if (!hasFood) {
    resources.fertile = { ...RESOURCE_TYPES.fertile, key: 'fertile', abundance: 0.8, depleted: false };
  }
  
  return { terrain: terrain.name, resources };
}

function getResourceOutput(resource, ageIndex) {
  if (resource.depleted) return 0;
  const [minAge, maxAge] = resource.ages;
  if (ageIndex < minAge || ageIndex > maxAge) return 0;
  const ageMod = 1 + (ageIndex * 0.15); // Tech improves yields
  return Math.round(resource.baseYield * resource.abundance * ageMod * 10) / 10;
}

function calculateFoodCapacity(resources, ageIndex) {
  let food = 0;
  for (const res of Object.values(resources)) {
    if (res.category === 'food') {
      food += getResourceOutput(res, ageIndex);
    }
  }
  // Each food unit supports ~50 people in Stone Age, scaling with tech
  const techMultiplier = 50 * (1 + ageIndex * 0.5);
  return Math.floor(food * techMultiplier);
}
