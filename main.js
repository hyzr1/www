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

  /* ---------------- route band: tools in, verified software out (GSAP) ---------------- */
  var routeStage = document.getElementById("route-stage");
  var hasGsap = typeof window.gsap !== "undefined";
  if (routeStage && hasGsap && !reducedMotion && typeof window.MotionPathPlugin !== "undefined") {
    window.gsap.registerPlugin(window.MotionPathPlugin);
    var routeSvg = document.getElementById("route-lines");
    var routeLines = Array.prototype.slice.call(routeStage.querySelectorAll(".rl"));
    var routeRing = routeStage.querySelector(".route-ring");

    var startPulses = function () {
      routeLines.forEach(function (path, i) {
        var isOut = path.classList.contains("out");
        var pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pulse.setAttribute("r", "3.4");
        pulse.setAttribute("class", "rl-pulse" + (isOut ? " out" : ""));
        routeSvg.appendChild(pulse);
        var duration = 2.1 + (i % 3) * 0.55;
        var tl = window.gsap.timeline({ repeat: -1, delay: i * 0.5, repeatDelay: 0.9 });
        tl.to(pulse, { motionPath: { path: "#" + path.id, align: "#" + path.id, alignOrigin: [0.5, 0.5] }, duration: duration, ease: "power1.inOut" }, 0)
          .fromTo(pulse, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0)
          .to(pulse, { opacity: 0, duration: 0.35 }, duration - 0.35);
      });
      window.gsap.fromTo(routeRing,
        { opacity: 0.8, scale: 1 },
        { opacity: 0, scale: 1.45, duration: 1.3, ease: "power2.out", repeat: -1, repeatDelay: 1.5 });
    };

    var routeStarted = false;
    var routeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !routeStarted) {
          routeStarted = true;
          var remaining = routeLines.length;
          routeLines.forEach(function (path, i) {
            var length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            window.gsap.to(path, {
              strokeDashoffset: 0,
              duration: 1.1,
              delay: i * 0.09,
              ease: "power2.out",
              onComplete: function () { if (--remaining === 0) startPulses(); }
            });
          });
          routeObserver.unobserve(routeStage);
        }
      });
    }, { threshold: 0.3 });
    routeObserver.observe(routeStage);
  }

  /* ---------------- footer wordmark reveal — same params as the studio site ---------------- */
  if (hasGsap && typeof window.ScrollTrigger !== "undefined" && !reducedMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.from(".fw-char", {
      yPercent: 110,
      duration: 1.2,
      stagger: 0.07,
      ease: "expo.out",
      scrollTrigger: { trigger: ".footer", start: "top 80%", once: true }
    });
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

  /* ---------------- product demo replay: GSAP timeline over real markup ---------------- */
  var thread = document.getElementById("af-thread");
  var frame = document.getElementById("app-frame");
  var runBadge = document.getElementById("af-run");
  var taskCount = document.getElementById("af-taskcount");

  if (frame && thread) {
    var demoSteps = Array.prototype.slice.call(thread.querySelectorAll(".ds"));
    var subStatuses = Array.prototype.slice.call(thread.querySelectorAll(".as-status"));
    var apProgress = document.getElementById("ap-progress");
    var apCostbar = document.getElementById("ap-costbar");
    var apTime = document.getElementById("ap-time");
    var apTokens = document.getElementById("ap-tokens");
    var apBudget = document.getElementById("ap-budget");
    var apCost = document.getElementById("ap-cost");
    var apTasks = document.getElementById("ap-tasks");
    var CHECK_SVG = '<svg viewBox="0 0 24 24" class="i" width="12" height="12" style="--sw:2.2"><path d="M20 6 9 17l-5-5"/></svg>';

    var setStatusDone = function (el) {
      el.classList.add("done");
      el.innerHTML = CHECK_SVG + " " + el.getAttribute("data-done");
    };
    var resetStatuses = function () {
      subStatuses.forEach(function (el) {
        el.classList.remove("done");
        el.innerHTML = '<span class="spinner"></span>';
      });
      apTasks.textContent = "0/3";
    };
    var showFinalState = function () {
      demoSteps.forEach(function (el) { el.style.opacity = "1"; });
      subStatuses.forEach(setStatusDone);
      apProgress.style.width = "68%";
      apCostbar.style.width = "68%";
      apTime.textContent = "11m 45s";
      apTokens.textContent = "611,480";
      apBudget.textContent = "68%";
      apCost.textContent = "$4.067";
      apTasks.textContent = "3/3";
    };

    if (hasGsap && !reducedMotion) {
      var counters = { seconds: 0, tokens: 0, budget: 0, cost: 0 };
      var renderCounters = function () {
        var m = Math.floor(counters.seconds / 60);
        var s = Math.floor(counters.seconds % 60);
        apTime.textContent = m + "m " + (s < 10 ? "0" : "") + s + "s";
        apTokens.textContent = Math.round(counters.tokens).toLocaleString("en-US");
        apBudget.textContent = Math.round(counters.budget) + "%";
        apCost.textContent = "$" + counters.cost.toFixed(3);
      };
      var scrollDemo = function () {
        thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
      };

      window.gsap.set(demoSteps, { autoAlpha: 0, y: 14 });

      var tl = window.gsap.timeline({ paused: true, repeat: -1, repeatDelay: 7 });
      var reveal = function (target, at) {
        tl.fromTo(target, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }, at);
        tl.call(scrollDemo, [], at + 0.15);
      };

      tl.call(function () {
        resetStatuses();
        runBadge.hidden = false;
        taskCount.hidden = false;
        thread.scrollTop = 0;
      }, [], 0);

      reveal(".afx-you", 0.15);
      reveal(".afx-user", 0.3);
      reveal(".afx-plan", 1.2);

      tl.fromTo(counters, { seconds: 0, tokens: 0, budget: 0, cost: 0 },
        { seconds: 705, tokens: 611480, budget: 68, cost: 4.067, duration: 10.5, ease: "power1.inOut", onUpdate: renderCounters }, 1.4);
      tl.fromTo(apProgress, { width: "0%" }, { width: "68%", duration: 10.5, ease: "power1.inOut" }, 1.4);
      tl.fromTo(apCostbar, { width: "0%" }, { width: "68%", duration: 10.5, ease: "power1.inOut" }, 1.4);

      reveal(".afx-contract", 2.1);
      reveal(".afx-objective", 2.7);

      var subs = thread.querySelectorAll(".afx-sub");
      reveal(subs[0], 3.4);
      reveal(subs[1], 4.0);
      reveal(subs[2], 4.6);

      tl.call(function () { setStatusDone(subStatuses[0]); apTasks.textContent = "1/3"; }, [], 6.2);
      tl.call(function () { setStatusDone(subStatuses[1]); apTasks.textContent = "2/3"; }, [], 8.6);
      tl.call(function () { setStatusDone(subStatuses[2]); apTasks.textContent = "3/3"; }, [], 11.2);

      reveal(".afx-answer", 12.1);
      tl.call(function () { runBadge.hidden = true; }, [], 12.4);
      tl.to({}, { duration: 6 }, 12.5);

      var demoStarted = false;
      var demoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !demoStarted) {
            demoStarted = true;
            tl.play();
            demoObserver.unobserve(frame);
          }
        });
      }, { threshold: 0.3 });
      demoObserver.observe(frame);
    } else {
      showFinalState();
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
