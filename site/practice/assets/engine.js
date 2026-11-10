/*
  Practice application engine, by Drew Cannedy.
  Shared by every practice portal: résumé dock, document viewer, drag or button upload,
  the profile form, scoring against each résumé's truth, coach notes, and completion codes.
  Privacy:
  - What's stored: only the Coach notes on/off setting, in sessionStorage, for this visit.
    Nothing typed into the form is saved anywhere.
  - Real files are never opened or read; only a real file's name is shown on the page.
  - What leaves the page: nothing, except the optional "Ask the coach" box, which only appears
    when the site's /api/coach function is set up. It sends the portal, the step, the names of
    the buttons on screen, the practice résumé's file name (a learner's own file is only ever
    called "the learner's own file"), the question, and the last 6 questions and answers.
    All of it is scrubbed of emails, phone numbers, names and passwords first. Nothing the
    learner typed into the application is sent.
*/
(function () {
  "use strict";

  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
  var CREDS = ["", "High school diploma", "GED", "Some college", "Certificate", "Associate degree", "Bachelor's degree", "Other"];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function ym(m, y) { return (+y) * 12 + (+m); }
  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim()); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function byId(id) { return document.getElementById(id); }
  function val(id) { var el = byId(id); return el ? el.value : ""; }
  function checked(id) { var el = byId(id); return !!(el && el.checked); }
  function fmtDate(m, y) { return m && y ? MONTHS[m - 1] + " " + y : ""; }
  function plural(n, one, many) { return n === 1 ? one : (many || one + "s"); }

  /* ---------- practice bar and coach ---------- */
  var hintsOn = true, hintListeners = [];
  /* Coach notes on/off carries from page to page for this visit (sessionStorage can be blocked, so it's optional) */
  function savedHints() { try { return sessionStorage.getItem("practice-hints"); } catch (e) { return null; } }
  function saveHints() { try { sessionStorage.setItem("practice-hints", hintsOn ? "on" : "off"); } catch (e) {} }
  function initBar() {
    var t = byId("hintToggle"), l = byId("hintLabel");
    if (!t) return;
    function show() {
      t.setAttribute("aria-pressed", String(hintsOn));
      l.textContent = hintsOn ? "Coach notes on" : "Coach notes off";
      document.body.classList.toggle("hints-off", !hintsOn);
    }
    if (savedHints() === "off") { hintsOn = false; show(); }
    t.addEventListener("click", function () {
      hintsOn = !hintsOn; show(); saveHints();
      hintListeners.forEach(function (fn) { fn(hintsOn); });
    });
    /* Coming back with the browser's Back button can show this page from memory: use the setting chosen on the other page */
    window.addEventListener("pageshow", function (e) {
      if (!e.persisted) return;
      var want = savedHints() !== "off";
      if (want === hintsOn) { show(); return; }
      hintsOn = want; show();
      hintListeners.forEach(function (fn) { fn(hintsOn); });
    });
  }

  /* Warn before leaving the page while an application is under way (Back to job board, browser Back, closing the tab).
     iPhones ignore the browser's leave warning, so the site's own leave links ask first. */
  var inProgress = false, skipUnload = false, skipTimer = 0;
  var LEAVE_MSG = "Leave this application? What you've done here will be lost.";
  function setInProgress(on) { inProgress = !!on; }
  function confirmLeave() {
    if (!inProgress) return true;
    if (!window.confirm(LEAVE_MSG)) return false;
    skipUnload = true; // they already said yes, so don't ask again on the way out
    clearTimeout(skipTimer); skipTimer = setTimeout(function () { skipUnload = false; }, 3000);
    return true;
  }
  window.addEventListener("beforeunload", function (e) { if (inProgress && !skipUnload) { e.preventDefault(); e.returnValue = ""; } });
  window.addEventListener("pageshow", function () { skipUnload = false; });
  document.addEventListener("click", function (e) {
    if (!inProgress || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // a new tab doesn't leave this page
    var a = e.target && e.target.closest && e.target.closest("a.back-board, [data-leave]");
    if (!a || (a.target && a.target !== "_self")) return;
    if (!confirmLeave()) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* Compare names and signatures the way a person would: curly or straight quotes, quotes around a
     nickname ('Mike'), extra spaces and case don't matter. Apostrophes inside a name (O'Brien) still count. */
  function sameName(a, b) {
    function norm(s) {
      return String(s || "").replace(/[\u2018\u2019\u201A\u201B\u2032`\u00B4]/g, "'").replace(/[\u201C\u201D\u201E\u2033"]/g, "")
        .replace(/(^|[\s(])'+/g, "$1").replace(/'+(?=[\s),]|$)/g, "")
        .replace(/\s+/g, " ").trim().toLowerCase();
    }
    return norm(a) === norm(b);
  }

  /* First number in what someone typed: "37.5" -> 37.5, ".5" -> 0.5, "22,50" -> 22.5, "52,000" -> 52000,
     "45 000" -> 45000, "52k" -> 52000, "$21-23" -> 21, "abc" -> NaN */
  function num(s) {
    var t = String(s == null ? "" : s)
      .replace(/(\d)[ \u00A0\u202F](?=\d{3}(?!\d))/g, "$1")
      .replace(/(\d),(\d{1,2})(?!\d)/, "$1.$2").replace(/,/g, "");
    var m = t.match(/(\d+(?:\.\d+)?|\.\d+)\s*([kK](?![A-Za-z]))?/);
    if (!m) return NaN;
    var n = parseFloat(m[1]);
    return m[2] ? Math.round(n * 1000 * 1e6) / 1e6 : n;
  }
  function coach(notes, extraHtml) {
    var el = byId("coach");
    if (!el) return;
    var has = (notes && notes.length) || extraHtml;
    if (!has && ai.state !== "ready") { el.innerHTML = ""; el.hidden = true; return; }
    el.hidden = false;
    var html = has ? '<p class="who">Coach note</p>' + (notes || []).map(function (n) { return "<p>" + esc(n) + "</p>"; }).join("") + (extraHtml || "") : "";
    if (askBox) {
      /* Swap the note around the Ask box without moving the box, so a learner typing a question keeps their place.
         (Sunny Side redraws the note after every bot message.) */
      var q = askBox.querySelector("textarea"), typing = !!q && document.activeElement === q, s0 = 0, s1 = 0, sd = "none";
      if (typing) { try { s0 = q.selectionStart; s1 = q.selectionEnd; sd = q.selectionDirection || "none"; } catch (e) {} }
      Array.prototype.slice.call(el.childNodes).forEach(function (n) { if (n !== askBox) el.removeChild(n); });
      if (askBox.parentNode !== el) el.appendChild(askBox);
      askBox.insertAdjacentHTML("beforebegin", html);
      if (typing && document.activeElement !== q) {
        q.focus({ preventScroll: true });
        try { q.setSelectionRange(s0, s1, sd); } catch (e) {}
      }
    } else el.innerHTML = html + '<div class="ask" data-ask hidden></div>';
    aiCheck(function (ok) { if (ok) mountAsk(el); });
  }

  /* ---------- AI coach (optional) ----------
     The "Ask the coach" box only appears when the site's /api/coach function is deployed and
     has a key. It sends the portal, the step, the names of the buttons on screen, the practice
     résumé's file name, the question and the last 6 exchanges, all scrubbed. Nothing from the form. */
  var ai = { state: "unknown", cbs: [] };
  var askBox = null;      // built once per page, moved into each new coach note so an answer on its way still lands
  var askHistory = [];    // the last six questions and answers, so follow-ups make sense
  function aiCheck(cb) {
    if (ai.state === "ready" || ai.state === "off") { cb(ai.state === "ready"); return; }
    ai.cbs.push(cb);
    if (ai.state === "checking") return;
    ai.state = "checking";
    function done(ok) {
      ai.state = ok ? "ready" : "off";
      if (ok) aiBarNote();
      var list = ai.cbs; ai.cbs = [];
      list.forEach(function (f) { f(ok); });
    }
    if (!window.fetch || location.protocol === "file:") { done(false); return; }
    fetch("/api/coach", { headers: { accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { done(!!(d && d.ready)); })
      .catch(function () { done(false); });
  }
  function aiBarNote() {
    var p = document.querySelector(".practice-bar .inner p");
    var line = portalId() === "hub" ? "Your searches never leave this page. Questions you ask the coach are answered by an AI." : "Nothing in the application leaves this page. Questions you ask the coach are answered by an AI.";
    if (p) p.innerHTML = p.innerHTML.replace(/Nothing you type( or upload)? leaves this page\./, line);
  }
  /* Take out what a learner might type about themselves before a question leaves the page.
     Keep these rules the same as scrub() in netlify/functions/coach.mjs. */
  /* Names: only after a lead like "my name is" ("the last name is wrong" stays). "Soy" and "I'm" count only
     before a capitalized word. The first word goes, then up to two more while they look like a name
     (capitalized, or lowercase and not a small word like "and" or "from"). */
  var NAME_LEAD = /\b(my name is|my name['’]s|i am called|call me|me llamo|mi nombre es|magacaygu waa|magacayga waa|tên tôi là|tôi tên là|tên em là|kuv lub npe yog|soy|i['’]m)([ \t]*:?[ \t]+)(\S+(?:[ \t]+\S+){0,2})/gi;
  var NAME_STOP = { and: 1, i: 1, im: 1, am: 1, from: 1, "in": 1, at: 1, is: 1, my: 1, the: 1, a: 1, to: 1, "for": 1, "with": 1, but: 1, so: 1, y: 1, de: 1, la: 1, el: 1, con: 1, en: 1, iyo: 1 };
  var NAME_SKIP = {}; "not wrong missing showing spelled blank empty correct right there here too also on off cut still now different changed typed written shown listed gone".split(" ").forEach(function (w) { NAME_SKIP[w] = 1; }); // "my name is not showing"
  function isUpper(c) { return c !== c.toLowerCase(); }
  function isLower(c) { return c !== c.toUpperCase() && c === c.toLowerCase(); }
  function isLetter(c) { return c.toLowerCase() !== c.toUpperCase() || /[̀-ͯ֐-ۿऀ-෿฀-࿿က-፿぀-鿿가-힯]/.test(c); }
  /* a word that starts with a letter (letters, apostrophes, hyphens), and whatever follows it in the same chunk, like a comma */
  function nameWord(tok) {
    if (!tok || !isLetter(tok.charAt(0))) return null;
    var i = 1;
    while (i < tok.length && (isLetter(tok.charAt(i)) || /['’-]/.test(tok.charAt(i)))) i++;
    return [tok, tok.slice(0, i), tok.slice(i)];
  }
  function scrubNames(s) {
    var out = "", from = 0, m;
    NAME_LEAD.lastIndex = 0;
    while ((m = NAME_LEAD.exec(s))) {
      var toks = m[3].split(/([ \t]+)/), first = nameWord(toks[0]); // words at even places, spaces between
      if (!first || (/^(?:soy|i['’]m)$/i.test(m[1]) && !isUpper(first[1].charAt(0))) || NAME_SKIP[first[1].toLowerCase()]) { NAME_LEAD.lastIndex = m.index + 1; continue; }
      var n = 1, tail = first[2];
      while (!tail && n < 3 && toks.length > 2 * n) {
        var w = nameWord(toks[2 * n]);
        if (!w) break;
        var low = w[1].toLowerCase().replace(/['’]/g, ""), c = w[1].charAt(0);
        if (isUpper(c) ? low === "i" || low === "im" : !isLower(c) || NAME_STOP[low]) break;
        n++; tail = w[2];
      }
      var at = m.index + m[1].length + m[2].length;
      out += s.slice(from, at) + "[name removed]" + tail;
      from = NAME_LEAD.lastIndex = at + toks.slice(0, 2 * n - 1).join("").length; // keep looking right after the name
    }
    return out + s.slice(from);
  }
  /* Passwords: only a value right after "password is", "password:", "contraseña es" and the like.
     "Does the password need a number?" stays. */
  var PASSWORD = /\b(password|passcode|contraseña|clave)(\s+(?:is|es)(?:\s*:)?\s+|\s*[:=]\s*)(?=[^\s\[])(\S+?)(?=[.,!?;:)"”’']*(?:\s|$))/gi;
  function scrub(s) {
    var t = String(s || "")
      .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[email removed]")
      .replace(/\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/g, "[phone removed]")
      .replace(/\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g, "[number removed]")
      .replace(/\d{7,}/g, "[number removed]");
    return scrubNames(t).replace(PASSWORD, "$1$2[password removed]");
  }
  function portalId() {
    var seg = location.pathname.split("/").filter(Boolean), i = seg.indexOf("practice");
    return (i >= 0 && seg[i + 1] && seg[i + 1].indexOf(".") === -1) ? seg[i + 1] : "hub";
  }
  function shown(el) { return !!el && !el.closest("[hidden]") && el.offsetParent !== null; }
  function firstShown(sel) { var all = document.querySelectorAll(sel); for (var i = 0; i < all.length; i++) if (shown(all[i])) return all[i]; return null; }
  /* The words a person sees: no screen-reader extras, nothing marked private (a learner's own file name or typing) */
  function seenText(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll(".visually-hidden, [data-private]").forEach(function (x) { x.parentNode.removeChild(x); });
    return c.textContent.replace(/\s+/g, " ").trim();
  }
  function botStep(el) { return seenText(el).replace(/^(thanks|thank you),?\s+[^!.?,]{1,40}[!.]\s*/i, ""); }
  var OWN = "the learner's own file";
  var practiceFiles = {}, ownFiles = {}; // file names of the practice résumés (from the dock) and of a learner's own file (from the viewer)
  function isOwnFile(name) { if (ownFiles[name]) return true; for (var k in practiceFiles) return !practiceFiles[name]; return false; }
  /* What the coach is told about the screen, so it can name real buttons instead of guessing.
     Only labels the site itself printed: the step, button names, the practice résumé's file name.
     Nothing the learner typed, and never the name of the learner's own file. */
  function screenFacts() {
    var card = byId("card"), step = "", t;
    if (card) {
      var dsEl = card.hasAttribute("data-step") ? card : firstShown("#card [data-step]"), ds = dsEl ? dsEl.getAttribute("data-step") : "";
      var load = firstShown("#card .loading");
      var h = card.querySelector("h1");
      if (load && /^\s*Reading\b/.test(load.textContent)) step = "Reading the résumé";
      else if (ds) step = ds.trim();
      else if (h && shown(h) && seenText(h)) step = seenText(h);
      else {
        var bots = card.querySelectorAll(".rmsg.bot .bubble"), sheet = firstShown("#card .sheet h2"), texts = card.querySelectorAll("#thread .sb.in");
        if (bots.length && (t = botStep(bots[bots.length - 1]))) step = "Chat with Sunny. Sunny's last message: " + t;
        else if (sheet) step = "Sunny Side web page: " + seenText(sheet);
        else if (texts.length && (t = botStep(texts[texts.length - 1]))) step = "Text messages with Sunny Side. Last text: " + t;
      }
    }
    if (!step && portalId() === "hub") step = "Job board";
    var seen = {}, labels = [];
    document.querySelectorAll("#card button, #card a.btn, #dock button, #coach button, .coach-check button").forEach(function (b) {
      if (!shown(b) || b.closest("[data-private], .chip-x, .ask")) return;
      var txt = seenText(b).replace(/\s*\([^)]*\)\s*$/, "").trim(), o = txt.match(/^Open\s+(.+\.\w{2,5})$/);
      if (o && isOwnFile(o[1])) return;
      if (txt && txt.length <= 40 && !seen[txt]) { seen[txt] = 1; labels.push(txt); }
    });
    /* the résumé: open in the viewer, or ready to open with the Open button */
    var file = "", isOpen = !!(viewerEl && document.contains(viewerEl)), open = firstShown("[data-action=open-current]");
    if (isOpen) {
      var title = viewerEl.querySelector("#viewerTitle"), name = title ? title.textContent.trim() : "";
      file = viewerEl.querySelector(".rdoc.ownfile") || isOwnFile(name) ? OWN : name;
    } else if (open) {
      var label = seenText(open).replace(/^Open\s+/, "");
      file = open.closest("[data-private]") || open.querySelector("[data-private]") || isOwnFile(label) ? OWN : label;
    }
    var dock = byId("dock") || document.querySelector(".dock"), people = [];
    if (shown(dock)) dock.querySelectorAll(".rcard .rname").forEach(function (n) { people.push(n.textContent.trim()); });
    var parts = [];
    if (file) parts.push(file + (isOpen ? " (open in the viewer)" : " (not open)"));
    else if (people.length) parts.push("none open");
    if (people.length) parts.push("practice résumés here: " + people.join(", "));
    return { step: step.slice(0, 200), screen: labels.slice(0, 15), resume: parts.join("; ").slice(0, 200) };
  }
  function mountAsk(el) {
    if (askBox) { if (askBox.parentNode !== el) el.appendChild(askBox); return; }
    var box = el.querySelector("[data-ask]");
    if (!box) return;
    askBox = box;
    box.innerHTML = '<p class="ask-nudge">Don’t get stuck. Ask the coach below.</p>' +
      '<p class="who">Ask the coach</p>' +
      '<form class="ask-form"><label class="visually-hidden" for="askQ">Your question for the coach</label>' +
      '<textarea id="askQ" rows="2" maxlength="300" placeholder="Stuck? Ask a question." aria-describedby="askNote"></textarea>' +
      '<button type="submit">Ask</button></form>' +
      '<p class="ask-note" id="askNote">The coach can’t see your screen or anything you type into the application. Tell it which step and which box you’re stuck on. An AI answers, so don’t type personal information here.</p>' +
      '<div class="ask-answer" aria-live="polite"></div>';
    box.hidden = false;
    var form = box.querySelector("form"), q = box.querySelector("textarea"), btn = box.querySelector("button"), out = box.querySelector(".ask-answer");
    var busy = false, seq = 0;
    var CANT = "The coach can’t answer right now. Use the coach notes, or ask your career navigator.";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return; // one question at a time: Enter or Ask while "Thinking…" doesn't send it again
      var sent = q.value, question = scrub(sent).trim();
      if (!question) { q.focus(); return; }
      var facts = screenFacts(), my = ++seq, finished = false;
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); finish(null); }, 20000);
      function finish(res) {
        if (finished || my !== seq) return; // a late or old answer
        finished = true; clearTimeout(timer); busy = false; btn.disabled = false;
        if (res && res.d && res.d.answer) {
          out.className = "ask-answer said"; out.textContent = res.d.answer;
          if (q.value === sent) q.value = ""; // keep a follow-up they started typing while waiting
          askHistory.push({ q: question.slice(0, 300), a: String(res.d.answer).slice(0, 600) });
          askHistory = askHistory.slice(-6);
        }
        else if (res && res.status === 429) out.textContent = "You’ve asked a lot this hour. Use the coach notes, or ask your career navigator.";
        else out.textContent = CANT;
        /* the coach column scrolls on its own, so bring the answer into view */
        if (out.scrollIntoView) out.scrollIntoView({ block: "nearest" });
      }
      busy = true; btn.disabled = true; out.className = "ask-answer"; out.textContent = "Thinking…";
      var init = {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ portal: portalId(), step: facts.step, screen: facts.screen, resume: facts.resume, question: question.slice(0, 300), history: askHistory })
      };
      if (ctl) init.signal = ctl.signal;
      fetch("/api/coach", init).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, d: d }; });
      }).then(finish, function () { finish(null); });
    });
    q.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.shiftKey || e.isComposing || e.keyCode === 229) return; // Enter that picks a word in an input method isn't a send
      e.preventDefault();
      if (busy) return;
      if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  }

  /* ---------- résumé dock ---------- */
  function dockHtml(resumes, done, opts) {
    opts = opts || {};
    resumes.forEach(function (r) { if (r && r.file && !r.own) practiceFiles[r.file] = 1; });
    return '<h2 id="dockTitle">Practice résumés</h2><p class="dock-hint">' + (opts.canUpload ? "Drag one onto the upload box, or use its Upload button." : "Open one to check it against the form.") + '</p>' +
      '<ul class="dock-list" aria-labelledby="dockTitle">' + resumes.map(function (r) {
        var d = done[r.id];
        return '<li class="rcard' + (d ? " done" : "") + '" data-id="' + esc(r.id) + '"' + (opts.canUpload && !d ? ' draggable="true"' : "") + ">" +
          '<span class="ficon" aria-hidden="true"><span>PDF</span></span>' +
          '<span class="rname">' + esc(r.person) + "</span>" +
          '<span class="rmeta">' + esc(r.file) + '<br><span class="tag-level l' + r.levelNum + '">' + esc(r.level) + "</span></span>" +
          (d ? '<span class="done-tag">Done: fixed ' + d.fixed + " of " + d.total + "</span>" : "") +
          '<span class="rbtns"><button type="button" data-preview="' + esc(r.id) + '">Preview<span class="visually-hidden"> ' + esc(r.person) + "</span></button>" +
          (opts.canUpload ? '<button type="button" data-upload="' + esc(r.id) + '"' + (d ? " disabled" : "") + ">Upload this one<span class=\"visually-hidden\"> (" + esc(r.person) + ")</span></button>" : "") +
          "</span></li>";
      }).join("") + "</ul>";
  }

  function bindDock(el) {
    el.addEventListener("dragstart", function (e) {
      var c = e.target.closest && e.target.closest(".rcard[draggable=true]");
      if (!c) return;
      c.classList.add("dragging");
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("application/x-resume", c.dataset.id);
      e.dataTransfer.setData("text/plain", c.dataset.id);
    });
    el.addEventListener("dragend", function (e) {
      var c = e.target.closest && e.target.closest(".rcard");
      if (c) c.classList.remove("dragging");
    });
  }

  function bindDrop(zone, handlers) {
    function over(e) { e.preventDefault(); zone.classList.add("over"); }
    zone.addEventListener("dragenter", over);
    zone.addEventListener("dragover", over);
    zone.addEventListener("dragleave", function () { zone.classList.remove("over"); });
    zone.addEventListener("drop", function (e) {
      e.preventDefault(); zone.classList.remove("over");
      var id = e.dataTransfer.getData("application/x-resume");
      if (id) { handlers.onResume(id); return; }
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handlers.onFile(f);
    });
  }

  /* ---------- viewer ---------- */
  var viewerEl = null, viewerOpener = null, viewerRes = null, viewerZoom = 0;
  var ZOOMS = [1, 1.25, 1.5, 2];
  var WIDE = window.matchMedia ? window.matchMedia("(min-width: 1000px)") : null;
  var DOC_ICON = '<svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path d="M2 1h8l4 4v12H2z" fill="#fff"/><path d="M10 1v4h4" fill="none" stroke="#9aa5b1"/><rect x="3.5" y="11" width="9" height="4" rx="1" fill="#C2412D"/></svg>';
  function openViewer(r, opener, opts) {
    if (!r) return;
    opts = opts || {};
    var keepOpener = viewerOpener;
    closeViewer(false);
    viewerOpener = opts.reopen ? keepOpener : (opener || document.activeElement);
    viewerRes = r;
    if (r.own || /\bownfile\b/.test(String(r.doc))) ownFiles[r.file] = 1;
    // On wide screens with the résumé list showing, the résumé opens right next to the list.
    var dock = document.querySelector(".layout .dock");
    var docked = !!(dock && !dock.hidden && dock.offsetParent !== null && WIDE && WIDE.matches);
    var pages = (String(r.doc).match(/class="rdoc /g) || []).length || 1;
    viewerEl = document.createElement("aside");
    viewerEl.className = "viewer " + (docked ? "docked" : "overlay");
    viewerEl.setAttribute("role", "dialog");
    viewerEl.setAttribute("aria-modal", "false");
    viewerEl.setAttribute("aria-labelledby", "viewerTitle");
    viewerEl.innerHTML = '<div class="viewer-head"><span class="vfile">' + DOC_ICON + '<b id="viewerTitle" title="' + esc(r.file) + '">' + esc(r.file) + "</b></span>" +
      '<span class="vpages">' + pages + " " + plural(pages, "page") + "</span>" +
      '<span class="vtools" role="group" aria-label="Zoom"><button type="button" data-z="-1" aria-label="Zoom out">&minus;</button><span class="vzoom" aria-live="polite">100%</span><button type="button" data-z="1" aria-label="Zoom in">+</button></span>' +
      '<button class="viewer-close" type="button" aria-label="Close preview">&times;</button></div>' +
      // The pages scroll, so the scroll area takes keyboard focus and has a name.
      '<div class="viewer-body" tabindex="0" role="region" aria-label="Pages of ' + esc(r.file) + '">' + r.doc + "</div>";
    if (docked) dock.insertAdjacentElement("afterend", viewerEl);
    else document.body.appendChild(viewerEl);
    document.body.classList.add("viewing", docked ? "viewing-docked" : "viewing-overlay");
    var zi = 0, el = viewerEl;
    function setZoom(i) {
      zi = viewerZoom = Math.max(0, Math.min(ZOOMS.length - 1, i));
      el.querySelector(".viewer-body").style.setProperty("--zoom", ZOOMS[zi]);
      el.querySelector(".vzoom").textContent = Math.round(ZOOMS[zi] * 100) + "%";
      el.querySelector('[data-z="-1"]').disabled = zi === 0;
      el.querySelector('[data-z="1"]').disabled = zi === ZOOMS.length - 1;
    }
    setZoom(opts.zoom || 0);
    el.querySelector(".vtools").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-z]"); if (b) setZoom(zi + Number(b.dataset.z));
    });
    el.querySelector(".viewer-close").addEventListener("click", function () { closeViewer(true); });
    // Full screen on narrow screens: Tab stays inside the résumé instead of wandering to the form hidden under it
    if (!docked) {
      el.setAttribute("aria-modal", "true");
      el.addEventListener("keydown", function (e) {
        if (e.key !== "Tab") return;
        var f = [].filter.call(el.querySelectorAll('button:not([disabled]), [tabindex="0"]'), function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    if (!opts.noFocus) el.querySelector(".viewer-close").focus({ preventScroll: true });
  }
  function closeViewer(restore) {
    if (!viewerEl) return;
    var r = viewerRes;
    viewerEl.remove(); viewerEl = null; viewerRes = null;
    document.body.classList.remove("viewing", "viewing-docked", "viewing-overlay");
    if (!restore) return;
    /* back to the button that opened it; if the page redrew that button, to the closest thing that does the same job */
    var to = viewerOpener && viewerOpener !== document.body && document.contains(viewerOpener) && shown(viewerOpener) ? viewerOpener : null;
    if (!to) to = firstShown("[data-action=open-current]");
    if (!to && r && r.id) to = firstShown('[data-preview="' + String(r.id).replace(/["\\]/g, "\\$&") + '"]');
    if (!to) { to = document.querySelector("#card h1"); if (to && !to.hasAttribute("tabindex")) to.setAttribute("tabindex", "-1"); }
    if (to) to.focus();
  }
  /* Esc closes the résumé, but not while the learner is typing in the form or the chat */
  document.addEventListener("keydown", function (e) {
    if ((e.key !== "Escape" && e.key !== "Esc") || !viewerEl || e.defaultPrevented) return;
    var a = document.activeElement;
    if (a && a !== document.body && a !== document.documentElement && !viewerEl.contains(a)) return;
    closeViewer(true);
  });
  /* Turning a tablet or resizing the window across 1000px: show the same résumé the right way for the new width */
  function onWideChange() {
    if (!viewerEl || !viewerRes) return;
    var hadFocus = viewerEl.contains(document.activeElement), body = viewerEl.querySelector(".viewer-body");
    var at = body && body.scrollHeight > body.clientHeight ? body.scrollTop / (body.scrollHeight - body.clientHeight) : 0;
    openViewer(viewerRes, null, { reopen: true, zoom: viewerZoom, noFocus: !hadFocus });
    body =viewerEl.querySelector(".viewer-body");
    if (body && at) body.scrollTop = at * (body.scrollHeight - body.clientHeight);
  }
  if (WIDE) { if (WIDE.addEventListener) WIDE.addEventListener("change", onWideChange); else if (WIDE.addListener) WIDE.addListener(onWideChange); }

  /* ---------- profile form ---------- */
  function monthOpts(sel) { var o = '<option value="">Month</option>'; for (var i = 1; i <= 12; i++) o += '<option value="' + i + '"' + (String(sel) === String(i) ? " selected" : "") + ">" + MONTHS[i - 1] + "</option>"; return o; }
  function yearOpts(sel) { var o = '<option value="">Year</option>'; for (var y = 2026; y >= 1970; y--) o += '<option value="' + y + '"' + (String(sel) === String(y) ? " selected" : "") + ">" + y + "</option>"; return o; }
  function stateOpts(sel) { var o = '<option value="">Select</option>'; STATES.forEach(function (s) { o += "<option" + (sel === s ? " selected" : "") + ">" + s + "</option>"; }); return o; }

  function textField(id, label, value, opts) {
    opts = opts || {};
    return '<div class="field" id="f-' + id + '"><label for="' + id + '">' + esc(label) + (opts.req ? '<span class="req" aria-hidden="true">*</span>' : "") + "</label>" +
      '<input type="' + (opts.type || "text") + '" id="' + id + '" value="' + esc(value) + '"' + (opts.req ? " required" : "") + (opts.ac ? ' autocomplete="' + opts.ac + '"' : "") + ">" +
      (opts.hint ? '<p class="hint">' + esc(opts.hint) + "</p>" : "") + "</div>";
  }

  function govFields(j, p) {
    return '<div class="row">' + textField(p + "hours", "Hours per week", j.hours, { req: true }) + textField(p + "wage", "Pay (hourly or yearly)", j.wage) + "</div>" +
      '<div class="row">' + textField(p + "super", "Supervisor\u2019s name", j.supervisor, { req: true }) + textField(p + "superPhone", "Supervisor\u2019s phone", j.supervisorPhone, { type: "tel" }) + "</div>" +
      '<div class="row"><div class="field" id="f-' + p + 'contact"><label for="' + p + 'contact">May we contact this employer?<span class="req" aria-hidden="true">*</span></label><select id="' + p + 'contact"><option value="">Select</option>' +
      ["Yes", "No"].map(function (v) { return "<option" + (j.mayContact === v ? " selected" : "") + ">" + v + "</option>"; }).join("") + "</select></div>" +
      textField(p + "reason", "Reason for leaving", j.reason, { hint: "Leave blank if you still work here." }) + "</div>";
  }

  function jobHtml(j, i, gov) {
    var p = "j" + i + "-";
    return '<div class="job" id="job-' + i + '"><div class="job-head"><h3>Job ' + (i + 1) + "</h3>" + (i > 0 ? '<button class="btn-link" type="button" data-action="remove-job" data-i="' + i + '">Remove</button>' : "") + "</div>" +
      '<div class="row">' + textField(p + "title", "Job title", j.title, { req: true }) + textField(p + "employer", "Employer", j.employer, { req: true }) + "</div>" +
      textField(p + "location", "Location", j.location) +
      '<div class="dates"><div class="field" id="f-' + p + 'start"><label for="' + p + 'startM">Start date<span class="req" aria-hidden="true">*</span></label><div class="pair"><select id="' + p + 'startM" aria-label="Start month">' + monthOpts(j.startM) + '</select><select id="' + p + 'startY" aria-label="Start year">' + yearOpts(j.startY) + "</select></div></div>" +
      '<div class="field" id="f-' + p + 'end"><label for="' + p + 'endM">End date</label><div class="pair"><select id="' + p + 'endM" aria-label="End month"' + (j.current ? " disabled" : "") + ">" + monthOpts(j.endM) + '</select><select id="' + p + 'endY" aria-label="End year"' + (j.current ? " disabled" : "") + ">" + yearOpts(j.endY) + "</select></div></div></div>" +
      '<div class="field" id="f-' + p + 'cur"><label class="choice"><input type="checkbox" id="' + p + 'current" data-current="' + i + '"' + (j.current ? " checked" : "") + "> <span>I currently work here</span></label></div>" + (gov ? govFields(j, p) : "") +
      '<div class="field" id="f-' + p + 'desc"><label for="' + p + 'desc">Description</label><textarea id="' + p + 'desc">' + esc(j.desc) + "</textarea></div></div>";
  }

  function formHtml(profile, opts) {
    var gov = !!(opts && opts.gov);
    var c = profile.contact, e = profile.education;
    return '<div class="section"><h2>Contact information</h2>' +
      '<div class="row">' + textField("c-first", "First name", c.first, { req: true }) + textField("c-last", "Last name", c.last, { req: true }) + "</div>" +
      '<div class="row">' + textField("c-email", "Email", c.email, { type: "email", req: true }) + textField("c-phone", "Phone", c.phone, { type: "tel", req: true }) + "</div>" +
      '<div class="row-3">' + textField("c-city", "City", c.city, { req: true }) +
      '<div class="field" id="f-c-state"><label for="c-state">State<span class="req" aria-hidden="true">*</span></label><select id="c-state">' + stateOpts(c.state) + "</select></div>" +
      textField("c-zip", "ZIP code", c.zip, { req: true }) + "</div></div>" +
      '<div class="section"><h2>Work experience</h2>' + profile.jobs.map(function (j, i) { return jobHtml(j, i, gov); }).join("") +
      '<button class="btn btn-secondary" type="button" id="add-job" data-action="add-job">Add another job</button></div>' +
      '<div class="section"><h2>Education</h2><div class="row-3 edu">' + textField("e-school", "School", e.school) +
      '<div class="field" id="f-e-cred"><label for="e-cred">Credential</label><select id="e-cred">' + CREDS.map(function (x) { return "<option" + (x === e.credential ? " selected" : "") + ' value="' + esc(x) + '">' + (x || "Select") + "</option>"; }).join("") + "</select></div>" +
      textField("e-year", "Year", e.year) + "</div></div>";
  }

  function collect(nJobs) {
    var jobs = [];
    for (var i = 0; i < nJobs; i++) {
      var p = "j" + i + "-";
      jobs.push({ title: val(p + "title"), employer: val(p + "employer"), location: val(p + "location"), startM: val(p + "startM"), startY: val(p + "startY"),
        endM: val(p + "endM"), endY: val(p + "endY"), current: checked(p + "current"), desc: val(p + "desc"),
        hours: val(p + "hours"), wage: val(p + "wage"), supervisor: val(p + "super"), supervisorPhone: val(p + "superPhone"), mayContact: val(p + "contact"), reason: val(p + "reason") });
    }
    return {
      contact: { first: val("c-first"), last: val("c-last"), email: val("c-email"), phone: val("c-phone"), city: val("c-city"), state: val("c-state"), zip: val("c-zip") },
      jobs: jobs,
      education: { school: val("e-school"), credential: val("e-cred"), year: val("e-year") }
    };
  }

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.dataset && t.dataset.current !== undefined) {
      var i = t.dataset.current;
      ["endM", "endY"].forEach(function (k) { var el = byId("j" + i + "-" + k); if (el) { el.disabled = t.checked; if (t.checked) el.value = ""; } });
    }
  });

  /* ---------- validation ---------- */
  /* Error messages are tied to their fields (aria-describedby, aria-invalid) so screen readers read them with the field */
  var errSeq = 0;
  function describedBy(el, id, add) {
    var ids = (el.getAttribute("aria-describedby") || "").split(/\s+/).filter(function (x) { return x && x !== id; });
    if (add) ids.push(id);
    if (ids.length) el.setAttribute("aria-describedby", ids.join(" ")); else el.removeAttribute("aria-describedby");
  }
  function clearErrors(scope) {
    var root = scope || document;
    root.querySelectorAll(".err-msg").forEach(function (el) {
      if (el.id) document.querySelectorAll('[aria-describedby~="' + el.id + '"]').forEach(function (c) { describedBy(c, el.id, false); });
      el.remove();
    });
    root.querySelectorAll(".invalid").forEach(function (el) {
      el.classList.remove("invalid");
      el.querySelectorAll('[aria-invalid="true"]').forEach(function (c) { c.removeAttribute("aria-invalid"); });
    });
  }
  function markInvalid(fieldId, msg) {
    var f = byId("f-" + fieldId);
    if (!f) return;
    f.classList.add("invalid");
    var p = document.createElement("p"); p.className = "err-msg"; p.id = "err-" + fieldId + "-" + (++errSeq); p.textContent = msg; f.appendChild(p);
    var controls = f.matches("input, select, textarea") ? [f] : Array.prototype.slice.call(f.querySelectorAll("input, select, textarea"));
    controls.forEach(function (c) { if (c.type === "hidden") return; c.setAttribute("aria-invalid", "true"); describedBy(c, p.id, true); });
  }
  function summary(boxId, count) {
    var box = byId(boxId);
    if (box) box.innerHTML = count ? '<div class="alert alert-err" role="alert">Please fix ' + count + " " + plural(count, "field") + " below.</div>" : "";
    if (count) { var first = document.querySelector(".invalid input, .invalid select, .invalid textarea"); if (first) first.focus(); }
  }
  function validateProfile(pr, boxId, opts) {
    var gov = !!(opts && opts.gov);
    clearErrors();
    var n = 0, c = pr.contact;
    function need(cond, id, msg) { if (!cond) { markInvalid(id, msg); n++; } }
    need(c.first.trim(), "c-first", "Enter a first name.");
    need(c.last.trim(), "c-last", "Enter a last name.");
    need(validEmail(c.email), "c-email", c.email.trim() ? "Enter a valid email, like name@example.com." : "Enter an email.");
    need(c.phone.trim(), "c-phone", "Enter a phone number.");
    need(c.city.trim(), "c-city", "Enter a city.");
    need(c.state, "c-state", "Choose a state.");
    need(c.zip.trim(), "c-zip", "Enter a ZIP code.");
    pr.jobs.forEach(function (j, i) {
      var p = "j" + i + "-";
      need(j.title.trim(), p + "title", "Enter a job title.");
      need(j.employer.trim(), p + "employer", "Enter the employer.");
      var mo = !!(opts && opts.monthOptional);
      var startOk = !!(j.startY && (mo || j.startM)), endOk = !!(j.endY && (mo || j.endM));
      need(startOk, p + "start", mo ? "Choose at least a start year." : "Choose a start month and year.");
      if (!j.current) {
        need(endOk, p + "end", "Choose an end date, or check “I currently work here.”");
        /* a missing month counts as early for the start and late for the end, so only a real mix-up is caught */
        if (startOk && endOk) need(ym(j.endM || 12, j.endY) >= ym(j.startM || 1, j.startY), p + "end", "The end date is before the start date.");
      }
      if (gov) {
        need(String(j.hours || "").trim(), p + "hours", "Enter hours per week.");
        need(String(j.supervisor || "").trim(), p + "super", "Enter your supervisor’s name.");
        need(j.mayContact, p + "contact", "Choose Yes or No.");
      }
    });
    summary(boxId, n);
    return n === 0;
  }

  /* ---------- scoring against the résumé's truth ---------- */
  function norm(s) { return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\bst\b\.?/g, "saint").replace(/[^a-z0-9]+/g, " ").trim(); }
  function loose(a, b) {
    var x = norm(a), y = norm(b);
    if (!x || !y) return x === y;
    return x === y || (x.length >= 3 && y.indexOf(x) !== -1) || (y.length >= 3 && x.indexOf(y) !== -1);
  }
  function get(obj, path) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function fieldMatch(path, got, want) {
    var key = path.split(".").pop();
    if (key === "phone" || /Phone$/.test(key)) return digits(got).slice(-10) === digits(want).slice(-10) && digits(got).length >= 10;
    if (key === "zip") return digits(got).slice(0, 5) === digits(want).slice(0, 5) && digits(got).length >= 5;
    if (key === "year") return digits(got) === digits(want);
    if (key === "email") return String(got || "").trim().toLowerCase() === String(want || "").trim().toLowerCase();
    if (key === "state" || key === "credential") return String(got || "") === String(want || "");
    if (key === "school") return sameSchool(got, want);
    if (key === "first" || key === "last" || key === "city" || key === "supervisor") return norm(got) === norm(want);
    if (key === "hours") { var g = num(got); return !isNaN(g) && g === num(want); } // "20", "20.0" and "20 hrs" all count
    return loose(got, want);
  }
  /* "Parkview High" = "Parkview HS" = "Parkview High School", and a city after the name is fine.
     Extra words in front still count as wrong ("Boxed 300 cases a shift. Riverview High School"). */
  function schoolKey(s) { return norm(s).replace(/\b(high school|school|hs)\b/g, " ").replace(/\s+/g, " ").trim(); }
  function sameSchool(a, b) {
    var x = schoolKey(a), y = schoolKey(b);
    if (!x || !y) return norm(a) === norm(b);
    if (x === y) return true;
    var s = x.length < y.length ? x : y, l = s === x ? y : x;
    return l.indexOf(s + " ") === 0 && l.slice(s.length).trim().split(" ").length <= 2;
  }
  /* Job titles: spaces, hyphens and simple word endings don't matter ("House Keeper" = "Housekeeper" = "Housekeeping") */
  function titleKey(s) {
    return norm(s).split(" ").map(function (w) {
      if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
      if (w.length > 4 && /ers?$/.test(w)) return w.replace(/ers?$/, "");
      if (w.length > 3 && /[^s]s$/.test(w)) return w.slice(0, -1);
      return w;
    }).join("");
  }
  function sameTitle(a, b) {
    if (loose(a, b)) return true;
    var x = titleKey(a), y = titleKey(b);
    return !!x && !!y && (x === y || (x.length >= 4 && y.indexOf(x) !== -1) || (y.length >= 4 && x.indexOf(y) !== -1));
  }
  function findJob(profile, tj) {
    for (var i = 0; i < profile.jobs.length; i++) {
      var j = profile.jobs[i];
      if (sameTitle(j.title, tj.title) && loose(j.employer, tj.employer)) return j;
    }
    return null;
  }
  function passes(check, resume, profile) {
    var truth = resume.truth;
    if (check.fn) return !!check.fn(profile, resume);
    if (check.match) return check.match.every(function (p) { return fieldMatch(p, get(profile, p), get(truth, p)); });
    if (check.hasJob !== undefined) {
      var hj = truth.jobs[check.hasJob];
      if (check.exactTitle) return profile.jobs.some(function (j) { return norm(j.title) === norm(hj.title) && loose(j.employer, hj.employer); });
      return !!findJob(profile, hj);
    }
    if (check.jobField) {
      var tf = truth.jobs[check.jobField.job], jf = findJob(profile, tf);
      if (!jf) return false;
      return check.jobField.fields.every(function (k) { return fieldMatch(k, jf[k], tf[k]); });
    }
    /* dates are judged on their own: if the title isn't fixed yet, use the job in the same place on the form */
    if (check.jobYears !== undefined) {
      var ty = truth.jobs[check.jobYears], jy = findJob(profile, ty) || profile.jobs[check.jobYears];
      if (!jy || +jy.startY !== +ty.startY) return false;
      if (ty.current) return !!jy.current;
      return !jy.current && +jy.endY === +ty.endY;
    }
    if (check.jobDates !== undefined) {
      var tj = truth.jobs[check.jobDates], j = findJob(profile, tj) || profile.jobs[check.jobDates];
      if (!j) return false;
      if (+j.startM !== +tj.startM || +j.startY !== +tj.startY) return false;
      if (tj.current) return !!j.current;
      return !j.current && +j.endM === +tj.endM && +j.endY === +tj.endY;
    }
    if (check.excludes) {
      var tj2 = truth.jobs[check.excludes.job], j2 = findJob(profile, tj2) || profile.jobs[check.excludes.job];
      if (!j2) return false;
      var d = String(j2.desc || "").toLowerCase();
      return check.excludes.terms.every(function (t) { return d.indexOf(t.toLowerCase()) === -1; });
    }
    return false;
  }
  function score(resume, profile) {
    return resume.errors.map(function (er) {
      var checks = [].concat(er.check);
      return { label: er.label, why: er.why, fields: er.fields, fixed: checks.every(function (c) { return passes(c, resume, profile); }) };
    });
  }

  function clearFlags() {
    document.querySelectorAll(".flagged").forEach(function (el) { el.classList.remove("flagged"); });
    document.querySelectorAll(".flag-note").forEach(function (el) { el.remove(); });
  }
  function flag(results) {
    clearFlags();
    var bad = results.filter(function (r) { return !r.fixed; });
    bad.forEach(function (e) {
      e.fields.forEach(function (id) { var el = byId(id); if (el) el.classList.add("flagged"); });
      var last = byId(e.fields[e.fields.length - 1]);
      var host = last && (last.closest(".row, .row-3, .dates") || last.closest(".field") || last);
      if (host && host.parentNode) {
        var p = document.createElement("p"); p.className = "flag-note"; p.textContent = e.label + ".";
        host.parentNode.insertBefore(p, host.nextSibling);
      }
    });
    var first = document.querySelector(".flagged");
    if (first && first.focus) first.focus();
    return bad.length;
  }

  /* ---------- completion code ---------- */
  function code(prefix, rounds, fixed, total) {
    var s = prefix + "-" + rounds + "R-" + fixed + "of" + total, h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1296;
    return s + "-" + ("0" + h.toString(36).toUpperCase()).slice(-2);
  }

  window.Practice = {
    MONTHS: MONTHS, esc: esc, digits: digits, ym: ym, validEmail: validEmail, clone: clone, byId: byId, val: val, checked: checked, fmtDate: fmtDate, plural: plural,
    initBar: initBar, hints: function () { return hintsOn; }, setInProgress: setInProgress, confirmLeave: confirmLeave, sameName: sameName, num: num, onHints: function (fn) { hintListeners.push(fn); }, coach: coach,
    dockHtml: dockHtml, bindDock: bindDock, bindDrop: bindDrop, openViewer: openViewer, closeViewer: closeViewer,
    textField: textField, formHtml: formHtml, collect: collect, clearErrors: clearErrors, markInvalid: markInvalid, summary: summary, validateProfile: validateProfile,
    score: score, flag: flag, clearFlags: clearFlags, code: code
  };
})();
