// === Trade System ===

function findTradePartners(settlement, allSettlements) {
  // Can trade with settlements within range (closer = easier)
  return allSettlements.filter(s => {
    if (s.id === settlement.id) return false;
    if (s.population < 30) return false; // Too small to trade
    if (settlement.tradeRoutes.includes(s.id)) return false; // Already trading
    return true;
  });
}

function establishTradeRoute(a, b, events, turn) {
  a.tradeRoutes.push(b.id);
  b.tradeRoutes.push(a.id);
  
  // Determine what they trade
  const aRes = Object.keys(a.resources).filter(k => !b.resources[k]);
  const bRes = Object.keys(b.resources).filter(k => !a.resources[k]);
  
  const aExport = aRes.length > 0 ? RESOURCE_TYPES[aRes[0]]?.name || 'goods' : 'goods';
  const bExport = bRes.length > 0 ? RESOURCE_TYPES[bRes[0]]?.name || 'goods' : 'goods';
  
  events.push({
    type: 'trade',
    text: `🤝 Trade route established: ${a.name} ↔ ${b.name} (${aExport} for ${bExport})`,
    civName: a.regionName
  });
}

function processTradeRoutes(settlement, allSettlements, ageIndex) {
  let tradeIncome = 0;
  let cultureGain = 0;
  
  for (const partnerId of settlement.tradeRoutes) {
    const partner = allSettlements.find(s => s.id === partnerId);
    if (!partner || partner.population < 10) continue;
    
    // Trade value based on resource diversity and age
    const myResCount = Object.keys(settlement.resources).length;
    const theirResCount = Object.keys(partner.resources).length;
    const diversity = myResCount + theirResCount;
    
    const ageMultiplier = 1 + ageIndex * 0.5;
    tradeIncome += Math.floor(diversity * ageMultiplier * 2);
    cultureGain += Math.floor(ageMultiplier);
  }
  
  settlement.wealthStore += tradeIncome;
  settlement.culture += cultureGain;
  
  return { tradeIncome, cultureGain };
}

function getTradeNetworkSize(settlement, allSettlements) {
  // BFS to find connected trade network
  const visited = new Set([settlement.id]);
  const queue = [settlement.id];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    const current = allSettlements.find(s => s.id === currentId);
    if (!current) continue;
    
    for (const partnerId of current.tradeRoutes) {
      if (!visited.has(partnerId)) {
        visited.add(partnerId);
        queue.push(partnerId);
      }
    }
  }
  
  return visited.size;
}
