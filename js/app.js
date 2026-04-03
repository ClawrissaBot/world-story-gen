// === Main App Controller ===

let mapEditor = null;
let simulation = null;
let simCanvas = null;
let simCtx = null;

// === Screen Management ===
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const screen = document.getElementById(id);
  screen.classList.remove('hidden');
  screen.classList.add('active');
  
  if (id === 'screen-create' && mapEditor) {
    setTimeout(() => mapEditor._resize(), 50);
  }
  if (id === 'screen-sim') {
    setTimeout(() => resizeSimCanvas(), 50);
  }
}

// === API Key Management ===
function checkApiKey() {
  if (!loreChat.hasApiKey()) {
    document.getElementById('api-key-modal').classList.remove('hidden');
  }
}

document.getElementById('api-key-save').addEventListener('click', () => {
  const key = document.getElementById('api-key-input').value.trim();
  if (key) {
    loreChat.setApiKey(key);
    document.getElementById('api-key-modal').classList.add('hidden');
  }
});

document.getElementById('api-key-skip').addEventListener('click', () => {
  document.getElementById('api-key-modal').classList.add('hidden');
});

document.getElementById('btn-settings').addEventListener('click', () => {
  document.getElementById('api-key-input').value = loreChat.getApiKey() || '';
  document.getElementById('api-key-modal').classList.remove('hidden');
});

// === Title Screen ===
document.getElementById('btn-new-world').addEventListener('click', () => {
  showScreen('screen-create');
  if (!mapEditor) {
    mapEditor = new MapEditor('map-canvas');
  }
  checkApiKey();
});

// === Map Drawing Controls ===
document.getElementById('btn-add-region').addEventListener('click', () => {
  if (mapEditor && mapEditor.currentPoints.length >= 3) {
    mapEditor._finishRegion();
  }
});

document.getElementById('btn-undo-point').addEventListener('click', () => {
  if (mapEditor) mapEditor.undoPoint();
});

document.getElementById('btn-clear-map').addEventListener('click', () => {
  if (mapEditor && confirm('Clear all regions?')) mapEditor.clear();
});

// === Lore Chat ===
async function sendLoreMessage() {
  const input = document.getElementById('lore-input');
  const text = input.value.trim();
  if (!text) return;
  
  input.value = '';
  const messagesEl = document.getElementById('lore-messages');
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'lore-msg user';
  userMsg.textContent = text;
  messagesEl.appendChild(userMsg);
  
  // Loading indicator
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'lore-msg loading';
  loadingMsg.textContent = '🔮 Thinking...';
  messagesEl.appendChild(loadingMsg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  // Send to AI
  const reply = await loreChat.sendMessage(text);
  
  // Replace loading with response
  loadingMsg.className = 'lore-msg assistant';
  loadingMsg.textContent = reply;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

document.getElementById('btn-lore-send').addEventListener('click', sendLoreMessage);
document.getElementById('lore-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendLoreMessage();
  }
});

// === Start Simulation ===
document.getElementById('btn-start-sim').addEventListener('click', () => {
  const regions = mapEditor.getRegions();
  if (regions.length === 0) {
    alert('Draw at least one region first!');
    return;
  }
  
  const loreSummary = loreChat.getLoreSummary();
  const loreKeywords = loreChat.getLoreKeywords();
  
  simulation = new Simulation(regions, loreSummary, loreKeywords);
  worldHistory.events = []; // Reset history
  
  showScreen('screen-sim');
  initSimView();
});

// === Simulation View ===
function resizeSimCanvas() {
  const canvas = document.getElementById('sim-canvas');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width - 24;
  canvas.height = rect.height - 24;
  simCanvas = canvas;
  simCtx = canvas.getContext('2d');
  renderSimMap();
}

function initSimView() {
  resizeSimCanvas();
  updateSimUI([]);
}

function renderSimMap() {
  if (!simCtx || !simulation) return;
  const ctx = simCtx;
  const w = simCanvas.width;
  const h = simCanvas.height;
  
  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);
  
  // Grid
  ctx.strokeStyle = '#1a1a3a';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  
  // Draw civilizations
  for (const civ of simulation.civilizations) {
    const alpha = civ.alive ? '66' : '22';
    const borderAlpha = civ.alive ? 'cc' : '44';
    
    // Fill region
    ctx.fillStyle = civ.color + alpha;
    ctx.beginPath();
    ctx.moveTo(civ.points[0].x, civ.points[0].y);
    for (let i = 1; i < civ.points.length; i++) {
      ctx.lineTo(civ.points[i].x, civ.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Border
    ctx.strokeStyle = civ.color + borderAlpha;
    ctx.lineWidth = civ.alive ? 3 : 1;
    ctx.stroke();
    
    // Territory size indicator (pulsing glow based on territory)
    if (civ.alive) {
      const glowRadius = 20 + civ.territory * 3;
      const gradient = ctx.createRadialGradient(civ.center.x, civ.center.y, 0, civ.center.x, civ.center.y, glowRadius);
      gradient.addColorStop(0, civ.color + '33');
      gradient.addColorStop(1, civ.color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(civ.center.x, civ.center.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Label
    const age = getAge(civ.ageIndex);
    ctx.fillStyle = civ.alive ? '#fff' : '#666';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(civ.name, civ.center.x, civ.center.y - 10);
    ctx.font = '11px sans-serif';
    ctx.fillText(`${age.emoji} ${age.name}`, civ.center.x, civ.center.y + 8);
    if (!civ.alive) {
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('☠️ Conquered', civ.center.x, civ.center.y + 22);
    }
  }
}

function updateSimUI(events) {
  if (!simulation) return;
  
  // Turn counter
  document.getElementById('turn-counter').textContent = simulation.turn;
  
  // Civ list
  const civList = document.getElementById('civ-list');
  civList.innerHTML = '';
  for (const civ of simulation.civilizations) {
    const age = getAge(civ.ageIndex);
    const card = document.createElement('div');
    card.className = 'civ-card';
    if (!civ.alive) card.style.opacity = '0.4';
    card.innerHTML = `
      <div class="civ-color" style="background:${civ.color}"></div>
      <span class="civ-name">${civ.name}</span>
      <span class="civ-age">${age.emoji} ${age.name}</span>
      <span style="font-size:11px;color:var(--text-dim)">👥${civ.population} ⚔️${civ.military} 🏛️${civ.culture} 🗺️${civ.territory}</span>
    `;
    civList.appendChild(card);
  }
  
  // Event log
  const logList = document.getElementById('event-log-list');
  for (const event of events) {
    const entry = document.createElement('div');
    entry.className = `event-entry ${event.type}`;
    entry.innerHTML = `<span class="turn-badge">T${simulation.turn}</span>${event.text}`;
    logList.insertBefore(entry, logList.firstChild);
  }
  
  renderSimMap();
}

// === Dice Roll Animation ===
async function showDiceRolls(rolls) {
  const overlay = document.getElementById('dice-overlay');
  
  for (const { civ, result } of rolls) {
    overlay.classList.remove('hidden');
    const nameEl = document.getElementById('dice-civ-name');
    const rollEl = document.getElementById('dice-roll');
    const resultEl = document.getElementById('dice-result');
    
    nameEl.textContent = `${civ.name} attempts to advance...`;
    nameEl.style.color = civ.color;
    
    // Animate roll
    for (let i = 0; i < 10; i++) {
      rollEl.textContent = `${Math.floor(Math.random() * 100)}%`;
      rollEl.style.color = '#fff';
      await sleep(60);
    }
    
    rollEl.textContent = `${result.roll}%`;
    
    if (result.advanced) {
      rollEl.style.color = '#2ecc71';
      resultEl.className = 'dice-result success';
      resultEl.textContent = `✅ Advanced to ${getAge(result.newAgeIndex).name}!`;
    } else if (result.regressed) {
      rollEl.style.color = '#e74c3c';
      resultEl.className = 'dice-result fail';
      resultEl.textContent = `💥 Fell back to ${getAge(result.newAgeIndex).name}!`;
    } else {
      rollEl.style.color = '#f39c12';
      resultEl.className = 'dice-result';
      resultEl.textContent = `No change (stayed at same age)`;
    }
    
    await sleep(1200);
    overlay.classList.add('hidden');
    await sleep(200);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// === Sim Controls ===
async function doStep() {
  if (!simulation) return;
  const events = simulation.step();
  const diceRolls = simulation.getDiceRolls();
  
  if (diceRolls.length > 0 && !simulation.playing) {
    await showDiceRolls(diceRolls);
  }
  
  updateSimUI(events);
  
  if (simulation.isFinished()) {
    simulation.pause();
    document.getElementById('btn-play').classList.add('hidden');
    document.getElementById('btn-pause').classList.add('hidden');
    worldHistory.addEvent(simulation.turn, 'discovery', '🏁 Simulation complete!');
    updateSimUI([{ type: 'discovery', text: '🏁 Simulation complete!' }]);
  }
}

document.getElementById('btn-step').addEventListener('click', doStep);

document.getElementById('btn-play').addEventListener('click', () => {
  if (!simulation) return;
  document.getElementById('btn-play').classList.add('hidden');
  document.getElementById('btn-pause').classList.remove('hidden');
  
  simulation.play((events) => {
    const diceRolls = simulation.getDiceRolls();
    // In auto-play, skip dice animation for speed
    updateSimUI(events);
    
    if (simulation.isFinished()) {
      simulation.pause();
      document.getElementById('btn-play').classList.remove('hidden');
      document.getElementById('btn-pause').classList.add('hidden');
    }
  });
});

document.getElementById('btn-pause').addEventListener('click', () => {
  if (!simulation) return;
  simulation.pause();
  document.getElementById('btn-play').classList.remove('hidden');
  document.getElementById('btn-pause').classList.add('hidden');
});

document.getElementById('sim-speed').addEventListener('input', (e) => {
  if (!simulation) return;
  const wasPlaying = simulation.playing;
  simulation.setSpeed(parseInt(e.target.value));
  if (wasPlaying) {
    simulation.play((events) => {
      updateSimUI(events);
      if (simulation.isFinished()) {
        simulation.pause();
        document.getElementById('btn-play').classList.remove('hidden');
        document.getElementById('btn-pause').classList.add('hidden');
      }
    });
  }
});

document.getElementById('btn-back-create').addEventListener('click', () => {
  if (simulation && simulation.playing) simulation.pause();
  showScreen('screen-create');
});

// === History Screen ===
document.getElementById('btn-history').addEventListener('click', () => {
  if (simulation && simulation.playing) simulation.pause();
  
  const timeline = document.getElementById('history-timeline');
  timeline.innerHTML = '';
  
  const events = worldHistory.getAllEvents();
  for (const event of events) {
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.innerHTML = `<span class="history-turn">Turn ${event.turn}</span><span>${event.text}</span>`;
    timeline.appendChild(entry);
  }
  
  const summary = document.getElementById('history-summary');
  summary.innerHTML = simulation ? worldHistory.generateSummary(simulation.civilizations) : '';
  
  showScreen('screen-history');
});

document.getElementById('btn-back-sim').addEventListener('click', () => {
  showScreen('screen-sim');
});

// === Window resize ===
window.addEventListener('resize', () => {
  if (document.getElementById('screen-sim').classList.contains('active')) {
    resizeSimCanvas();
  }
});

// === Init ===
console.log('🌍 World Story Gen loaded');
