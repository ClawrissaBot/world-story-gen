// === History / Event Tracking ===

class WorldHistory {
  constructor() {
    this.events = [];
  }

  addEvent(turn, type, text, civName = null) {
    this.events.push({ turn, type, text, civName, timestamp: Date.now() });
  }

  getEventsForTurn(turn) {
    return this.events.filter(e => e.turn === turn);
  }

  getAllEvents() {
    return [...this.events];
  }

  getLastN(n) {
    return this.events.slice(-n);
  }

  generateSummary(civilizations) {
    const summary = [];
    summary.push('<h3>🌍 World Summary</h3>');
    
    // Civ summaries
    for (const civ of civilizations) {
      const age = getAge(civ.ageIndex);
      const civEvents = this.events.filter(e => e.civName === civ.name);
      const advances = civEvents.filter(e => e.type === 'advance').length;
      const regressions = civEvents.filter(e => e.type === 'regress').length;
      const wars = civEvents.filter(e => e.type === 'war').length;
      
      summary.push(`<div class="history-entry">
        <span style="color:${civ.color}; font-weight:700;">${civ.name}</span> — 
        ${age.emoji} ${age.name} | 
        📈 ${advances} advances, 📉 ${regressions} regressions, ⚔️ ${wars} wars |
        Territory: ${civ.territory} tiles
      </div>`);
    }
    
    return summary.join('');
  }
}

// Global instance
const worldHistory = new WorldHistory();
