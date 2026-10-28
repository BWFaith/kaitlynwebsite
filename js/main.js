(() => {
  const S = window.SITE, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const cur = location.pathname.split('/').pop() || 'index.html';
  const links = [['index.html', 'Home'], ['listings.html', 'Properties'], ['services.html', 'Services'], ['about.html', 'About'], ['contact.html', 'Contact']];

  /* ---------- Shared header + footer ---------- */
  const hdr = $('#hdr');
  if (hdr) hdr.outerHTML = `<header class="nav" id="nav"><a class="logo" href="index.html"><b>KB</b><span>${S.name}<small>${S.brand}</small></span></a>
    <nav id="menu">${links.map(([h, t]) => `<a href="${h}"${h === cur ? ' class="on"' : ''}>${t}</a>`).join('')}<a class="btn sm" href="tel:${S.phone}">${S.phone}</a></nav>
    <button class="burger" id="burger" aria-label="Open menu"><i></i><i></i></button></header>`;
  const ftr = $('#ftr');
  if (ftr) ftr.outerHTML = `<footer><div class="wrap"><div class="cols">
    <div><h3>${S.name}</h3><p>Caring heart, real estate hustle. Serving the beautiful Mohawk Valley with passion and purpose.</p><p style="margin-top:14px"><a href="${S.fb}" target="_blank" rel="noopener">Follow on Facebook</a></p></div>
    <div><h3>Explore</h3><ul>${links.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>
    <div><h3>Get in touch</h3><ul><li><a href="tel:${S.phone}">${S.phone}</a></li><li><a href="mailto:${S.email}">${S.email}</a></li><li>${S.addr}</li></ul></div></div>
    <div class="legal"><span>\u00a9 ${new Date().getFullYear()} ${S.name} | ${S.tag} | ${S.brokerage}. All rights reserved.</span><span>Equal Housing Opportunity</span></div></div></footer>`;
  const nav = $('#nav');
  const burger = $('#burger');
  const setMenu = open => {                       // open/close the mobile menu and lock page scrolling
    nav.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.onclick = () => setMenu(!nav.classList.contains('open'));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });

  /* ---------- Helpers shared by pages ---------- */
  const money = n => '$' + Number(n).toLocaleString('en-US');
  window.fmtPrice = l => money(l.price) + (l.status === 'rent' ? '/mo' : '');
  window.metaHTML = l => l.type === 'land' ? `<span>${l.acres} acres</span>` : `<span>${l.beds} bd</span><span>${l.baths} ba</span><span>${l.sqft.toLocaleString()} sq ft</span>`;
  window.cardHTML = l => `<article class="card tilt"><a class="ph" href="property.html?id=${l.id}"><img loading="lazy" src="${l.img[0]}" alt="${l.title}"><span class="tag">${l.tag || (l.status === 'rent' ? 'For rent' : 'For sale')}</span></a>
    <div class="body"><div class="price">${fmtPrice(l)}</div><h3><a href="property.html?id=${l.id}">${l.title}</a></h3><p class="loc">${l.addr}, ${l.city}, CA</p>
    <div class="meta">${metaHTML(l)}</div><a class="more" href="property.html?id=${l.id}">View details</a></div></article>`;

  /* ---------- Property search form (used on Home and Properties) ---------- */
  const opt = (arr, any) => `<option value="">${any}</option>` + arr.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
  window.filterHTML = () => `
    <div class="tabs">${[['', 'All'], ['sale', 'For sale'], ['rent', 'For rent']].map(([v, t], i) => `<label><input type="radio" name="status" value="${v}"${i ? '' : ' checked'}><span>${t}</span></label>`).join('')}</div>
    <div class="fgrid">
      <label>Location or keyword<input name="q" list="places" placeholder="City, street or keyword"></label>
      <label>Property type<select name="type">${opt([['house', 'House'], ['apartment', 'Apartment'], ['condo', 'Condo'], ['land', 'Land']], 'Any type')}</select></label>
      <label>Min price<input name="min" type="number" min="0" step="500" placeholder="No min"></label>
      <label>Max price<input name="max" type="number" min="0" step="500" placeholder="No max"></label>
      <label>Bedrooms<select name="beds">${opt([[1, '1+'], [2, '2+'], [3, '3+'], [4, '4+']], 'Any')}</select></label>
      <label>Bathrooms<select name="baths">${opt([[1, '1+'], [2, '2+'], [3, '3+']], 'Any')}</select></label>
    </div>
    <datalist id="places">${[...new Set(LISTINGS.map(l => l.city))].map(c => `<option value="${c}">`).join('')}</datalist>
    <details class="more"><summary>More filters</summary><div class="feats">${['Pool', 'Garage', 'Lake view', 'Waterfront', 'Fireplace', 'Garden', 'Pet friendly'].map(f => `<label><input type="checkbox" name="feat" value="${f}">${f}</label>`).join('')}</div></details>
    <div class="frow"><label>Email or phone (optional, so Kait can send you matches)<input name="contact" autocomplete="email" placeholder="you@example.com"></label><button class="btn dk" type="submit">Search homes</button></div>
    <p class="note">Searching shares your criteria with Kait so she can follow up with matching homes.</p>
    <input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">`;
  window.readForm = f => {
    const d = {}; new FormData(f).forEach((v, k) => { if (k === '_honey' || v === '') return; d[k] = d[k] ? d[k] + ', ' + v : v; }); return d;
  };
  window.searchEmail = d => ({
    'Listing status': d.status || 'All', 'Location / keyword': d.q || 'Any', 'Property type': d.type || 'Any',
    'Min price': d.min || 'None', 'Max price': d.max || 'None', 'Bedrooms': d.beds ? d.beds + '+' : 'Any', 'Bathrooms': d.baths ? d.baths + '+' : 'Any',
    'Features': d.feat || 'None', 'Visitor contact': d.contact || 'Not provided', ...(d.contact && d.contact.includes('@') ? { _replyto: d.contact } : {})
  });

  /* ---------- Email delivery (FormSubmit.co sends to the realtor's inbox) ---------- */
  window.sendMail = async (subject, data) => {
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${S.email}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', ...data })
      });
      return r.ok;
    } catch (e) { return false; }
  };
  document.addEventListener('submit', async e => {
    const f = e.target.closest('form[data-mail]'); if (!f) return;
    e.preventDefault();
    const d = readForm(f), btn = f.querySelector('button[type=submit]'), t = btn.textContent;
    if (d.email) d._replyto = d.email;
    btn.disabled = true; btn.textContent = 'Sending...';
    const ok = await sendMail(f.dataset.mail, d);
    btn.disabled = false; btn.textContent = t;
    $('.ok', f).hidden = !ok; $('.err', f).hidden = ok;
    if (ok) f.reset();
  });

  /* ---------- Scroll: 3D depth + hero parallax ---------- */
  const hc = $('#heroCopy');
  let queued = false;
  const update = () => {
    queued = false;
    const y = scrollY, vh = innerHeight;
    nav.classList.toggle('solid', y > 40);
    if (hc && y < vh) { hc.style.transform = `translate3d(0,${y * .22}px,0)`; hc.style.opacity = Math.max(0, 1 - y / (vh * .75)); }
    if (reduce) return;
    const touch = matchMedia('(pointer:coarse)').matches;
    $$('[data-3d]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) { if (el.style.transform) el.style.transform = ''; return; }
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh * .75)));
      const e = Math.sign(p) * Math.max(0, Math.abs(p) - .15) / .85;   // dead zone: no transform at rest, so text and photos stay pixel-sharp
      el.style.transform = e ? `perspective(1400px) rotateX(${e * (touch ? 5 : 10)}deg) translateY(${e * (touch ? 18 : 36)}px)` : '';
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true }); addEventListener('resize', queue);
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  update();

  /* ---------- Card tilt ---------- */
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.tilt'); if (!el || reduce) return;
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
  });
  document.addEventListener('pointerout', e => { const el = e.target.closest && e.target.closest('.tilt'); if (el && !el.contains(e.relatedTarget)) el.style.transform = ''; });

  /* ---------- Hero headline split + ready state ---------- */
  const h1 = $('#h1');
  if (h1) h1.innerHTML = h1.textContent.trim().split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}"><span>${w}</span></span>`).join(' ');
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('ready'), 150));
})();
