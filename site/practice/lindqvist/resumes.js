/*
  Lindqvist Freight practice résumés (advanced course: salaried, professional résumés).
  Each résumé has: doc (what the learner sees), truth (what the résumé actually says),
  parsed (what autofill put in the form), and errors (each planted mistake, why it happened,
  and how the engine checks whether the learner fixed it).
  The form here is a one-page application, so the profile has its own shape:
    contact: first, last, email, phone, city
    work: company, title (the current job)
    links: profile (a professional profile link)
    education: school, degree, field, startY, endY
  The docs use only the shared résumé styles (practice.css) and inline styles, so tools/make-pdfs.py can print them.
  All people, companies, schools, phone numbers, emails and links are invented.
*/
(function () {
  "use strict";

  var ICON = {
    phone: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/></svg>',
    mail: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7.2L4.5 7v.2L12 13l7.5-5.8V7z"/></svg>',
    link: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F2B544" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1.2-1.2"/></svg>',
    pin: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M12 2a7 7 0 017 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z"/></svg>'
  };
  var RUN = 'style="display:flex;justify-content:space-between;font-size:calc(0.7 * var(--u));color:#666;border-bottom:1px solid #e4e4e4;padding-bottom:calc(0.3 * var(--u));margin-bottom:calc(0.9 * var(--u))"';
  var FOOT = 'class="pgfoot" style="font-size:calc(0.7 * var(--u));color:#666"';
  var SUBLINE = 'style="display:flex;justify-content:space-between;gap:calc(1 * var(--u));font-style:italic"';

  /* Matching helpers for the checks below. Case, periods and extra spaces don't matter. */
  function words(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  /* "Bachelor of Applied Science", "B.A.S.", "BS", "Bachelor's degree" all count as a bachelor's degree */
  function isBachelor(s) { return /(^| )(bachelor|bachelors|b a s|bas|b s|bs|bsc|b a|ba)( |$)/.test(words(s)); }
  /* "Burnsville", "Burnsville, MN" and "Burnsville, Minnesota 55337" all name the same city */
  function sameCity(got, want) { return words(got).replace(/(^| )(mn|minnesota|\d{5})(?= |$)/g, " ").replace(/\s+/g, " ").trim() === words(want); }
  function edu(school, degree, field, startY, endY) { return { school: school, degree: degree, field: field, startY: startY, endY: endY }; }

  /* ---------- 1. Clean: one column, standard headings ---------- */
  var denise = {
    id: "lf-denise", person: "Denise Carlson", file: "Denise-Carlson-Resume.pdf", level: "Clean", levelNum: 1,
    doc: '<article class="rdoc classic" aria-label="Résumé: Denise Carlson">' +
      '<p class="rname">Denise Carlson</p>' +
      '<p class="rcontact">Burnsville, MN 55337 &nbsp;|&nbsp; (952) 555-0164 &nbsp;|&nbsp; denise.carlson@example.com &nbsp;|&nbsp; profiles.example.com/denise-carlson</p>' +
      "<h5>Summary</h5><p>Operations coordinator with five years of experience keeping warehouse projects, vendor schedules and budgets on track. Known for clear status updates and calm problem solving on a busy dock.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Prairie Line Distribution</b><span>Shakopee, MN</span></p>' +
      '<p class="jobline"><i>Operations Coordinator</i><span>March 2023 to Present</span></p>' +
      "<ul><li>Coordinate dock schedules and vendor deliveries for a 220,000-square-foot distribution center</li>" +
      "<li>Track budgets for facility projects up to $180,000 and send a weekly status report to the operations director</li>" +
      "<li>Led the rollout of a new yard scheduling tool across three shifts, two weeks ahead of plan</li></ul>" +
      '<p class="jobline"><i>Logistics Assistant</i><span>June 2021 to February 2023</span></p>' +
      "<ul><li>Booked carrier pickups and kept the shipping calendar up to date</li><li>Matched vendor invoices to purchase orders in spreadsheets</li></ul>" +
      '<p class="jobline"><b>Cedar Ridge Events</b><span>Bloomington, MN</span></p>' +
      '<p class="jobline"><i>Event Assistant</i><span>May 2019 to May 2021</span></p>' +
      "<ul><li>Helped plan 40+ weddings and company events a year, from vendor bookings to day-of timelines</li><li>Kept event budgets and guest lists in shared spreadsheets</li></ul>" +
      "<h5>Education</h5><p><b>Bachelor of Arts in Business Administration</b>, Metro Valley University, Saint Paul, MN, 2015 to 2019</p>" +
      "<h5>Training</h5><p>Project Management Foundations Certificate, Twin Cities Technical College, 2024</p>" +
      "<h5>Skills</h5><p>Spreadsheets (formulas, pivot tables, lookups) &nbsp;|&nbsp; Project scheduling tools &nbsp;|&nbsp; Vendor communication &nbsp;|&nbsp; Budget tracking &nbsp;|&nbsp; Status reports</p></article>",
    truth: {
      contact: { first: "Denise", last: "Carlson", email: "denise.carlson@example.com", phone: "(952) 555-0164", city: "Burnsville" },
      work: { company: "Prairie Line Distribution", title: "Operations Coordinator" },
      links: { profile: "profiles.example.com/denise-carlson" },
      education: edu("Metro Valley University", "Bachelor of Arts", "Business Administration", "2015", "2019")
    },
    parsed: {
      contact: { first: "Denise", last: "Carlson", email: "denise.carlson@example.com", phone: "(952) 555-0164", city: "Shakopee" },
      work: { company: "Prairie Line Distribution", title: "Logistics Assistant" },
      links: { profile: "profiles.example.com/denise-carlson" },
      education: edu("Metro Valley University", "Bachelor of Arts", "Business Administration", "2015", "2019")
    },
    errors: [
      { label: "The current title is her title from before a promotion", why: "Two titles sat under one company name. The system kept the second one it read, Logistics Assistant. Her title now is Operations Coordinator.",
        fields: ["w-title"], check: { match: ["work.title"] } },
      { label: "The city came from her job, not her home", why: "Shakopee is where Prairie Line Distribution is. She lives in Burnsville, on her contact line. Employers use this box to see who lives nearby.",
        fields: ["c-city"], check: { fn: function (p) { return sameCity(p.contact.city, "Burnsville"); } } }
    ],
    coach: ["A clean, one-column résumé with standard headings. Autofill reads these best.", "Two things went wrong anyway. One of them has to do with a promotion."]
  };

  /* ---------- 2. Harder format: two columns, sidebar with icons ---------- */
  var marcus = {
    id: "lf-kevin", person: "Kevin Thao", file: "KevinThao_Resume.pdf", level: "Two columns", levelNum: 2,
    doc: '<article class="rdoc sidebar" aria-label="Résumé: Kevin Thao"><div class="side">' +
      '<div class="avatar" aria-hidden="true">KT</div>' +
      "<h5>Contact</h5>" +
      '<p class="ico">' + ICON.phone + "<span>(651) 555-0139</span></p>" +
      '<p class="ico">' + ICON.mail + "<span>kevin.thao@example.com</span></p>" +
      '<p class="ico">' + ICON.link + "<span>profiles.example.com/kevinthao</span></p>" +
      '<p class="ico">' + ICON.pin + "<span>Roseville, MN 55113</span></p>" +
      "<h5>Skills</h5>" +
      '<p class="skill">Project scheduling<br><span class="dots" aria-label="5 out of 5">●●●●●</span></p>' +
      '<p class="skill">Budgets and invoices<br><span class="dots" aria-label="4 out of 5">●●●●○</span></p>' +
      '<p class="skill">Vendor contracts<br><span class="dots" aria-label="4 out of 5">●●●●○</span></p>' +
      '<p class="skill">Spreadsheets<br><span class="dots" aria-label="5 out of 5">●●●●●</span></p>' +
      "<h5>Certifications</h5><p>Project Management Essentials, Northern Lakes Community College, 2024</p>" +
      '</div><div class="main">' +
      '<p class="rname">Kevin<br>Thao</p><p class="rtitle">Project and Events Coordinator</p>' +
      "<h5>Profile</h5><p>Coordinator with six years of experience running events and projects for teams of 5 to 40 people. I keep timelines, budgets and vendors moving, and I like a well-built spreadsheet.</p>" +
      "<h5>Experience</h5>" +
      '<p class="co">Project Coordinator</p><p>Bluestem Fulfillment, Minneapolis, MN<br><span class="dates">January 2024 to Present</span></p>' +
      "<ul><li>Coordinate 6 to 8 warehouse and client projects at a time, from kickoff to launch</li><li>Track project budgets up to $250,000 and flag overruns early</li><li>Run weekly vendor calls and keep the project tracker current</li></ul>" +
      '<p class="co">RIVERFRONT CONVENTION CENTER</p><p>Events Coordinator, Saint Paul, MN<br><span class="dates">August 2020 to December 2023</span></p>' +
      "<ul><li>Planned 120+ conferences and trade shows a year, from 50 to 2,000 guests</li><li>Booked vendors, built floor plans and managed event budgets</li><li>Wrote setup schedules for crews of up to 30</li></ul>" +
      "<h5>Education</h5><p><b>Hospitality and Event Management</b>, B.A.S.<br>Northern Lakes State University, Moorhead, MN<br><span class=\"dates\">2016 to 2020</span></p>" +
      "</div></article>",
    truth: {
      contact: { first: "Kevin", last: "Thao", email: "kevin.thao@example.com", phone: "(651) 555-0139", city: "Roseville" },
      work: { company: "Bluestem Fulfillment", title: "Project Coordinator" },
      links: { profile: "profiles.example.com/kevinthao" },
      education: edu("Northern Lakes State University", "Bachelor of Applied Science", "Hospitality and Event Management", "2016", "2020")
    },
    parsed: {
      contact: { first: "Kevin", last: "Thao", email: "profiles.example.com/kevinthao", phone: "", city: "Roseville" },
      work: { company: "Riverfront Convention Center", title: "Project Coordinator" },
      links: { profile: "" },
      education: edu("Northern Lakes State University", "Hospitality and Event Management", "B.A.S.", "2016", "2020")
    },
    errors: [
      { label: "The profile link went in the Email box instead of its own box", why: "In the sidebar the link sat right under the email, next to a small icon. The system grabbed the wrong line, so the email was lost and the Professional profile link box stayed empty.",
        fields: ["c-email", "l-profile"], check: { match: ["contact.email", "links.profile"] } },
      { label: "The phone number was skipped", why: "It sat next to a phone icon in the sidebar. Many systems skip text that sits beside a picture.",
        fields: ["c-phone"], check: { match: ["contact.phone"] } },
      { label: "The current company is his old employer", why: "His newest job puts the title first and the company on the next line. His older job puts the company first, in capitals. The system mixed up the two styles and took Riverfront Convention Center.",
        fields: ["w-company"], check: { match: ["work.company"] } },
      { label: "The degree and the field of study were swapped", why: "This résumé puts the field of study first and the degree after it as a short form, B.A.S. (Bachelor of Applied Science). The system put each one in the other's box.",
        fields: ["e-degree", "e-field"], check: { fn: function (p) { var e = p.education || {}; return isBachelor(e.degree) && /hospitality/.test(words(e.field)) && !isBachelor(e.field); } } }
    ],
    coach: ["Two-column résumés look sharp, but autofill reads straight across the page and gets lost around the icons.", "Check the sidebar first. Then compare each job and the education line."]
  };

  /* ---------- 3. Tricky: two pages, credential after the name, "Reports to" line, references ---------- */
  var nadia = {
    id: "lf-selam", person: "Selam Haile", file: "Selam_Haile_CAPM_Resume_2026.pdf", level: "Tricky", levelNum: 3,
    doc: '<article class="rdoc functional" aria-label="Résumé page 1: Selam Haile">' +
      '<p class="rname">SELAM HAILE, CAPM</p>' +
      '<p class="rcontact">Minneapolis, MN 55406 &nbsp;·&nbsp; (612) 555-0127 &nbsp;·&nbsp; selam.haile@example.com &nbsp;·&nbsp; profiles.example.com/selam-haile</p>' +
      '<p class="obj">Logistics project coordinator: cold chain, warehouse launches and vendor-heavy projects</p>' +
      "<h5>Summary</h5><p>Project coordinator with nine years in logistics and inventory, the last three running cross-team projects. I keep projects on schedule and on budget, and I write status reports that busy leaders actually read.</p>" +
      "<h5>Core Skills</h5><p>Project schedules &nbsp;·&nbsp; Budget tracking &nbsp;·&nbsp; Vendor management &nbsp;·&nbsp; Status reports &nbsp;·&nbsp; Spreadsheets and dashboards &nbsp;·&nbsp; Cold chain safety &nbsp;·&nbsp; Training and onboarding</p>" +
      "<h5>Professional Experience</h5>" +
      '<div class="hist"><p><b>Northbound Cold Storage</b><span>Inver Grove Heights, MN</span></p>' +
      "<p " + SUBLINE + "><span>Logistics Project Coordinator, Operations Project Office</span><span>April 2023 to Present</span></p></div>" +
      '<p style="color:#666;font-size:calc(0.9 * var(--u))">Reports to: Senior Manager, Operations Projects</p>' +
      "<ul><li>Coordinate 10 or more projects a year, including a $1.2 million freezer expansion and a new dock scheduling system</li>" +
      "<li>Build project schedules and send weekly status reports to leaders in three buildings</li>" +
      "<li>Track budgets and vendor invoices; caught $38,000 in duplicate billing in 2025</li>" +
      "<li>Run kickoff and lessons-learned meetings for every project</li>" +
      "<li><b>Freezer expansion, 2025:</b> kept 14 vendors on one schedule; opened on time and 3% under budget</li>" +
      "<li><b>Dock scheduling system, 2024:</b> planned training for 60 drivers and dock staff; cut truck wait times by 20 minutes</li></ul>" +
      '<div class="hist"><p><b>Twin Ports Grocery Supply</b><span>Saint Paul, MN</span></p>' +
      "<p " + SUBLINE + "><span>Inventory Analyst</span><span>June 2017 to March 2023</span></p></div>" +
      "<ul><li>Ran weekly cycle counts and fixed stock errors across 9,000 items</li><li>Built the vendor delivery tracker the team still uses</li>" +
      "<li>Planned the weekend move of 2,400 items to a new storage area with no missed orders</li><li>Trained six new hires on receiving and inventory software</li></ul>" +
      "<p " + FOOT + ">Page 1 of 2</p></article>" +
      '<article class="rdoc functional" aria-label="Résumé page 2: Selam Haile">' +
      "<p " + RUN + "><span>Selam Haile, CAPM</span><span>Page 2</span></p>" +
      "<h5>Professional Experience, continued</h5>" +
      '<div class="hist"><p><b>Riverbend State University Dining Services</b><span>Mankato, MN</span></p>' +
      "<p " + SUBLINE + "><span>Stockroom Assistant (part time, while in school)</span><span>September 2014 to May 2017</span></p></div>" +
      "<ul><li>Received and put away food deliveries for four campus kitchens</li><li>Kept the stockroom count sheet and flagged low items to the purchasing lead</li></ul>" +
      "<h5>Education</h5>" +
      '<div class="hist"><p><b>Riverbend State University</b><span>Mankato, MN</span></p></div>' +
      "<p>Bachelor of Science, Supply Chain Management, 2017</p><p>Minor: Data Analytics</p>" +
      "<h5>Certifications and Training</h5><p>CAPM (Certified Associate in Project Management), 2024</p><p>Cold Chain Safety Training, Upper Midwest Food Logistics Council, 2022</p>" +
      "<h5>Volunteer</h5>" +
      '<div class="hist"><p><b>East Lake Community Festival</b><span>Minneapolis, MN</span></p>' +
      "<p " + SUBLINE + "><span>Vendor Lead</span><span>2019 to Present</span></p></div>" +
      "<ul><li>Sign up and schedule 45 food and craft vendors for a one-day festival each August</li></ul>" +
      "<h5>References</h5><p>Daniel Ruiz, Former Supervisor, Twin Ports Grocery Supply<br>(651) 555-0182 &nbsp;·&nbsp; daniel.ruiz@example.com</p>" +
      "<p " + FOOT + ">Page 2 of 2</p></article>",
    truth: {
      contact: { first: "Selam", last: "Haile", email: "selam.haile@example.com", phone: "(612) 555-0127", city: "Minneapolis" },
      work: { company: "Northbound Cold Storage", title: "Logistics Project Coordinator" },
      links: { profile: "profiles.example.com/selam-haile" },
      education: edu("Riverbend State University", "Bachelor of Science", "Supply Chain Management", "", "2017")
    },
    parsed: {
      contact: { first: "Selam", last: "Haile, CAPM", email: "selam.haile@example.com", phone: "(651) 555-0182", city: "Minneapolis" },
      work: { company: "Northbound Cold Storage", title: "Senior Manager, Operations Projects" },
      links: { profile: "profiles.example.com/selam-haile" },
      education: edu("Riverbend State University", "Bachelor of Science", "Data Analytics", "2017", "")
    },
    errors: [
      { label: "Her certification got stuck to her last name", why: "CAPM after her name is a certification, not part of her name. Name boxes get only the name. The certification already shows on her résumé.",
        fields: ["c-last"], check: { match: ["contact.last"] } },
      { label: "The phone number came from her references", why: "The system took the last phone number in the file. That one belongs to her old supervisor, on page 2. Her own number is at the top of page 1.",
        fields: ["c-phone"], check: { match: ["contact.phone"] } },
      { label: "Her boss’s title became her current title", why: "The line under her job says who she reports to. The system read “Senior Manager, Operations Projects” as her title. Her title is Logistics Project Coordinator.",
        fields: ["w-title"], check: { match: ["work.title"] } },
      { label: "Her minor was read as her field of study", why: "“Minor: Data Analytics” looked like a label and an answer, so the system used it. Her field of study (her major) is Supply Chain Management.",
        fields: ["e-field"], check: { fn: function (p) { return /supply chain/.test(words((p.education || {}).field)); } } },
      { label: "The graduation year went in the Start year box", why: "The résumé gives only one year, 2017, the year she finished. That goes in End year. The résumé doesn't give a start year, so the Start year box can stay blank.",
        fields: ["e-start", "e-end"], check: { fn: function (p) { var e = p.education || {}, st = String(e.startY || "").trim(); return String(e.endY) === "2017" && (!st || (/^\d{4}$/.test(st) && +st >= 2008 && +st < 2017)); } } }
    ],
    coach: ["Two pages, with extra lines that autofill can misread: a credential after the name, who she reports to, and references.", "Check every box against both pages. Use the zoom buttons if the words are small."]
  };

  window.LF_RESUMES = [denise, marcus, nadia];
})();
