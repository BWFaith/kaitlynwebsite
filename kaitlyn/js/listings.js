(() => {
  const f = $('#sf'), grid = $('#results'), count = $('#count'), sort = $('#sort');
  f.insertAdjacentHTML('beforeend', filterHTML());

  // Pre-fill from the URL (links from the home search or category tiles)
  const qs = new URLSearchParams(location.search);
  qs.forEach((v, k) => {
    if (k === 'feat') return;
    const el = f.elements[k]; if (!el) return;
    if (el.length && el[0].type === 'radio') [...el].forEach(r => r.checked = r.value === v); else el.value = v;
  });
  qs.getAll('feat').flatMap(v => v.split(', ')).forEach(v => { const c = $(`input[name=feat][value="${v}"]`, f); if (c) c.checked = true; });
  if (qs.has('feat')) $('.more', f).open = true;

  const matches = (l, d) =>
    (!d.status || l.status === d.status) && (!d.type || l.type === d.type) &&
    (!d.q || (l.title + ' ' + l.addr + ' ' + l.city + ' ' + l.type + ' ' + l.desc).toLowerCase().includes(d.q.toLowerCase())) &&
    (!d.min || l.price >= +d.min) && (!d.max || l.price <= +d.max) && (!d.beds || l.beds >= +d.beds) && (!d.baths || l.baths >= +d.baths) &&
    (!d.feat || d.feat.split(', ').every(x => l.feat.includes(x)));

  const render = () => {
    const d = readForm(f);
    const list = LISTINGS.filter(l => matches(l, d));
    if (sort.value === 'low') list.sort((a, b) => a.price - b.price);
    if (sort.value === 'high') list.sort((a, b) => b.price - a.price);
    if (sort.value === 'beds') list.sort((a, b) => b.beds - a.beds);
    count.textContent = `${list.length} ${list.length === 1 ? 'property' : 'properties'} found`;
    grid.innerHTML = list.length ? list.map(cardHTML).join('') :
      `<div class="empty"><h3>Nothing matches yet</h3><p>Tell Kait what you are looking for and she will search off-market and upcoming homes for you.</p><a class="btn dk" href="contact.html">Contact Kait</a></div>`;
  };

  f.addEventListener('submit', async e => {
    e.preventDefault(); render();
    history.replaceState(null, '', '?' + new URLSearchParams(readForm(f)).toString().replace(/&?contact=[^&]*/, ''));
    $('#top-results').scrollIntoView({ behavior: 'smooth' });
    sendMail('New property search on your website', searchEmail(readForm(f)));   // delivered to the realtor
  });
  f.addEventListener('reset', () => setTimeout(render));
  sort.onchange = render;
  $('#clear').onclick = () => { f.reset(); history.replaceState(null, '', 'listings.html'); render(); };
  render();
  // Searches that started on the home page were already emailed, so nothing is sent again here
})();
