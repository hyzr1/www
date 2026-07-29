/* hyzr.ai front page — composer, demo replay, lecture stage */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- nav hairline ---------------- */
  var nav = document.querySelector(".nav");
  var onScroll = function () {
    nav.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- reveal on scroll ---------------- */
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealed.forEach(function (el) { ro.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- composer ---------------- */
  var form = document.getElementById("composer");
  var ta = document.getElementById("prompt");
  var send = document.getElementById("send");

  function autosize() {
    ta.style.height = "auto";
    var height = Math.min(ta.scrollHeight, 260);
    ta.style.height = height + "px";
    ta.style.overflowY = ta.scrollHeight > 260 ? "auto" : "hidden";
  }
  function syncSend() {
    send.disabled = !ta.value.trim();
  }
  ta.addEventListener("input", function () { autosize(); syncSend(); });
  ta.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (ta.value.trim()) form.submit();
    }
  });
  form.addEventListener("submit", function (e) {
    if (!ta.value.trim()) e.preventDefault();
  });

  document.querySelectorAll(".suggestion").forEach(function (chip) {
    chip.addEventListener("click", function () {
      ta.value = chip.getAttribute("data-prompt");
      ta.focus();
      autosize();
      syncSend();
    });
  });

  /* Cycling placeholder — types real prompts while the field is idle. */
  var IDLE_PROMPTS = [
    "Ask anything — Hyzr Chat routes it to the right model",
    "Build a pricing page with a comparison table and dark mode",
    "Refactor my API layer and prove nothing broke",
    "Explain this codebase like I just joined the team",
    "Ship a landing page to a new GitHub repo"
  ];
  if (!reducedMotion) {
    var promptIndex = 0, charIndex = 0, deleting = false, holdUntil = 0;
    var typeTimer = window.setInterval(function () {
      if (document.activeElement === ta || ta.value) return;
      var now = Date.now();
      if (now < holdUntil) return;
      var target = IDLE_PROMPTS[promptIndex];
      if (!deleting) {
        charIndex++;
        if (charIndex >= target.length) {
          charIndex = target.length;
          deleting = true;
          holdUntil = now + 2600;
        }
      } else {
        charIndex -= 3;
        if (charIndex <= 0) {
          charIndex = 0;
          deleting = false;
          promptIndex = (promptIndex + 1) % IDLE_PROMPTS.length;
          holdUntil = now + 350;
        }
      }
      ta.setAttribute("placeholder", target.slice(0, Math.max(0, charIndex)));
    }, 38);
    window.addEventListener("pagehide", function () { window.clearInterval(typeTimer); });
  }

  /* ---------------- route band: tools fly into the Hyzr mark (GSAP) ---------------- */
  var routeStage = document.getElementById("route-stage");
  var routeFallback = document.getElementById("route-fallback");
  var hasGsap = typeof window.gsap !== "undefined";
  if (routeStage && hasGsap && !reducedMotion) {
    window.gsap.registerPlugin(window.MotionPathPlugin);
    var ROUTE_ICONS = ["claude", "openai-mark", "github", "vscode", "git", "typescript", "python", "react", "nodedotjs"];
    var ROUTE_PATHS = ["#rp1", "#rp2", "#rp3", "#rp4"];
    var routeHub = document.getElementById("route-hub");
    var routeRing = routeStage.querySelector(".route-ring");
    var routeIconIndex = 0;

    var pulseHub = function () {
      window.gsap.fromTo(routeHub, { scale: 1 }, { scale: 1.1, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out", overwrite: "auto",
        onComplete: function () { window.gsap.set(routeHub, { scale: 1 }); } });
      window.gsap.fromTo(routeRing, { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.55, duration: 0.7, ease: "power2.out", overwrite: true });
    };

    var launchTile = function (pathSel) {
      var name = ROUTE_ICONS[routeIconIndex++ % ROUTE_ICONS.length];
      var tile = document.createElement("span");
      tile.className = "tile route-tile";
      tile.innerHTML = '<img src="assets/icons/' + name + '.svg" alt="" />';
      routeStage.appendChild(tile);
      var duration = 5.4 + Math.random() * 1.6;
      var tl = window.gsap.timeline({
        onComplete: function () {
          tile.remove();
          launchTile(pathSel);
        }
      });
      tl.to(tile, { motionPath: { path: pathSel, align: pathSel, alignOrigin: [0.5, 0.5] }, duration: duration, ease: "power1.in" }, 0)
        .fromTo(tile, { opacity: 0, scale: 0.5, rotation: -8 + Math.random() * 16 }, { opacity: 1, scale: 1, rotation: 0, duration: 1.1, ease: "power2.out" }, 0)
        .to(tile, { opacity: 0, scale: 0.25, duration: 0.55, ease: "power2.in" }, duration - 0.55)
        .call(pulseHub, [], duration - 0.35);
    };

    var routeStarted = false;
    var routeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !routeStarted) {
          routeStarted = true;
          ROUTE_PATHS.forEach(function (path, i) {
            window.gsap.delayedCall(i * 1.4, function () { launchTile(path); });
            window.gsap.delayedCall(i * 1.4 + 3.1, function () { launchTile(path); });
          });
          routeObserver.unobserve(routeStage);
        }
      });
    }, { threshold: 0.3 });
    routeObserver.observe(routeStage);
  } else if (routeFallback) {
    routeFallback.hidden = false;
    var fallbackPaths = routeStage && routeStage.querySelector(".route-paths");
    if (fallbackPaths) fallbackPaths.style.display = "none";
    var fallbackHub = document.getElementById("route-hub");
    if (fallbackHub) fallbackHub.style.display = "none";
  }

  /* ---------------- footer wordmark reveal (GSAP) ---------------- */
  if (hasGsap && typeof window.ScrollTrigger !== "undefined" && !reducedMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.fromTo(".fw-char",
      { yPercent: 108 },
      { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.07,
        scrollTrigger: { trigger: ".foot-wordmark", start: "top 94%", once: true } });
  }

  /* ---------------- footer subscribe ---------------- */
  var subscribe = document.getElementById("subscribe");
  if (subscribe) {
    subscribe.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = subscribe.querySelector("input").value.trim();
      if (!email) return;
      window.location.href = "mailto:hyzrai@gmail.com?subject=" +
        encodeURIComponent("Subscribe to Hyzr updates") +
        "&body=" + encodeURIComponent("Please add " + email + " to the Hyzr updates list.");
    });
  }

  /* ---------------- icons for the demo ---------------- */
  function icon(kind, size) {
    var paths = {
      route: '<circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8 19h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h1"/>',
      code: '<path d="M8 6 3 12l5 6M16 6l5 6-5 6"/>',
      file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
      terminal: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 9l3 3-3 3M13 15h4"/>',
      shield: '<path d="M12 3l7 3v5c0 4.4-2.9 8.2-7 10-4.1-1.8-7-5.6-7-10V6l7-3Z"/>',
      eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      sparkles: '<path d="M12 3.2l1.7 4.6 4.6 1.7-4.6 1.7L12 15.8l-1.7-4.6L5.7 9.5l4.6-1.7z"/>'
    };
    return '<svg viewBox="0 0 24 24" class="i" width="' + size + '" height="' + size + '">' + paths[kind] + "</svg>";
  }

  /* ---------------- product demo replay ---------------- */
  var thread = document.getElementById("af-thread");
  var frame = document.getElementById("app-frame");
  var runBadge = document.getElementById("af-run");
  var taskCount = document.getElementById("af-taskcount");
  var afTitle = document.getElementById("af-title");

  var SUBTASKS = [
    { label: "Layout, tokens, and responsive grid", tier: "standard" },
    { label: "Monthly / annual toggle + comparison table", tier: "standard" },
    { label: "Accessibility and visual verification", tier: "hard" }
  ];
  var STEPS = [
    { kind: "route", label: "Routing 3 tasks by capability — 2 models selected" },
    { kind: "file", label: "Reading project structure and design tokens" },
    { kind: "code", label: "Editing pricing.tsx — comparison table, 4 plans" },
    { kind: "code", label: "Editing theme.css — dark mode via prefers-color-scheme" },
    { kind: "terminal", label: "Running type checks and unit tests" },
    { kind: "eye", label: "Capturing desktop and mobile screenshots" },
    { kind: "shield", label: "Verifying acceptance criteria independently" }
  ];
  var EVIDENCE = ["Type check", "14 unit tests", "Contrast AA", "2 screenshots"];

  function el(html) {
    var div = document.createElement("div");
    div.innerHTML = html.trim();
    return div.firstChild;
  }
  function scrollThread() {
    thread.scrollTo({ top: thread.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }

  var demoTimers = [];
  function after(ms, fn) { demoTimers.push(window.setTimeout(fn, ms)); }

  function runDemo() {
    demoTimers.forEach(window.clearTimeout);
    demoTimers = [];
    thread.innerHTML = "";
    runBadge.hidden = true;
    taskCount.hidden = true;
    afTitle.textContent = "New project";

    var t = 600;

    /* 1 — the request */
    after(t, function () {
      thread.appendChild(el('<div class="dm dm-user">Build a pricing page with a monthly/annual toggle, a plan comparison table, and dark mode.</div>'));
      afTitle.textContent = "Pricing page with comparison table";
      scrollThread();
    });

    /* 2 — the plan */
    t += 1100;
    after(t, function () {
      runBadge.hidden = false;
      taskCount.hidden = false;
      var plan = el(
        '<div class="dm dm-plan"><div class="dm-plan-head">' + icon("route", 14) +
        ' Planned 3 specialist tasks <em>routed by capability</em></div>' +
        SUBTASKS.map(function (s, i) {
          return '<div class="dm-sub" data-sub="' + i + '"><span class="st"><span class="spinner" hidden></span><span class="q">·</span></span>' +
            s.label + '<span class="tier">' + s.tier + "</span></div>";
        }).join("") + "</div>"
      );
      thread.appendChild(plan);
      scrollThread();
    });

    /* 3 — subtasks light up while steps stream */
    var stepsBox = null;
    t += 900;
    after(t, function () {
      stepsBox = el('<div class="dm dm-steps"></div>');
      thread.appendChild(stepsBox);
    });

    STEPS.forEach(function (step, i) {
      t += i === 0 ? 200 : 1150;
      after(t, function () {
        if (!stepsBox) return;
        var prev = stepsBox.querySelector(".dm-step.active");
        if (prev) prev.classList.remove("active");
        stepsBox.appendChild(el('<div class="dm-step active">' + icon(step.kind, 13) + step.label + "</div>"));
        var subIndex = i < 2 ? 0 : i < 4 ? 1 : 2;
        for (var s = 0; s <= subIndex; s++) {
          var row = thread.querySelector('[data-sub="' + s + '"]');
          if (!row) continue;
          var active = s === subIndex && i < STEPS.length - 1;
          row.querySelector(".spinner").hidden = !active;
          row.querySelector(".q").hidden = true;
          if (!active && !row.classList.contains("done")) {
            row.classList.add("done");
            row.querySelector(".st").innerHTML = icon("check", 13);
          }
        }
        scrollThread();
      });
    });

    /* 4 — the delivery */
    t += 1400;
    after(t, function () {
      var last = thread.querySelector('[data-sub="2"]');
      if (last && !last.classList.contains("done")) {
        last.classList.add("done");
        last.querySelector(".st").innerHTML = icon("check", 13);
      }
      var active = thread.querySelector(".dm-step.active");
      if (active) active.classList.remove("active");
      runBadge.hidden = true;
      var answer = el(
        '<div class="dm dm-answer"><p>Done. The pricing page is live in this project’s workspace with four plans, an annual discount toggle, and full dark-mode support. Every acceptance criterion passed independent verification.</p>' +
        '<div class="dm-evidence">' + EVIDENCE.map(function (e) {
          return '<span class="dm-chip">' + icon("check", 11) + e + "</span>";
        }).join("") + "</div>" +
        '<div class="dm-usage">4 model calls · 2 zero-model operations · 41% under token budget</div></div>'
      );
      thread.appendChild(answer);
      scrollThread();
    });

    /* loop */
    t += 7000;
    after(t, runDemo);
  }

  if (frame) {
    if (reducedMotion) {
      /* Render the finished state once, no animation. */
      runDemo = null;
      thread.innerHTML = "";
      thread.appendChild(el('<div class="dm dm-user">Build a pricing page with a monthly/annual toggle, a plan comparison table, and dark mode.</div>'));
      var plan = '<div class="dm dm-plan"><div class="dm-plan-head">' + icon("route", 14) + ' Planned 3 specialist tasks <em>routed by capability</em></div>' +
        SUBTASKS.map(function (s) {
          return '<div class="dm-sub done"><span class="st">' + icon("check", 13) + "</span>" + s.label + '<span class="tier">' + s.tier + "</span></div>";
        }).join("") + "</div>";
      thread.appendChild(el(plan));
      thread.appendChild(el(
        '<div class="dm dm-answer"><p>Done. The pricing page is live in this project’s workspace with four plans, an annual discount toggle, and full dark-mode support.</p>' +
        '<div class="dm-evidence">' + EVIDENCE.map(function (e) { return '<span class="dm-chip">' + icon("check", 11) + e + "</span>"; }).join("") + "</div></div>"
      ));
      afTitle.textContent = "Pricing page with comparison table";
    } else {
      var started = false;
      var demoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            runDemo();
            demoObserver.unobserve(frame);
          }
        });
      }, { threshold: 0.35 });
      demoObserver.observe(frame);
    }
  }

  /* ---------------- hyzr code lecture stage ---------------- */
  var stage = document.getElementById("stage");
  var stageTitle = document.getElementById("stage-title");
  var stageCode = document.getElementById("stage-code");
  var stageTime = document.getElementById("stage-time");
  var waveBars = stage ? Array.prototype.slice.call(stage.querySelectorAll(".stage-wave i")) : [];
  var pips = stage ? Array.prototype.slice.call(stage.querySelectorAll(".scene-rail .pip")) : [];

  var SCENES = [
    { title: "A function remembers where it was born.", code: false, lit: [] },
    { title: "", code: true, lit: [] },
    { title: "", code: true, lit: [3] },
    { title: "", code: true, lit: [7] },
    { title: "That's a closure — scope that outlives the call.", code: false, lit: [] }
  ];
  var SCENE_MS = 3400;

  if (stage && !reducedMotion) {
    var sceneIndex = 0;
    var stageStart = Date.now();

    var showScene = function (scene) {
      if (scene.code) {
        stageTitle.hidden = true;
        stageCode.hidden = false;
        var lines = stageCode.querySelectorAll(".ln");
        lines.forEach(function (line, n) {
          line.classList.toggle("lit", scene.lit.indexOf(n + 1) !== -1);
        });
      } else {
        stageCode.hidden = true;
        stageTitle.hidden = false;
        stageTitle.classList.add("out");
        window.setTimeout(function () {
          stageTitle.textContent = scene.title;
          stageTitle.classList.remove("out");
        }, 220);
      }
    };

    var tickStage = function () {
      sceneIndex = (sceneIndex + 1) % SCENES.length;
      if (sceneIndex === 0) stageStart = Date.now();
      showScene(SCENES[sceneIndex]);
      pips.forEach(function (pip, n) {
        pip.classList.toggle("on", n <= Math.min(sceneIndex, pips.length - 1));
      });
    };

    var stageRunning = false;
    var stageTimers = [];
    var startStage = function () {
      if (stageRunning) return;
      stageRunning = true;
      stage.classList.add("playing");
      stageStart = Date.now();
      stageTimers.push(window.setInterval(tickStage, SCENE_MS));
      stageTimers.push(window.setInterval(function () {
        var total = SCENES.length * SCENE_MS;
        var elapsed = (Date.now() - stageStart) % total;
        var fraction = elapsed / total;
        waveBars.forEach(function (bar, n) {
          bar.classList.toggle("played", n / waveBars.length <= fraction);
        });
        var seconds = Math.floor(elapsed / 1000);
        stageTime.textContent = "0:" + (seconds < 10 ? "0" : "") + seconds;
      }, 250));
    };

    var stageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startStage();
      });
    }, { threshold: 0.4 });
    stageObserver.observe(stage);

    document.getElementById("stage-play").addEventListener("click", startStage);
  } else if (stage) {
    stageCode.hidden = false;
    stageTitle.hidden = true;
    pips.forEach(function (pip) { pip.classList.add("on"); });
    waveBars.forEach(function (bar) { bar.classList.add("played"); });
  }
})();
