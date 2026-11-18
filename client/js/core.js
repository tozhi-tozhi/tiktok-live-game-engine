const stage = document.getElementById('stage');
const statusText = document.getElementById('statusText');
const lbEl = document.getElementById('leaderboard');
const lbList = document.getElementById('lbList');

let currentMode = null;

// Register all game modes here
const MODES = {
  boxing: BoxingGame,
  climbing: ClimbingGame
};

function switchMode(modeKey) {
  if (!MODES[modeKey]) return;
  currentMode = MODES[modeKey];
  stage.innerHTML = ''; // clear previous mode
  currentMode.init(stage);
  console.log(`Switched to mode: ${modeKey}`);
}

// ---------- WebSocket connection ----------
function connectWS() {
  const ws = new WebSocket(`ws://localhost:8080`);

  ws.onopen = () => {
    statusText.textContent = '🟢 Connected — waiting for gifts...';
    // Default mode
    switchMode('boxing');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.event === 'gift' && currentMode) {
      currentMode.handleGift(data);
    }

    if (data.event === 'leaderboard') {
      renderLeaderboard(data.data);
    }

    if (data.event === 'modeChanged') {
      switchMode(data.mode);
    }

    if (data.event === 'system') {
      statusText.textContent = data.message;
    }
  };

  ws.onclose = () => {
    statusText.textContent = '🔴 Disconnected — retrying in 3s...';
    setTimeout(connectWS, 3000);
  };
}

function renderLeaderboard(entries) {
  if (!entries || entries.length === 0) {
    lbEl.classList.add('hidden');
    return;
  }
  lbEl.classList.remove('hidden');
  lbList.innerHTML = entries.map(e =>
    `<li><span>${e.userId}</span><span>${e.totalDiamonds}💎</span></li>`
  ).join('');
}

connectWS();