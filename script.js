(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav: fondo sólido al hacer scroll
  var nav = document.getElementById('nav');

  // Menú móvil
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.toggle('show');
      nav.classList.toggle('open', menu.classList.contains('show'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('show');
        nav.classList.remove('open');
      });
    });
  }

  // Formulario de registro (solo existe en index.html)
  var sendBtn = document.getElementById('send');
  if (sendBtn) {
    sendBtn.addEventListener('click', function () {
      var v = document.getElementById('email').value;
      if (v.indexOf('@') > -1) {
        document.getElementById('form').style.display = 'none';
        document.getElementById('done').style.display = 'block';
      }
    });
  }

  // Aparición progresiva de bloques al entrar en pantalla.
  // Se usa IntersectionObserver, más un barrido de respaldo en el scroll: con saltos
  // de scroll muy grandes el observador puede no llegar a ver el bloque intersectando
  // y el contenido se quedaría invisible para siempre.
  var pending = [].slice.call(document.querySelectorAll('.reveal'));

  function show(el) {
    el.classList.add('in');
    var i = pending.indexOf(el);
    if (i > -1) pending.splice(i, 1);
  }

  function sweepReveals() {
    if (!pending.length) return;
    var limit = window.innerHeight * 0.94;
    pending.slice().forEach(function (el) {
      if (el.getBoundingClientRect().top < limit) show(el);
    });
  }

  if (pending.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      pending.slice().forEach(show);
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
      pending.forEach(function (el) { io.observe(el); });
    }
  }

  // Contadores: animan la cifra la primera vez que se ven
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length) {
    var runCount = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1100;
      var t0 = performance.now();
      var tick = function (now) {
        var p = Math.min(1, (now - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (reduce || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
    } else {
      var ioN = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); ioN.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      nums.forEach(function (el) { ioN.observe(el); });
    }
  }

  // Barras de reparto: se llenan al entrar en pantalla
  var fills = document.querySelectorAll('.bar-fill[data-w]');
  if (fills.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      fills.forEach(function (el) { el.style.width = el.getAttribute('data-w'); });
    } else {
      var ioB = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.style.width = e.target.getAttribute('data-w');
            ioB.unobserve(e.target);
          }
        });
      }, { threshold: 0.4 });
      fills.forEach(function (el) { ioB.observe(el); });
    }
  }

  // Pestañas (gimnasio / calistenia)
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('.tab-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-tab');
        btns.forEach(function (b) {
          b.setAttribute('aria-selected', String(b === btn));
        });
        tabs.querySelectorAll('.tab-panel').forEach(function (p) {
          p.classList.toggle('show', p.id === id);
        });
      });
    });
  });

  // Scroll: nav sólido, barra de progreso, fondo giratorio y parallax de bandas
  var progress = document.getElementById('progress');
  var rotor = document.getElementById('rotor');
  var heroEl = document.querySelector('.hero');
  var strips = document.querySelectorAll('.strip img');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle('scrolled', y > 40);

    sweepReveals();

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }

    // El fondo giratorio no asoma detrás del hero: entra al dejarlo atrás
    // y empieza a girar desde cero a partir de ese punto.
    if (rotor) {
      var start = heroEl ? Math.max(0, heroEl.offsetHeight - window.innerHeight * 0.3) : 0;
      var past = y - start;
      rotor.classList.toggle('on', past > 0);
      if (!reduce) {
        rotor.style.setProperty('--rot', (Math.max(0, past) * 0.06).toFixed(2) + 'deg');
      }
    }

    if (strips.length && !reduce) {
      strips.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var rel = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          img.style.transform = 'translateY(' + (rel * -34).toFixed(1) + 'px)';
        }
      });
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll();
})();
