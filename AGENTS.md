# TikTok Live Game Hub — บันทึกสำหรับเอไอ/ผู้พัฒนา

> อ่านไฟล์นี้ก่อนแก้โค้ด และอัปเดตไฟล์นี้ทุกครั้งที่โครงสร้างหรือข้อตกลงเปลี่ยน

## เป้าหมาย
Hub สำหรับขึ้น TikTok LIVE: เลือกเกม 1 เกม → กด "ขึ้น Live" → คนดูมีส่วนร่วม (ของขวัญ/แชท/ไลก์)
กับเกมที่ Live อยู่เท่านั้น. OBS เปิด `overlay.html` ไว้ครั้งเดียว เกมเปลี่ยนตามที่เลือกใน Hub.

## วิธีรัน (Windows)
- ดับเบิลคลิก `start-hub.bat` หรือ `npm run start:server` → เบราว์เซอร์เปิด http://localhost:3000/hub.html
- Overlay (ใส่ OBS Browser Source): http://localhost:3000/overlay.html
- ห้ามมองว่า Electron เป็นทางหลัก: ติดตั้งไม่สำเร็จบนเครื่องเจ้าของ (Node 26, electron.exe หาย).
  `electron-main.js` เก็บไว้เผื่ออนาคต แต่ทุกฟีเจอร์ต้องใช้งานได้ผ่านเบราว์เซอร์

## โครงสร้าง
- `server/index.js` — HTTP + WebSocket พอร์ตเดียว (3000), state กลาง, เชื่อม TikTok, คำสั่งจาก Hub
- `server/config.js` — port, signApiKey, ขนาด leaderboard
- `client/hub.html` + `css/hub.css` — หน้าควบคุม (เลือกเกม, Go Live, ทดสอบ, บันทึกอีเวนต์)
- `client/overlay.html` + `js/core.js` — หน้าจอสตรีม โหลดเกมที่ Live แบบไดนามิก
- `client/games/<id>/manifest.json` + `game.js` — เกมแต่ละเกม (ปลั๊กอิน)
- เกมตอนนี้: `boxing`, `climbing`

## โปรโตคอล WebSocket (JSON)
Client → Server: `hello {role: 'hub'|'overlay'}`, `goLive {gameId, username}`, `stopLive`,
`simulate {type: 'gift'|'chat'|'like', userId, giftName, diamonds, count, comment}`, `resetLeaderboard`

Server → Client: `state {activeGame, tiktok{status,username,message}, overlays, games[]}`,
`game_event {gameId, type, userId, name, ...}`, `leaderboard {data}`, `notice {message}`

รูปแบบ game_event: gift = `{giftName, count, diamonds}`, chat = `{comment}`, like = `{count}`
อีเวนต์จริงจาก TikTok และอีเวนต์ทดสอบ (`test: true`) วิ่งผ่าน `dispatch()` ทางเดียวกัน
ไม่มี `activeGame` = ไม่ส่งอีเวนต์ให้เกมใดเลย

## วิธีเพิ่มเกมใหม่
1. สร้าง `client/games/<id>/manifest.json` (`name`, `icon`, `description`, และค่าตั้งของเกม เช่น `gifts`)
2. สร้าง `client/games/<id>/game.js` ที่ลงทะเบียน `GameRegistry.<id> = { init(container, manifest), onEvent(evt), destroy() }`
   - ห้ามประกาศ `const/let` ระดับบนสุดใน game.js (ไฟล์ถูกโหลดซ้ำทุกครั้งที่ขึ้น Live)
   - `destroy()` ต้องล้าง timer ทั้งหมด
   - ข้อความจากผู้ใช้ TikTok ต้องใส่ด้วย `textContent` หรือ escape เสมอ (กัน HTML injection)
3. ไม่ต้องแก้ไฟล์อื่น — Hub จะเจอเกมเองจากโฟลเดอร์

## ข้อตกลง/ข้อควรระวัง
- ไลบรารี `tiktok-live-connector` v2.5: ของขวัญอยู่ที่ `data.giftDetails` (ชื่อ, diamondCount, giftType);
  ของแบบสตรีค (giftType 1) นับตอน `repeatEnd` เท่านั้น. โค้ดรองรับทั้งรูปแบบ README และ type ของ proto v3
- WebSocket ยอมเฉพาะ Origin localhost/127.0.0.1 (กันเว็บอื่นแอบสั่งงาน)
- เครื่องมือ build (`electron-builder`) มี `npm audit` เตือนเยอะ — อย่ารัน `npm audit fix --force`
- แก้ไฟล์ static ได้ทันที (เซิร์ฟเวอร์ส่ง `Cache-Control: no-store`)

## สถานะการทดสอบ
- ทดสอบอัตโนมัติแล้ว: Hub → เลือกเกม → Live → อีเวนต์จำลอง → overlay, สลับเกมกลาง Live, หยุด Live,
  อีเวนต์ TikTok (ไลบรารีจำลอง), TikTok เชื่อมต่อล้มเหลวแล้วเซิร์ฟเวอร์ไม่ตาย
- ยังไม่เคยทดสอบ: ไลฟ์ TikTok จริง, Electron, OBS จริง

## ข้อตกลงการทำงานกับเจ้าของ
- ตอบเป็นภาษาไทย
- เจ้าของใช้ AI ฟรีผ่านแชทเท่านั้น (ไม่มี API) และ copy-paste เอง → ให้โค้ด **ไฟล์เต็ม** พร้อมระบุพาธชัดเจน
  และบอกไฟล์ที่ต้องลบ/สร้างใหม่ ไม่ใช้ diff หรือ "...โค้ดเดิม..."
- ก่อนแก้ ให้อ่าน NOTES.md นี้และตรวจโค้ดจริงใน repomix ก่อนเดา