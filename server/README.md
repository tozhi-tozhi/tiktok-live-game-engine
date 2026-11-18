# TikTok Live Game Engine

โปรแกรมเกมสำหรับ TikTok LIVE ที่เชื่อมของขวัญเข้ากับเกมบนหน้าจอ OBS

## ⚡ วิธีใช้งาน (3 ขั้นตอน)

### 1. เปิดโปรแกรม
ดับเบิลคลิก `TikTok Live Game Engine.exe`
หน้าต่าง Control Panel จะเปิดขึ้น

### 2. ตั้งค่า TikTok Username
เปิดไฟล์ `resources/app/server/config.js` (หรือรอเวอร์ชันถัดไปที่มีช่องกรอกในแอป)
แก้บรรทัด:
```js
tiktokUsername: 'ชื่อผู้ใช้ TikTok ของคุณ',