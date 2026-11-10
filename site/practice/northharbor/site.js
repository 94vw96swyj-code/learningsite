/* City of North Harbor website (practice): menus, site search and the "isn't part of this practice" message.
   Used by home.html, volunteer.html and hr.html. Nothing typed here is saved or sent anywhere. */
(function () {
  "use strict";
  var P = window.Practice, esc = P.esc, card = P.byId("card");
  var BASE_STEP = card.getAttribute("data-step") || "";
  var menus = [].slice.call(document.querySelectorAll("details.menu"));

  /* ---------- menus ----------
     Each menu is a <details>, so it opens and closes with a click, Enter or Space, and still works without JavaScript.
     Only one is open at a time. Esc or a click somewhere else closes it. */
  function menuName(d) { var s = d.querySelector("summary"); return s ? s.textContent.replace(/\s+/g, " ").trim() : ""; }
  function tellCoach() {
    var open = menus.filter(function (d) { return d.open; })[0];
    card.setAttribute("data-step", BASE_STEP + (open ? ". The “" + menuName(open) + "” menu is open" : ""));
  }
  menus.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) menus.forEach(function (o) { if (o !== d && o.open) o.open = false; });
      tellCoach();
    });
  });
  function closeAll(except) { menus.forEach(function (d) { if (d !== except && d.open) d.open = false; }); }
  document.addEventListener("click", function (e) {
    var inMenu = e.target.closest && e.target.closest("details.menu");
    closeAll(inMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    var open = menus.filter(function (d) { return d.open; })[0];
    if (!open) return;
    var hadFocus = open.contains(document.activeElement);
    open.open = false;
    if (hadFocus) open.querySelector("summary").focus();
  });

  /* ---------- "isn't part of this practice" ----------
     The message box is empty (and invisible) until needed. It is cleared first and filled a moment later,
     so a screen reader reads it every time, even when someone clicks the same link twice. */
  var toast = P.byId("toast"), timer = null;
  function say(text) {
    clearTimeout(timer); toast.textContent = "";
    timer = setTimeout(function () {
      toast.textContent = text;
      timer = setTimeout(function () { toast.textContent = ""; }, 6000);
    }, 80);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-nope]"); if (!a) return;
    e.preventDefault();
    var name = a.getAttribute("data-name") || a.textContent.replace(/\s+/g, " ").trim();
    var kind = a.getAttribute("data-nope");
    var text = a.getAttribute("data-msg") ||
      ("“" + name + "” isn’t part of this practice. " + (kind === "dept" ? "Hint: one department hires people for every part of the City." : "Keep looking for the job link."));
    closeAll(a.closest("details.menu")); // a link inside a menu keeps that menu open, so the keyboard stays in place
    say(text);
  });

  /* ---------- site search ----------
     A small search of the city's pages. Job words find the Human Resources page first, then Volunteer. */
  var PAGES = [
    { t: "Job opportunities", d: "Human Resources. See open City jobs and learn how to apply.", href: "hr.html", k: "job jobs employment employ career careers work working hire hiring apply applying application openings opening position positions vacancy vacancies human resources hr office clerk clerical specialist support" },
    { t: "Volunteer with the City", d: "Parks and Recreation. Help at parks, events and the library. Volunteers are not paid.", href: "volunteer.html", k: "volunteer volunteers volunteering help helping job jobs work opportunities opportunity" },
    { t: "Human Resources", d: "Department page: jobs, benefits and how to contact Human Resources.", href: "hr.html", k: "human resources hr benefits department departments" },
    { t: "Pay a utility bill", d: "Pay your water and sewer bill online.", nope: 1, k: "pay bill bills payment water sewer utility utilities" },
    { t: "Trash and recycling", d: "Pickup days, leaf collection and the drop-off site.", nope: 1, k: "trash garbage recycling recycle pickup leaf leaves compost" },
    { t: "Report a problem", d: "Potholes, streetlights, graffiti and more.", nope: 1, k: "report problem pothole potholes streetlight graffiti broken" },
    { t: "Parks and recreation", d: "Parks, classes, the Harbor Pool and the ice rink.", nope: 1, k: "park parks recreation classes class pool swim rink" },
    { t: "Council meetings and agendas", d: "Watch meetings and read agendas and minutes.", nope: 1, k: "council meeting meetings agenda agendas minutes mayor" },
    { t: "Permits", d: "Building, fence, sign and event permits.", nope: 1, k: "permit permits building fence sign license licenses" },
    { t: "Bid opportunities", d: "For businesses: bid on City projects and supplies.", nope: 1, k: "bid bids contract contracts business businesses opportunities opportunity" },
    { t: "Snow emergencies", d: "Parking rules when the City plows the streets.", nope: 1, k: "snow plow plowing parking emergency emergencies winter" }
  ];
  var STOP = { a: 1, an: 1, the: 1, to: 1, "for": 1, of: 1, i: 1, my: 1, me: 1, how: 1, "do": 1, can: 1, "in": 1, at: 1, on: 1, and: 1, city: 1, north: 1, harbor: 1, want: 1, find: 1, where: 1, is: 1 };
  function clean(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }
  function find(q) {
    var words = clean(q).split(" ").filter(function (w) { return w.length > 1 && !STOP[w]; });
    if (!words.length) return null;
    return PAGES.map(function (p, i) {
      var hay = (" " + clean(p.t + " " + p.k) + " "), hits = 0;
      words.forEach(function (w) {
        var stem = w.length > 4 ? w.replace(/(ing|ers|er|s)$/, "") : w;
        if (hay.indexOf(" " + w) !== -1 || hay.indexOf(" " + stem) !== -1) hits++;
      });
      return { p: p, hits: hits, i: i };
    }).filter(function (x) { return x.hits; }).sort(function (a, b) { return b.hits - a.hits || a.i - b.i; }).map(function (x) { return x.p; });
  }
  var form = P.byId("citySearch"), box = P.byId("results");
  if (form && box) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = P.val("q").trim(), list = find(q);
      box.hidden = false;
      var count = P.byId("resultsCount"), ul = P.byId("resultsList");
      if (!q) { count.textContent = "Type a word to search for, like “trash” or “jobs.”"; ul.innerHTML = ""; }
      else if (!list || !list.length) { count.innerHTML = 'No results for “<span data-private>' + esc(q) + '</span>.” Try a shorter word, like “jobs.”'; ul.innerHTML = ""; }
      else {
        count.innerHTML = list.length + " " + P.plural(list.length, "result") + ' for “<span data-private>' + esc(q) + '</span>”';
        ul.innerHTML = list.map(function (p) {
          return '<li><a href="' + (p.nope ? "#" : p.href) + '"' + (p.nope ? " data-nope" : "") + ">" + esc(p.t) + "</a><p>" + esc(p.d) + "</p></li>";
        }).join("");
      }
      card.setAttribute("data-step", BASE_STEP + ". Search results are showing");
      var h = P.byId("resultsH"); h.focus();
    });
    P.byId("clearSearch").addEventListener("click", function () {
      box.hidden = true; P.byId("q").value = ""; tellCoach(); P.byId("q").focus();
    });
  }

  /* ---------- the coach's "Show me where" ---------- */
  function showWhere(menuId, linkId) {
    var link = P.byId(linkId), m = menuId ? P.byId(menuId) : null;
    if (!link) return;
    if (m && !m.open) m.open = true;
    document.querySelectorAll(".found").forEach(function (x) { if (x !== link) x.classList.remove("found"); });
    link.classList.add("found");
    link.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    link.focus({ preventScroll: true });
  }
  /* After the browser's Back button, start with every menu closed */
  window.addEventListener("pageshow", function (e) { if (e.persisted) { closeAll(null); tellCoach(); } });

  window.NHSite = { showWhere: showWhere, say: say, closeAll: closeAll };
})();
