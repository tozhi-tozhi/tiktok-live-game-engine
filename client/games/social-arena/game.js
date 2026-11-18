(function () {
  const STYLE_ID = 'social-arena-styles';
  const CSS = `
  .sa-root{position:absolute;inset:0;color:#fff;font-family:Inter,"Segoe UI",sans-serif;overflow:hidden;background:radial-gradient(ellipse at 50% 48%,rgba(50,83,125,.38),transparent 58%)}
  .sa-top{position:absolute;z-index:5;top:2.5%;left:3%;right:3%;display:flex;align-items:center;justify-content:space-between;gap:20px}
  .sa-brand{display:flex;align-items:center;gap:12px}.sa-mark{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(145deg,#a855f7,#ec4899);font-size:25px;box-shadow:0 8px 28px #a855f755}
  .sa-kicker{font-size:10px;letter-spacing:3px;color:#c4b5fd;font-weight:800}.sa-title{font-size:25px;font-weight:1000;letter-spacing:2px}
  .sa-state{padding:10px 16px;border:1px solid #ffffff25;background:#080d1dcc;border-radius:30px;font-size:12px;letter-spacing:1px}
  .sa-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#4ade80;margin-right:8px;box-shadow:0 0 12px #4ade80}
  .sa-stats{display:flex;gap:9px}.sa-stat{min-width:78px;text-align:center;padding:8px 12px;border:1px solid #ffffff20;background:#080d1dcc;border-radius:12px}.sa-stat small{display:block;font-size:9px;color:#a5b4fc;letter-spacing:1.5px}.sa-stat b{font-size:20px}
  .sa-banner{position:absolute;z-index:4;top:15%;left:50%;transform:translateX(-50%);text-align:center;padding:12px 25px;border:1px solid #c4b5fd44;background:#0b1026c9;border-radius:15px;min-width:340px;transition:opacity .2s}
  .sa-banner strong{display:block;font-size:22px;letter-spacing:1px}.sa-banner span{display:block;margin-top:5px;font-size:12px;color:#cbd5e1}
  .sa-field{position:absolute;left:7%;right:7%;top:25%;bottom:24%;border:1px solid #a78bfa35;border-radius:50% / 43%;background:radial-gradient(ellipse,#202b4a88 0%,#111a3066 48%,transparent 72%);overflow:hidden}
  .sa-grid{position:absolute;inset:0;opacity:.25;background-image:linear-gradient(#a5b4fc20 1px,transparent 1px),linear-gradient(90deg,#a5b4fc20 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse,#000 25%,transparent 75%)}
  .sa-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:1px solid #a78bfa30;border-radius:50%}.sa-ring.one{width:55%;height:75%}.sa-ring.two{width:82%;height:94%;border-style:dashed}
  .sa-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:42px;font-weight:1000;letter-spacing:8px;color:#c4b5fd12}
  .sa-fighters,.sa-fx{position:absolute;inset:0;pointer-events:none}
  .sa-player{position:absolute;width:78px;transform:translate(-50%,-50%);text-align:center;transition:left .12s linear,top .12s linear;filter:drop-shadow(0 8px 9px #0009)}
  .sa-avatar{position:relative;width:46px;height:46px;margin:auto;border-radius:50%;padding:3px;background:linear-gradient(135deg,hsl(var(--hue),90%,68%),#fff);box-shadow:0 0 0 3px #111827,0 0 20px hsl(var(--hue),90%,60%,.5)}
  .sa-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:none}.sa-fallback{width:100%;height:100%;border-radius:50%;display:grid;place-items:center;background:hsl(var(--hue),48%,28%);font-size:20px;font-weight:900}
  .sa-name{display:block;margin:5px auto 3px;max-width:82px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:3px 7px;border-radius:8px;background:#090e1ddd;font-size:10px;font-weight:800;transition:background .2s,color .2s}
  .sa-bars{width:58px;margin:auto;height:5px;background:#3f1724;border-radius:8px;overflow:hidden}.sa-hp{height:100%;width:100%;background:linear-gradient(90deg,#fb7185,#facc15);transition:width .15s}
  .sa-shield{height:3px;width:0;background:linear-gradient(90deg,#22d3ee,#818cf8);margin:2px auto 0;border-radius:5px;transition:width .15s}
  .sa-cheer{height:3px;width:0;background:#fb7185;margin:2px auto 0;border-radius:5px;transition:width .15s}
  .sa-player.boost{filter:drop-shadow(0 0 12px #fbbf24)}
  .sa-player.buffed .sa-name{background:#78350fee;color:#fde68a}
  .sa-player.buffed .sa-avatar{animation:saBuff .9s ease-out}
  .sa-player.attack .sa-avatar{animation:saPunch .25s}.sa-player.hit .sa-avatar{animation:saHit .2s}.sa-player.out{opacity:0;transform:translate(-50%,-50%) scale(.4);transition:.45s}
  @keyframes saPunch{50%{transform:scale(1.22)}}@keyframes saHit{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
  @keyframes saBuff{0%{box-shadow:0 0 0 3px #111827,0 0 0 0 rgba(251,191,36,.85)}100%{box-shadow:0 0 0 3px #111827,0 0 0 16px rgba(251,191,36,0)}}
  .sa-float{position:absolute;font-size:16px;font-weight:1000;color:#fde68a;text-shadow:0 2px 5px #000;animation:saFloat 1s forwards;white-space:nowrap}
  .sa-float.dmg{color:#fca5a5}.sa-float.heal{color:#86efac}.sa-float.shield{color:#7dd3fc}.sa-float.power{color:#f0abfc}
  @keyframes saFloat{to{transform:translateY(-45px);opacity:0}}
  .sa-footer{position:absolute;left:3%;right:3%;bottom:3%;display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:12px}
  .sa-panel{min-height:68px;padding:11px 14px;border:1px solid #ffffff20;background:#080d1ddd;border-radius:13px;overflow:hidden}.sa-panel b{display:block;font-size:10px;color:#c4b5fd;letter-spacing:1.5px;margin-bottom:7px}
  .sa-panel span{font-size:11px;color:#e2e8f0}.sa-chips{display:flex;gap:5px;flex-wrap:wrap}.sa-chip{padding:4px 7px;background:#312e8155;border:1px solid #a78bfa33;border-radius:6px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sa-feedline{display:block!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:2px 0}
  @media(max-width:850px){.sa-title{font-size:18px}.sa-state{display:none}.sa-field{left:2%;right:2%}.sa-footer{grid-template-columns:1fr 1fr}.sa-panel:first-child{grid-column:1/-1}.sa-stat{min-width:54px;padding:6px}.sa-banner{top:17%;min-width:0;width:80%}}
  `;
  GameRegistry['social-arena'] = {
    settings:{}, players:null, byUser:null, byName:null, queue:[], feed:[],
    phase:'waiting', round:0, participants:0, phaseEnds:0, roundEnds:0, bannerUntil:0,
    lastTick:0, root:null, refs:null, tickTimer:null, uiTimer:null, timers:null, hudDirty:true,

    init(container, manifest) {
      this.destroy();
      this.settings=Object.assign({maxPlayers:12,maxQueue:30,maxHp:100,roundSeconds:180,countdownSeconds:5,resultSeconds:8,baseDamage:9,attackCooldownMs:1150,moveSpeed:7.5,joinKeywords:['สู้','เข้าร่วม','join','fight'],gifts:{}},manifest||{});
      this.players=new Map();this.byUser=new Map();this.byName=new Map();
      this.queue=[];this.feed=[];this.round=0;this.phase='waiting';this.hudDirty=true;this.bannerUntil=0;
      let style=document.getElementById(STYLE_ID);
      if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style);}
      style.textContent=CSS;
      container.innerHTML=`<div class="sa-root">
        <header class="sa-top"><div class="sa-brand"><div class="sa-mark">⚔</div><div><div class="sa-kicker">TIKTOK LIVE MINI GAME</div><div class="sa-title">SOCIAL ARENA</div></div></div>
        <div class="sa-state"><i class="sa-dot"></i><span id="saState">WAITING FOR PLAYERS</span></div>
        <div class="sa-stats"><div class="sa-stat"><small>ROUND</small><b id="saRound">00</b></div><div class="sa-stat"><small>TIME</small><b id="saTime">03:00</b></div><div class="sa-stat"><small>ALIVE</small><b id="saAlive">0</b></div></div></header>
        <div class="sa-banner" id="saBanner"><strong id="saBannerTitle">THE ARENA IS WAITING</strong><span id="saBannerSub">พิมพ์ “สู้” ในแชทเพื่อเข้าร่วมสนาม</span></div>
        <main class="sa-field"><div class="sa-grid"></div><div class="sa-ring one"></div><div class="sa-ring two"></div><div class="sa-center">ARENA</div><div class="sa-fighters" id="saFighters"></div><div class="sa-fx" id="saFx"></div></main>
        <footer class="sa-footer"><section class="sa-panel"><b>JOIN THE FIGHT</b><span>พิมพ์ “สู้” เพื่อเข้าร่วม · ❤️ Like เพิ่มพลัง · 🎁 Gift มอบบัฟให้ตัวคุณเอง</span></section><section class="sa-panel"><b>ON DECK</b><div class="sa-chips" id="saQueue"></div></section><section class="sa-panel"><b>LIVE FEED</b><div id="saFeed"></div></section></footer></div>`;
      this.root=container.querySelector('.sa-root');
      const q=id=>this.root.querySelector('#'+id);
      this.refs={state:q('saState'),round:q('saRound'),time:q('saTime'),alive:q('saAlive'),banner:q('saBanner'),bannerTitle:q('saBannerTitle'),bannerSub:q('saBannerSub'),fighters:q('saFighters'),fx:q('saFx'),queue:q('saQueue'),feed:q('saFeed')};
      this.lastTick=Date.now();
      this.setBanner('THE ARENA IS WAITING','พิมพ์ “สู้” ในแชทเพื่อเข้าร่วมสนาม');
      this.tickTimer=setInterval(()=>this.tick(),100);
      this.uiTimer=setInterval(()=>this.renderHud(),250);
      this.renderHud();
    },

    destroy(){
      if(this.tickTimer)clearInterval(this.tickTimer);
      if(this.uiTimer)clearInterval(this.uiTimer);
      this.tickTimer=null;this.uiTimer=null;
      if(this.timers)this.timers.forEach(t=>clearTimeout(t));
      this.timers=new Set();
      if(this.root&&this.root.parentNode)this.root.remove();
      this.root=null;this.refs=null;
      if(this.players)this.players.clear();
      this.players=null;this.byUser=null;this.byName=null;
      this.queue=[];this.feed=[];
    },

    later(fn,ms){const t=setTimeout(()=>{this.timers.delete(t);fn();},ms);this.timers.add(t);return t;},

    onEvent(evt){
      if(!evt||!this.players)return;
      if(evt.type==='chat')this.chat(evt);
      else if(evt.type==='like')this.like(evt);
      else if(evt.type==='gift')this.gift(evt);
    },

    norm(s){return String(s||'').trim().toLowerCase().replace(/[!！。、,.?？]/g,'');},

    // ---- การระบุตัวตน: บัฟต้องลงตัวละครของเจ้าของแอคชั่นเท่านั้น ----
    cleanId(v){
      const s=String(v==null?'':v).trim();
      if(!s||s==='unknown'||s==='undefined'||s==='null')return '';
      return s.slice(0,100);
    },
    nameKey(v){
      const s=String(v==null?'':v).trim();
      if(!s||s==='unknown')return '';
      return s.toLowerCase().slice(0,60);
    },
    resolve(evt){
      const uid=this.cleanId(evt.userId);
      const nk=this.nameKey(evt.name);
      if(uid&&this.byUser.has(uid)){const p=this.players.get(this.byUser.get(uid));if(p)return p;}
      if(nk&&this.byName.has(nk)){
        const p=this.players.get(this.byName.get(nk));
        // เชื่อมด้วยชื่อได้ก็ต่อเมื่อไม่ขัดกับ ID จริงที่รู้อยู่ (กันคนชื่อซ้ำคนละบัญชี)
        if(p&&(!uid||!p.uid||p.uid===uid))return p;
      }
      return null;
    },
    link(p,evt){
      const uid=this.cleanId(evt.userId);
      const nk=this.nameKey(evt.name);
      if(uid&&!p.uid)p.uid=uid;
      if(p.uid)this.byUser.set(p.uid,p.id);
      if(nk){p.nameKey=nk;this.byName.set(nk,p.id);}
      if(evt.name){
        const nm=String(evt.name).trim().slice(0,28);
        if(nm&&nm!==p.name){
          p.name=nm;
          if(p.dom){p.dom.name.textContent=nm;p.dom.name.title=nm;p.dom.fallback.textContent=Array.from(nm)[0]||'?';}
        }
      }
    },
    ensure(evt){
      let p=this.resolve(evt);
      if(p){this.link(p,evt);}
      else{
        const uid=this.cleanId(evt.userId);
        const nk=this.nameKey(evt.name);
        const id=uid||(nk?'n:'+nk:'');
        if(!id)return null; // ระบุเจ้าของไม่ได้ = ไม่สร้างตัวมั่ว ไม่บัฟมั่ว
        if(this.players.size>=this.settings.maxPlayers+this.settings.maxQueue)return null;
        p={id,uid,nameKey:nk,name:String(evt.name||evt.userId||id).trim().slice(0,28)||id,hue:this.hash(id)%360,status:'queued',hp:this.settings.maxHp,shield:0,cheer:0,likes:0,kills:0,x:50,y:50,attackAt:0,boostUntil:0,el:null,dom:null};
        this.players.set(id,p);
        this.queue.push(id);
        this.link(p,evt);
        this.hudDirty=true;
      }
      if(p.status==='eliminated'&&this.phase==='running'){
        p.status='queued';
        if(!this.queue.includes(p.id))this.queue.push(p.id);
        this.hudDirty=true;
      }
      this.promote();
      return p;
    },

    chat(evt){
      if(!(this.settings.joinKeywords||[]).some(k=>this.norm(k)===this.norm(evt.comment)))return;
      const before=this.resolve(evt);
      const wasAlive=!!(before&&before.status==='alive');
      const p=this.ensure(evt);
      if(!p)return;
      if(!wasAlive)this.addFeed('JOIN',p.name+' เข้าร่วมสนาม');
      if(this.phase==='waiting'&&this.alive().length>=2)this.countdown();
    },

    like(evt){
      const p=this.resolve(evt); // ไม่สร้างตัวละครใหม่จาก Like
      if(!p||p.status!=='alive')return;
      this.link(p,evt);
      const n=Math.min(100,Math.max(1,Number(evt.count)||1));
      p.likes+=n;
      p.cheer=Math.min(100,p.cheer+n*4);
      if(p.cheer>=100){
        p.cheer=0;p.boostUntil=Date.now()+5000;
        this.float(p,'LIKE POWER!','power');
        this.pulse(p,'buffed',900);
        this.addFeed('POWER',p.name+' ได้พลังจาก Like');
      }else this.float(p,'❤️ +'+n);
      this.drawPlayer(p);
    },

    gift(evt){
      const p=this.ensure(evt);
      if(!p)return;
      const r=this.settings.gifts[evt.giftName]||this.settings.gifts.default||{heal:8,shield:5,boostMs:0};
      const n=Math.min(20,Math.max(1,Number(evt.count)||1));
      const before=p.hp;
      p.hp=Math.min(this.settings.maxHp,p.hp+(Number(r.heal)||0)*n);
      const sh=(Number(r.shield)||0)*n;
      p.shield=Math.min(this.settings.maxHp,p.shield+sh);
      if(r.boostMs)p.boostUntil=Date.now()+Number(r.boostMs);
      const gained=Math.round(p.hp-before);
      this.float(p,'🎁 '+(evt.giftName||'GIFT'));
      if(gained>0)this.float(p,'+'+gained+' HP','heal',20);
      if(sh>0)this.float(p,'🛡 +'+sh,'shield',40);
      this.pulse(p,'buffed',900);
      this.addFeed('GIFT',p.name+' ได้บัฟ '+(evt.giftName||'Gift'));
      this.drawPlayer(p);
    },

    hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;},
    alive(){return this.players?Array.from(this.players.values()).filter(p=>p.status==='alive'):[];},

    promote(){
      if(this.phase==='result')return;
      while(this.alive().length<this.settings.maxPlayers&&this.queue.length){
        const p=this.players.get(this.queue.shift());
        if(!p||p.status!=='queued')continue;
        p.status='alive';p.hp=this.settings.maxHp;p.shield=0;p.cheer=0;
        p.x=10+Math.random()*80;p.y=10+Math.random()*80;
        this.createNode(p);
        this.hudDirty=true;
      }
    },

    createNode(p){
      const el=document.createElement('div');
      el.className='sa-player';
      el.style.setProperty('--hue',p.hue);
      el.innerHTML='<div class="sa-avatar"><img><span class="sa-fallback"></span></div><span class="sa-name"></span><div class="sa-bars"><div class="sa-hp"></div></div><div class="sa-shield"></div><div class="sa-cheer"></div>';
      const img=el.querySelector('img'),fallback=el.querySelector('.sa-fallback');
      fallback.textContent=Array.from(p.name)[0]||'?';
      const nameEl=el.querySelector('.sa-name');
      nameEl.textContent=p.name;nameEl.title=p.name;
      if(p.avatarUrl){img.src=p.avatarUrl;img.style.display='block';fallback.style.display='none';img.onerror=()=>{img.style.display='none';fallback.style.display='grid';};}
      p.el=el;
      p.dom={img,fallback,name:nameEl,hp:el.querySelector('.sa-hp'),shield:el.querySelector('.sa-shield'),cheer:el.querySelector('.sa-cheer')};
      this.refs.fighters.appendChild(el);
      this.drawPlayer(p);
    },

    drawPlayer(p){
      if(!p.el||!p.dom)return;
      p.el.style.left=p.x+'%';p.el.style.top=p.y+'%';
      p.dom.name.textContent=p.name;
      p.dom.hp.style.width=Math.max(0,Math.min(100,p.hp/this.settings.maxHp*100))+'%';
      p.dom.shield.style.width=Math.max(0,Math.min(100,p.shield/this.settings.maxHp*100))+'%';
      p.dom.cheer.style.width=Math.max(0,Math.min(100,p.cheer))+'%';
      p.el.classList.toggle('boost',p.boostUntil>Date.now());
    },

    pulse(p,cls,ms){
      if(!p.el)return;
      p.el.classList.remove(cls);
      void p.el.offsetWidth;
      p.el.classList.add(cls);
      this.later(()=>{if(p.el)p.el.classList.remove(cls);},ms);
    },

    tick(){
      if(!this.refs)return;
      const now=Date.now();
      if(this.phase==='countdown'&&now>=this.phaseEnds){
        if(this.alive().length>=2)this.startRound();
        else{this.phase='waiting';this.setBanner('THE ARENA IS WAITING','พิมพ์ “สู้” ในแชทเพื่อเข้าร่วมสนาม');}
      }
      if(this.phase==='result'&&now>=this.phaseEnds)this.nextRound();
      if(this.phase==='running'){
        const dt=Math.min(.2,(now-this.lastTick)/1000);
        const fighters=this.alive();
        fighters.forEach(p=>this.move(p,fighters,now,dt));
        const left=this.alive();
        if(left.length<=1&&this.participants>=2)this.finish(left[0]||null);
        else if(now>=this.roundEnds){
          const winner=left.sort((a,b)=>(b.hp+b.shield)-(a.hp+a.shield))[0]||null;
          this.finish(winner);
        }
      }
      this.lastTick=now;
    },

    move(p,all,now,dt){
      let target=null,best=Infinity;
      all.forEach(o=>{if(o.id===p.id)return;const d=Math.hypot(o.x-p.x,o.y-p.y);if(d<best){best=d;target=o;}});
      if(!target)return;
      if(best>12){
        p.x=Math.max(5,Math.min(95,p.x+(target.x-p.x)/best*this.settings.moveSpeed*dt));
        p.y=Math.max(7,Math.min(93,p.y+(target.y-p.y)/best*this.settings.moveSpeed*dt));
      }else if(now>=p.attackAt){
        p.attackAt=now+this.settings.attackCooldownMs;
        this.pulse(p,'attack',260);
        const boosted=p.boostUntil>now;
        this.damage(p,target,Math.round(this.settings.baseDamage*(boosted?1.65:1)));
      }
      this.drawPlayer(p);
    },

    damage(a,t,n){
      const absorb=Math.min(t.shield,n);
      t.shield-=absorb;
      const hpLoss=n-absorb;
      t.hp=Math.max(0,t.hp-hpLoss);
      this.pulse(t,'hit',220);
      if(absorb>0)this.float(t,'🛡 -'+absorb,'shield',20);
      if(hpLoss>0)this.float(t,'-'+hpLoss,'dmg');
      if(t.hp<=0&&t.status==='alive'){
        t.status='eliminated';a.kills++;
        if(t.el)t.el.classList.add('out');
        this.addFeed('KNOCKOUT',a.name+' คัดออก '+t.name);
        this.later(()=>{if(t.el)t.el.remove();t.el=null;t.dom=null;},500);
        this.promote();
      }
      this.drawPlayer(t);
    },

    float(p,msg,kind,dy){
      if(!this.refs||!p)return;
      const fx=this.refs.fx;
      while(fx.childElementCount>36)fx.removeChild(fx.firstChild);
      const el=document.createElement('span');
      el.className='sa-float'+(kind?' '+kind:'');
      el.textContent=msg;
      el.style.left=p.x+'%';
      el.style.top='calc('+p.y+'% - '+(dy||0)+'px)';
      fx.appendChild(el);
      this.later(()=>el.remove(),1000);
    },

    countdown(){
      if(this.phase==='countdown'||this.phase==='running'||this.phase==='result')return;
      this.phase='countdown';
      this.phaseEnds=Date.now()+this.settings.countdownSeconds*1000;
      this.setBanner('GET READY','การแข่งขันจะเริ่มใน '+this.settings.countdownSeconds+' วินาที');
    },

    startRound(){
      this.phase='running';this.round++;
      this.participants=this.alive().length;
      this.roundEnds=Date.now()+this.settings.roundSeconds*1000;
      this.bannerUntil=Date.now()+1600;
      this.setBanner('FIGHT!','เหลือรอดเป็นคนสุดท้ายเพื่อคว้าชัย');
    },

    finish(winner){
      if(this.phase!=='running')return;
      this.phase='result';
      this.phaseEnds=Date.now()+this.settings.resultSeconds*1000;
      this.setBanner(winner?'🏆 '+winner.name+' WINS!':'DRAW','รอบถัดไปใน '+this.settings.resultSeconds+' วินาที');
      this.addFeed('RESULT',winner?winner.name+' เป็นผู้ชนะ':'การแข่งขันจบแบบเสมอ');
    },

    nextRound(){
      this.phase='waiting';this.queue=[];
      this.players.forEach(p=>{
        p.status='queued';p.hp=this.settings.maxHp;p.shield=0;p.cheer=0;p.boostUntil=0;
        if(p.el)p.el.remove();
        p.el=null;p.dom=null;
        this.queue.push(p.id);
      });
      this.hudDirty=true;
      this.promote();
      this.setBanner('NEXT ROUND','ผู้เล่นเดิมลงสนามต่อได้ · ชวนเพื่อนพิมพ์ “สู้”');
      if(this.alive().length>=2)this.countdown();
    },

    setBanner(a,b){
      if(!this.refs)return;
      this.refs.bannerTitle.textContent=a;
      this.refs.bannerSub.textContent=b;
      this.refs.banner.style.display='block';
    },

    addFeed(type,message){
      this.feed.unshift({type,message});
      this.feed.length=Math.min(this.feed.length,4);
      this.hudDirty=true;
    },

    renderHud(){
      if(!this.refs)return;
      const now=Date.now();
      const n=this.alive().length;
      this.refs.state.textContent={waiting:'WAITING FOR PLAYERS',countdown:'MATCH STARTING',running:'LIVE MATCH',result:'ROUND FINISHED'}[this.phase]||'WAITING';
      this.refs.round.textContent=String(this.round).padStart(2,'0');
      this.refs.alive.textContent=n;
      let s=this.settings.roundSeconds;
      if(this.phase==='countdown'||this.phase==='result')s=Math.max(0,Math.ceil((this.phaseEnds-now)/1000));
      else if(this.phase==='running')s=Math.max(0,Math.ceil((this.roundEnds-now)/1000));
      this.refs.time.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
      if(this.hudDirty){
        this.hudDirty=false;
        this.refs.queue.innerHTML='';
        this.queue.slice(0,6).forEach(id=>{
          const p=this.players.get(id);
          if(p&&p.status==='queued'){
            const x=document.createElement('span');
            x.className='sa-chip';x.textContent=p.name;
            this.refs.queue.appendChild(x);
          }
        });
        this.refs.feed.innerHTML='';
        this.feed.slice(0,3).forEach(f=>{
          const x=document.createElement('span');
          x.className='sa-feedline';x.textContent=f.type+' · '+f.message;
          this.refs.feed.appendChild(x);
        });
      }
      this.refs.banner.style.display=(this.phase!=='running'||now<this.bannerUntil)?'block':'none';
    }
  };
})();