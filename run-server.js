// run-server.js — รัน backend โดยไม่ต้องผ่าน Electron
const { startServer } = require('./server');

startServer().then(({ httpPort, wsPort }) => {
  console.log('\n✅ Backend ready!');
  console.log(`   Overlay : http://localhost:${httpPort}/overlay.html`);
  console.log(`   Control : http://localhost:${httpPort}/control.html`);
  console.log(`   WS      : ws://localhost:${wsPort}\n`);
}).catch(err => {
  console.error('Failed to start server:', err);
});