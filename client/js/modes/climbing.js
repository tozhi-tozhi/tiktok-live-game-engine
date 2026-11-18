const ClimbingGame = {
  mapping: null,
  progress: {},
  activeUser: null,

  async init(container) {
    this.progress = {};
    this.activeUser = null;

    container.innerHTML = `
      <div class="climb-wrap">
        <div class="climber-lane">
          <div class="lane-label">🧗 Climber</div>
          <div id="climber" class="climber">🧗</div>
        </div>
      </div>
      <div class="climb-goal" style="position:absolute; right:60px; top:60px; font-size:40px;">🏁</div>
    `;

    try {
      const res = await fetch('gift-mapping.json');
      const all = await res.json();
      this.mapping = all.climbing;
    } catch {
      this.mapping = { default: { climb: 1 } };
    }
  },

  handleGift(data) {
    const rule = this.mapping?.[data.giftName] || this.mapping?.default || { climb: 1 };
    this.climb(data.userId, rule.climb);
  },

  climb(userId, amount) {
    if (!userId) userId = 'tester';
    this.activeUser = userId;

    // Reset if different user starts climbing high (simple 1-lane logic)
    this.progress[userId] = Math.min(100, (this.progress[userId] || 0) + amount);

    const climber = document.getElementById('climber');
    const label = document.querySelector('.lane-label');
    if (!climber) return;

    climber.style.bottom = `${this.progress[userId]}%`;
    if (label) label.textContent = `🧗 ${userId} — ${this.progress[userId]}%`;

    if (this.progress[userId] >= 100) {
      this.reachTop(userId);
    }
  },

  reachTop(userId) {
    const banner = document.createElement('div');
    banner.className = 'winner-banner';
    banner.textContent = `🏁 ${userId} ถึงยอด!`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 3000);

    setTimeout(() => {
      this.progress[userId] = 0;
      const climber = document.getElementById('climber');
      if (climber) climber.style.bottom = '0%';
    }, 3200);
  }
};