const http = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const config = require('./config');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function startServer() {
   return new Promise(async (resolve) => {
    // ---------- 1. HTTP Server (serves overlay & control panel) ----------
    const httpServer = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      // Serve files from /client
      const filePath = path.join(__dirname, '..', 'client', urlPath === '/' ? 'overlay.html' : urlPath);

      // Security: prevent path traversal
      if (!filePath.startsWith(path.join(__dirname, '..', 'client'))) {
        res.writeHead(403); res.end('Forbidden'); return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    httpServer.listen(config.httpPort, () => {
      console.log(`HTTP server: http://localhost:${config.httpPort}`);
    });

    // ---------- 2. WebSocket Server (pushes gift events to overlay) ----------
    const wss = new WebSocket.Server({ port: config.wsPort });
    console.log(`WebSocket server: ws://localhost:${config.wsPort}`);

    function broadcast(data) {
      const msg = JSON.stringify(data);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
      });
    }

    // ---------- 3. Leaderboard (in-memory) ----------
    const leaderboard = new Map(); // userId -> { userId, totalDiamonds }

    function updateLeaderboard(userId, diamonds) {
      if (!userId || !diamonds) return;
      const entry = leaderboard.get(userId) || { userId, totalDiamonds: 0 };
      entry.totalDiamonds += diamonds;
      leaderboard.set(userId, entry);

      const sorted = [...leaderboard.values()]
        .sort((a, b) => b.totalDiamonds - a.totalDiamonds)
        .slice(0, config.leaderboardSize);

      broadcast({ event: 'leaderboard', data: sorted });
    }

    // Reset leaderboard every N hours (configurable)
    setInterval(() => {
      leaderboard.clear();
      broadcast({ event: 'leaderboard', data: [] });
      console.log('🔄 Leaderboard reset');
    }, config.leaderboardResetHours * 60 * 60 * 1000);

    // ---------- 4. TikTok Live Connection ----------
    // Users configure their TikTok username in config.js (or later via UI)
    const tiktokUsername = config.tiktokUsername;

    if (tiktokUsername && tiktokUsername !== 'YOUR_USERNAME') {
      const connection = new TikTokLiveConnection(tiktokUsername, {
        signApiKey: config.signApiKey || undefined
      });

      connection.connect().then(state => {
        console.log(`✅ Connected to TikTok LIVE: ${tiktokUsername} (roomId: ${state.roomId})`);
        broadcast({ event: 'system', message: `Connected to ${tiktokUsername}` });
      }).catch(err => {
        console.error('❌ TikTok connection failed:', err.message);
        broadcast({ event: 'system', message: 'TikTok connection failed — check username / sign key' });
      });

      connection.on(WebcastEvent.GIFT, (data) => {
        // For streakable gifts, wait until repeatEnd
        if (data.giftType === 1 && !data.repeatEnd) return;

        const diamonds = (data.diamondCount || 0) * (data.repeatCount || 1);
        const payload = {
          event: 'gift',
          userId: data.user?.displayId || data.user?.uniqueId || 'unknown',
          giftName: data.giftName || 'Gift',
          diamonds,
          giftId: data.giftId
        };

        broadcast(payload);
        updateLeaderboard(payload.userId, diamonds);

        console.log(`🎁 ${payload.userId} sent ${payload.giftName} (${diamonds}💎)`);
      });

      // Optional: chat event (can be used later for chat-triggered games)
      // connection.on(WebcastEvent.CHAT, (data) => {
      //   broadcast({ event: 'chat', userId: data.user?.displayId, comment: data.content });
      // });
    } else {
      console.log('⚠️ No TikTok username configured — running in MOCK MODE');
      broadcast({ event: 'system', message: 'Mock mode — configure username in server/config.js' });
    }

    // ---------- 5. Client → Server commands (e.g., switch mode, reset leaderboard) ----------
    wss.on('connection', (ws) => {
  console.log('🖥️ Client connected');
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.command === 'resetLeaderboard') {
        leaderboard.clear();
        broadcast({ event: 'leaderboard', data: [] });
        console.log('🔄 Leaderboard reset by client');
      }

      if (msg.command === 'switchMode') {
        broadcast({ event: 'modeChanged', mode: msg.mode });
        console.log(`🎮 Mode switched to: ${msg.mode}`);
      }

      // ⭐ NEW: simulate a gift for testing (no TikTok needed)
      if (msg.command === 'simulateGift') {
        const payload = {
          event: 'gift',
          userId: msg.userId || 'tester',
          giftName: msg.giftName || 'Rose',
          diamonds: Number(msg.diamonds) || 1,
          giftId: 0
        };
        console.log(`🧪 [MOCK] Gift: ${payload.userId} → ${payload.giftName} (${payload.diamonds}💎)`);
        broadcast(payload);
        updateLeaderboard(payload.userId, payload.diamonds);
      }
    } catch (_) { /* ignore malformed */ }
  });
});

    resolve({ httpPort: config.httpPort, wsPort: config.wsPort });
  });
}

module.exports = { startServer };