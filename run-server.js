// run-server.js — รัน Hub โดยไม่ต้องใช้ Electron
const { exec } = require('child_process');
const { startServer } = require('./server');

startServer().then(({ port }) => {
  const hubUrl = `http://localhost:${port}/hub.html`;
  console.log('\n✅ Hub พร้อมแล้ว');
  console.log(`   Hub     : ${hubUrl}`);
  console.log(`   Overlay : http://localhost:${port}/overlay.html  (ใส่ใน OBS)`);
  console.log('\n   ปิดหน้าต่างนี้ = ปิดโปรแกรม\n');

  if (process.platform === 'win32') exec(`start "" "${hubUrl}"`); // เปิดเบราว์เซอร์ให้เอง
}).catch(err => {
  console.error('เริ่มเซิร์ฟเวอร์ไม่ได้:', err.message);
  console.error('(พอร์ต 3000 อาจถูกโปรแกรมอื่นใช้อยู่ — ปิดอันเก่าก่อน)');
  process.exit(1);
});