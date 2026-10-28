(() => {
  const f = $('#hs');
  f.insertAdjacentHTML('beforeend', filterHTML());
  $('#featured').innerHTML = LISTINGS.slice(0, 6).map(cardHTML).join('');

  // Search: email the criteria to the realtor, then show matching homes on the Properties page
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const d = readForm(f), btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Searching...';
    const q = new URLSearchParams(d); q.set('src', 'home'); q.delete('contact');
    await Promise.race([sendMail('New home search from your website', searchEmail(d)), new Promise(r => setTimeout(r, 3000))]);
    location.href = 'listings.html?' + q.toString();
  });
})();
