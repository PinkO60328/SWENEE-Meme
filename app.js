(function () {
  const INTRO_KEY = 'swenee_intro_seen';
  const INTRO_MAX_MS = 10000; // ~8–12s window; fixed at 10s
  const PLACEHOLDER_RE = /^comm?ing\s*soon$/i;

  const tvIntro = document.getElementById('tvIntro');
  const site = document.getElementById('site');
  const skipBtn = document.getElementById('skipIntro');
  const toast = document.getElementById('toast');

  let dismissed = false;

  function showSite() {
    if (dismissed) return;
    dismissed = true;
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (_) {}
    if (tvIntro) tvIntro.classList.add('is-out');
    if (site) site.classList.remove('is-hidden');
    startHearts();
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

  // Force-show: sessionStorage.removeItem('swenee_intro_seen'); location.reload();
  if (!shouldShowIntro()) {
    if (tvIntro) tvIntro.classList.add('is-hidden');
    if (site) site.classList.remove('is-hidden');
    startHearts();
  } else {
    if (site) site.classList.add('is-hidden');
    if (skipBtn) skipBtn.addEventListener('click', showSite);
    setTimeout(showSite, INTRO_MAX_MS);
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

  function copyText(ca) {
    const done = () => showToast('COPIED');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ca).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      const t = document.createElement('textarea');
      t.value = ca;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
      done();
    }
  }

  function wireCopy(ca) {
    document.querySelectorAll('#copyCa, #copyCaSwap').forEach((btn) => {
      btn.dataset.ca = ca;
      btn.onclick = () => copyText(ca);
    });
    const caDisplay = document.getElementById('caDisplay');
    if (caDisplay) caDisplay.textContent = ca;
    const footer = document.getElementById('footerCa');
    if (footer) footer.textContent = ca;
  }

  function wireBuy(ca, dex) {
    const valid = isValidSolMint(ca);
    const url = dex || (valid ? 'https://pump.fun/coin/' + ca : '');
    const buyBtn = document.getElementById('buyBtn');
    const connectBtn = document.getElementById('connectBtn');

    if (buyBtn) {
      if (!valid || !url) {
        buyBtn.disabled = true;
        buyBtn.classList.add('is-disabled');
        buyBtn.textContent = 'COMING SOON';
        buyBtn.onclick = null;
      } else {
        buyBtn.disabled = false;
        buyBtn.classList.remove('is-disabled');
        buyBtn.textContent = 'BUY';
        buyBtn.onclick = () => window.open(url, '_blank', 'noopener');
      }
    }

    if (connectBtn) {
      // UI-only — no real wallet while CA is placeholder
      if (!valid) {
        connectBtn.disabled = true;
        connectBtn.classList.add('is-disabled');
        connectBtn.textContent = 'Connect wallet · Coming soon';
        connectBtn.onclick = null;
      } else {
        connectBtn.disabled = true;
        connectBtn.classList.add('is-disabled');
        connectBtn.textContent = 'Connect wallet · Coming soon';
        connectBtn.onclick = () => showToast('Wallet soon');
      }
    }
  }

  function wireSocial(twitter, telegram) {
    const x = document.getElementById('xLink');
    const tg = document.getElementById('tgLink');
    function setLink(el, url) {
      if (!el) return;
      if (url) {
        el.hidden = false;
        el.removeAttribute('aria-hidden');
        el.href = url;
        el.target = '_blank';
        el.rel = 'noreferrer';
      } else {
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        el.removeAttribute('href');
      }
    }
    setLink(x, twitter);
    setLink(tg, telegram);
  }

  // Soft romantic floating hearts / sparkles
  let heartsStarted = false;
  function startHearts() {
    if (heartsStarted) return;
    const canvas = document.getElementById('heartsCanvas');
    if (!canvas) return;
    heartsStarted = true;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const N = 36;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        s: 6 + Math.random() * 14,
        vy: 0.15 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.35,
        a: 0.15 + Math.random() * 0.4,
        kind: Math.random() > 0.45 ? 'heart' : 'spark',
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.02
      });
    }

    function drawHeart(x, y, size, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 16, size / 16);
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(-8, -6, -16, 4, 0, 14);
      ctx.bezierCurveTo(16, 4, 8, -6, 0, 3);
      ctx.fillStyle = 'rgba(244, 63, 122,' + alpha + ')';
      ctx.fill();
      ctx.restore();
    }

    function drawSpark(x, y, size, alpha, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = 'rgba(255, 182, 203,' + alpha + ')';
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size);
      }
      ctx.strokeStyle = 'rgba(251, 113, 133,' + alpha + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.2;
        p.rot += p.spin;
        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        if (p.kind === 'heart') drawHeart(p.x, p.y, p.s, p.a);
        else drawSpark(p.x, p.y, p.s * 0.6, p.a, p.rot);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

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
