const stage = document.getElementById('stage');
const statusText = document.getElementById('statusText');
const lbEl = document.getElementById('leaderboard');
const lbList = document.getElementById('lbList');

// เกมแต่ละเกม (games/<id>/game.js) จะมาลงทะเบียนตัวเองที่นี่: GameRegistry.<id> = { init, onEvent, destroy }
const GameRegistry = {};

let requestedId = null; // เกมที่เซิร์ฟเวอร์สั่งให้ขึ้น
let activeId = null;    // เกมที่รันอยู่จริง
let activeGame = null;
let loadToken = 0;

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function loadScript(src) {
  return new Promise((ok, fail) => {
    const el = document.createElement('script');
    el.src = `${src}?t=${Date.now()}`; // โหลดใหม่ทุกครั้ง แก้เกมแล้วไม่ต้องปิดเปิดโปรแกรม
    el.onload = ok;
    el.onerror = () => fail(new Error(`โหลดไม่ได้: ${src}`));
    document.head.appendChild(el);
  });
}

function stopGame() {
  if (activeGame && activeGame.destroy) {
    try { activeGame.destroy(); } catch (e) { console.error(e); }
  }
  activeGame = null;
  activeId = null;
  stage.innerHTML = '';
  document.querySelectorAll('.winner-banner, .dmg-float').forEach(n => n.remove());
}

async function startGame(id) {
  const token = ++loadToken;
  stopGame();
  try {
    const res = await fetch(`games/${id}/manifest.json`, { cache: 'no-store' });
    const manifest = await res.json();
    delete GameRegistry[id];
    await loadScript(`games/${id}/game.js`);
    if (token !== loadToken) return;               // ระหว่างโหลดมีการสลับเกมอีกรอบ
    const game = GameRegistry[id];
    if (!game) throw new Error(`games/${id}/game.js ไม่ได้ลงทะเบียน GameRegistry.${id}`);
    activeId = id;
    activeGame = game;
    await game.init(stage, manifest);
    console.log(`▶ เริ่มเกม: ${id}`);
  } catch (e) {
    console.error(e);
    statusText.style.display = '';
    statusText.textContent = `❌ ${e.message}`;
  }
}

function applyState(s) {
  if (s.activeGame !== requestedId) {
    requestedId = s.activeGame;
    if (requestedId) startGame(requestedId);
    else { loadToken++; stopGame(); }
  }
  if (!s.activeGame) {
    statusText.style.display = '';
    statusText.textContent = '⏸️ รอเริ่ม Live จากหน้า Hub';
  } else {
    statusText.style.display = 'none'; // ระหว่าง Live ไม่โชว์ข้อความสถานะบนจอสตรีม
  }
}

function connectWS() {
  const ws = new WebSocket(`ws://${location.host}`);

  ws.onopen = () => {
    statusText.style.display = '';
    statusText.textContent = '🟢 Connected';
    ws.send(JSON.stringify({ command: 'hello', role: 'overlay' }));
  };

  ws.onmessage = (e) => {
    let d;
    try { d = JSON.parse(e.data); } catch { return; }

    if (d.event === 'state') applyState(d);
    else if (d.event === 'game_event') {
      // ส่งให้เฉพาะเกมที่ Live อยู่เท่านั้น
      if (activeGame && d.gameId === activeId && activeGame.onEvent) {
        try { activeGame.onEvent(d); } catch (err) { console.error(err); }
      }
    }
    else if (d.event === 'leaderboard') renderLeaderboard(d.data);
  };

  ws.onclose = () => {
    statusText.style.display = '';
    statusText.textContent = '🔴 Disconnected — retrying in 3s...';
    setTimeout(connectWS, 3000);
  };
}

function renderLeaderboard(entries) {
  if (!entries || entries.length === 0) { lbEl.classList.add('hidden'); return; }
  lbEl.classList.remove('hidden');
  lbList.innerHTML = entries.map(e =>
    `<li><span>${esc(e.name || e.userId)}</span><span>${e.totalDiamonds}💎</span></li>`
  ).join('');
}

connectWS();