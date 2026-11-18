const BoxingGame = {
  mapping: null,
  hp: { left: 100, right: 100 },
  maxHp: 100,
  battleOver: false,

  async init(container) {
    this.hp = { left: this.maxHp, right: this.maxHp };
    this.battleOver = false;

    container.innerHTML = `
      <div class="hp-wrap">
        <div class="hp-box">
          <div class="hp-name">🤖 Robot</div>
          <div class="hp-bar"><div class="hp-fill" id="hpLeft"></div></div>
        </div>
        <div class="hp-box">
          <div class="hp-name">🦖 Dino</div>
          <div class="hp-bar"><div class="hp-fill" id="hpRight"></div></div>
        </div>
      </div>
      <div id="boxer1" class="fighter left">🥊🤖</div>
      <div class="vs-text">VS</div>
      <div id="boxer2" class="fighter right">🦖🔥</div>
    `;

    try {
      const res = await fetch('gift-mapping.json');
      const all = await res.json();
      this.mapping = all.boxing;
    } catch {
      this.mapping = { default: { damage: 5, effect: 'punch' } };
    }
  },

  handleGift(data) {
    if (this.battleOver) return;
    const rule = this.mapping?.[data.giftName] || this.mapping?.default || { damage: 5 };
    this.attack(rule.damage, data.giftName, data.userId);
  },

  attack(damage, giftName, userId) {
    if (this.battleOver) return;

    const attacker = document.getElementById('boxer1');
    const target = document.getElementById('boxer2');
    if (!attacker || !target) return;

    // 1. attacker lunges forward
    attacker.classList.add('attack');
    setTimeout(() => attacker.classList.remove('attack'), 300);

    // 2. after 120ms, target takes damage
    setTimeout(() => {
      target.classList.add('hit');
      setTimeout(() => target.classList.remove('hit'), 400);

      // 3. reduce HP
      this.hp.right = Math.max(0, this.hp.right - damage);
      const hpEl = document.getElementById('hpRight');
      if (hpEl) hpEl.style.width = `${(this.hp.right / this.maxHp) * 100}%`;

      // 4. floating damage number
      this.spawnDamage(damage, target);

      // 5. KO check
      if (this.hp.right <= 0) {
        this.battleOver = true;
        target.classList.add('ko');
        this.showWinner('🤖 Robot');
        setTimeout(() => this.reset(), 4000);
      }
    }, 120);
  },

  spawnDamage(dmg, target) {
    const rect = target.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'dmg-float';
    el.textContent = `-${dmg}`;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  },

  showWinner(name) {
    const banner = document.createElement('div');
    banner.className = 'winner-banner';
    banner.textContent = `🏆 ${name} WINS!`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3900);
  },

  reset() {
    this.hp = { left: this.maxHp, right: this.maxHp };
    this.battleOver = false;
    const hpLeft = document.getElementById('hpLeft');
    const hpRight = document.getElementById('hpRight');
    const b1 = document.getElementById('boxer1');
    const b2 = document.getElementById('boxer2');
    if (hpLeft) hpLeft.style.width = '100%';
    if (hpRight) hpRight.style.width = '100%';
    if (b1) b1.classList.remove('ko');
    if (b2) b2.classList.remove('ko');
  }
};