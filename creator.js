// Kreator zawodnika: formularz + podgląd na żywo. Zatwierdzenie tworzy karierę w FL.state.
FL.router.register('creator', { title: 'Kreator', render(root) {
  const h = FL.h, P = FL.player, L = P.LIMITS;
  const d = { firstName:'', lastName:'', nationality:'PL', age:16, height:178, weight:68, position:'CM', foot:'R', style:'playmaker' };
  const preview = h('div', { class: 'card' });
  const errEls = {};
  const err = k => (errEls[k] = h('div', { class: 'err' }));

  function fixStyle() { if (!P.stylesFor(d.position).some(s => s.id === d.style)) d.style = P.stylesFor(d.position)[0].id; }
  function drawPreview() {
    const ok = !P.validate({ ...d, firstName: 'xx', lastName: 'xx' }).height && !P.validate({ ...d, firstName: 'xx', lastName: 'xx' }).weight && !P.validate({ ...d, firstName: 'xx', lastName: 'xx' }).age;
    if (!ok) return;
    const a = P.computeAttrs(d);
    preview.replaceChildren(h('h3', {}, 'Podgląd zawodnika'),
      h('div', { class: 'pcard' }, h('div', { class: 'ovr' }, P.overall(a, d.position)),
        h('div', {}, h('b', {}, `${d.firstName || 'Imię'} ${d.lastName || 'Nazwisko'}`), h('div', { class: 'muted' }, `${d.position} • ${d.age} lat`))),
      ...P.ATTRS.map(([k, n]) => h('div', { class: 'stat' }, n, h('div', { class: 'bar' }, h('i', { style: `width:${a[k]}%` })), a[k])));
  }
  function text(k, label) { return h('div', {}, h('label', {}, label), h('input', { maxlength: 20, value: d[k], oninput: e => { d[k] = e.target.value; drawPreview(); } }), err(k)); }
  function num(k, label) { return h('div', {}, h('label', {}, `${label} (${L[k][0]}–${L[k][1]})`),
    h('input', { type: 'number', inputmode: 'numeric', min: L[k][0], max: L[k][1], value: d[k], oninput: e => { d[k] = parseInt(e.target.value, 10); drawPreview(); } }), err(k)); }
  function select(k, label, opts, onchange) {
    const s = h('select', { onchange: e => { d[k] = e.target.value; onchange && onchange(); drawPreview(); } },
      opts.map(([v, n]) => h('option', { value: v, selected: v === d[k] }, n)));
    return h('div', {}, h('label', {}, label), s, err(k));
  }
  const styleBox = h('div');
  function drawStyle() { fixStyle(); styleBox.replaceChildren(select('style', 'Styl gry', P.stylesFor(d.position).map(s => [s.id, s.name]))); }
  const footBox = h('div', { class: 'seg' }, P.FEET.map(([v, n]) => h('button', { type: 'button', class: v === d.foot ? 'on' : '', onclick: e => {
    d.foot = v; footBox.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.currentTarget)); } }, n)));

  function submit() {
    fixStyle();
    const errors = P.validate(d);
    Object.entries(errEls).forEach(([k, el]) => el.textContent = errors[k] || '');
    if (Object.keys(errors).length) return FL.toast('Popraw zaznaczone pola', true);
    FL.state.newCareer(P.build(d)).then(() => FL.router.go('dashboard'));
  }
  drawStyle(); drawPreview();
  root.append(h('h2', {}, 'Stwórz zawodnika'),
    h('div', { class: 'card' },
      h('div', { class: 'row' }, text('firstName', 'Imię'), text('lastName', 'Nazwisko')),
      select('nationality', 'Narodowość', FL.data.countries.map(c => [c.code, `${c.flag} ${c.name}`])),
      h('div', { class: 'row' }, num('age', 'Wiek'), num('height', 'Wzrost cm')), num('weight', 'Waga kg'),
      select('position', 'Pozycja', P.POSITIONS.map(p => [p.id, `${p.id} – ${p.name}`]), drawStyle),
      h('label', {}, 'Dominująca noga'), footBox, err('foot'), styleBox),
    preview,
    h('button', { class: 'btn', onclick: submit }, 'Rozpocznij karierę'),
    h('button', { class: 'btn sec', onclick: () => FL.router.go('menu') }, 'Wróć'));
} });
