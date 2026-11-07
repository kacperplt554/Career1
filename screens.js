// Ekrany: menu, pulpit, profil, historia, system. Każdy działa na FL.state i ma realne skutki.
(function () {
  const h = FL.h, P = FL.player;
  const flag = c => (FL.data.countries.find(x => x.code === c) || {}).flag || '';
  const country = c => (FL.data.countries.find(x => x.code === c) || {}).name || c;
  const stats = a => P.ATTRS.map(([k, n]) => h('div', { class: 'stat' }, n, h('div', { class: 'bar' }, h('i', { style: `width:${a[k]}%` })), a[k]));
  const kv = (k, v) => h('div', { class: 'kv' }, h('small', {}, k), v);
  const foot = f => (P.FEET.find(x => x[0] === f) || [])[1];

  FL.router.register('menu', { title: 'Menu', render(root) {
    const s = FL.state.data;
    root.append(h('div', { class: 'card hero' }, h('h1', {}, '⚽ FOOTBALL LIFE'), h('p', { class: 'muted' }, 'Symulator kariery zawodowego piłkarza')));
    if (s) root.append(h('div', { class: 'card' }, h('h3', {}, 'Zapisana kariera'),
      h('div', { class: 'pcard' }, h('div', { class: 'ovr' }, s.player.overall), h('div', {}, h('b', {}, `${s.player.firstName} ${s.player.lastName}`),
        h('div', { class: 'muted' }, `${s.player.position} • ${s.career.age} lat • sezon ${s.career.season}`))),
      h('button', { class: 'btn', onclick: () => FL.router.go('dashboard') }, 'Kontynuuj karierę')));
    root.append(h('button', { class: 'btn' + (s ? ' sec' : ''), onclick: () => {
      if (s && !confirm('Nowa kariera nadpisze obecny zapis. Kontynuować?')) return;
      FL.router.go('creator'); } }, 'Nowa kariera'));
  } });

  FL.router.register('dashboard', { title: 'Pulpit', icon: '🏠', nav: true, render(root) {
    const { player: p, career: c } = FL.state.data;
    root.append(h('h2', {}, 'Pulpit'),
      h('div', { class: 'card pcard' }, h('div', { class: 'ovr' }, p.overall), h('div', {}, h('b', {}, `${flag(p.nationality)} ${p.firstName} ${p.lastName}`),
        h('div', { class: 'muted' }, `${p.position} • ${c.age} lat`))),
      h('div', { class: 'grid2' }, kv('Sezon', c.season), kv('Tydzień', c.week), kv('Klub', c.club || 'Wolny zawodnik'), kv('Forma / morale', `${p.fitness}% / ${p.morale}%`)),
      h('div', { class: 'card', style: 'margin-top:14px' }, h('h3', {}, 'Atrybuty'), stats(p.attrs)));
  } });

  FL.router.register('profile', { title: 'Profil', icon: '👤', nav: true, render(root) {
    const p = FL.state.data.player, st = P.STYLES.find(s => s.id === p.style);
    root.append(h('h2', {}, 'Profil zawodnika'),
      h('div', { class: 'grid2' }, kv('Imię i nazwisko', `${p.firstName} ${p.lastName}`), kv('Narodowość', `${flag(p.nationality)} ${country(p.nationality)}`),
        kv('Wiek', FL.state.data.career.age), kv('Pozycja', `${p.position} – ${P.pos(p.position).name}`),
        kv('Wzrost / waga', `${p.height} cm / ${p.weight} kg`), kv('Noga', foot(p.foot)),
        kv('Słaba noga', '★'.repeat(p.weakFoot) + '☆'.repeat(5 - p.weakFoot)), kv('Styl gry', st ? st.name : p.style)),
      h('div', { class: 'card', style: 'margin-top:14px' }, h('h3', {}, 'Atrybuty'), stats(p.attrs)));
  } });

  FL.router.register('history', { title: 'Historia', icon: '📜', nav: true, render(root) {
    const list = FL.state.data.history.slice().reverse();
    root.append(h('h2', {}, 'Historia kariery'), h('div', { class: 'card' },
      list.map(e => h('div', { class: 'hist' }, h('small', { class: 'muted' }, `${e.season} • ${new Date(e.t).toLocaleDateString('pl-PL')}`), h('div', {}, e.text)))));
  } });

  FL.router.register('system', { title: 'System', icon: '⚙️', nav: true, render(root) {
    root.append(h('h2', {}, 'System'), h('div', { class: 'card' },
      h('p', { class: 'muted' }, 'Kariera zapisuje się automatycznie po każdej zmianie.'),
      h('button', { class: 'btn', onclick: () => FL.state.saveNow().then(() => FL.toast('Zapisano')) }, 'Zapisz teraz'),
      h('button', { class: 'btn sec', onclick: () => {
        const blob = new Blob([JSON.stringify(FL.state.data, null, 2)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'football-life-save.json' });
        a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      } }, 'Eksportuj zapis (JSON)'),
      h('button', { class: 'btn sec', onclick: () => FL.router.go('menu') }, 'Menu główne'),
      h('button', { class: 'btn danger', onclick: () => {
        if (!confirm('Trwale usunąć karierę?')) return;
        FL.state.remove().then(() => { FL.toast('Kariera usunięta'); FL.router.go('menu'); });
      } }, 'Usuń karierę')));
  } });
})();
