// System zawodnika: pozycje, style gry, generowanie atrybutów, walidacja. Bez dostępu do DOM.
FL.player = (function () {
  const ATTRS = [['pace','Szybkość'],['shooting','Strzał'],['passing','Podania'],['dribbling','Drybling'],['defending','Obrona'],['physical','Fizyczność']];
  const POSITIONS = [
    { id:'GK', name:'Bramkarz', group:'GK', base:[38,18,38,30,56,50] },
    { id:'CB', name:'Środkowy obrońca', group:'DEF', base:[42,28,38,32,56,54] },
    { id:'LB', name:'Lewy obrońca', group:'DEF', base:[52,30,42,40,52,48] },
    { id:'RB', name:'Prawy obrońca', group:'DEF', base:[52,30,42,40,52,48] },
    { id:'CDM', name:'Pomocnik defensywny', group:'MID', base:[44,36,50,42,52,52] },
    { id:'CM', name:'Środkowy pomocnik', group:'MID', base:[46,40,52,46,42,46] },
    { id:'CAM', name:'Ofensywny pomocnik', group:'MID', base:[46,46,54,52,30,40] },
    { id:'LW', name:'Lewy skrzydłowy', group:'ATT', base:[56,42,46,54,28,38] },
    { id:'RW', name:'Prawy skrzydłowy', group:'ATT', base:[56,42,46,54,28,38] },
    { id:'ST', name:'Napastnik', group:'ATT', base:[50,54,40,46,24,48] }
  ];
  const ALL = ['DEF','MID','ATT'];
  const STYLES = [
    { id:'speed', name:'Szybkościowiec', groups:ALL, mod:{pace:7,dribbling:3} },
    { id:'tech', name:'Technik', groups:['MID','ATT'], mod:{dribbling:6,passing:4} },
    { id:'playmaker', name:'Rozgrywający', groups:ALL, mod:{passing:8,dribbling:2} },
    { id:'sniper', name:'Snajper', groups:['MID','ATT'], mod:{shooting:8,pace:2} },
    { id:'tank', name:'Twardziel', groups:['DEF','MID'], mod:{defending:6,physical:6} },
    { id:'leader', name:'Lider boiska', groups:ALL, mod:{passing:3,defending:3,physical:3} },
    { id:'allround', name:'Wszechstronny', groups:ALL, mod:{pace:2,shooting:2,passing:2,dribbling:2,defending:2,physical:2} },
    { id:'reflex', name:'Refleksowy bramkarz', groups:['GK'], mod:{defending:8,physical:2} },
    { id:'sweeper', name:'Bramkarz grający nogami', groups:['GK'], mod:{passing:8,defending:4} }
  ];
  const FEET = [['R','Prawa'],['L','Lewa'],['B','Obie']];
  const WEIGHTS = { GK:[.05,0,.15,0,.65,.15], DEF:[.15,.03,.12,.07,.43,.2], MID:[.1,.15,.35,.25,.05,.1], ATT:[.2,.4,.12,.2,0,.08] };
  const LIMITS = { age:[16,19], height:[160,205], weight:[50,100] };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pos = id => POSITIONS.find(p => p.id === id);

  function stylesFor(posId) { const g = pos(posId).group; return STYLES.filter(s => s.groups.includes(g)); }

  // Deterministyczne atrybuty wyliczane z profilu (ten sam wynik w podglądzie i w zapisie)
  function computeAttrs(p) {
    const P = pos(p.position), st = STYLES.find(s => s.id === p.style), dh = p.height - 180, dw = p.weight - 72;
    const body = { pace: -dh * .3 - dw * .15, physical: dw * .35 + dh * .2, dribbling: -dh * .15 };
    const attrs = {};
    ATTRS.forEach(([k], i) => {
      attrs[k] = Math.round(clamp(P.base[i] + ((st && st.mod[k]) || 0) + (p.age - 16) * 2.5 + (body[k] || 0), 15, 99));
    });
    return attrs;
  }
  function overall(attrs, posId) {
    const w = WEIGHTS[pos(posId).group];
    return Math.round(ATTRS.reduce((s, [k], i) => s + attrs[k] * w[i], 0));
  }
  function validate(p) {
    const e = {}, nameRe = /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż'’ -]{2,20}$/;
    if (!nameRe.test((p.firstName || '').trim())) e.firstName = 'Imię: 2–20 liter';
    if (!nameRe.test((p.lastName || '').trim())) e.lastName = 'Nazwisko: 2–20 liter';
    if (!FL.data.countries.some(c => c.code === p.nationality)) e.nationality = 'Wybierz narodowość';
    for (const [k, [a, b]] of Object.entries(LIMITS)) if (!(p[k] >= a && p[k] <= b)) e[k] = `Zakres: ${a}–${b}`;
    if (!pos(p.position)) e.position = 'Wybierz pozycję';
    if (!FEET.some(f => f[0] === p.foot)) e.foot = 'Wybierz nogę';
    if (!stylesFor(p.position).some(s => s.id === p.style)) e.style = 'Wybierz styl pasujący do pozycji';
    return e;
  }
  function build(p) {
    const attrs = computeAttrs(p), ovr = overall(attrs, p.position);
    return {
      id: 'p' + Date.now().toString(36), firstName: p.firstName.trim(), lastName: p.lastName.trim(),
      nationality: p.nationality, age: p.age, height: p.height, weight: p.weight,
      position: p.position, foot: p.foot, style: p.style, weakFoot: p.foot === 'B' ? 4 : 2,
      attrs, overall: ovr,
      potential: Math.min(99, ovr + 20 + Math.floor(Math.random() * 15)), // ukryte w UI
      fitness: 100, morale: 70
    };
  }
  return { ATTRS, POSITIONS, STYLES, FEET, LIMITS, pos, stylesFor, computeAttrs, overall, validate, build };
})();
