// Nawigacja: każdy ekran rejestruje się przez FL.router.register. Dolny pasek pokazuje tylko ekrany z nav:true.
FL.router = {
  routes: {}, order: [], current: null,
  register(name, def) { this.routes[name] = def; if (def.nav) this.order.push(name); },
  go(name) {
    const r = this.routes[name];
    if (!r) return FL.toast('Nieznany ekran: ' + name, true);
    this.current = name;
    const screen = document.getElementById('screen');
    screen.replaceChildren();
    try { r.render(screen); } catch (e) { console.error(e); screen.append(FL.h('div', { class: 'card' }, 'Błąd ekranu: ' + e.message)); }
    screen.scrollTop = 0;
    this.renderNav(!!r.nav);
  },
  renderNav(show) {
    const nav = document.getElementById('nav');
    nav.hidden = !show;
    nav.replaceChildren(...this.order.map(n => FL.h('button', { class: n === this.current ? 'on' : '', onclick: () => this.go(n) },
      FL.h('span', { class: 'ic' }, this.routes[n].icon), this.routes[n].title)));
  },
  refresh() { if (this.current) this.go(this.current); }
};
