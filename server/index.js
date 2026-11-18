const http = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const config = require('./config');

const CLIENT_DIR = path.resolve(__dirname, '..', 'client');
const GAMES_DIR = path.join(CLIENT_DIR, 'games');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

// อ่านรายชื่อเกมจากโฟลเดอร์ client/games/<id>/manifest.json
function loadGames() {
  try {
    return fs.readdirSync(GAMES_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => {
        try {
          const m = JSON.parse(fs.readFileSync(path.join(GAMES_DIR, d.name, 'manifest.json'), 'utf8'));
          return { id: d.name, name: m.name || d.name, icon: m.icon || '🎮', description: m.description || '' };
        } catch (e) {
          console.warn(`⚠️ ข้ามเกม "${d.name}": ${e.message}`);
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    // ---------- State กลาง (ที่เดียว) ----------
    const state = {
      activeGame: null, // เกมที่ Live อยู่ (null = ยังไม่ Live)
      tiktok: { status: 'idle', username: '', message: '' } // idle | connecting | connected | error
    };
    const leaderboard = new Map();
    let connection = null;

    // ---------- 1. HTTP ----------
    const httpServer = http.createServer((req, res) => {
      let urlPath;
      try { urlPath = decodeURIComponent(req.url.split('?')[0]); }
      catch { res.writeHead(400); res.end('Bad request'); return; }

      if (urlPath === '/') urlPath = '/hub.html';
      const filePath = path.resolve(CLIENT_DIR, '.' + urlPath);

      if (filePath !== CLIENT_DIR && !filePath.startsWith(CLIENT_DIR + path.sep)) {
        res.writeHead(403); res.end('Forbidden'); return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
          'Cache-Control': 'no-store'
        });
        res.end(data);
      });
    });

    // ---------- 2. WebSocket (พอร์ตเดียวกับ HTTP) ----------
    const wss = new WebSocket.Server({
      server: httpServer,
      // กันเว็บอื่นในเบราว์เซอร์แอบต่อเข้ามาสั่งงานเครื่องเรา
      verifyClient: ({ origin }) => {
        if (!origin) return true;
        try { return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname); }
        catch { return false; }
      }
    });

    const fail = (err) => { console.error('❌ Server error:', err.message); reject(err); };
    httpServer.once('error', fail);
    wss.on('error', fail);

    function broadcast(data) {
      const msg = JSON.stringify(data);
      wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
    }
    const reply = (ws, message) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ event: 'notice', message }));
    };
    const countRole = (role) => [...wss.clients].filter(c => c.role === role).length;

    const stateMsg = () => ({
      event: 'state',
      activeGame: state.activeGame,
      tiktok: state.tiktok,
      overlays: countRole('overlay'),
      games: loadGames()
    });
    const broadcastState = () => broadcast(stateMsg());
    function setTikTok(status, username, message) {
      state.tiktok = { status, username: username || '', message: message || '' };
      broadcastState();
    }

    // ---------- 3. Leaderboard ----------
    const topList = () => [...leaderboard.values()]
      .sort((a, b) => b.totalDiamonds - a.totalDiamonds)
      .slice(0, config.leaderboardSize);
    const sendLeaderboard = () => broadcast({ event: 'leaderboard', data: topList() });

    function updateLeaderboard(userId, name, diamonds) {
      if (!userId || !diamonds) return;
      const e = leaderboard.get(userId) || { userId, name: name || userId, totalDiamonds: 0 };
      e.totalDiamonds += diamonds;
      leaderboard.set(userId, e);
      sendLeaderboard();
    }
    const lbTimer = setInterval(() => {
      leaderboard.clear(); sendLeaderboard();
      console.log('🔄 Leaderboard reset (ตามเวลา)');
    }, config.leaderboardResetHours * 3600 * 1000);
    lbTimer.unref();

    // ---------- 4. ทางเดียวที่อีเวนต์จะไปถึงเกม (ของจริงและของทดสอบใช้ทางเดียวกัน) ----------
    function dispatch(evt) {
      if (!state.activeGame) return false;            // ไม่ได้ Live = ไม่ส่งให้ใคร
      broadcast({ event: 'game_event', gameId: state.activeGame, ...evt });
      if (evt.type === 'gift') updateLeaderboard(evt.userId, evt.name, evt.diamonds);
      return true;
    }

    // ---------- 5. TikTok ----------
    function disconnectTikTok() {
      const old = connection;
      connection = null;
      if (old) { try { old.disconnect(); } catch (_) {} }
    }

    async function connectTikTok(username) {
      disconnectTikTok();
      let lib;
      try { lib = require('tiktok-live-connector'); }
      catch (e) { setTikTok('error', username, 'โหลด tiktok-live-connector ไม่ได้ — ลองรัน npm install'); return; }

      const { TikTokLiveConnection, WebcastEvent, ControlEvent } = lib;
      setTikTok('connecting', username, '');

      const conn = new TikTokLiveConnection(username, { signApiKey: config.signApiKey || undefined });
      connection = conn;
      const mine = () => connection === conn; // กันอีเวนต์ค้างจากการเชื่อมต่อเก่า

      conn.on(WebcastEvent.GIFT, (d) => {
        if (!mine()) return;
        const g = d.giftDetails || d.gift || {};
        const giftType = g.giftType ?? g.type;
        if (giftType === 1 && !d.repeatEnd) return;   // ของขวัญแบบสตรีค: รอจนจบสตรีค
        const count = Math.max(1, Number(d.repeatCount) || 1);
        const unit = Number(g.diamondCount) || 0;
        dispatch({
          type: 'gift',
          userId: d.user?.uniqueId || d.user?.displayId || 'unknown',
          name: d.user?.nickname || d.user?.uniqueId || 'unknown',
          giftName: g.giftName || g.name || 'Gift',
          count,
          diamonds: unit * count
        });
      });

      conn.on(WebcastEvent.CHAT, (d) => {
        if (!mine()) return;
        dispatch({
          type: 'chat',
          userId: d.user?.uniqueId || 'unknown',
          name: d.user?.nickname || d.user?.uniqueId || 'unknown',
          comment: d.comment ?? d.content ?? ''
        });
      });

      conn.on(WebcastEvent.LIKE, (d) => {
        if (!mine()) return;
        dispatch({
          type: 'like',
          userId: d.user?.uniqueId || 'unknown',
          name: d.user?.nickname || d.user?.uniqueId || 'unknown',
          count: Number(d.likeCount ?? d.count) || 1
        });
      });

      conn.on(ControlEvent.DISCONNECTED, () => {
        if (mine()) { connection = null; setTikTok('error', username, 'หลุดการเชื่อมต่อ TikTok'); }
      });
      conn.on(WebcastEvent.STREAM_END, () => { if (mine()) setTikTok('error', username, 'ไลฟ์จบแล้ว'); });
      conn.on(ControlEvent.ERROR, (e) => console.error('TikTok error:', e?.message || e));

      try {
        const s = await conn.connect();
        if (!mine()) { try { conn.disconnect(); } catch (_) {} return; }
        setTikTok('connected', username, `roomId ${s.roomId}`);
        console.log(`✅ เชื่อมต่อ TikTok LIVE: ${username} (roomId ${s.roomId})`);
      } catch (err) {
        if (!mine()) return;
        connection = null;
        setTikTok('error', username, err.message || String(err));
        console.error('❌ เชื่อมต่อ TikTok ไม่สำเร็จ:', err.message);
      }
    }

    // ---------- 6. คำสั่งจากหน้า Hub ----------
    wss.on('connection', (ws) => {
      ws.send(JSON.stringify(stateMsg()));
      ws.send(JSON.stringify({ event: 'leaderboard', data: topList() }));

      ws.on('close', broadcastState);
      ws.on('message', (raw) => {
        let msg;
        try { msg = JSON.parse(raw); } catch { return; }

        switch (msg.command) {
          case 'hello':
            ws.role = msg.role === 'overlay' ? 'overlay' : 'hub';
            broadcastState();
            break;

          case 'goLive': {
            if (!loadGames().some(g => g.id === msg.gameId)) { reply(ws, `ไม่พบเกม "${msg.gameId}"`); break; }
            if (!state.activeGame) { leaderboard.clear(); sendLeaderboard(); }
            state.activeGame = msg.gameId;

            const username = String(msg.username || '').trim().replace(/^@/, '');
            const t = state.tiktok;
            const alreadyOn = username && t.username === username && (t.status === 'connecting' || t.status === 'connected');
            if (username && !alreadyOn) connectTikTok(username);
            else if (!username) {
              disconnectTikTok();
              state.tiktok = { status: 'idle', username: '', message: '' };
            }
            console.log(`🔴 LIVE: ${msg.gameId}${username ? ' @' + username : ' (โหมดทดสอบ)'}`);
            broadcastState();
            break;
          }

          case 'stopLive':
            state.activeGame = null;
            disconnectTikTok();
            leaderboard.clear(); sendLeaderboard();
            state.tiktok = { status: 'idle', username: '', message: '' };
            console.log('⏹️ หยุด Live');
            broadcastState();
            break;

          case 'simulate': {
            const base = { userId: msg.userId || 'tester', name: msg.userId || 'tester' };
            let evt = null;
            if (msg.type === 'gift') {
              const count = Math.max(1, Number(msg.count) || 1);
              evt = { type: 'gift', ...base, giftName: msg.giftName || 'Rose', count,
                      diamonds: (Number(msg.diamonds) || 1) * count };
            } else if (msg.type === 'chat') {
              evt = { type: 'chat', ...base, comment: String(msg.comment || '') };
            } else if (msg.type === 'like') {
              evt = { type: 'like', ...base, count: Math.max(1, Number(msg.count) || 1) };
            }
            if (!evt) break;
            if (!dispatch({ ...evt, test: true })) reply(ws, '⚠️ ยังไม่ได้ขึ้น Live — เลือกเกมแล้วกด "ขึ้น Live" ก่อน');
            break;
          }

          case 'resetLeaderboard':
            leaderboard.clear(); sendLeaderboard();
            break;
        }
      });
    });

    httpServer.listen(config.port, () => {
      console.log(`HTTP + WebSocket: http://localhost:${config.port}`);
      resolve({
        port: config.port,
        close: () => { disconnectTikTok(); wss.close(); httpServer.close(); }
      });
    });
  });
}

module.exports = { startServer };