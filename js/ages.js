// === Age Definitions & Progression ===

const AGES = [
  { id: 'stone',       name: 'Stone Age',           emoji: '🪨', techLevel: 1, expansionRate: 0.3, militaryMod: 1.0, cultureMod: 0.5 },
  { id: 'bronze',      name: 'Bronze Age',          emoji: '🏺', techLevel: 2, expansionRate: 0.5, militaryMod: 1.5, cultureMod: 0.8 },
  { id: 'iron',        name: 'Iron Age',            emoji: '⚔️', techLevel: 3, expansionRate: 0.7, militaryMod: 2.0, cultureMod: 1.0 },
  { id: 'classical',   name: 'Classical Age',       emoji: '🏛️', techLevel: 4, expansionRate: 0.8, militaryMod: 2.5, cultureMod: 1.5 },
  { id: 'medieval',    name: 'Medieval Age',        emoji: '🏰', techLevel: 5, expansionRate: 0.9, militaryMod: 3.0, cultureMod: 1.8 },
  { id: 'exploration', name: 'Age of Exploration',  emoji: '⛵', techLevel: 6, expansionRate: 1.2, militaryMod: 3.5, cultureMod: 2.0 },
  { id: 'industrial',  name: 'Industrial Age',      emoji: '🏭', techLevel: 7, expansionRate: 1.5, militaryMod: 4.5, cultureMod: 2.5 },
  { id: 'modern',      name: 'Modern Age',          emoji: '💡', techLevel: 8, expansionRate: 1.8, militaryMod: 6.0, cultureMod: 3.0 },
  { id: 'information', name: 'Information Age',     emoji: '🚀', techLevel: 9, expansionRate: 2.0, militaryMod: 7.0, cultureMod: 4.0 },
];

const FAILURE_CHANCE = 0.10; // 10% chance to regress instead of advance

function getAge(index) {
  return AGES[Math.max(0, Math.min(index, AGES.length - 1))];
}

function getAgeByIndex(index) {
  return getAge(index);
}

/**
 * Attempt age advancement for a civilization.
 * Returns { advanced: bool, regressed: bool, roll: number, newAgeIndex: number }
 */
function attemptAgeAdvance(currentAgeIndex) {
  if (currentAgeIndex >= AGES.length - 1) {
    return { advanced: false, regressed: false, roll: -1, newAgeIndex: currentAgeIndex, maxed: true };
  }
  
  const roll = Math.random();
  
  if (roll < FAILURE_CHANCE) {
    // Failed — regress one age (min Stone Age)
    const newIndex = Math.max(0, currentAgeIndex - 1);
    return {
      advanced: false,
      regressed: newIndex < currentAgeIndex,
      roll: Math.round(roll * 100),
      newAgeIndex: newIndex,
      maxed: false
    };
  } else {
    // Success — advance one age
    return {
      advanced: true,
      regressed: false,
      roll: Math.round(roll * 100),
      newAgeIndex: currentAgeIndex + 1,
      maxed: false
    };
  }
}
