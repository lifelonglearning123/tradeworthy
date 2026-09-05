/* Tradeworthy — shared behaviour. No dependencies. */
function TWinit() {
  var d = document, w = window;
  d.documentElement.classList.add('js');
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile nav */
  var burger = d.querySelector('.burger'), nav = d.querySelector('.nav');
  if (burger && nav && !burger.dataset.bound) {
    burger.dataset.bound = '1';
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* Current page in nav. Clean URLs (/about) and legacy ones (/about.html) key the same. */
  var pageKey = function (path) {
    return String(path || '').split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop().replace(/\.html$/, '') || 'index';
  };
  var here = pageKey(w.TW_PAGE || location.pathname);
  d.querySelectorAll('.nav a[aria-current]').forEach(function (a) { a.removeAttribute('aria-current'); });
  d.querySelectorAll('.nav a').forEach(function (a) {
    if (pageKey(a.getAttribute('href')) === here) a.setAttribute('aria-current', 'page');
  });

  /* Pop-ins */
  var pops = d.querySelectorAll('.pop');
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    pops.forEach(function (el) { io.observe(el); });
  } else { pops.forEach(function (el) { el.classList.add('in'); }); }

  /* Word reveal on scroll */
  var reveals = d.querySelectorAll('.reveal');
  if (reveals.length && !reduce) {
    reveals.forEach(function (p) {
      if (p.dataset.split) return; p.dataset.split = '1';
      var words = p.textContent.trim().split(/\s+/);
      p.innerHTML = words.map(function (x) { return '<span class="rw">' + x + '</span>'; }).join(' ');
    });
    var tick = function () {
      var vh = w.innerHeight;
      d.querySelectorAll('.reveal').forEach(function (p) {
        var r = p.getBoundingClientRect();
        var start = vh * 0.85, end = vh * 0.35;
        var t = (start - r.top) / (start - end + r.height * 0.6);
        t = Math.max(0, Math.min(1, t));
        var ws = p.querySelectorAll('.rw'), n = Math.round(t * ws.length);
        for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < n);
      });
    };
    if (!w.__twReveal) {
      w.__twReveal = true; var raf = false;
      w.addEventListener('scroll', function () { if (!raf) { raf = true; requestAnimationFrame(function () { tick(); raf = false; }); } }, { passive: true });
    }
    tick();
  }

  /* Call card demo (home hero) */
  var card = d.querySelector('.callcard');
  if (card && !reduce && !card.dataset.live) {
    card.dataset.live = '1';
    var timer = card.querySelector('.timer b'), items = card.querySelectorAll('.item'), foot = card.querySelector('.foot');
    var loop = function () {
      items.forEach(function (i) { i.classList.remove('on'); }); if (foot) foot.classList.remove('on');
      var t = 0; if (timer) timer.textContent = '0.0';
      var iv = setInterval(function () {
        t += 0.1; if (timer) timer.textContent = t.toFixed(1);
        if (t >= 2.9) { clearInterval(iv); if (timer) timer.textContent = '2.9'; }
      }, 100);
      items.forEach(function (it, i) { setTimeout(function () { it.classList.add('on'); }, 3200 + i * 1100); });
      setTimeout(function () { if (foot) foot.classList.add('on'); }, 3200 + items.length * 1100 + 300);
      setTimeout(loop, 3200 + items.length * 1100 + 4200);
    };
    loop();
  } else if (card) {
    card.querySelectorAll('.item').forEach(function (i) { i.classList.add('on'); });
    var f = card.querySelector('.foot'); if (f) f.classList.add('on');
    var tb = card.querySelector('.timer b'); if (tb) tb.textContent = '2.9';
  }

  /* Book-a-call form: GoHighLevel */
  var cfg = w.TW_CONFIG || {};
  var slot = d.getElementById('ghl-form');
  var native = d.getElementById('native-form');
  if (slot && cfg.ghlFormId) {
    var id = cfg.ghlFormId;
    slot.innerHTML = '<iframe src="https://api.leadconnectorhq.com/widget/form/' + id + '" id="inline-' + id + '" data-layout="{\'id\':\'INLINE\'}" data-trigger-type="alwaysShow" data-trigger-value="" data-activation-type="alwaysActivate" data-activation-value="" data-deactivation-type="neverDeactivate" data-deactivation-value="" data-form-name="Book a call" data-height="760" data-layout-iframe-id="inline-' + id + '" data-form-id="' + id + '" title="Book a call"></iframe>';
    var s = d.createElement('script'); s.src = 'https://link.msgsndr.com/js/form_embed.js'; d.body.appendChild(s);
    slot.hidden = false; if (native) native.hidden = true;
  } else if (native && !native.dataset.bound) {
    native.dataset.bound = '1';
    native.hidden = false; if (slot) slot.hidden = true;
    native.addEventListener('submit', function (e) {
      e.preventDefault();
      if (native.querySelector('.honey input') && native.querySelector('.honey input').value) return;
      var data = {};
      new FormData(native).forEach(function (v, k) { data[k] = data[k] ? data[k] + ', ' + v : v; });
      data.source = 'tradeworthy-website'; data.page = location.href; data.submitted_at = new Date().toISOString();
      var btn = native.querySelector('button[type=submit]'); if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var done = function () {
        var ok = d.getElementById('form-ok'); native.hidden = true; if (ok) { ok.hidden = false; ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      };
      if (cfg.ghlWebhook) {
        fetch(cfg.ghlWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(done).catch(function () { if (btn) { btn.disabled = false; btn.textContent = 'Try again'; } alert('Sorry — that did not send. Please call or email us instead.'); });
      } else { done(); }
    });
  }

  /* Cookie notice (strictly necessary only — no consent needed, so no banner). */

  /* Sting picker (Can we help?) */
  var stings = d.querySelectorAll('.sting'), ans = d.getElementById('sting-answer');
  if (stings.length && ans) {
    stings.forEach(function (b) {
      if (b.dataset.bound) return; b.dataset.bound = '1';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        stings.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        d.getElementById('sting-label').textContent = b.dataset.label;
        d.getElementById('sting-page').textContent = b.dataset.page;
        d.getElementById('sting-go').href = b.dataset.route;
        d.getElementById('sting-go').firstChild.textContent = 'See ' + b.dataset.page + ' ';
        d.getElementById('sting-book').href = '/book-a-call?about=' + encodeURIComponent(b.dataset.key);
        ans.hidden = false;
        try { sessionStorage.setItem('tw_sting', b.dataset.key + '|' + b.textContent.trim()); } catch (e) {}
      });
    });
  }

  /* Book-a-call: carry the sting through */
  var notes = d.getElementById('f-notes');
  if (notes && !notes.dataset.bound) {
    notes.dataset.bound = '1';
    var STING = { 'rings-out': 'The phone rings out while we\'re all on site', 'inbox': 'Enquiries land in an inbox and sit there', 'scraps': 'It\'s all in texts, emails and my head', 'quotes': 'Quotes go out and nothing comes back', 'smaller': 'People check us out and we look smaller than we are', 'quiet': 'It\'s quiet and I want the phone ringing' };
    var key = new URLSearchParams(w.TW_QUERY || location.search).get('about');
    if (key && STING[key] && !notes.value) { notes.value = 'What stings: ' + STING[key]; }
    var hid = d.createElement('input'); hid.type = 'hidden'; hid.name = 'sting'; hid.value = key || ''; notes.form && notes.form.appendChild(hid);
  }

  /* Lost revenue calculator (Why Tradeworthy) — opens at zero, no defaults, nothing stored or sent */
  var cm = d.getElementById('c-missed'), cv = d.getElementById('c-value'), cw = d.getElementById('c-win');
  if (cm && cv && cw && !cm.dataset.bound) {
    cm.dataset.bound = '1';
    var gbp = function (n) { return '£' + Math.round(n).toLocaleString('en-GB'); };
    var calc = function () {
      var m = parseFloat(cm.value) || 0, v = parseFloat(cv.value) || 0, p = Math.min(100, Math.max(0, parseFloat(cw.value) || 0));
      var jobs = m * 52 * (p / 100), year = jobs * v;
      var out = d.getElementById('c-year'), sub = d.getElementById('c-sub'), br = d.getElementById('c-break');
      var ready = m > 0 && v > 0 && p > 0;
      out.textContent = gbp(year); out.classList.toggle('empty', !ready);
      sub.textContent = ready ? 'a year, on the numbers you gave — ' + m + ' missed a week, ' + gbp(v) + ' a job, ' + p + '% turning into work.' : 'Fill in the three boxes and this works itself out.';
      br.hidden = !ready;
      d.getElementById('c-month').textContent = gbp(year / 12);
      d.getElementById('c-jobs').textContent = Math.round(jobs).toLocaleString('en-GB');
    };
    [cm, cv, cw].forEach(function (i) { i.addEventListener('input', calc); });
  }

  /* Flow hero: looping call → answered → captured → booked, plus pointer parallax */
  var art = d.getElementById('flow-art');
  if (art && !art.dataset.live) {
    art.dataset.live = '1';
    var timerEl = art.querySelector('.timer'), stateEl = art.querySelector('.caller .state'), titleEl = art.querySelector('.bar-title');
    var PH = [['p1', 2600], ['p2', 5200], ['p3', 2600], ['p4', 3600]];
    var setPhase = function (k) {
      art.classList.remove('p1', 'p2', 'p3', 'p4'); art.classList.add(k);
      /* The home hero shows a photo of the phone instead of the live call card, so
         these three are absent there. The phase classes still drive the app card and tiles. */
      if (!stateEl || !titleEl) return;
      if (k === 'p1') { stateEl.textContent = 'Ringing…'; titleEl.textContent = 'INCOMING CALL'; }
      if (k === 'p2') { stateEl.textContent = 'Answered in your business name'; titleEl.textContent = 'ON THE CALL'; }
      if (k === 'p3') { stateEl.textContent = 'Details taken'; titleEl.textContent = 'WRITTEN UP'; }
      if (k === 'p4') { stateEl.textContent = 'Booked into your diary'; titleEl.textContent = 'DONE'; }
    };
    if (reduce) { setPhase('p4'); if (timerEl) timerEl.textContent = '00:41'; }
    else {
      var idx = 0, t0 = Date.now();
      setPhase('p1');
      setInterval(function () {
        var el = Date.now() - t0;
        if (el > PH[idx][1]) { idx = (idx + 1) % PH.length; t0 = Date.now(); el = 0; setPhase(PH[idx][0]); }
        var s = 0;
        if (idx === 0) s = Math.min(3, el / 1000 * 1.15); else if (idx === 1) s = 3 + el / 1000 * 7; else if (idx === 2) s = 39 + el / 1000; else s = 41;
        var m = Math.floor(s / 60), r = Math.floor(s % 60);
        if (timerEl) timerEl.textContent = (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
      }, 100);
      /* parallax */
      var hero = art.closest('.hero'), layers = art.querySelectorAll('[data-depth]');
      if (hero && w.matchMedia('(pointer:fine)').matches) {
        var tx = 0, ty = 0, cx = 0, cy = 0, rafp = false;
        hero.addEventListener('mousemove', function (e) {
          var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
          if (!rafp) { rafp = true; requestAnimationFrame(step); }
        });
        hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!rafp) { rafp = true; requestAnimationFrame(step); } });
        var step = function () {
          cx += (tx - cx) * .08; cy += (ty - cy) * .08;
          layers.forEach(function (l) { var dp = parseFloat(l.dataset.depth) || 1; l.style.setProperty('--px', (cx * dp * -14) + 'px'); l.style.setProperty('--py', (cy * dp * -10) + 'px'); l.style.translate = 'var(--px) var(--py)'; });
          if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) requestAnimationFrame(step); else rafp = false;
        };
      }
    }
  }

  /* Journey stepper (first three months) */
  var journey = d.getElementById('journey');
  if (journey && !journey.dataset.bound) {
    journey.dataset.bound = '1';
    var steps = journey.querySelectorAll('.jstep'), fill = journey.querySelector('.jfill'), cur = 0, autoJ;
    var go = function (i) {
      cur = (i + steps.length) % steps.length;
      steps.forEach(function (s, k) { s.classList.toggle('on', k === cur); s.classList.toggle('done', k < cur); });
      if (fill) fill.style.width = (cur / (steps.length - 1) * 100) + '%';
      var st = steps[cur], body = d.getElementById('jbody');
      if (body) {
        d.getElementById('jnum').textContent = st.querySelector('b').textContent;
        d.getElementById('jcount').textContent = 'Step ' + (cur + 1) + ' of ' + steps.length;
        d.getElementById('jtitle').textContent = st.querySelector('strong').textContent;
        d.getElementById('jtext').textContent = st.querySelector('p').textContent;
        var nx = steps[(cur + 1) % steps.length]; d.getElementById('jnext').textContent = 'Next: ' + nx.querySelector('b').textContent + ' →';
        body.style.animation = 'none'; void body.offsetWidth; body.style.animation = '';
      }
    };
    steps.forEach(function (s, k) { s.addEventListener('click', function () { clearInterval(autoJ); go(k); }); s.setAttribute('tabindex', '0'); s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearInterval(autoJ); go(k); } }); });
    journey.querySelectorAll('.jbtn').forEach(function (b) { b.addEventListener('click', function () { clearInterval(autoJ); go(cur + parseInt(b.dataset.dir, 10)); }); });
    go(0);
    if (!reduce && 'IntersectionObserver' in w) {
      var jo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { autoJ = setInterval(function () { go(cur + 1); }, 2800); jo.disconnect(); } }, { threshold: .4 });
      jo.observe(journey);
    }
  }

  /* Map pins: label everything once the dashboard is in view */
  var mapEl = d.querySelector('.dash .map');
  if (mapEl && !mapEl.dataset.bound && 'IntersectionObserver' in w) {
    mapEl.dataset.bound = '1';
    var mo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { setTimeout(function () { mapEl.classList.add('in'); }, 600); mo.disconnect(); } }, { threshold: .5 });
    mo.observe(mapEl);
  }

  /* Add-on tabs (theme B home) */
  var tabbar = d.querySelector('.tabbar');
  if (tabbar && !tabbar.dataset.bound) {
    tabbar.dataset.bound = '1';
    var tabs = tabbar.querySelectorAll('[role=tab]'), panels = d.querySelectorAll('.tabpanel');
    var pick = function (name) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.tab === name ? 'true' : 'false'); });
      panels.forEach(function (p) { p.classList.toggle('on', p.dataset.panel === name); });
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { pick(t.dataset.tab); }); });
    tabbar.addEventListener('keydown', function (e) {
      var i = Array.prototype.indexOf.call(tabs, d.activeElement); if (i < 0) return;
      if (e.key === 'ArrowRight') { tabs[(i + 1) % tabs.length].focus(); pick(tabs[(i + 1) % tabs.length].dataset.tab); }
      if (e.key === 'ArrowLeft') { tabs[(i - 1 + tabs.length) % tabs.length].focus(); pick(tabs[(i - 1 + tabs.length) % tabs.length].dataset.tab); }
    });
    /* rotate through the tabs slowly until someone clicks */
    if (!reduce) {
      var order = ['present', 'boost', 'convert'], k = 0, auto = setInterval(function () { k = (k + 1) % order.length; pick(order[k]); }, 6000);
      tabbar.addEventListener('click', function () { clearInterval(auto); }, { once: true });
    }
  }

  /* Year */
  d.querySelectorAll('.year').forEach(function (y) { y.textContent = new Date().getFullYear(); });
}
window.TWinit = TWinit;
TWinit();
