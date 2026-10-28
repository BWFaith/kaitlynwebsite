(() => {
  const S = SITE, id = new URLSearchParams(location.search).get('id');
  const l = LISTINGS.find(x => x.id === id), root = $('#detail');
  if (!l) { root.innerHTML = `<div class="empty"><h3>Property not found</h3><p>It may have been sold or removed.</p><a class="btn dk" href="listings.html">Browse all properties</a></div>`; return; }
  document.title = `${l.title} | ${S.name}`;
  $('#crumb').textContent = l.title; $('#ptitle').textContent = l.title;
  $('#paddr').textContent = `${l.addr}, ${l.city}, CA`;
  $('.banner').style.setProperty('--bg', `url(${l.img[0]})`);
  const sale = l.status === 'sale', cityQ = encodeURIComponent(`${l.addr}, ${l.city}, CA`);
  const facts = l.type === 'land'
    ? [[l.acres, 'Acres'], ['Land', 'Type'], [fmtPrice(l), 'Price'], [sale ? 'For sale' : 'For rent', 'Status']]
    : [[l.beds, 'Bedrooms'], [l.baths, 'Bathrooms'], [l.sqft.toLocaleString(), 'Sq ft'], [l.year, 'Year built']];

  root.innerHTML = `
  <div>
    <div class="main-img"><img id="big" src="${l.img[0]}" alt="${l.title}"></div>
    <div class="thumbs">${l.img.map((s, i) => `<button type="button" class="${i ? '' : 'on'}" data-i="${i}" aria-label="Photo ${i + 1}"><img src="${s}" alt=""></button>`).join('')}</div>
    <p class="eyebrow">${l.tag || (sale ? 'For sale' : 'For rent')} \u00b7 ${l.type.charAt(0).toUpperCase() + l.type.slice(1)} in ${l.city}</p>
    <h2>${fmtPrice(l)}</h2>
    <div class="facts">${facts.map(([v, t]) => `<div><b>${v}</b><small>${t}</small></div>`).join('')}</div>
    <h3>About this property</h3><p style="margin:10px 0 24px">${l.desc}</p>
    <h3>Features</h3><div class="chips">${l.feat.map(f => `<span>${f}</span>`).join('')}</div>
    <h3 style="margin-bottom:14px">Location</h3>
    <iframe loading="lazy" title="Map" src="https://maps.google.com/maps?q=${cityQ}&output=embed"></iframe>
  </div>
  <aside class="side">
    <div class="box"><div class="agent"><img src="images/kait/profile.jpg" alt="${S.name}"><div><b>${S.name}</b><small>${S.tag}</small><a href="tel:${S.phone}"><b>${S.phone}</b></a></div></div>
      <form data-mail="Tour request: ${l.title}">
        <input type="hidden" name="Property" value="${l.title} (${l.addr}, ${l.city}) - ${fmtPrice(l)}">
        <label>Full name<input name="name" required autocomplete="name"></label>
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
        <label>Preferred date<input name="date" type="date"></label>
        <label>Message<textarea name="message" rows="3">I'd like to schedule a tour of ${l.title}.</textarea></label>
        <input class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn dk" type="submit">Request a tour</button>
        <p class="ok" hidden>Thank you. Kait will contact you shortly.</p><p class="err" hidden>Could not send. Please call ${S.phone} or email ${S.email}.</p>
      </form></div>
    ${sale && l.type !== 'land' ? `<div class="box"><h3 style="margin-bottom:14px">Payment estimate</h3>
      <div style="display:grid;gap:12px"><label>Down payment (%)<input id="dp" type="number" value="20" min="0" max="95"></label>
      <label>Interest rate (%)<input id="rt" type="number" value="6.5" step=".05"></label><label>Term (years)<input id="yr" type="number" value="30" min="5" max="40"></label></div>
      <p style="margin-top:14px">Estimated principal and interest</p><div class="res" id="pay"></div><p class="note">An estimate only. Taxes, insurance and fees are not included.</p></div>` : ''}
  </aside>`;

  $$('.thumbs button').forEach(b => b.onclick = () => { $('#big').src = l.img[b.dataset.i]; $$('.thumbs button').forEach(x => x.classList.toggle('on', x === b)); });
  const pay = $('#pay');
  if (pay) {
    const calc = () => {
      const P = l.price * (1 - $('#dp').value / 100), r = $('#rt').value / 1200, n = $('#yr').value * 12;
      pay.textContent = '$' + Math.round(r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n).toLocaleString('en-US') + '/mo';
    };
    ['#dp', '#rt', '#yr'].forEach(s => $(s).oninput = calc); calc();
  }
  $('#related').innerHTML = LISTINGS.filter(x => x.id !== l.id && (x.type === l.type || x.status === l.status)).slice(0, 3).map(cardHTML).join('');
})();
