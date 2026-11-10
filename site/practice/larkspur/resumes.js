/*
  Larkspur Health practice résumés (hospital system application, advanced résumé course).
  Each résumé has: doc (what the learner sees), truth (what the résumé actually says),
  parsed (what the "system" filled in), and errors (each planted mistake, why it happened,
  and how the page checks whether the learner fixed it).
  Extra pieces for this application:
  - truth.edu / parsed.edu: education entries (school, degree, field of study, status, year)
  - truth.certs / parsed.certs: licenses and certifications (type, name if Other, organization, number, dates)
  - truth.facts: what the résumé says for the screening questions (team size, highest education finished)
  - each error has page: "profile" or "certs" (the form page it lives on), and may have where(profile),
    which names the boxes to outline right now (for "Show me what’s off")
  All people, clinics, schools, organizations, numbers and emails are invented.
  Card and certificate numbers use 555 so they're clearly fake.
*/
(function () {
  "use strict";

  /* ---------- helpers shared by the checks ---------- */
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function loose(a, b) {
    var x = norm(a), y = norm(b);
    if (!x || !y) return x === y;
    return x === y || (x.length >= 4 && y.indexOf(x) !== -1) || (y.length >= 4 && x.indexOf(y) !== -1);
  }
  function code(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); } // "bls 555-0137" = "BLS5550137"
  function sameNum(a, b) { var x = code(a), y = code(b); return !!x && (x === y || x.replace(/^NO/, "") === y); } // "No. BLS-555-0137" counts
  function year(s) { return String(s || "").replace(/\D/g, ""); }

  /* Jobs: the same title and employer, the way a person would read them */
  function jobAt(p, tj) {
    for (var i = 0; i < p.jobs.length; i++) if (loose(p.jobs[i].title, tj.title) && loose(p.jobs[i].employer, tj.employer)) return i;
    return -1;
  }
  function datesOk(j, tj) {
    if (!j || +j.startM !== +tj.startM || +j.startY !== +tj.startY) return false;
    if (tj.current) return !!j.current;
    return !j.current && +j.endM === +tj.endM && +j.endY === +tj.endY;
  }
  /* Only the date boxes that are wrong: a start date, an end date, or the "I currently work here" box */
  function wrongDates(j, tj, i) {
    var p = "j" + i + "-", out = [];
    if (+j.startM !== +tj.startM || +j.startY !== +tj.startY) out.push(p + "startM", p + "startY");
    if (tj.current) { if (!j.current) out.push(p + "current"); }
    else if (j.current) out.push(p + "current");
    else if (+j.endM !== +tj.endM || +j.endY !== +tj.endY) out.push(p + "endM", p + "endY");
    return out;
  }

  /* Education entries, found by school */
  function eduAt(p, school) {
    var list = p.edu || [];
    for (var i = 0; i < list.length; i++) if (loose(list[i].school, school)) return i;
    return -1;
  }
  /* Licenses and certifications */
  function certsOf(p) { return p.certs || []; }
  function certName(c) { return c.type === "Other" ? c.other : c.type; }
  function certAt(p, tc) {
    var list = certsOf(p), i;
    for (i = 0; i < list.length; i++) if (list[i].type === tc.type && (tc.type !== "Other" || loose(list[i].other, tc.other))) return i;
    if (tc.type === "Other") for (i = 0; i < list.length; i++) if (loose(list[i].other, tc.other) || sameNum(list[i].number, tc.number)) return i;
    return -1;
  }
  /* Which boxes of one license don't match the résumé */
  function certWrong(c, tc, i) {
    var p = "k" + i + "-", bad = [];
    if (c.type !== tc.type) bad.push(p + "type");
    if (tc.type === "Other" && !loose(c.other, tc.other)) bad.push(p + "other");
    if (!loose(c.org, tc.org)) bad.push(p + "org");
    if (!sameNum(c.number, tc.number)) bad.push(p + "num");
    if (+c.issueM !== +tc.issueM || +c.issueY !== +tc.issueY) bad.push(p + "issueM", p + "issueY");
    if (tc.noexp) { if (!c.noexp) bad.push(p + "noexp"); }
    else if (c.noexp || +c.expM !== +tc.expM || +c.expY !== +tc.expY) bad.push(p + "expM", p + "expY", p + "noexp");
    return bad;
  }

  var ICON = {
    phone: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/></svg>',
    mail: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7.2L4.5 7v.2L12 13l7.5-5.8V7z"/></svg>',
    link: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F2B544" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1.2-1.2"/></svg>',
    pin: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M12 2a7 7 0 017 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z"/></svg>'
  };
  function job(o) { return Object.assign({ location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "" }, o); }
  function cert(o) { return Object.assign({ type: "", other: "", org: "", number: "", issueM: "", issueY: "", expM: "", expY: "", noexp: false }, o); }

  /* ---------- Level 1: Nadia Farah, clean one-column résumé ---------- */
  var nadia = {
    id: "lh-nadia", person: "Nadia Farah", file: "Nadia-Farah-Resume.pdf", level: "Clean", levelNum: 1,
    doc: '<article class="rdoc classic" aria-label="Résumé: Nadia Farah">' +
      '<p class="rname">Nadia Farah</p>' +
      '<p class="rcontact">Richfield, MN 55423 &nbsp;|&nbsp; (612) 555-0137 &nbsp;|&nbsp; nadia.farah@example.com</p>' +
      "<h5>Summary</h5><p>Patient services lead with eight years in clinic front desk work and health plan customer service. I build fair schedules, coach new staff, and keep patients moving. Ready to grow into a supervisor role.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Patient Services Lead, Cedar Ridge Family Clinic</b><span>March 2022 to Present</span></p><p>Edina, MN</p>' +
      "<ul><li>Lead a front desk team of 6 patient service representatives</li><li>Build the weekly staff schedule and cover call-outs</li>" +
      "<li>Handle patient complaints and bring safety concerns to the clinic manager</li><li>Trained 9 new hires on check-in, insurance checks and patient privacy</li>" +
      "<li>Cut average check-in time from 9 minutes to 6</li></ul>" +
      '<p class="jobline"><b>Customer Care Representative, Lakeshore Health Plan</b><span>August 2018 to February 2022</span></p><p>Minneapolis, MN</p>' +
      "<ul><li>Answered 60+ member calls a day about benefits, claims and finding a doctor</li><li>Mentored new representatives in their first month</li>" +
      "<li>Highest quality score on my team in 2020 and 2021</li></ul>" +
      "<h5>Education</h5><p>Bluestem Community College, Associate of Applied Science, Health Care Administration, 2016 to 2018</p>" +
      "<h5>Licenses and Certifications</h5>" +
      "<p>Basic Life Support (BLS) Provider, Midwest Lifesaving Council. Card No. BLS-555-0137. Issued February 2026, expires February 2028</p>" +
      '<p style="margin-top:calc(0.3 * var(--u))">Patient Access Specialist, Front Office Health Guild. Certificate No. PAS-555-2281. Issued June 2023, does not expire</p>' +
      "<h5>Skills</h5><p>Staff scheduling, front desk operations, insurance checks, patient privacy, calming upset patients, English and Somali</p></article>",
    truth: {
      contact: { first: "Nadia", last: "Farah", email: "nadia.farah@example.com", phone: "(612) 555-0137", city: "Richfield", state: "MN", zip: "55423" },
      jobs: [
        { title: "Patient Services Lead", employer: "Cedar Ridge Family Clinic", startM: 3, startY: 2022, current: true },
        { title: "Customer Care Representative", employer: "Lakeshore Health Plan", startM: 8, startY: 2018, endM: 2, endY: 2022 }
      ],
      education: { school: "Bluestem Community College", credential: "Associate degree", year: "2018" },
      edu: [{ school: "Bluestem Community College", degree: "Associate degree", field: "Health Care Administration", status: "Completed", year: "2018" }],
      certs: [
        { type: "BLS", other: "", org: "Midwest Lifesaving Council", number: "BLS-555-0137", issueM: 2, issueY: 2026, expM: 2, expY: 2028 },
        { type: "Other", other: "Patient Access Specialist", org: "Front Office Health Guild", number: "PAS-555-2281", issueM: 6, issueY: 2023, noexp: true }
      ],
      facts: { leadSince: [3, 2022], team: 6, team_how: "a front desk team of 6", highest: "Associate degree", bls: true }
    },
    parsed: {
      contact: { first: "Nadia", last: "Farah", email: "nadia.farah@example.com", phone: "(612) 555-0137", city: "Edina", state: "MN", zip: "55423" },
      jobs: [
        job({ title: "Patient Services Lead", employer: "Cedar Ridge Family Clinic", location: "Edina, MN", startM: "3", startY: "2022", current: true,
          desc: "Lead a front desk team of 6 patient service representatives. Build the weekly staff schedule and cover call-outs. Handle patient complaints and bring safety concerns to the clinic manager. Trained 9 new hires on check-in, insurance checks and patient privacy. Cut average check-in time from 9 minutes to 6." }),
        job({ title: "Customer Care Representative", employer: "Lakeshore Health Plan", location: "Minneapolis, MN", startM: "8", startY: "2018", endM: "2", endY: "2022",
          desc: "Answered 60+ member calls a day about benefits, claims and finding a doctor. Mentored new representatives in their first month. Highest quality score on my team in 2020 and 2021." })
      ],
      education: { school: "", credential: "", year: "" },
      edu: [{ school: "Bluestem Community College", degree: "Associate degree", field: "Health Care Administration", status: "Completed", year: "2016" }],
      certs: [
        cert({ type: "BLS", org: "Midwest Lifesaving Council", number: "BLS-555-0137", issueM: "2", issueY: "2026", expM: "2", expY: "2026" }),
        cert({ type: "Other", other: "Patient Access Specialist", org: "Front Office Health Guild", number: "PAS-555-2281", issueM: "6", issueY: "2023", noexp: true })
      ]
    },
    errors: [
      { page: "profile", label: "The city came from her job, not her home", why: "The system read “Edina, MN” under her job as her address. She lives in Richfield. Recruiters use your city to think about your drive to work.",
        fields: ["c-city"], check: { match: ["contact.city"] } },
      { page: "profile", label: "The start year landed in the graduation year box", why: "Her résumé says 2016 to 2018. The system took the first year, so she looks like she finished two years early. Use the year you finished.",
        fields: ["ed0-year"], check: { fn: function (p) { var i = eduAt(p, "Bluestem Community College"); return i >= 0 && year(p.edu[i].year) === "2018"; } },
        where: function (p) { var i = eduAt(p, "Bluestem Community College"); return [i >= 0 ? "ed" + i + "-year" : "ed0-school"]; } },
      { page: "certs", label: "The BLS card’s expiration date took the issue year", why: "“Expires February 2028” became February 2026, so a current card looked expired. Hospitals check this, and an expired card can hold up a job offer.",
        fields: ["k0-expM", "k0-expY"],
        check: { fn: function (p) { var i = certAt(p, nadia.truth.certs[0]), c = certsOf(p)[i]; return !!c && !c.noexp && +c.expM === 2 && +c.expY === 2028; } },
        where: function (p) { var i = certAt(p, nadia.truth.certs[0]); return i >= 0 ? ["k" + i + "-expM", "k" + i + "-expY"] : ["add-cert"]; } }
    ],
    coach: ["A clean, one-column résumé with standard headings. Systems read these best.", "It still got two things wrong on this page. Look closely at her address and her education line."],
    certCoach: ["License dates matter. An expired card can hold up a job offer.", "If a date shows as expired, check it against the résumé before you believe it."]
  };

  /* ---------- Level 2: Marcus Odom, two columns ---------- */
  var marcus = {
    id: "lh-marcus", person: "Marcus Odom", file: "Marcus_Odom_Resume.pdf", level: "Two columns", levelNum: 2,
    doc: '<article class="rdoc sidebar" aria-label="Résumé: Marcus Odom"><div class="side">' +
      '<div class="avatar" aria-hidden="true">MO</div>' +
      "<h5>Contact</h5>" +
      '<p class="ico">' + ICON.phone + "<span>(952) 555-0164</span></p>" +
      '<p class="ico">' + ICON.mail + "<span>marcus.odom@example.com</span></p>" +
      '<p class="ico">' + ICON.link + "<span>careerlink.example.com/@marcus.odom</span></p>" +
      '<p class="ico">' + ICON.pin + "<span>Burnsville, MN 55337</span></p>" +
      "<h5>Licenses &amp; Certifications</h5>" +
      '<p class="skill"><b>BLS Provider</b><br>Midwest Lifesaving Council<br>No. BLS-555-0164<br>Issued 03/2026, expires 03/2028</p>' +
      '<p class="skill" style="margin-top:calc(0.7 * var(--u))"><b>Workplace De-escalation Trainer</b><br>Calm Response Institute<br>No. CRI-555-3390<br>Issued 09/2023, no expiration</p>' +
      "<h5>Education</h5>" +
      "<p><b>B.S., Health Services Administration</b><br>Riverbend State University<br>Minor: Business<br>2018</p>" +
      "<h5>Skills</h5><p>Staff scheduling<br>Patient flow<br>Coaching and training<br>Incident reports<br>Cash handling</p>" +
      '</div><div class="main">' +
      '<p class="rname">Marcus<br>Odom</p><p class="rtitle">Clinic Operations Supervisor</p>' +
      "<h5>Summary</h5><p>Urgent care supervisor who keeps a busy clinic calm. Eight years in patient registration and front desk operations, more than five of them leading teams.</p>" +
      "<h5>Experience</h5>" +
      '<p class="co">LAKEVIEW URGENT CARE</p><p>Apple Valley, MN</p>' +
      '<p style="margin-top:calc(0.45 * var(--u))"><b>Clinic Supervisor</b><br><span class="dates">Jan 2024 to Present</span></p>' +
      "<ul><li>Supervise 9 front desk and float staff across two shifts</li><li>Run the daily huddle, the staff schedule and time-off approvals</li>" +
      "<li>Handle patient complaints and write incident reports</li><li>Work with the nurse manager to keep waits under 30 minutes</li></ul>" +
      "<p><b>Front Desk Lead</b><br><span class=\"dates\">May 2021 to Dec 2023</span></p>" +
      "<ul><li>Led a team of 4 and trained every new front desk hire</li><li>Balanced the cash drawer and made the daily deposit</li>" +
      "<li>Wrote the check-in checklist the clinic still uses</li></ul>" +
      '<p class="co" style="margin-top:calc(0.7 * var(--u))">PRAIRIE RIDGE HOSPITAL</p><p>Shakopee, MN</p>' +
      '<p style="margin-top:calc(0.45 * var(--u))"><b>Patient Registration Specialist</b><br><span class="dates">Jun 2018 to Apr 2021</span></p>' +
      "<ul><li>Registered 70+ emergency department patients a shift</li><li>Checked insurance and collected copays</li></ul>" +
      "</div></article>",
    truth: {
      contact: { first: "Marcus", last: "Odom", email: "marcus.odom@example.com", phone: "(952) 555-0164", city: "Burnsville", state: "MN", zip: "55337" },
      jobs: [
        { title: "Clinic Supervisor", employer: "Lakeview Urgent Care", startM: 1, startY: 2024, current: true },
        { title: "Front Desk Lead", employer: "Lakeview Urgent Care", startM: 5, startY: 2021, endM: 12, endY: 2023 },
        { title: "Patient Registration Specialist", employer: "Prairie Ridge Hospital", startM: 6, startY: 2018, endM: 4, endY: 2021 }
      ],
      education: { school: "Riverbend State University", credential: "Bachelor's degree", year: "2018" },
      edu: [{ school: "Riverbend State University", degree: "Bachelor's degree", field: "Health Services Administration", status: "Completed", year: "2018" }],
      certs: [
        { type: "BLS", other: "", org: "Midwest Lifesaving Council", number: "BLS-555-0164", issueM: 3, issueY: 2026, expM: 3, expY: 2028 },
        { type: "Other", other: "Workplace De-escalation Trainer", org: "Calm Response Institute", number: "CRI-555-3390", issueM: 9, issueY: 2023, noexp: true }
      ],
      facts: { leadSince: [5, 2021], team: 9, team_how: "9 front desk and float staff", highest: "Bachelor's degree", bls: true }
    },
    parsed: {
      contact: { first: "Marcus", last: "Odom", email: "careerlink.example.com/@marcus.odom", phone: "(952) 555-0164", city: "Burnsville", state: "MN", zip: "55337" },
      jobs: [
        job({ title: "Clinic Supervisor", employer: "Lakeview Urgent Care", location: "Apple Valley, MN", startM: "5", startY: "2021", current: true,
          desc: "Supervise 9 front desk and float staff across two shifts. Run the daily huddle, the staff schedule and time-off approvals. Handle patient complaints and write incident reports. Work with the nurse manager to keep waits under 30 minutes. Led a team of 4 and trained every new front desk hire. Balanced the cash drawer and made the daily deposit. Wrote the check-in checklist the clinic still uses." }),
        job({ title: "Patient Registration Specialist", employer: "Prairie Ridge Hospital", location: "Shakopee, MN", startM: "6", startY: "2018", endM: "4", endY: "2021",
          desc: "Registered 70+ emergency department patients a shift. Checked insurance and collected copays." })
      ],
      education: { school: "", credential: "", year: "" },
      edu: [{ school: "Riverbend State University", degree: "Bachelor's degree", field: "Business", status: "Completed", year: "2018" }],
      certs: [
        cert({ type: "BLS", org: "Midwest Lifesaving Council", number: "BLS-555-0164", issueM: "3", issueY: "2026", expM: "3", expY: "2028" })
      ]
    },
    errors: [
      { page: "profile", label: "His profile link landed in the email box", why: "The link has an @ in it, so the system took it for an email address. Recruiters would write to an address that doesn’t exist.",
        fields: ["c-email"], check: { match: ["contact.email"] } },
      { page: "profile", label: "The supervisor start date came from his lead role", why: "Two titles sat under one employer, and the system gave the newer title the older start date. That makes his time as supervisor look longer than it was, and hiring managers check.",
        fields: ["j0-startM", "j0-startY"], check: { jobDates: 0 },
        where: function (p) { var i = jobAt(p, marcus.truth.jobs[0]); return i >= 0 ? wrongDates(p.jobs[i], marcus.truth.jobs[0], i) : ["j0-title"]; } },
      { page: "profile", label: "The Front Desk Lead job was folded into the supervisor job", why: "It sat under the same employer heading, so the system merged it. Add it back as its own job with its own dates. A promotion is worth showing.",
        fields: ["add-job"], check: [{ hasJob: 1 }, { jobDates: 1 }],
        where: function (p) {
          var tj = marcus.truth.jobs[1], i = jobAt(p, tj);
          if (i >= 0) return wrongDates(p.jobs[i], tj, i);
          for (var k = 0; k < p.jobs.length; k++) if (loose(p.jobs[k].title, tj.title)) return ["j" + k + "-title", "j" + k + "-employer"];
          return ["add-job"];
        } },
      { page: "profile", label: "His minor landed in the field of study", why: "His major is Health Services Administration. Business is his minor. The system took the line closest to the year.",
        fields: ["ed0-field"], check: { fn: function (p) { var i = eduAt(p, "Riverbend State University"); return i >= 0 && loose(p.edu[i].field, "Health Services Administration"); } },
        where: function (p) { var i = eduAt(p, "Riverbend State University"); return [i >= 0 ? "ed" + i + "-field" : "ed0-school"]; } },
      { page: "certs", label: "His de-escalation trainer certification was left off", why: "It sat low in the sidebar, past where the system stopped reading. Add it with every detail: name, organization, number and dates.",
        fields: ["add-cert"],
        check: { fn: function (p) { var tc = marcus.truth.certs[1], i = certAt(p, tc); return i >= 0 && !certWrong(certsOf(p)[i], tc, i).length; } },
        where: function (p) { var tc = marcus.truth.certs[1], i = certAt(p, tc); return i >= 0 ? certWrong(certsOf(p)[i], tc, i) : ["add-cert"]; } }
    ],
    coach: ["Two columns look sharp, but systems often mix up the sidebar.", "Look hard at the email box, and at the two job titles under one employer. Then check Education word by word."],
    certCoach: ["This résumé keeps its licenses in the sidebar. Systems often stop reading a sidebar partway down.", "Count the certifications on the résumé. Then count them here."]
  };

  /* ---------- Level 3: Linh Tran, two pages, credentials everywhere ---------- */
  var RUN = 'style="display:flex;justify-content:space-between;font-size:calc(0.72 * var(--u));color:#5F5F5F;border-bottom:1px solid #ddd;padding-bottom:calc(0.3 * var(--u));margin-bottom:calc(1 * var(--u))"';
  var FOOT = 'class="pgfoot" style="font-size:calc(0.72 * var(--u));color:#666"';
  var GAP = 'style="margin-top:calc(0.55 * var(--u))"';
  var linh = {
    id: "lh-linh", person: "Linh Tran", file: "LTran_Resume_FINAL.pdf", level: "Tricky", levelNum: 3,
    doc: '<article class="rdoc functional" aria-label="Résumé page 1: Linh Tran">' +
      '<p class="rname">LINH TRAN, CMA</p>' +
      '<p class="rcontact">Eagan, MN 55122 &nbsp;·&nbsp; (651) 555-0182 &nbsp;·&nbsp; linh.tran@example.com</p>' +
      '<p class="obj">Certified medical assistant turned clinic operations lead. Ten years in busy clinics. I run the floor so providers can see patients on time.</p>' +
      "<h5>Professional Experience</h5>" +
      '<div class="hist"><p><b>Southshore Medical Group, Eagan Clinic</b><span>Eagan, MN</span></p>' +
      "<p " + GAP + "><i>Clinic Operations Lead</i><span>March 2022 to Present</span></p>" +
      "<ul><li>Lead 5 medical assistants and 3 front desk staff in a clinic with 6 providers</li><li>Build provider and staff schedules four weeks out and fill gaps</li>" +
      "<li>Cut the no-show rate 18% with reminder calls and a same-day waitlist</li><li>Point person for privacy questions, safety concerns and incident reports</li></ul>" +
      "<p><i>Certified Medical Assistant</i><span>July 2018 to February 2022</span></p>" +
      "<ul><li>Roomed patients, took vital signs and gave injections</li><li>Trained new medical assistants and mentored students</li></ul>" +
      '<p style="margin-top:calc(0.9 * var(--u))"><b>Pine Hollow Pediatrics</b><span>Burnsville, MN</span></p>' +
      "<p " + GAP + "><i>Medical Receptionist</i><span>May 2016 to June 2018</span></p>" +
      "<ul><li>Checked in 50+ families a day and scheduled well-child visits</li><li>Called parents with reminders and lab follow-ups</li></ul></div>" +
      "<p " + FOOT + ">Page 1 of 2</p></article>" +
      '<article class="rdoc functional" aria-label="Résumé page 2: Linh Tran"><p ' + RUN + "><span>Linh Tran, CMA</span><span>linh.tran@example.com</span></p>" +
      "<h5>Credentials</h5>" +
      '<div class="hist"><p><b>CMA, Certified Medical Assistant</b><span>Expires June 2028</span></p>' +
      "<p>Medical Assistant Certification Board. Certificate No. CMA-555-7716. Renewed June 2023. Certified since 2018.</p>" +
      "<p " + GAP + "><b>BLS Provider (CPR)</b><span>Expires January 2028</span></p>" +
      "<p>Midwest Lifesaving Council. Card No. BLS-555-0182. Issued January 2026.</p></div>" +
      "<h5>Education</h5>" +
      '<div class="hist"><p><b>Riverbend State University (online)</b><span>Expected May 2027</span></p>' +
      "<p>Bachelor of Science, Health Care Management. GPA 3.8. Two classes a term while working full time.</p>" +
      "<p " + GAP + "><b>Twin Rivers Technical College</b><span>2018</span></p>" +
      "<p>Medical Assistant Diploma</p></div>" +
      "<h5>Leadership Highlights</h5>" +
      "<ul><li>Led the clinic’s move to a new scheduling system with no missed appointments</li><li>Started a monthly staff huddle where front desk and medical assistants share fixes</li>" +
      "<li>Trusted to open and close the clinic and handle after-hours alarm calls</li></ul>" +
      "<h5>Languages</h5><p>English and Vietnamese</p>" +
      "<p " + FOOT + ">Page 2 of 2</p></article>",
    truth: {
      contact: { first: "Linh", last: "Tran", email: "linh.tran@example.com", phone: "(651) 555-0182", city: "Eagan", state: "MN", zip: "55122" },
      jobs: [
        { title: "Clinic Operations Lead", employer: "Southshore Medical Group", startM: 3, startY: 2022, current: true },
        { title: "Certified Medical Assistant", employer: "Southshore Medical Group", startM: 7, startY: 2018, endM: 2, endY: 2022 },
        { title: "Medical Receptionist", employer: "Pine Hollow Pediatrics", startM: 5, startY: 2016, endM: 6, endY: 2018 }
      ],
      education: { school: "Twin Rivers Technical College", credential: "Certificate", year: "2018" },
      edu: [
        { school: "Riverbend State University", degree: "Bachelor's degree", field: "Health Care Management", status: "In progress", year: "2027" },
        { school: "Twin Rivers Technical College", degree: "Certificate or diploma", field: "Medical Assistant", status: "Completed", year: "2018" }
      ],
      certs: [
        { type: "CMA", other: "", org: "Medical Assistant Certification Board", number: "CMA-555-7716", issueM: 6, issueY: 2023, expM: 6, expY: 2028 },
        { type: "BLS", other: "", org: "Midwest Lifesaving Council", number: "BLS-555-0182", issueM: 1, issueY: 2026, expM: 1, expY: 2028 }
      ],
      facts: { leadSince: [3, 2022], team: 8, team_how: "5 medical assistants and 3 front desk staff (8 people)", highest: "Certificate or diploma", bls: true,
        eduNote: "Her bachelor’s degree is still in progress, so the highest level she has finished is her medical assistant diploma." }
    },
    parsed: {
      contact: { first: "Linh", last: "Tran, CMA", email: "linh.tran@example.com", phone: "(651) 555-0182", city: "Eagan", state: "MN", zip: "55122" },
      jobs: [
        job({ title: "Clinic Operations Lead", employer: "Southshore Medical Group, Eagan Clinic", location: "Eagan, MN", startM: "7", startY: "2018", endM: "2", endY: "2022", current: false,
          desc: "Lead 5 medical assistants and 3 front desk staff in a clinic with 6 providers. Build provider and staff schedules four weeks out and fill gaps. Cut the no-show rate 18% with reminder calls and a same-day waitlist. Point person for privacy questions, safety concerns and incident reports." }),
        job({ title: "Certified Medical Assistant", employer: "Southshore Medical Group, Eagan Clinic", location: "Eagan, MN", startM: "3", startY: "2022", current: true,
          desc: "Roomed patients, took vital signs and gave injections. Trained new medical assistants and mentored students." }),
        job({ title: "Medical Receptionist", employer: "Pine Hollow Pediatrics", location: "Burnsville, MN", startM: "5", startY: "2016", endM: "6", endY: "2018",
          desc: "Checked in 50+ families a day and scheduled well-child visits. Called parents with reminders and lab follow-ups." })
      ],
      education: { school: "", credential: "", year: "" },
      edu: [
        { school: "Riverbend State University", degree: "Bachelor's degree", field: "Health Care Management", status: "Completed", year: "2027" },
        { school: "Twin Rivers Technical College", degree: "Associate degree", field: "Medical Assistant", status: "Completed", year: "2018" }
      ],
      certs: [
        cert({ type: "CNA", org: "Medical Assistant Certification Board", number: "CMA-555-7716", issueM: "6", issueY: "2023", expM: "6", expY: "2028" }),
        cert({ type: "BLS", org: "Midwest Lifesaving Council", number: "BLS-555-0182", issueM: "1", issueY: "2026", expM: "1", expY: "2028" })
      ]
    },
    errors: [
      { page: "profile", label: "Her credential got stuck to her last name", why: "“CMA” after a name is a credential, not part of the name. Her last name is Tran. Credentials go in Licenses and certifications.",
        fields: ["c-last"], check: { match: ["contact.last"] } },
      { page: "profile", label: "The promotion dates were swapped", why: "Two titles at one employer, and each one got the other’s dates. It looked like she went from lead back down to medical assistant.",
        fields: ["j0-startM", "j0-startY", "j0-endM", "j0-endY", "j0-current", "j1-startM", "j1-startY", "j1-endM", "j1-endY", "j1-current"],
        check: [{ jobDates: 0 }, { jobDates: 1 }],
        where: function (p) {
          var out = [];
          [0, 1].forEach(function (k) {
            var tj = linh.truth.jobs[k], i = jobAt(p, tj);
            if (i < 0) out.push("j" + k + "-title"); else if (!datesOk(p.jobs[i], tj)) out = out.concat(wrongDates(p.jobs[i], tj, i));
          });
          return out;
        } },
      { page: "profile", label: "Her bachelor’s degree was marked as finished", why: "“Expected May 2027” means she’s still in school. A degree marked finished that isn’t can cost a job offer when the school is checked.",
        fields: ["ed0-status"],
        check: { fn: function (p) { var i = eduAt(p, "Riverbend State University"); return i >= 0 && p.edu[i].status === "In progress" && year(p.edu[i].year) === "2027"; } },
        where: function (p) {
          var i = eduAt(p, "Riverbend State University"); if (i < 0) return ["ed0-school"];
          var out = [];
          if (p.edu[i].status !== "In progress") out.push("ed" + i + "-status");
          if (year(p.edu[i].year) !== "2027") out.push("ed" + i + "-year");
          return out.length ? out : ["ed" + i + "-status"];
        } },
      { page: "profile", label: "Her medical assistant diploma was read as an associate degree", why: "A diploma or certificate program is not an associate degree. Claim exactly what you earned.",
        fields: ["ed1-degree"],
        check: { fn: function (p) { var i = eduAt(p, "Twin Rivers Technical College"); return i >= 0 && p.edu[i].degree === "Certificate or diploma"; } },
        where: function (p) { var i = eduAt(p, "Twin Rivers Technical College"); return [i >= 0 ? "ed" + i + "-degree" : "add-edu"]; } },
      { page: "certs", label: "Her CMA was read as CNA", why: "CMA (Certified Medical Assistant) and CNA (Certified Nursing Assistant) are different jobs. One wrong letter claims a credential she doesn’t have.",
        fields: ["k0-type"],
        check: { fn: function (p) { var l = certsOf(p); return l.some(function (c) { return c.type === "CMA"; }) && !l.some(function (c) { return c.type === "CNA"; }); } },
        where: function (p) {
          var l = certsOf(p), out = [];
          l.forEach(function (c, i) { if (c.type === "CNA" || sameNum(c.number, "CMA-555-7716")) out.push("k" + i + "-type"); });
          return out.length ? out : ["add-cert"];
        } }
    ],
    coach: ["Two pages, a credential after the name, and two titles at one employer. This one hides its mistakes well.", "Check the name, the order of the promotion, and every word in Education. Page 2 has more."],
    certCoach: ["In healthcare, one letter can mean a different job.", "Read each credential name slowly against page 2 of the résumé."]
  };

  window.LH_RESUMES = [nadia, marcus, linh];
  window.LH_HELP = { norm: norm, loose: loose, certName: certName };
})();
