/*
  Halvorsen & Pike practice résumés.
  Each résumé has: doc (what the learner sees), truth (what the résumé actually says),
  parsed (what the "system" filled in), and errors (each planted mistake, why it happened,
  and how the engine checks whether the learner fixed it).
  All people, companies, schools, phone numbers and emails are invented.
*/
(function () {
  "use strict";

  var ICON = {
    phone: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/></svg>',
    mail: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7.2L4.5 7v.2L12 13l7.5-5.8V7z"/></svg>',
    pin: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M12 2a7 7 0 017 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z"/></svg>'
  };

  var alan = {
    id: "hp-alan", person: "Alan Johnson", file: "Alan-Johnson-Resume.pdf", level: "Clean", levelNum: 1,
    doc: '<article class="rdoc classic" aria-label="Résumé: Alan Johnson">' +
      '<p class="rname">Alan Johnson</p>' +
      '<p class="rcontact">Brooklyn Center, MN 55430 &nbsp;|&nbsp; (763) 555-0172 &nbsp;|&nbsp; alan.johnson@example.com</p>' +
      "<h5>Summary</h5><p>Reliable operations associate with ten years of stockroom and shipping experience. Safe, organized and easy to work with.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Operations Associate, Business Land</b><span>May 2019 to Present</span></p><p>Minneapolis, MN</p>' +
      "<ul><li>Receive, sort and ship supplies for 40+ business accounts</li><li>Work with vendors every day and keep delivery records up to date</li><li>Trained four new associates on safe stockroom practices</li></ul>" +
      '<p class="jobline"><b>Stock Associate, Cedar Avenue Hardware</b><span>June 2016 to April 2019</span></p><p>Minneapolis, MN</p>' +
      "<ul><li>Stocked shelves, built displays and unloaded weekly freight</li><li>Helped customers find the right parts</li></ul>" +
      "<h5>Education</h5><p>High School Diploma, Northside High School, Minneapolis, MN, 2016</p>" +
      "<h5>Skills</h5><p>Pallet jack, inventory counts, Microsoft Excel, safe lifting</p></article>",
    truth: {
      contact: { first: "Alan", last: "Johnson", email: "alan.johnson@example.com", phone: "(763) 555-0172", city: "Brooklyn Center", state: "MN", zip: "55430" },
      jobs: [
        { title: "Operations Associate", employer: "Business Land", startM: 5, startY: 2019, current: true },
        { title: "Stock Associate", employer: "Cedar Avenue Hardware", startM: 6, startY: 2016, endM: 4, endY: 2019 }
      ],
      education: { school: "Northside High School", credential: "High school diploma", year: "2016" }
    },
    parsed: {
      contact: { first: "Alan", last: "Johnson", email: "alan.johnson@example.com", phone: "(763) 555-0172", city: "Brooklyn Center", state: "MN", zip: "" },
      jobs: [
        { title: "Operations Associate", employer: "Business Land", location: "Minneapolis, MN", startM: "5", startY: "2019", endM: "5", endY: "2019", current: false,
          desc: "Receive, sort and ship supplies for 40+ business accounts. Work with vendors every day and keep delivery records up to date. Trained four new associates on safe stockroom practices." },
        { title: "Stock Associate", employer: "Cedar Avenue Hardware", location: "Minneapolis, MN", startM: "6", startY: "2016", endM: "4", endY: "2019", current: false,
          desc: "Stocked shelves, built displays and unloaded weekly freight. Helped customers find the right parts." }
      ],
      education: { school: "Northside High School", credential: "High school diploma", year: "2016" }
    },
    errors: [
      { label: "The ZIP code was dropped", why: "Even clean résumés lose pieces. Location filters can skip an application with no ZIP.",
        fields: ["c-zip"], check: { match: ["contact.zip"] } },
      { label: "“Present” didn't come through, so the end date matched the start date", why: "It made a seven-year job look like a one-month job.",
        fields: ["j0-endM", "j0-endY", "j0-current"], check: { jobDates: 0 } }
    ],
    coach: ["This is a clean, one-column résumé with standard headings. Systems read these best.", "It still lost two things. Open the résumé and check every box anyway."]
  };

  var jordan = {
    id: "hp-jordan", person: "Jordan Reyes", file: "Jordan-Reyes-Resume.pdf", level: "Fancy format", levelNum: 2,
    doc: '<article class="rdoc sidebar" aria-label="Résumé: Jordan Reyes"><div class="side">' +
      '<div class="avatar" aria-hidden="true">JR</div>' +
      "<h5>Contact</h5>" +
      '<p class="ico">' + ICON.phone + "<span>(612) 555-0148</span></p>" +
      '<p class="ico">' + ICON.mail + "<span>jordan.reyes@example.com</span></p>" +
      '<p class="ico">' + ICON.pin + "<span>Minneapolis, MN 55411</span></p>" +
      "<h5>Skills</h5>" +
      '<p class="skill">Forklift certified<br><span class="dots" aria-label="4 out of 5">●●●●○</span></p>' +
      '<p class="skill">Bilingual: English and Spanish<br><span class="dots" aria-label="5 out of 5">●●●●●</span></p>' +
      '<p class="skill">Inventory software<br><span class="dots" aria-label="3 out of 5">●●●○○</span></p>' +
      '<p class="skill">Customer service<br><span class="dots" aria-label="4 out of 5">●●●●○</span></p>' +
      '</div><div class="main">' +
      '<p class="rname">Jordan<br>Reyes</p><p class="rtitle">Warehouse and Stock Professional</p>' +
      "<h5>Experience</h5>" +
      '<p class="co">MIDWAY FOODS</p><p>Stocker, Minneapolis, MN<br><span class="dates">Mar 2023 to Present</span></p>' +
      "<ul><li>Stocked shelves and rotated product to keep dates fresh</li><li>Unloaded two trucks a week and checked deliveries against invoices</li><li>Trained three new hires on the backroom layout</li></ul>" +
      '<p class="co">LAKESIDE GRILL</p><p>Crew Member, Minneapolis, MN<br><span class="dates">Jun 2021 to Feb 2023</span></p>' +
      "<ul><li>Ran the drive-thru window during the lunch rush</li><li>Counted the cash drawer at close</li></ul>" +
      "<h5>Education</h5><p>GED, Minneapolis Adult Education, 2021</p></div></article>",
    truth: {
      contact: { first: "Jordan", last: "Reyes", email: "jordan.reyes@example.com", phone: "(612) 555-0148", city: "Minneapolis", state: "MN", zip: "55411" },
      jobs: [
        { title: "Stocker", employer: "Midway Foods", startM: 3, startY: 2023, current: true },
        { title: "Crew Member", employer: "Lakeside Grill", startM: 6, startY: 2021, endM: 2, endY: 2023 }
      ],
      education: { school: "Minneapolis Adult Education", credential: "GED", year: "2021" }
    },
    parsed: {
      contact: { first: "Jordan", last: "Reyes", email: "", phone: "", city: "Minneapolis MN 55411", state: "", zip: "" },
      jobs: [
        { title: "Midway Foods", employer: "Stocker", location: "Minneapolis, MN", startM: "3", startY: "2023", endM: "", endY: "", current: true,
          desc: "Forklift certified Bilingual: English and Spanish Inventory software Customer service Stocked shelves and rotated product to keep dates fresh. Unloaded two trucks a week and checked deliveries against invoices. Trained three new hires on the backroom layout." }
      ],
      education: { school: "Minneapolis Adult Education", credential: "GED", year: "2021" }
    },
    errors: [
      { label: "The phone number and email were skipped", why: "They sat in the sidebar next to little icons. Many systems can't read text that sits beside pictures.",
        fields: ["c-email", "c-phone"], check: { match: ["contact.email", "contact.phone"] } },
      { label: "City, state and ZIP were crammed into one box", why: "They shared one line with a map-pin icon, so the system couldn't split them apart.",
        fields: ["c-city", "c-state", "c-zip"], check: { match: ["contact.city", "contact.state", "contact.zip"] } },
      { label: "Job title and employer were swapped", why: "On this résumé the company name comes first and in bold, so the system guessed it was the job title.",
        fields: ["j0-title", "j0-employer"], check: { hasJob: 0 } },
      { label: "The sidebar skills got poured into the job description", why: "The system read straight across the page, left column into right.",
        fields: ["j0-desc"], check: { excludes: { job: 0, terms: ["forklift", "bilingual"] } } },
      { label: "The second job was skipped", why: "Lakeside Grill sat lower in the right-hand column, past where the system stopped reading.",
        fields: ["add-job"], check: { hasJob: 1 } }
    ],
    coach: ["Two-column résumés look sharp, but most systems read straight across the page, left to right.", "Open the résumé and compare line by line. Watch what happened to the sidebar."]
  };

  var marisol = {
    id: "hp-marisol", person: "Marisol Banks", file: "Marisol_Banks_Resume_2026.pdf", level: "Tricky", levelNum: 3,
    doc: '<article class="rdoc header" aria-label="Résumé: Marisol Banks">' +
      '<p class="pagehead">Marisol Banks &nbsp;|&nbsp; (651) 555-0193 &nbsp;|&nbsp; marisol.banks@example.com &nbsp;|&nbsp; Saint Paul, MN 55104</p>' +
      '<p class="hello">Hello! I’m Marisol.</p><p class="intro">Caring, steady and fast on my feet. Looking for full-time warehouse work.</p>' +
      "<h5>Where I’ve Worked</h5>" +
      '<p><b>Seasonal Package Handler</b>, Crosstown Parcel, Eagan, MN<br><span class="when">10.2023 to 01.2024</span></p>' +
      "<ul><li>Scanned and sorted 1,200+ packages a shift during peak season</li><li>Loaded delivery vans by route</li></ul>" +
      '<p><b>Family Caregiver</b><br><span class="when">07.2021 to 09.2023</span></p>' +
      "<ul><li>Cared full time for a family member after an illness</li></ul>" +
      '<p><b>Home Health Aide</b>, Comfort Home Care, Saint Paul, MN<br><span class="when">04.2017 to 06.2021</span></p>' +
      "<ul><li>Helped clients with daily care, meals and getting around</li><li>Kept accurate visit notes for nurses</li></ul>" +
      "<h5>What I Bring</h5><p>" + ["Safe lifting", "Scanner guns", "Reliable", "Patient", "Valid driver’s license"].map(function (s) { return '<span class="pill">' + s + "</span>"; }).join("") + "</p>" +
      "<h5>School</h5><p>Lakeview High School, Diploma, 2009</p></article>",
    truth: {
      contact: { first: "Marisol", last: "Banks", email: "marisol.banks@example.com", phone: "(651) 555-0193", city: "Saint Paul", state: "MN", zip: "55104" },
      jobs: [
        { title: "Seasonal Package Handler", employer: "Crosstown Parcel", startM: 10, startY: 2023, endM: 1, endY: 2024 },
        { title: "Home Health Aide", employer: "Comfort Home Care", startM: 4, startY: 2017, endM: 6, endY: 2021 }
      ],
      education: { school: "Lakeview High School", credential: "High school diploma", year: "2009" }
    },
    parsed: {
      contact: { first: "Hello!", last: "I’m Marisol", email: "", phone: "", city: "", state: "", zip: "" },
      jobs: [
        { title: "Seasonal Package Handler", employer: "Crosstown Parcel", location: "Eagan, MN", startM: "", startY: "", endM: "", endY: "", current: false,
          desc: "Scanned and sorted 1,200+ packages a shift during peak season. Loaded delivery vans by route." }
      ],
      education: { school: "", credential: "", year: "" }
    },
    errors: [
      { label: "The greeting became the name", why: "The system grabbed the first big words on the page: “Hello! I’m Marisol.”",
        fields: ["c-first", "c-last"], check: { match: ["contact.first", "contact.last"] } },
      { label: "The phone number and email were missing", why: "They were in the page header, the small line at the very top. Many systems never read headers.",
        fields: ["c-email", "c-phone"], check: { match: ["contact.email", "contact.phone"] } },
      { label: "City, state and ZIP were missing", why: "Same page header. The address never made it in.",
        fields: ["c-city", "c-state", "c-zip"], check: { match: ["contact.city", "contact.state", "contact.zip"] } },
      { label: "The work dates didn't come through", why: "Dates written like 10.2023 confuse a lot of systems. Month names or 10/2023 work better.",
        fields: ["j0-startM", "j0-startY", "j0-endM", "j0-endY"], check: { jobDates: 0 } },
      { label: "The home health aide job was skipped", why: "“Where I’ve Worked” isn't a standard heading, so the system only half-read that section.",
        fields: ["add-job"], check: { hasJob: 1 } },
      { label: "Education was skipped", why: "“School” wasn't recognized as an education heading.",
        fields: ["e-school", "e-cred", "e-year"], check: { match: ["education.school", "education.credential", "education.year"] } }
    ],
    coach: ["Creative headings and contact info tucked into the page header are invisible to a lot of systems. This one needs the most rebuilding.",
      "The caregiving years weren't a paid job, but you can add them as their own entry so the gap isn't a mystery. Use “Family Caregiver” as the job title and “Family” as the employer, since the form needs one. Your call. It isn't scored."]
  };

  /* A learner's own file: never opened. The "parse" is junk built from the file name. */
  function own(fileName) {
    var base = fileName.replace(/\.[^.]+$/, "").replace(/[-_.]+/g, " ").replace(/\s+/g, " ").trim() || "Document";
    var J = "References available upon request.";
    return {
      id: "own", person: "Your résumé", file: fileName, level: "Your file", levelNum: 2, own: true,
      doc: '<div class="rdoc ownfile"><p><b>This is your own file.</b></p><p>This practice site never opens it, so open it on your computer and compare it to the form.</p></div>',
      truth: null,
      parsed: {
        contact: { first: "Resume", last: base, email: "", phone: "", city: "Objective:", state: "", zip: "" },
        jobs: [{ title: "EXPERIENCE", employer: "", location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: J }],
        education: { school: "", credential: "", year: "" }
      },
      errors: [
        { label: "The name came from the file name, not the résumé", why: "The system filled in “Resume” plus whatever the file was called.",
          fields: ["c-first", "c-last"], check: { fn: function (p) { var f = p.contact.first.trim(), l = p.contact.last.trim(); return f && l && f.toLowerCase() !== "resume" && l !== base; } } },
        { label: "Email and phone were left blank", why: "Without these, nobody can reach you.",
          fields: ["c-email", "c-phone"], check: { fn: function (p) { var d = window.Practice.digits(p.contact.phone); return window.Practice.validEmail(p.contact.email) && (d.length === 10 || (d.length === 11 && d.charAt(0) === "1")); } } }, // "+1 (612) 555-0100" counts, like the practice résumés
        { label: "A section heading landed in the City box", why: "“Objective:” is not a city. Location filters would skip you.",
          fields: ["c-city", "c-state", "c-zip"], check: { fn: function (p) { var c = p.contact.city.trim(); return c && c !== "Objective:" && !/\d/.test(c) && p.contact.state && /^\d{5}(?:[\s-]?\d{4})?$/.test(p.contact.zip.trim()); } } }, // ZIP+4 like 55408-1234 counts too
        { label: "The heading “EXPERIENCE” became a job title", why: "The system read the section label as a job.",
          fields: ["j0-title", "j0-employer"], check: { fn: function (p) { var j = p.jobs[0] || {}; return (j.title || "").trim() && j.title.trim().toUpperCase() !== "EXPERIENCE" && (j.employer || "").trim(); } } },
        { label: "The job description was a leftover line", why: "“References available upon request” says nothing about the work.",
          fields: ["j0-desc"], check: { fn: function (p) { var j = p.jobs[0] || {}; return (j.desc || "").trim() && !/references available/i.test(j.desc); } } }
      ],
      coach: ["This is your own file, so you're the only one who knows what it says. Open it on your computer and check every box against it.",
        "The system pulled almost nothing useful out of it. That happens more than you'd think."]
    };
  }

  window.HP_RESUMES = [alan, jordan, marisol];
  window.HP_OWN = own;
})();
