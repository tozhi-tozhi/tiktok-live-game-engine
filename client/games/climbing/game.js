GameRegistry.climbing = {
  mapping: {},
  maxLanes: 5,
  lanes: {},          // userId -> { progress, el, climber, label }
  finished: false,
  timers: [],

  init(container, manifest) {
    this.mapping = manifest.gifts || {};
    this.maxLanes = manifest.maxLanes || 5;
    this.lanes = {};
    this.finished = false;
    this.timers = [];
    container.innerHTML = '<div class="climb-wrap" id="climbWrap"></div>';
    this.wrap = container.querySelector('#climbWrap');
  },

  destroy() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  },

  onEvent(evt) {
    if (evt.type !== 'gift' || this.finished) return;
    const rule = this.mapping[evt.giftName] || this.mapping.default || { climb: 2 };
    this.climb(evt.userId, evt.name || evt.userId, rule.climb * Math.max(1, evt.count || 1));
  },

  ensureLane(userId, name) {
    if (this.lanes[userId]) return this.lanes[userId];

    // เลนเต็ม → แทนที่เลนที่ปีนได้น้อยที่สุด (ของขวัญไม่หายเงียบ)
    const ids = Object.keys(this.lanes);
    if (ids.length >= this.maxLanes) {
      const lowest = ids.reduce((a, b) => this.lanes[a].progress <= this.lanes[b].progress ? a : b);
      this.lanes[lowest].el.remove();
      delete this.lanes[lowest];
    }

    const el = document.createElement('div');
    el.className = 'climber-lane';
    el.innerHTML = `
      <div class="lane-label"></div>
      <div style="position:absolute; top:30px; left:50%; transform:translateX(-50%); font-size:28px;">🏁</div>
      <div class="climber">🧗</div>`;
    this.wrap.appendChild(el);

    const lane = { progress: 0, el, climber: el.querySelector('.climber'), label: el.querySelector('.lane-label') };
    lane.label.textContent = `🧗 ${name}`;
    this.lanes[userId] = lane;
    return lane;
  },

  climb(userId, name, amount) {
    const lane = this.ensureLane(userId, name);
    lane.progress = Math.min(100, lane.progress + amount);
    lane.climber.style.bottom = `${lane.progress * 0.8}%`; // เหลือที่ให้ธงด้านบน
    lane.label.textContent = `🧗 ${name} — ${lane.progress}%`;
    if (lane.progress >= 100) this.reachTop(name);
  },

  reachTop(name) {
    this.finished = true;
    const banner = document.createElement('div');
    banner.className = 'winner-banner';
    banner.textContent = `🏁 ${name} ถึงยอด!`;
    document.body.appendChild(banner);

    const t = setTimeout(() => {
      banner.remove();
      this.lanes = {};
      this.wrap.innerHTML = '';
      this.finished = false;
    }, 3200);
    this.timers.push(t);
  }
};