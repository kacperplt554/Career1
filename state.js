// Stan aplikacji: jedno źródło prawdy + autozapis. Kolejne systemy dopisują własne gałęzie do state.career.
FL.state = {
  SLOT: 'career-1', VERSION: 1, data: null, subs: [], timer: null,
  subscribe(fn) { this.subs.push(fn); },
  emit() { this.subs.forEach(fn => { try { fn(this.data); } catch (e) { console.error(e); } }); },
  has() { return !!this.data; },
  // Jedyny sposób zmiany stanu: update(s => { s.xxx = ... }) – wywołuje autozapis i odświeżenie UI
  update(fn) {
    fn(this.data);
    this.data.meta.updated = Date.now();
    this.emit(); this.queueSave();
  },
  newCareer(player) {
    this.data = {
      version: this.VERSION,
      meta: { created: Date.now(), updated: Date.now() },
      player,
      career: { age: player.age, season: '2026/27', week: 1, club: null },
      history: [{ t: Date.now(), season: '2026/27', text: `Początek kariery: ${player.firstName} ${player.lastName}, ${player.age} lat.` }]
    };
    return this.saveNow();
  },
  queueSave() { clearTimeout(this.timer); this.timer = setTimeout(() => this.saveNow(), 400); this.mark('zapisywanie…'); },
  saveNow() {
    clearTimeout(this.timer);
    if (!this.data) return Promise.resolve();
    return FL.storage.put(this.SLOT, JSON.parse(JSON.stringify(this.data)))
      .then(() => this.mark('zapisano ✓'))
      .catch(e => { this.mark('błąd zapisu'); FL.toast('Nie udało się zapisać: ' + e.message, true); });
  },
  load() {
    return FL.storage.get(this.SLOT).then(d => { this.data = d && d.player ? this.migrate(d) : null; return this.data; })
      .catch(e => { FL.toast('Błąd wczytywania: ' + e.message, true); return null; });
  },
  migrate(d) { return d; }, // miejsce na migracje wersji zapisu
  remove() { this.data = null; return FL.storage.del(this.SLOT); },
  mark(t) { const el = document.getElementById('saveState'); if (el) el.textContent = t; }
};
window.addEventListener('pagehide', () => FL.state.has() && FL.state.saveNow());
document.addEventListener('visibilitychange', () => document.hidden && FL.state.has() && FL.state.saveNow());
