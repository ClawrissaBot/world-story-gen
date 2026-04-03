// === Simulation Engine ===

class Simulation {
  constructor(regions, loreSummary, loreKeywords) {
    this.turn = 0;
    this.playing = false;
    this.speed = 3;
    this.playInterval = null;
    this.loreSummary = loreSummary;
    this.loreKeywords = loreKeywords;
    
    // Create civilizations from regions
    this.civilizations = regions.map(r => ({
      name: r.name,
      color: r.color,
      points: r.points,
      center: r.center,
      ageIndex: 0,
      territory: 1,
      military: 10,
      culture: 5,
      population: 100,
      alive: true
    }));
    
    this.pendingDiceRolls = [];
  }

  step() {
    this.turn++;
    const turnEvents = [];

    for (const civ of this.civilizations) {
      if (!civ.alive) continue;
      const age = getAge(civ.ageIndex);

      // 1. Population growth
      civ.population = Math.floor(civ.population * (1 + 0.05 * age.techLevel));

      // 2. Territory expansion
      if (Math.random() < age.expansionRate * 0.3) {
        civ.territory++;
        turnEvents.push({ type: 'discovery', text: `${age.emoji} ${civ.name} expands their territory`, civName: civ.name });
      }

      // 3. Military growth
      civ.military = Math.floor(civ.military + age.militaryMod * (1 + Math.random()));

      // 4. Culture growth
      civ.culture = Math.floor(civ.culture + age.cultureMod * (0.5 + Math.random()));

      // 5. Age advancement attempt (every 3 turns)
      if (this.turn % 3 === 0) {
        const result = attemptAgeAdvance(civ.ageIndex);
        if (!result.maxed) {
          this.pendingDiceRolls.push({ civ, result });
          
          if (result.advanced) {
            civ.ageIndex = result.newAgeIndex;
            const newAge = getAge(civ.ageIndex);
            turnEvents.push({
              type: 'advance',
              text: `🎉 ${civ.name} advances to the ${newAge.emoji} ${newAge.name}! (rolled ${result.roll}%)`,
              civName: civ.name
            });
          } else if (result.regressed) {
            civ.ageIndex = result.newAgeIndex;
            const newAge = getAge(civ.ageIndex);
            turnEvents.push({
              type: 'regress',
              text: `💥 ${civ.name} suffers a catastrophic setback! Falls back to ${newAge.emoji} ${newAge.name} (rolled ${result.roll}% — FAILURE!)`,
              civName: civ.name
            });
          }
        }
      }
    }

    // 6. Conflicts between civs
    if (this.civilizations.filter(c => c.alive).length > 1) {
      this._resolveConflicts(turnEvents);
    }

    // 7. Random events
    this._randomEvents(turnEvents);

    // Record events
    for (const event of turnEvents) {
      worldHistory.addEvent(this.turn, event.type, event.text, event.civName);
    }

    return turnEvents;
  }

  _resolveConflicts(events) {
    const alive = this.civilizations.filter(c => c.alive);
    if (alive.length < 2) return;

    // Random border skirmish chance
    if (Math.random() < 0.25) {
      const i = Math.floor(Math.random() * alive.length);
      let j = Math.floor(Math.random() * (alive.length - 1));
      if (j >= i) j++;

      const a = alive[i];
      const b = alive[j];
      const aPower = a.military * getAge(a.ageIndex).militaryMod + Math.random() * 20;
      const bPower = b.military * getAge(b.ageIndex).militaryMod + Math.random() * 20;

      const winner = aPower > bPower ? a : b;
      const loser = aPower > bPower ? b : a;

      winner.territory++;
      winner.military = Math.floor(winner.military * 0.9);
      loser.territory = Math.max(0, loser.territory - 1);
      loser.military = Math.floor(loser.military * 0.7);

      const flavorVerbs = ['clashes with', 'raids', 'battles', 'wages war on', 'invades'];
      const verb = flavorVerbs[Math.floor(Math.random() * flavorVerbs.length)];

      events.push({
        type: 'war',
        text: `⚔️ ${winner.name} ${verb} ${loser.name} and wins! (+1 territory)`,
        civName: winner.name
      });

      if (loser.territory <= 0) {
        loser.alive = false;
        events.push({
          type: 'war',
          text: `💀 ${loser.name} has been conquered by ${winner.name}!`,
          civName: loser.name
        });
      }
    }
  }

  _randomEvents(events) {
    if (Math.random() > 0.15) return; // 15% chance per turn

    const alive = this.civilizations.filter(c => c.alive);
    if (alive.length === 0) return;
    const civ = alive[Math.floor(Math.random() * alive.length)];

    const loreThemed = this.loreKeywords.length > 0;
    const keyword = loreThemed ? this.loreKeywords[Math.floor(Math.random() * this.loreKeywords.length)] : null;

    const disasters = [
      { text: '🌋 A volcanic eruption devastates', effect: () => { civ.population = Math.floor(civ.population * 0.7); civ.territory = Math.max(1, civ.territory - 1); } },
      { text: '🦠 A plague sweeps through', effect: () => { civ.population = Math.floor(civ.population * 0.5); } },
      { text: '🌊 A great flood hits', effect: () => { civ.territory = Math.max(1, civ.territory - 1); } },
      { text: '🔥 Wildfires rage across', effect: () => { civ.population = Math.floor(civ.population * 0.8); } },
    ];

    const blessings = [
      { text: '✨ A golden age dawns for', effect: () => { civ.culture += 10; civ.population = Math.floor(civ.population * 1.2); } },
      { text: '📚 A great discovery is made by', effect: () => { civ.culture += 15; } },
      { text: '🌾 Bountiful harvests bless', effect: () => { civ.population = Math.floor(civ.population * 1.3); } },
      { text: '🏗️ A wonder is built by', effect: () => { civ.culture += 20; civ.military += 5; } },
    ];

    // Add lore-themed events
    if (keyword) {
      const loreEvents = [
        { text: `🔮 The ancient ${keyword} stirs, affecting`, effect: () => { civ.culture += 8; } },
        { text: `⚡ A ${keyword}-touched prophecy inspires`, effect: () => { civ.military += 10; civ.culture += 5; } },
      ];
      blessings.push(...loreEvents);
    }

    const isDisaster = Math.random() < 0.4;
    const pool = isDisaster ? disasters : blessings;
    const event = pool[Math.floor(Math.random() * pool.length)];
    
    event.effect();
    events.push({
      type: isDisaster ? 'disaster' : 'discovery',
      text: `${event.text} ${civ.name}!`,
      civName: civ.name
    });
  }

  getDiceRolls() {
    const rolls = [...this.pendingDiceRolls];
    this.pendingDiceRolls = [];
    return rolls;
  }

  play(stepCallback) {
    this.playing = true;
    const interval = Math.max(200, 2000 - (this.speed * 180));
    this.playInterval = setInterval(() => {
      if (!this.playing) return;
      const events = this.step();
      stepCallback(events);
    }, interval);
  }

  pause() {
    this.playing = false;
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  setSpeed(speed) {
    this.speed = speed;
    if (this.playing) {
      // Restart with new speed
      this.pause();
      // Will be restarted by caller
    }
  }

  isFinished() {
    return this.civilizations.filter(c => c.alive).length <= 1 ||
           this.civilizations.every(c => c.ageIndex >= AGES.length - 1 || !c.alive);
  }
}
