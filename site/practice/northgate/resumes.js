/*
  Northgate Outfitters practice résumés (job board Easy Apply).
  The board builds a profile from the résumé; these are the mistakes it makes.
  All people, businesses, schools, numbers and emails are invented.
*/
(function () {
  "use strict";
  function edu(s, c, y) { return { school: s, credential: c, year: y }; }

  var maria = {
    id: "ng-maria", person: "Maria Gonzalez", file: "Maria-Gonzalez-Resume.pdf", level: "Clean", levelNum: 1,
    doc: '<article class="rdoc classic" aria-label="Résumé: Maria Gonzalez">' +
      '<p class="rname">Maria Gonzalez</p>' +
      '<p class="rcontact">St. Paul, MN 55106 &nbsp;|&nbsp; (651) 555-0186 &nbsp;|&nbsp; Email: maria.gonzalez@example.com.</p>' +
      "<h5>Summary</h5><p>Friendly cashier with seven years of customer service. Bilingual in English and Spanish.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Cashier, Eastside Grocery</b><span>September 2021 to Present</span></p><p>St. Paul, MN</p>' +
      "<ul><li>Ring up 300+ customers a shift with accurate change</li><li>Help customers find products and handle returns</li></ul>" +
      '<p class="jobline"><b>Crew Member, Taco Corner</b><span>May 2019 to August 2021</span></p><p>St. Paul, MN</p>' +
      "<ul><li>Took orders at the counter and drive-thru</li><li>Kept the dining room clean during the rush</li></ul>" +
      "<h5>Education</h5><p>High School Diploma, Eastview High School, 2019</p></article>",
    truth: {
      contact: { first: "Maria", last: "Gonzalez", email: "maria.gonzalez@example.com", phone: "(651) 555-0186", city: "St. Paul", state: "MN", zip: "55106" },
      jobs: [
        { title: "Cashier", employer: "Eastside Grocery", startM: 9, startY: 2021, current: true },
        { title: "Crew Member", employer: "Taco Corner", startM: 5, startY: 2019, endM: 8, endY: 2021 }
      ],
      education: edu("Eastview High School", "High school diploma", "2019")
    },
    parsed: {
      contact: { first: "Maria", last: "Gonzalez", email: "maria.gonzalez@example.com.", phone: "(651) 555-0186", city: "St.", state: "", zip: "55106" },
      jobs: [
        { title: "Cashier", employer: "Eastside Grocery", location: "St. Paul, MN", startM: "9", startY: "2021", endM: "", endY: "", current: true,
          desc: "Ring up 300+ customers a shift with accurate change. Help customers find products and handle returns." },
        { title: "Crew Member", employer: "Taco Corner", location: "St. Paul, MN", startM: "5", startY: "2019", endM: "8", endY: "2021", current: false,
          desc: "Took orders at the counter and drive-thru. Kept the dining room clean during the rush." }
      ],
      education: edu("Eastview High School", "High school diploma", "2019")
    },
    errors: [
      { label: "The email picked up the period at the end of the sentence", why: "“example.com.” with a dot on the end won't deliver. Employers would never reach her.",
        fields: ["c-email"], check: { match: ["contact.email"] } },
      { label: "The city stopped at “St.” and the state was left blank", why: "The period made the system think the city ended there, so it missed the state too.",
        fields: ["c-city", "c-state"], check: { match: ["contact.city", "contact.state"] } }
    ],
    coach: ["A clean, one-column résumé. The board read most of it right.", "Look closely at punctuation. One dot can break an email."]
  };

  var tyler = {
    id: "ng-tyler", person: "Tyler Nguyen", file: "TylerNguyen_Resume_Design.pdf", level: "Fancy format", levelNum: 2,
    doc: '<article class="rdoc info" aria-label="Résumé: Tyler Nguyen"><div class="band"><p class="rname">Tyler Nguyen</p><p>Retail and Sales. Brooklyn Center, MN 55429. (763) 555-0137</p></div>' +
      '<div class="ibody"><h5>Experience</h5><div class="tl">' +
      '<div class="stop"><span class="bub">Aug 2022<br>to<br>Present</span><p><b>Sales Associate</b>, Lakeshore Shoe Co.</p><ul><li>Fit customers for running and work shoes</li><li>Hit monthly sales goals 10 months in a row</li></ul></div>' +
      '<div class="stop"><span class="bub">May 2020<br>to<br>Jul 2022</span><p><b>Stock Associate</b>, Ridgeview Home Goods</p><ul><li>Unloaded freight and stocked shelves overnight</li><li>Kept the backroom organized</li></ul></div></div>' +
      '<h5>Skills</h5><div class="bars"><span>Customer service</span><span class="bar"><i style="width:90%"></i></span><span>Sales</span><span class="bar"><i style="width:80%"></i></span><span>Cash register</span><span class="bar"><i style="width:70%"></i></span></div>' +
      '<p class="foot">tyler.nguyen@example.com</p></div></article>',
    truth: {
      contact: { first: "Tyler", last: "Nguyen", email: "tyler.nguyen@example.com", phone: "(763) 555-0137", city: "Brooklyn Center", state: "MN", zip: "55429" },
      jobs: [
        { title: "Sales Associate", employer: "Lakeshore Shoe Co.", startM: 8, startY: 2022, current: true },
        { title: "Stock Associate", employer: "Ridgeview Home Goods", startM: 5, startY: 2020, endM: 7, endY: 2022 }
      ],
      education: edu("", "", "")
    },
    parsed: {
      contact: { first: "Tyler", last: "Nguyen", email: "", phone: "(763) 555-0137", city: "Brooklyn Center", state: "MN", zip: "55429" },
      jobs: [
        { title: "Sales Associate", employer: "Lakeshore Shoe Co.", location: "", startM: "", startY: "", endM: "", endY: "", current: false,
          desc: "Fit customers for running and work shoes. Hit monthly sales goals 10 months in a row. Stock Associate Ridgeview Home Goods Unloaded freight and stocked shelves overnight. Kept the backroom organized." }
      ],
      education: edu("", "", "")
    },
    errors: [
      { label: "The email was missed", why: "It sat alone in the footer at the very bottom. Many systems skip footers.",
        fields: ["c-email"], check: { match: ["contact.email"] } },
      { label: "The dates inside the timeline bubbles were missed", why: "Text inside shapes and graphics is often invisible to a system.",
        fields: ["j0-startM", "j0-startY", "j0-current"], check: { jobDates: 0 } },
      { label: "The second job got poured into the first job's description", why: "With no dates to separate them, the system read both jobs as one.",
        fields: ["j0-desc"], check: { excludes: { job: 0, terms: ["ridgeview", "unloaded freight"] } } },
      { label: "The stock associate job never got its own entry", why: "You had to add it back by hand.",
        fields: ["add-job"], check: { hasJob: 1 } }
    ],
    coach: ["Infographic résumés with timelines and skill bars look great on paper. To a computer, the shapes are empty space.", "Notice where the email is, and where the dates are."]
  };

  var dana = {
    id: "ng-dana", person: "Dana Whitfield", file: "Scan_0042.pdf", level: "Tricky", levelNum: 3,
    doc: '<p style="text-align:center;margin:0"><span class="scan-stamp">Scanned paper copy</span></p>' +
      '<article class="rdoc scan" aria-label="Résumé page 1: Dana Whitfield">' +
      '<p class="rname">DANA WHITFIELD</p><p class="rcontact">Roseville, MN 55113<br>(651) 555-0142 &nbsp; dana.whitfield@example.com</p>' +
      "<h5>SUMMARY</h5><p>Friendly cashier with eight years of customer service in person and on the phone.</p>" +
      "<h5>SKILLS</h5><p>Cash handling, customer service, answering phones, problem solving, Microsoft Word</p>" +
      "<h5>EXPERIENCE</h5><p><b>Cashier</b>, Sunrise Pharmacy, Roseville MN<br>March 2021 to Present</p>" +
      "<ul><li>Run the front register and pharmacy pickup counter</li><li>Answer phones and help customers find products</li></ul>" +
      '<p class="pgno">Page 1 of 2</p></article>' +
      '<article class="rdoc scan" aria-label="Résumé page 2: Dana Whitfield">' +
      "<p><b>Customer Service Representative</b>, Northern Lights Call Center, St. Paul MN<br>June 2018 to February 2021</p>" +
      "<ul><li>Handled 60+ customer calls a day</li><li>Solved billing questions and kept notes in the computer system</li></ul>" +
      "<h5>EDUCATION</h5><p>High School Diploma, Parkview High School, 2018</p>" +
      '<p class="pgno">Page 2 of 2</p></article>',
    truth: {
      contact: { first: "Dana", last: "Whitfield", email: "dana.whitfield@example.com", phone: "(651) 555-0142", city: "Roseville", state: "MN", zip: "55113" },
      jobs: [
        { title: "Cashier", employer: "Sunrise Pharmacy", location: "Roseville MN", startM: 3, startY: 2021, current: true },
        { title: "Customer Service Representative", employer: "Northern Lights Call Center", startM: 6, startY: 2018, endM: 2, endY: 2021 }
      ],
      education: edu("Parkview High School", "High school diploma", "2018")
    },
    parsed: {
      contact: { first: "Dana", last: "Whitfie1d", email: "dana.whitfield@exarnple.com", phone: "(651) 555-O142", city: "Rosevi11e", state: "MN", zip: "55113" },
      jobs: [
        { title: "Cashier", employer: "Sunrise Pharrnacy", location: "Rosevi11e MN", startM: "3", startY: "2021", endM: "", endY: "", current: true,
          desc: "Run the front register and pharmacy pickup counter. Answer phones and help customers find products." }
      ],
      education: edu("", "", "")
    },
    errors: [
      { label: "The last name has a number 1 where the letter l should be", why: "This file is a scan, a picture of paper. The system had to guess each letter, and it guessed wrong.",
        fields: ["c-last"], check: { match: ["contact.last"] } },
      { label: "The phone number has a letter O instead of a zero", why: "Another bad guess from reading a picture.",
        fields: ["c-phone"], check: { match: ["contact.phone"] } },
      { label: "The email says “exarnple” instead of “example”", why: "In a blurry scan, the letters r and n look like an m. Easy to miss, and every email would bounce.",
        fields: ["c-email"], check: { match: ["contact.email"] } },
      { label: "The city came out as “Rosevi11e”", why: "Two lowercase l's read as two number 1's.",
        fields: ["c-city"], check: { match: ["contact.city"] } },
      { label: "The employer came out as “Sunrise Pharrnacy”", why: "Same r and n problem.",
        fields: ["j0-employer"], check: { hasJob: 0 } },
      { label: "The job’s location came out as “Rosevi11e MN”", why: "The same misread as the city, in a second box. Check every box, not just the first one you spot.",
        fields: ["j0-location"], check: { fn: function (p) {
          var j = p.jobs.filter(function (x) { return /sunrise/i.test(x.employer); })[0] || p.jobs[0];
          return !!j && /^roseville(\s|$)/.test(String(j.location || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
        } } },
      { label: "Page 2 was never read, so the call center job was skipped", why: "Scans often get read as a single page.",
        fields: ["add-job"], check: { hasJob: 1 } },
      { label: "Education was blank because it was on page 2 too", why: "When a system skips a page, everything on it is lost, not just the jobs.",
        fields: ["e-school", "e-cred", "e-year"], check: { match: ["education.school", "education.credential", "education.year"] } }
    ],
    coach: ["This résumé is a scan: someone took a picture of paper and saved it as a PDF. Systems have to guess every letter.", "Read slowly. The mistakes are tiny, and one misread word can show up in two boxes.","Use a real document file, not a scan, when you can."]
  };

  window.NG_RESUMES = [maria, tyler, dana];
})();
