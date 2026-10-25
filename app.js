(function () {
  const INTRO_KEY = 'swenee_intro_seen';
  const INTRO_MAX_MS = 10000; // GIF is short/looping; cap so site never blocks
  const PLACEHOLDER_RE = /^comm?ing\s*soon$/i;

  const tvIntro = document.getElementById('tvIntro');
  const site = document.getElementById('site');
  const skipBtn = document.getElementById('skipIntro');
  const tvGif = document.getElementById('tvGif');
  const toast = document.getElementById('toast');

  let dismissed = false;

  function showSite() {
    if (dismissed) return;
    dismissed = true;
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (_) {}
    if (tvIntro) tvIntro.classList.add('is-out');
    if (site) site.classList.remove('is-hidden');
    setTimeout(() => {
      if (tvIntro && tvIntro.parentNode) tvIntro.parentNode.removeChild(tvIntro);
    }, 600);
  }

  function shouldShowIntro() {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch (_) {
      return true;
    }
  }

  // Force-show for testing: sessionStorage.removeItem('swenee_intro_seen'); location.reload();
  if (!shouldShowIntro()) {
    if (tvIntro) tvIntro.classList.add('is-hidden');
    if (site) site.classList.remove('is-hidden');
  } else {
    if (site) site.classList.add('is-hidden');
    if (skipBtn) skipBtn.addEventListener('click', showSite);

    // If GIF missing/errors, still allow CRT + skip (never block)
    let ended = false;
    const onDone = () => {
      if (ended) return;
      ended = true;
      showSite();
    };

    if (tvGif) {
      tvGif.addEventListener('error', () => {
        // keep snow/static visible; auto-skip after short delay
        setTimeout(onDone, 2500);
      });
      // GIF loops forever usually — use max timer; also try animationiteration if browser fires it
      tvGif.addEventListener('animationiteration', onDone);
      // Some browsers expose loop end via load + duration estimate
      tvGif.addEventListener('load', () => {
        // short placeholder GIF (~0.6s) — wait ~1 loop-ish then a beat, but still respect max
      });
    }

    setTimeout(onDone, INTRO_MAX_MS);
  }

  function isPlaceholder(ca) {
    const s = String(ca || '').trim();
    return !s || PLACEHOLDER_RE.test(s) || s.toLowerCase() === 'comingsoon' || s.toLowerCase() === 'commingsonn';
  }

  function isValidSolMint(ca) {
    return typeof ca === 'string'
      && ca.length >= 32 && ca.length <= 44
      && /^[1-9A-HJ-NP-Za-km-z]+$/.test(ca)
      && !isPlaceholder(ca);
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }

  function wireCopy(ca) {
    document.querySelectorAll('#copyCa, #copyCaHero').forEach((btn) => {
      btn.dataset.ca = ca;
      if (btn.id === 'copyCaHero') btn.textContent = 'CA: ' + ca;
      btn.onclick = () => {
        const done = () => showToast('COPIED');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(ca).then(done, fb);
        } else {
          fb();
        }
        function fb() {
          const t = document.createElement('textarea');
          t.value = ca;
          document.body.appendChild(t);
          t.select();
          document.execCommand('copy');
          t.remove();
          done();
        }
      };
    });
    const footer = document.getElementById('footerCa');
    if (footer) footer.textContent = ca;
  }

  function wireBuy(ca, dex) {
    const valid = isValidSolMint(ca);
    const url = dex || (valid ? 'https://pump.fun/coin/' + ca : '');
    document.querySelectorAll('#buyBtn, #buyBtnHero').forEach((btn) => {
      if (!valid || !url) {
        btn.disabled = true;
        btn.classList.add('is-disabled');
        btn.textContent = btn.id === 'buyBtnHero' ? 'BUY · COMING SOON' : 'BUY · COMING SOON';
        btn.removeAttribute('data-href');
        btn.onclick = null;
        return;
      }
      btn.disabled = false;
      btn.classList.remove('is-disabled');
      btn.textContent = btn.id === 'buyBtnHero' ? 'BUY / PUMP SWAP' : 'BUY';
      btn.onclick = () => window.open(url, '_blank', 'noopener');
    });
  }

  function wireSocial(twitter, telegram) {
    const x = document.getElementById('xLink');
    const tg = document.getElementById('tgLink');
    if (x) {
      if (twitter) {
        x.hidden = false;
        x.removeAttribute('aria-hidden');
        x.href = twitter;
        x.target = '_blank';
        x.rel = 'noreferrer';
      } else {
        x.hidden = true;
        x.setAttribute('aria-hidden', 'true');
        x.removeAttribute('href');
      }
    }
    if (tg) {
      if (telegram) {
        tg.hidden = false;
        tg.removeAttribute('aria-hidden');
        tg.href = telegram;
        tg.target = '_blank';
        tg.rel = 'noreferrer';
      } else {
        tg.hidden = true;
        tg.setAttribute('aria-hidden', 'true');
        tg.removeAttribute('href');
      }
    }
  }

  // Defaults before settings fetch
  wireCopy('CommingSoon');
  wireBuy('CommingSoon', '');
  wireSocial('', '');

  fetch('/api/settings')
    .then((r) => r.json())
    .then((s) => {
      const ca = s.ca || 'CommingSoon';
      wireCopy(ca);
      wireBuy(ca, s.dex || '');
      wireSocial(s.twitter || '', s.telegram || '');
    })
    .catch(() => {});
})();
