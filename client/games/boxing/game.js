GameRegistry.boxing = {
  mapping: {},
  maxHp: 100,
  hp: { left: 100, right: 100 },
  battleOver: false,
  teams: {},          // userId -> 'left' | 'right'
  nextTeam: 'left',
  timers: [],
  names: { left: '🤖 Robot', right: '🦖 Dino' },

  init(container, manifest) {
    this.mapping = manifest.gifts || {};
    this.maxHp = manifest.maxHp || 100;
    this.teams = {};
    this.nextTeam = 'left';
    this.timers = [];
    this.battleOver = false;
    this.hp = { left: this.maxHp, right: this.maxHp };

    container.innerHTML = `
      <div class="hp-wrap">
        <div class="hp-box">
          <div class="hp-name">${this.names.left} (พิมพ์ 1)</div>
          <div class="hp-bar"><div class="hp-fill" id="hp-left"></div></div>
        </div>
        <div class="hp-box">
          <div class="hp-name">${this.names.right} (พิมพ์ 2)</div>
          <div class="hp-bar"><div class="hp-fill" id="hp-right"></div></div>
        </div>
      </div>
      <div id="boxer-left" class="fighter left">🥊🤖</div>
      <div class="vs-text">VS</div>
      <div id="boxer-right" class="fighter right">🦖🔥</div>
    `;
  },

  destroy() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  },

  onEvent(evt) {
    if (evt.type === 'chat') this.handleChat(evt);
    else if (evt.type === 'gift') this.handleGift(evt);
  },

  // ---- ทีม ----
  teamOf(userId) {
    if (!this.teams[userId]) {            // ยังไม่เลือกทีม → จัดให้สลับกันอัตโนมัติ
      this.teams[userId] = this.nextTeam;
      this.nextTeam = this.nextTeam === 'left' ? 'right' : 'left';
    }
    return this.teams[userId];
  },

  handleChat(evt) {
    const t = String(evt.comment || '').trim().toLowerCase();
    if (t === '1' || t === 'robot') this.teams[evt.userId] = 'left';
    else if (t === '2' || t === 'dino') this.teams[evt.userId] = 'right';
  },

  handleGift(evt) {
    if (this.battleOver) return;
    const rule = this.mapping[evt.giftName] || this.mapping.default || { damage: 5 };
    const damage = rule.damage * Math.max(1, evt.count || 1);
    this.attack(this.teamOf(evt.userId), damage);
  },

  // ---- ต่อสู้ ----
  attack(side, damage) {
    if (this.battleOver) return;
    const other = side === 'left' ? 'right' : 'left';
    const attacker = document.getElementById(`boxer-${side}`);
    const target = document.getElementById(`boxer-${other}`);
    if (!attacker || !target) return;

    this.play(attacker, 'attack', 300);

    this.later(() => {
      if (this.battleOver) return;
      this.play(target, 'hit', 400);

      this.hp[other] = Math.max(0, this.hp[other] - damage);
      const bar = document.getElementById(`hp-${other}`);
      if (bar) bar.style.width = `${(this.hp[other] / this.maxHp) * 100}%`;
      this.spawnDamage(damage, target);

      if (this.hp[other] <= 0) {
        this.battleOver = true;
        target.classList.add('ko');
        this.showWinner(side);
        this.later(() => this.resetRound(), 4000);
      }
    }, 120);
  },

  // เล่นแอนิเมชันซ้ำได้แม้เล่นอยู่ (ของขวัญรัว ๆ ไม่ค้าง)
  play(el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    this.later(() => el.classList.remove(cls), ms);
  },

  later(fn, ms) {
    const t = setTimeout(() => {
      this.timers = this.timers.filter(x => x !== t);
      fn();
    }, ms);
    this.timers.push(t);
  },

  spawnDamage(dmg, target) {
    const rect = target.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'dmg-float';
    el.textContent = `-${dmg}`;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top}px`;
    document.body.appendChild(el);
    this.later(() => el.remove(), 1200);
  },

  showWinner(side) {
    const banner = document.createElement('div');
    banner.className = 'winner-banner';
    banner.textContent = `🏆 ${this.names[side]} WINS!`;
    document.body.appendChild(banner);
    this.later(() => banner.remove(), 3900);
  },

  resetRound() {
    this.hp = { left: this.maxHp, right: this.maxHp };
    this.battleOver = false;
    ['left', 'right'].forEach(s => {
      const bar = document.getElementById(`hp-${s}`);
      const boxer = document.getElementById(`boxer-${s}`);
      if (bar) bar.style.width = '100%';
      if (boxer) boxer.classList.remove('ko');
    });
  }
};