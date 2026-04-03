// === Settlements (Villages → Towns → Cities) ===

const SETTLEMENT_PREFIXES = ['New','Old','East','West','North','South','Upper','Lower','Great','Little','Fort','Port','High','Deep','Iron','Gold','Silver','Storm','Sun','Moon','Star'];
const SETTLEMENT_SUFFIXES = ['haven','ford','stead','holm','ton','bury','vale','gate','bridge','fell','mere','reach','crest','peak','hollow','brook','dale','march','keep','watch','port'];
const SETTLEMENT_NAMES = ['Thornwall','Ashford','Riverdale','Stonebridge','Ironholm','Goldcrest','Silverpeak','Stormhaven','Sunvale','Moonbrook','Starfall','Deephollow','Highwatch','Greymarsh','Redcliff','Bluehaven','Greenpeak','Whitestone','Blackforge','Clearwater'];

function generateSettlementName() {
  if (Math.random() < 0.3) {
    return SETTLEMENT_NAMES[Math.floor(Math.random() * SETTLEMENT_NAMES.length)];
  }
  const prefix = SETTLEMENT_PREFIXES[Math.floor(Math.random() * SETTLEMENT_PREFIXES.length)];
  const suffix = SETTLEMENT_SUFFIXES[Math.floor(Math.random() * SETTLEMENT_SUFFIXES.length)];
  return prefix + suffix;
}

const SETTLEMENT_TIERS = [
  { name: 'Camp',     emoji: '🏕️', minPop: 0,     maxPop: 30,     maxPeople: 30 },
  { name: 'Village',  emoji: '🏘️', minPop: 20,    maxPop: 200,    maxPeople: 80 },
  { name: 'Town',     emoji: '🏠', minPop: 150,   maxPop: 2000,   maxPeople: 150 },
  { name: 'City',     emoji: '🏙️', minPop: 1500,  maxPop: 50000,  maxPeople: 250 },
  { name: 'Metropolis', emoji: '🌆', minPop: 30000, maxPop: 500000, maxPeople: 400 },
  { name: 'Megalopolis', emoji: '🌇', minPop: 200000, maxPop: 5000000, maxPeople: 500 },
];

function getSettlementTier(population) {
  for (let i = SETTLEMENT_TIERS.length - 1; i >= 0; i--) {
    if (population >= SETTLEMENT_TIERS[i].minPop) return SETTLEMENT_TIERS[i];
  }
  return SETTLEMENT_TIERS[0];
}

let _settlementId = 0;

function createSettlement(regionName, position, resources, ageIndex) {
  const name = generateSettlementName();
  const tier = SETTLEMENT_TIERS[0];
  
  // Initial population based on food resources
  const foodCap = calculateFoodCapacity(resources, ageIndex);
  const initPop = Math.min(Math.max(5, Math.floor(foodCap * 0.3)), 20);
  
  // Generate initial villagers
  const people = [];
  const numDetailed = Math.min(initPop, 15); // Track up to 15 individually at start
  
  for (let i = 0; i < numDetailed; i++) {
    people.push(generatePerson(ageIndex, name));
  }
  
  // Ensure essential roles
  const essentialRoles = ageIndex === 0 
    ? ['gatherer', 'hunter', 'healer']
    : ['farmer', 'builder', 'warrior'];
  
  for (let i = 0; i < Math.min(essentialRoles.length, people.length); i++) {
    assignNeededRole(people[i], essentialRoles[i], ageIndex);
  }
  
  return {
    id: ++_settlementId,
    name,
    regionName,
    position, // {x, y} on canvas
    population: initPop,
    people, // Named characters (capped for performance)
    tier,
    resources: { ...resources },
    buildings: [],
    foodStore: initPop * 2,
    materialStore: 0,
    wealthStore: 0,
    culture: 0,
    defense: 0,
    tradeRoutes: [], // settlement ids
    founded: 0,
    ageIndex,
  };
}

function updateSettlementTier(settlement, events, turn) {
  const newTier = getSettlementTier(settlement.population);
  if (newTier.name !== settlement.tier.name && settlement.population >= newTier.minPop) {
    const oldName = settlement.tier.name;
    settlement.tier = newTier;
    events.push({
      type: 'discovery',
      text: `🏗️ ${settlement.name} grows from a ${oldName} to a ${newTier.emoji} ${newTier.name}! (pop: ${formatPop(settlement.population)})`,
      civName: settlement.regionName
    });
    return true;
  }
  return false;
}

function formatPop(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// Determine what roles the settlement needs
function getNeededRoles(settlement, ageIndex) {
  const needed = [];
  const roleCount = {};
  for (const p of settlement.people) {
    if (!p.alive) continue;
    roleCount[p.roleKey] = (roleCount[p.roleKey] || 0) + 1;
  }
  
  // Always need food producers
  if (ageIndex < 2 && (roleCount.gatherer || 0) + (roleCount.hunter || 0) < 3) {
    needed.push(Math.random() < 0.5 ? 'gatherer' : 'hunter');
  }
  if (ageIndex >= 1 && (roleCount.farmer || 0) < Math.ceil(settlement.population / 50)) {
    needed.push('farmer');
  }
  
  // Need builders when growing
  if (ageIndex >= 1 && (roleCount.builder || 0) < 2) needed.push('builder');
  
  // Need warriors for defense
  if ((roleCount.warrior || 0) < Math.ceil(settlement.population / 100)) needed.push('warrior');
  
  // Need traders when big enough
  if (settlement.population > 100 && (roleCount.trader || 0) < 2) needed.push('trader');
  
  // Scholars, priests, governors for classical+
  if (ageIndex >= 3) {
    if ((roleCount.scholar || 0) < 1) needed.push('scholar');
    if ((roleCount.priest || 0) < 1) needed.push('priest');
    if (settlement.population > 500 && (roleCount.governor || 0) < 1) needed.push('governor');
  }
  
  // Engineers for industrial+
  if (ageIndex >= 6 && (roleCount.engineer || 0) < 2) needed.push('engineer');
  
  // Merchants for trade
  if (ageIndex >= 4 && (roleCount.merchant || 0) < Math.ceil(settlement.tradeRoutes.length / 2 + 1)) {
    needed.push('merchant');
  }
  
  return needed;
}
