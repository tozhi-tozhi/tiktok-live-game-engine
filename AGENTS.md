TikTok Live Game Hub — บันทึกสำหรับ AI/ผู้พัฒนา
อ่านไฟล์นี้ก่อนแก้โค้ด และอัปเดตไฟล์นี้ทุกครั้งที่โครงสร้างหรือข้อตกลงเปลี่ยน
ข้อมูลสถานะ Social Arena เพิ่มเติมอ้างอิงจากไฟล์เกม MVP ที่ส่งให้เจ้าของ และการยืนยันจากเจ้าของว่าเปิดใช้งานได้แล้ว

เป้าหมาย
Hub สำหรับขึ้น TikTok LIVE: เลือกเกม 1 เกม → กด "ขึ้น Live" → คนดูมีส่วนร่วมผ่านของขวัญ/แชท/ไลก์ กับเกมที่ Live อยู่เท่านั้น
- OBS เปิด overlay.html ไว้ครั้งเดียว เกมเปลี่ยนตามที่เลือกใน Hub
- เป้าหมายผลิตภัณฑ์ระยะยาว: เครื่องมือสำหรับ TikToker ที่ไม่ถนัดเทคนิค ให้เปิดเกมและใช้งานระหว่าง Live ได้ง่าย
- ระยะแรก รองรับ TikTok LIVE เท่านั้น
- แนวทางเกม: 2D game ที่มีตัวตนของผู้ชมในโลกเกม, Gameplay ดำเนินเองเป็นหลัก, Chat ใช้เข้าร่วมหรือสั่งการ, Like เป็นการมีส่วนร่วมแบบง่าย, Gift เป็นพลัง/ความสามารถพิเศษ
- วางระบบให้เพิ่มเกมหลายแนวในอนาคตได้ แต่ให้พิสูจน์ Gameplay ด้วยเกมต้นแบบก่อน อย่าเพิ่งสร้าง abstraction หรือระบบกลางเกินความจำเป็น
วิธีรัน (Windows)
- ดับเบิลคลิก start-hub.bat หรือรัน npm run start:server
- Hub: http://localhost:3000/hub.html
- Overlay (ใส่ OBS Browser Source): http://localhost:3000/overlay.html
- ห้ามมองว่า Electron เป็นทางหลัก: ติดตั้งไม่สำเร็จบนเครื่องเจ้าของ (Node 26, electron.exe หาย)
- electron-main.js เก็บไว้เผื่ออนาคต แต่ทุกฟีเจอร์ต้องใช้งานได้ผ่านเบราว์เซอร์
โครงสร้าง
- server/index.js — HTTP + WebSocket พอร์ตเดียว (3000), state กลาง, เชื่อม TikTok, คำสั่งจาก Hub
- server/config.js — port, signApiKey, ขนาด leaderboard
- client/hub.html + css/hub.css — หน้าควบคุม (เลือกเกม, Go Live, ทดสอบ, บันทึกอีเวนต์)
- client/overlay.html + js/core.js — หน้าจอสตรีม โหลดเกมที่ Live แบบไดนามิก
- client/games/<id>/manifest.json + game.js — เกมแต่ละเกม (ปลั๊กอิน)
- เกมที่มีในโปรเจกต์: boxing, climbing
- เกมต้นแบบที่เพิ่มใหม่: social-arena (Social Arena MVP)
โปรโตคอล WebSocket (JSON)
Client → Server:
- hello {role: 'hub'|'overlay'}
- goLive {gameId, username}
- stopLive
- simulate {type: 'gift'|'chat'|'like', userId, giftName, diamonds, count, comment}
- resetLeaderboard
Server → Client:
- state {activeGame, tiktok{status,username,message}, overlays, games[]}
- game_event {gameId, type, userId, name, ...}
- leaderboard {data}
- notice {message}
รูปแบบ game_event ปัจจุบัน:
- gift: {giftName, count, diamonds}
- chat: {comment}
- like: {count}
- ทุก event มี userId และ name
- อีเวนต์จริงจาก TikTok และอีเวนต์ทดสอบ (test: true) วิ่งผ่าน dispatch() ทางเดียวกัน
- ไม่มี activeGame = ไม่ส่งอีเวนต์ให้เกมใดเลย
- ปัจจุบัน server ยังไม่ส่ง avatarUrl หรือ URL รูปโปรไฟล์ ให้เกม อย่าเขียนเกมโดยสมมติว่ามีข้อมูลนี้
- หาก TikTok user ไม่มี uniqueId ในบาง event, server อาจส่ง userId: 'unknown'; เกมที่ใช้ userId เป็น key ต้องระวังว่าผู้ใช้ที่ไม่มี ID อาจถูกรวมเป็นผู้เล่นเดียวกัน
วิธีเพิ่มเกมใหม่
1. สร้าง client/games/<id>/manifest.json
   - อย่างน้อยควรมี name, icon, description
   - ค่าตั้งเฉพาะเกม เช่น gifts, จำนวนผู้เล่น, เวลาแข่งขัน สามารถกำหนดใน manifest ได้
2. สร้าง client/games/<id>/game.js และลงทะเบียน object ที่มี init(container, manifest), onEvent(evt), destroy()
3. ต้องลงทะเบียนด้วย key ที่ตรงกับชื่อโฟลเดอร์แบบตรงตัว เพราะ client/js/core.js เรียก GameRegistry[id]
   - ID ที่เป็นตัวอักษร/ตัวเลข เช่น boxing: GameRegistry.boxing = { ... } ใช้ได้
   - ID ที่มีขีดกลาง เช่น social-arena: ต้องใช้ GameRegistry['social-arena'] = { ... }
   - ห้ามใช้ GameRegistry.social-arena เพราะ JavaScript จะตีความเป็นการลบตัวแปร ไม่ใช่ key ชื่อ social-arena
4. ไม่ต้องแก้ไฟล์อื่นเพื่อให้ Hub ค้นพบเกม — server/index.js อ่านรายชื่อเกมจากโฟลเดอร์ที่มี manifest.json อัตโนมัติ
5. ข้อกำหนดของปลั๊กอิน:
   - ห้ามประกาศ const/`let` ที่ top-level ของไฟล์ game.js เพราะไฟล์ถูกโหลดซ้ำทุกครั้งที่ขึ้น Live; ใช้ IIFE หรือ scope ภายในฟังก์ชัน
   - destroy() ต้องล้าง setInterval, setTimeout และ event listener ที่เกมสร้างขึ้น
   - ข้อความจากผู้ใช้ TikTok ต้องใส่ด้วย textContent หรือ escape เสมอ (ป้องกัน HTML injection)
   - อย่าพึ่งพา event ที่ไม่มีอยู่ใน protocol; ตรวจ server/index.js ก่อนเพิ่มการใช้งาน
   - เกมต้องรับ event เฉพาะตอนตัวเองเป็นเกมที่ Live อยู่ และไม่ควรสร้าง WebSocket connection แยกเอง
Social Arena MVP — สถานะและกติกาปัจจุบัน
สถานะ: เจ้าของยืนยันแล้วว่าแก้ปัญหาการลงทะเบียนและเปิดใช้งานเกมได้

ไฟล์:
- client/games/social-arena/manifest.json
- client/games/social-arena/game.js
แนวคิด: สนามประลองอัตโนมัติที่ผู้ชมเข้ามาเป็นตัวละครของตัวเอง ตัวละครเดินหาและต่อสู้กับผู้เล่นอื่นเอง ผู้ชมมีส่วนร่วมผ่าน Chat / Like / Gift

การเล่นปัจจุบัน:
- เข้าร่วมด้วยการพิมพ์ keyword ตรงกับค่าใน joinKeywords (ค่าเริ่มต้น สู้, เข้าร่วม, join, fight)
- ผู้เล่นถูกระบุตัวด้วย userId เพื่อป้องกันการสร้างตัวละครซ้ำจากบัญชีเดิม
- จำกัดตัวละครในสนาม maxPlayers (ค่าเริ่มต้น 12); ผู้เล่นที่เกินจำนวนจะรอในคิว maxQueue
- เมื่อมีผู้เล่นอย่างน้อย 2 คน จะเริ่มนับถอยหลัง 5 วินาที แล้วเริ่มต่อสู้อัตโนมัติ
- ตัวละครเลือกเป้าหมายที่อยู่ใกล้ที่สุด เดินเข้าหา และโจมตีเอง
- Like เพิ่มแถบ Cheer; เมื่อเต็มจะได้รับพลังโจมตีชั่วคราว
- Gift สามารถสร้างผู้เล่นเข้าคิวได้ และให้ Heal / Shield / Boost ตาม mapping ใน manifest
- รอบปกติ 180 วินาที; จบเมื่อเหลือผู้เล่นไม่เกิน 1 คน หรือหมดเวลา
- เมื่อหมดเวลา ผู้ชนะตัดสินจาก HP + Shield ที่เหลือ; แสดงผล 8 วินาทีแล้วเริ่มรอบใหม่
- ตัวละครใช้สีและอักษรย่อจากชื่อบัญชีเป็น avatar fallback
ข้อจำกัดที่ต้องทราบ:
- ยังไม่มีรูปโปรไฟล์ TikTok จริง เพราะ server event ปัจจุบันไม่มี avatarUrl
- Like จะมีผลกับผู้เล่นที่เข้าร่วมและยังอยู่ในสนามเท่านั้น
- Gift สามารถสร้างผู้เล่นใหม่ได้; ผู้เล่นที่ตายระหว่างรอบจะรอคิว/รอบถัดไปตาม logic ของเกม
- การทดสอบที่เจ้าของยืนยันคือเกมเปิดใช้งานได้หลังแก้ registration key; อย่าอ้างว่าผ่านการทดสอบ TikTok LIVE จริงหรือ OBS จริง หากยังไม่ได้ทดสอบรอบนั้น
ค่าที่ปรับได้ใน manifest.json:
- maxPlayers, maxQueue, maxHp
- roundSeconds, countdownSeconds, resultSeconds
- baseDamage, attackCooldownMs, moveSpeed
- joinKeywords
- gifts — mapping ชื่อ Gift ไปเป็น heal, shield, boostMs
ข้อตกลง/ข้อควรระวัง
- ไลบรารี tiktok-live-connector v2.5: ของขวัญอยู่ที่ data.giftDetails (ชื่อ, diamondCount, giftType); ของแบบสตรีค (giftType === 1) นับตอน repeatEnd เท่านั้น
- WebSocket ยอมเฉพาะ Origin localhost/127.0.0.1; หากไม่มี Origin จะอนุญาต (ดู implementation ปัจจุบันใน server/index.js)
- เครื่องมือ build (electron-builder) มี npm audit เตือนเยอะ — อย่ารัน npm audit fix --force
- แก้ไฟล์ static ได้ทันที เพราะ server ส่ง Cache-Control: no-store
- อย่าเปลี่ยน protocol ฝั่ง server โดยไม่ตรวจเกมเดิมทุกเกม เพราะทุกเกมใช้ event dispatch กลางร่วมกัน
สถานะการทดสอบ
- ทดสอบอัตโนมัติแล้วตามบันทึกเดิม: Hub → เลือกเกม → Live → อีเวนต์จำลอง → overlay, สลับเกมกลาง Live, หยุด Live, อีเวนต์ TikTok จำลอง, TikTok เชื่อมต่อล้มเหลวแล้ว server ไม่ตาย
- Social Arena: เจ้าของยืนยันว่าเปิดใช้งานได้หลังแก้ registration key จาก dot notation เป็น bracket notation
- ยังไม่ยืนยันจากการทดสอบจริง: TikTok LIVE จริง, OBS Browser Source จริง, Electron
- ก่อนสรุปว่า feature ใหม่สมบูรณ์ ให้ทดสอบ Chat / Like / Gift จำลองอย่างน้อยหนึ่งรอบ และตรวจ console ของ Overlay
ข้อตกลงการทำงานกับเจ้าของ
- ตอบเป็นภาษาไทย
- เจ้าของใช้ AI ฟรีผ่านแชทและ copy-paste เอง → ให้โค้ด ไฟล์เต็ม พร้อมระบุพาธชัดเจน และบอกไฟล์ที่ต้องลบ/สร้างใหม่ ไม่ใช้ diff หรือ ...โค้ดเดิม...
- ก่อนแก้ ให้อ่าน AGENTS.md และ NOTES.md (ถ้ามี) รวมถึงตรวจโค้ดจริงในโปรเจกต์/Repomix ก่อนเดา
- ทำงานเป็นช่วงเล็ก ๆ: อธิบายเป้าหมายของ session, ระบุไฟล์ที่จะเปลี่ยน, ทดสอบ syntax/flow ที่ทำได้ แล้วสรุปสิ่งที่เจ้าของต้องทดสอบ
- เน้นสร้าง vertical slice ที่เล่นได้ก่อน แล้วค่อยแยกส่วนที่ใช้ซ้ำเมื่อมีเหตุผลจริง