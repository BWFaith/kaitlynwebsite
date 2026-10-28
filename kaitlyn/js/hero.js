/* Cinematic 3D hero: a luxury mansion estate (domed chateau with towers, gardens, fountain and gates)
   is built from foundation to finished, then the loop restarts.
   Mouse: steers camera + a light on the house. Drag (mouse or touch): orbit. */
(() => {
  const hero = document.querySelector('.hero'), cv = document.getElementById('scene');
  if (!window.THREE || !cv) return;
  const T = THREE, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches, small = innerWidth < 800;
  let R; try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return; }
  R.setPixelRatio(Math.min(devicePixelRatio, 2));
  R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.12;

  const fogc = 0x1b2036, S = new T.Scene();
  S.background = new T.Color(fogc); S.fog = new T.FogExp2(fogc, .011);
  const C = new T.PerspectiveCamera(40, 1, .1, 500);

  // Twilight sky dome (warm horizon to deep blue), moon and stars
  const skg = new T.SphereGeometry(300, 32, 16), sp = skg.attributes.position, cols = [];
  const ch = new T.Color(0xb9764f), cm = new T.Color(0x3a3558), ct = new T.Color(0x070b18), tmp = new T.Color();
  for (let i = 0; i < sp.count; i++) {
    const y = Math.max(0, sp.getY(i) / 300);
    tmp.copy(y < .18 ? ch.clone().lerp(cm, y / .18) : cm.clone().lerp(ct, Math.min(1, (y - .18) / .4))); cols.push(tmp.r, tmp.g, tmp.b);
  }
  skg.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
  S.add(new T.Mesh(skg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false })));
  const moon = new T.Mesh(new T.SphereGeometry(8, 24, 24), new T.MeshBasicMaterial({ color: 0xfff0d2, fog: false })); moon.position.set(-90, 70, -170); S.add(moon);
  const star = new Float32Array(900);
  for (let i = 0; i < 300; i++) { const a = Math.random() * 6.28, e = Math.random() * 1.1 + .2; star[i * 3] = Math.cos(a) * Math.cos(e) * 270; star[i * 3 + 1] = Math.sin(e) * 270; star[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 270; }
  const stg = new T.BufferGeometry(); stg.setAttribute('position', new T.BufferAttribute(star, 3));
  S.add(new T.Points(stg, new T.PointsMaterial({ color: 0xffffff, size: 1.6, fog: false, transparent: true, opacity: .85 })));

  S.add(new T.HemisphereLight(0x8196d0, 0x1a1a14, .7));
  const sun = new T.DirectionalLight(0xffcf94, 2.3); sun.position.set(-26, 30, 24); sun.castShadow = true; sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 130 }); S.add(sun);
  const rim = new T.DirectionalLight(0x5f7dff, .7); rim.position.set(24, 10, -26); S.add(rim);
  const cl = new T.PointLight(0xffe0b0, 0, 24); S.add(cl);                       // light that follows the cursor
  const ups = [-8, 0, 8].map(x => { const l = new T.PointLight(0xffc27a, 0, 20); l.position.set(x, 1.5, 11); S.add(l); return l; });

  const M = o => new T.MeshStandardMaterial(o);
  const mWall = M({ color: 0xece4d4, roughness: .85 }), mStone = M({ color: 0xd2c9b6, roughness: .8 }), mGold = M({ color: 0xc9a96b, metalness: .85, roughness: .3 });
  const mWhite = M({ color: 0xf6f3ec, roughness: .55 }), mRoof = M({ color: 0x2a3140, roughness: .65 }), mBrick = M({ color: 0x8a4b3a, roughness: .9 });
  const mDoor = M({ color: 0x3b2417, roughness: .5 }), mGrass = M({ color: 0x1b3a26, roughness: 1 }), mLawn = M({ color: 0x2a5636, roughness: 1 });
  const mLeaf = M({ color: 0x2f6b3f, roughness: .9, flatShading: true }), mHedge = M({ color: 0x22492c, roughness: 1, flatShading: true });
  const mTrunk = M({ color: 0x4a3626, roughness: 1 }), mRoad = M({ color: 0xb9a27a, roughness: .95 }), mDome = M({ color: 0x5a9a8c, metalness: .6, roughness: .4 });
  const mGlass = M({ color: 0x1d2a45, metalness: .9, roughness: .1, emissive: 0xffc072, emissiveIntensity: 0 });
  const mLamp = M({ color: 0xffe2b0, emissive: 0xffd08a, emissiveIntensity: 2 });
  const mWater = M({ color: 0x2fb8c9, emissive: 0x1aa6b8, emissiveIntensity: .5, roughness: .1, metalness: .4 });

  const gnd = new T.Mesh(new T.CircleGeometry(295, 64), mGrass); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; S.add(gnd);

  const B = new T.Group(); S.add(B); const P = [];
  const bx = (w, h, d, m, x, y, z) => { const g = new T.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); const o = new T.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
  const put = (o, a, b, k, par = B) => { o.userData = { a, b, k, y: o.position.y }; par.add(o); P.push(o); return o; };
  const flat = (g, m, x, y, z) => { const o = new T.Mesh(g, m); o.rotation.x = -Math.PI / 2; o.position.set(x, y, z); o.receiveShadow = true; return o; };
  const mesh = (g, m, x, y, z) => { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
  const win = (A, wx, wy, wz, ry, a) => {
    const gr = new T.Group(); gr.position.set(wx, wy, wz); gr.rotation.y = ry;
    gr.add(new T.Mesh(new T.BoxGeometry(1.2, 1.7, .1), mWhite), new T.Mesh(new T.BoxGeometry(.94, 1.44, .14), mGlass)); A(gr, a, a + .05, 'grow');
  };

  const HH = 2.4, Y0 = .28;
  /* A rectangular wing: foundation > steel frame > floors > walls > roof > windows (+ portico, dome for the grand centre) */
  function block(x, z, w, d, fl, grand) {
    const g = new T.Group(); g.position.set(x, 0, z); B.add(g);
    const A = (o, a, b, k) => put(o, a, b, k, g), tot = fl * HH;
    A(bx(w + 1, .28, d + 1, mStone, 0, 0, 0), 0, .06, 'sx');
    const nc = Math.round(w / 2.3) + 1;
    for (let i = 0; i < nc; i++) for (const s of [-1, 1]) A(bx(.26, tot, .26, mGold, -w / 2 + i * w / (nc - 1), Y0, s * d / 2), .07 + i * .007, .17 + i * .007, 'sy');
    for (let f = 0; f < fl; f++) A(bx(w + .3, .2, d + .3, mStone, 0, Y0 + (f + 1) * HH - .2, 0), .16 + f * .04, .26 + f * .04, 'sy');
    A(bx(w - .05, tot, d - .05, mWall, 0, Y0, 0), .28, .46, 'sy');
    A(bx(w + .5, .3, d + .5, mStone, 0, Y0 + tot - .1, 0), .44, .5, 'sy');
    const rg = grand ? new T.CylinderGeometry(.5, 1, 1, 4) : new T.ConeGeometry(1, 1, 4); rg.rotateY(Math.PI / 4); rg.translate(0, .5, 0);
    const rf = new T.Mesh(rg, mRoof); rf.scale.set((w / 2 + .6) / .7071, grand ? 2.2 : 1.8, (d / 2 + .6) / .7071); rf.position.y = Y0 + tot + .15; rf.castShadow = true; A(rf, .5, .64, 'drop');
    const n = Math.max(1, Math.floor(w / 2.3));
    for (let f = 0; f < fl; f++) for (let i = 0; i < n; i++) {
      const wx = (i - (n - 1) / 2) * (w / n); if (grand && f === 0 && Math.abs(wx) < 1.8) continue;
      win(A, wx, Y0 + f * HH + 1.4, d / 2 + .03, 0, .66 + (f * n + i) * .004);
    }
    if (!grand) return;
    const ytop = Y0 + tot + 2.35;                                                    // central drum, copper dome and finial
    const dg = new T.CylinderGeometry(1.7, 1.8, 1.1, 28); dg.translate(0, .55, 0); A(mesh(dg, mWhite, 0, ytop, 0), .64, .7, 'drop');
    A(mesh(new T.SphereGeometry(1.7, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mDome, 0, ytop + 1.1, 0), .66, .72, 'drop');
    A(mesh(new T.SphereGeometry(.22, 12, 12), mGold, 0, ytop + 3, 0), .7, .74, 'grow');
    for (const cx of [-3.6, 3.6]) A(bx(.7, 2.2, .7, mBrick, cx, Y0 + tot + .4, -1), .56, .64, 'sy');
    const pz = d / 2 + 2.6, ch = tot - .55;                                           // grand portico
    for (const px of [-4.2, -2.5, -.85, .85, 2.5, 4.2]) { const cg = new T.CylinderGeometry(.25, .3, ch, 22); cg.translate(0, ch / 2, 0); A(mesh(cg, mWhite, px, Y0, pz), .6, .74, 'sy'); }
    A(bx(9.8, .6, 3.2, mWhite, 0, Y0 + ch, d / 2 + 1.5), .72, .78, 'sy');
    const sh = new T.Shape(); sh.moveTo(-4.9, 0); sh.lineTo(4.9, 0); sh.lineTo(0, 1.9); sh.lineTo(-4.9, 0);
    A(mesh(new T.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }), mWhite, 0, Y0 + tot, d / 2), .74, .8, 'drop');
    A(bx(9, .2, 1.6, mStone, 0, 0, d / 2 + 3.6), .76, .8, 'sy'); A(bx(8.2, .2, 1.1, mStone, 0, .2, d / 2 + 3.4), .77, .81, 'sy');
    A(bx(2.3, 2.6, .14, mDoor, 0, Y0, d / 2 + .04), .74, .8, 'sy'); A(bx(.06, 2.6, .16, mGold, 0, Y0, d / 2 + .1), .78, .82, 'sy');
  }
  /* Round tower with cone roof */
  function tower(x, z, r, fl) {
    const g = new T.Group(); g.position.set(x, 0, z); B.add(g);
    const A = (o, a, b, k) => put(o, a, b, k, g), tot = fl * HH;
    const fg = new T.CylinderGeometry(r + .6, r + .6, .28, 32); fg.translate(0, .14, 0); A(mesh(fg, mStone, 0, 0, 0), 0, .06, 'sx');
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; A(bx(.26, tot, .26, mGold, Math.sin(a) * (r + .05), Y0, Math.cos(a) * (r + .05)), .08 + i * .01, .2 + i * .01, 'sy'); }
    const wg = new T.CylinderGeometry(r, r, tot, 32); wg.translate(0, tot / 2, 0); A(mesh(wg, mWall, 0, Y0, 0), .28, .46, 'sy');
    for (let f = 1; f <= fl; f++) { const bg = new T.CylinderGeometry(r + .2, r + .2, .26, 32); A(mesh(bg, mStone, 0, Y0 + f * HH - .13, 0), .17 + f * .03, .27 + f * .03, 'sy'); }
    const cg = new T.ConeGeometry(r + .7, 3.6, 32); cg.translate(0, 1.8, 0); A(mesh(cg, mRoof, 0, Y0 + tot + .15, 0), .5, .64, 'drop');
    A(mesh(new T.SphereGeometry(.2, 12, 12), mGold, 0, Y0 + tot + 3.9, 0), .66, .7, 'grow');
    for (let f = 0; f < fl; f++) for (const k of [-1, -.5, 0, .5, 1]) { const an = k * 1.0; win(A, Math.sin(an) * (r + .03), Y0 + f * HH + 1.4, Math.cos(an) * (r + .03), an, .68 + f * .004 + Math.abs(k) * .004); }
  }
  block(0, 0, 10, 6, 2, true);
  for (const s of [-1, 1]) { block(s * 8.4, -.5, 6.4, 5, 2, false); tower(s * 12.6, .8, 2.2, 3); }

  /* Grounds */
  put(flat(new T.PlaneGeometry(4.4, 12), mRoad, 0, .04, 12.8), .74, .82, 'sx');
  put(flat(new T.RingGeometry(4.2, 8, 64), mRoad, 0, .04, 24), .76, .84, 'sx');
  put(flat(new T.PlaneGeometry(4.4, 9), mRoad, 0, .04, 36), .78, .86, 'sx');
  const fnt = new T.Group(); fnt.position.set(0, 0, 24); B.add(fnt);
  const fb = new T.CylinderGeometry(2.4, 2.7, .6, 32); fb.translate(0, .3, 0); fnt.add(mesh(fb, mStone, 0, 0, 0));
  const fw = new T.Mesh(new T.CylinderGeometry(2.1, 2.1, .06, 32), mWater); fw.position.y = .62; fnt.add(fw);
  fnt.add(bx(.4, 2.2, .4, mStone, 0, .5, 0)); const fs = new T.Mesh(new T.SphereGeometry(.5, 16, 16), mWater); fs.position.y = 3; fnt.add(fs);
  fnt.userData = { a: .8, b: .88, k: 'grow', y: 0 }; P.push(fnt);
  for (const s of [-1, 1]) {                                                         // parterre gardens with hedge borders
    const pg = new T.Group(); pg.position.set(s * 11.5, 0, 15); B.add(pg);
    pg.add(flat(new T.PlaneGeometry(9, 8), mLawn, 0, .05, 0));
    for (const [w, d, px, pz] of [[9.4, .6, 0, 4.1], [9.4, .6, 0, -4.1], [.6, 8, 4.6, 0], [.6, 8, -4.6, 0]]) pg.add(bx(w, .8, d, mHedge, px, 0, pz));
    pg.add(mesh(new T.SphereGeometry(.8, 14, 14), mHedge, 0, 1, 0));
    pg.userData = { a: .78, b: .86, k: 'sx', y: 0 }; P.push(pg);
  }
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) {                             // topiary lining the avenue
    const tp = new T.Group(); tp.position.set(s * 3.6, 0, 8.6 + k * 2.2);
    tp.add(bx(.14, 1, .14, mTrunk, 0, 0, 0), mesh(new T.SphereGeometry(.6, 14, 14), mHedge, 0, 1.5, 0)); put(tp, .82 + k * .01, .9 + k * .01, 'grow');
  }
  for (let k = 0; k < 3; k++) for (const s of [-1, 1]) {                             // lanterns
    const lg = new T.Group(); lg.position.set(s * 2.7, 0, 9.5 + k * 3.6);
    lg.add(bx(.08, .9, .08, mGold, 0, 0, 0), mesh(new T.SphereGeometry(.17, 12, 12), mLamp, 0, 1.05, 0)); put(lg, .88 + k * .01, .92 + k * .01, 'grow');
  }
  for (const s of [-1, 1]) {                                                         // gates and boundary wall
    put(bx(1.1, 3.6, 1.1, mStone, s * 3.4, 0, 41), .84, .9, 'sy'); put(mesh(new T.SphereGeometry(.42, 14, 14), mGold, s * 3.4, 3.9, 41), .88, .92, 'grow');
    put(bx(17, 1.3, .5, mStone, s * 12.3, 0, 41), .84, .92, 'sy');
  }
  const pool = new T.Group(); pool.position.set(-22, 0, 5); B.add(pool);
  pool.add(bx(9, .24, 5, mStone, 0, 0, 0), flat(new T.PlaneGeometry(8, 4), mWater, 0, .26, 0), bx(1.8, .35, .7, mWhite, -2, .24, 3.1), bx(1.8, .35, .7, mWhite, 1, .24, 3.1));
  pool.userData = { a: .76, b: .86, k: 'sx', y: 0 }; P.push(pool);
  const tree = (x, z, sc, a) => {
    const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(sc);
    const tg = new T.CylinderGeometry(.22, .34, 2.4, 8); tg.translate(0, 1.2, 0);
    g.add(mesh(tg, mTrunk, 0, 0, 0), mesh(new T.IcosahedronGeometry(1.7, 0), mLeaf, 0, 3.6, 0), mesh(new T.IcosahedronGeometry(1.2, 0), mLeaf, .5, 4.8, .2)); put(g, a, a + .08, 'grow');
  };
  [[-19, 16], [19, 16], [-26, -4], [26, -4], [-17, -14], [17, -14], [0, -18], [-32, 14], [32, 14]].forEach(([x, z], i) => tree(x, z, 1.2 + (i % 3) * .2, .78 + i * .01));
  for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28, r = 58 + (i * 7 % 5) * 4; tree(Math.cos(a) * r * 1.1, Math.sin(a) * r * .9 - 6, 1.8 + (i % 4) * .3, .84 + (i % 5) * .008); }

  /* Construction props that clear away as the estate rises */
  const crane = new T.Group(); crane.position.set(19, 0, -5); B.add(crane);
  crane.add(bx(.4, 15, .4, mGold, 0, 0, 0)); const jib = new T.Group(); jib.position.y = 15; crane.add(jib);
  jib.add(bx(15, .26, .26, mGold, -4, 0, 0)); jib.add(bx(1.2, .8, .8, mDoor, 3.6, -.2, 0));
  crane.userData = { a: .72, b: .82, k: 'out', y: 0 }; P.push(crane);
  put(bx(3.4, .7, 1.2, mTrunk, -17, 0, 11), .3, .42, 'out'); put(bx(2.6, .9, 1.4, mStone, -15, 0, 14), .3, .44, 'out'); put(bx(3, .6, 1.2, mTrunk, 17, 0, 12), .32, .46, 'out');
  const ff = 140, fp = new Float32Array(ff * 3);
  for (let i = 0; i < ff; i++) { fp[i * 3] = (Math.random() - .5) * 60; fp[i * 3 + 1] = Math.random() * 9 + .5; fp[i * 3 + 2] = Math.random() * 50 - 8; }
  const fg2 = new T.BufferGeometry(); fg2.setAttribute('position', new T.BufferAttribute(fp, 3));
  const fmat = new T.PointsMaterial({ color: 0xffe8a8, size: .26, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }); S.add(new T.Points(fg2, fmat));

  /* Timeline + camera */
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a))), eo = x => 1 - Math.pow(1 - x, 3), mn = v => Math.max(.001, v);
  const DUR = 52, fade = $('#fade'), lab = $('#phaseLabel'), bar = $('#phaseBar'), cur = $('#cur');
  let mx = 0, my = 0, sx = 0, sy = 0, run = true, last = '', t0 = performance.now(), tgY = 3, hasPtr = false;
  let drag = false, px = 0, py = 0, ux = 0, uy = 0, lastDrag = -9;
  const tg = new T.Vector3(), rc = new T.Raycaster(), mv = new T.Vector2();

  hero.addEventListener('pointerdown', e => { if (e.target.closest('a,button,input')) return; drag = true; px = e.clientX; py = e.clientY; hero.classList.add('grab'); });
  const end = () => { drag = false; hero.classList.remove('grab'); };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; hasPtr = e.clientY >= r.top && e.clientY <= r.bottom;
    if (cur) cur.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px)`;
    if (drag) { ux -= (e.clientX - px) * .006; uy = Math.max(-5, Math.min(9, uy + (e.clientY - py) * .04)); px = e.clientX; py = e.clientY; lastDrag = performance.now() / 1000; }
  });
  const size = () => {
    const w = hero.clientWidth, h = hero.clientHeight; R.setSize(w, h, false); C.aspect = w / h; C.fov = C.aspect < 1 ? 52 : 40;
    if (C.aspect > 1.2) C.setViewOffset(w, h, -w * .1, 0, w, h); else C.clearViewOffset();    // push the house right so the text has room
    C.updateProjectionMatrix();
  };
  addEventListener('resize', size); size();
  new IntersectionObserver(([e]) => { run = e.isIntersecting; }).observe(hero);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!run) return;
    const s = (now - t0) / 1000, t = reduce ? .95 : (s % DUR) / DUR;
    P.forEach(o => {
      const u = o.userData, p = eo(seg(t, u.a, u.b)); o.visible = u.k === 'out' ? p < 1 : p > 0;
      if (u.k === 'sy') o.scale.y = mn(p); else if (u.k === 'sx') o.scale.set(mn(p), 1, mn(p)); else if (u.k === 'drop') o.position.y = u.y + (1 - p) * 12;
      else if (u.k === 'out') o.scale.setScalar(mn(1 - p)); else o.scale.setScalar(mn(p));
    });
    jib.rotation.y = Math.sin(s * .35) * .6;
    const lit = seg(t, .82, .93);
    mGlass.emissiveIntensity = 1.3 * lit; ups.forEach(l => l.intensity = 1.8 * lit);
    fs.position.y = 3 + Math.sin(s * 2) * .1; fmat.opacity = .9 * lit;
    for (let i = 0; i < ff; i++) { fp[i * 3 + 1] += Math.sin(s + i) * .004; fp[i * 3] += Math.cos(s * .5 + i) * .004; }
    fg2.attributes.position.needsUpdate = true;

    if (!drag && s - lastDrag > 2.5) { ux *= .97; uy *= .97; }
    sx += (mx - sx) * .04; sy += (my - sy) * .04;
    const portrait = C.aspect < 1, built = seg(t, .08, .62), wide = portrait ? Math.min(1.6, .9 / C.aspect) : 1;
    const ang = -.9 + t * 1.55 + Math.sin(s * .15) * .05 + sx * .22 + ux, rad = (41 - t * 8) * wide, h = 6 + eo(Math.min(1, t * 1.6)) * 9 - sy * 2 + uy;
    C.position.set(Math.sin(ang) * rad, Math.max(1.5, h), Math.cos(ang) * rad);
    tgY += (3 + built * 2.5 - (portrait ? 4 : 0) - tgY) * .05; tg.set(0, tgY, 5); C.lookAt(tg);

    mv.set(mx * 2, -my * 2); rc.setFromCamera(mv, C);
    cl.position.copy(rc.ray.origin).addScaledVector(rc.ray.direction, Math.max(10, C.position.distanceTo(tg) - 8));
    cl.intensity += ((hasPtr ? 2.6 : 0) - cl.intensity) * .08;

    fade.style.opacity = reduce ? 0 : Math.max(1 - seg(t, 0, .03), seg(t, .968, 1));
    const name = t < .07 ? 'Foundation' : t < .27 ? 'Steel structure' : t < .5 ? 'Walls and towers' : t < .66 ? 'Roof and dome' : t < .9 ? 'Gardens and grounds' : 'The finished estate';
    if (name !== last) { lab.textContent = name; last = name; }
    bar.style.width = (t * 100) + '%';
    R.render(S, C);
  }
  requestAnimationFrame(frame);
})();
