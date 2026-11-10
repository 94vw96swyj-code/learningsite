/*
  City of North Harbor practice résumés (government application).
  Government forms want hours per week and supervisor details for every job.
  All people, businesses, schools, numbers and emails are invented.
*/
(function () {
  "use strict";
  function edu(s, c, y) { return { school: s, credential: c, year: y }; }
  function job(o) { return Object.assign({ location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "", hours: "", wage: "", supervisor: "", supervisorPhone: "", mayContact: "", reason: "" }, o); }

  var grace = {
    id: "nh-grace", person: "Grace Lee", file: "Grace-Lee-Resume.pdf", level: "Clean", levelNum: 1,
    doc: '<article class="rdoc classic" aria-label="Résumé: Grace Lee"><p class="rname">Grace Lee</p>' +
      '<p class="rcontact">Minneapolis, MN 55417 &nbsp;|&nbsp; (612) 555-0153 &nbsp;|&nbsp; grace.lee@example.com</p>' +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Front Desk Associate, Lakeside Family Clinic</b><span>September 2022 to Present</span></p>' +
      "<p>Hours per week: 40. Pay: $19.50 an hour. Supervisor: Teresa Hall, (612) 555-0161. May contact: Yes.</p>" +
      "<ul><li>Check in 80+ patients a day and answer a four-line phone</li><li>Schedule appointments in the clinic’s computer system</li></ul>" +
      '<p class="jobline"><b>Library Page, Northside Public Library</b><span>June 2020 to August 2022</span></p>' +
      "<p>Hours per week: 20. Pay: $15.00 an hour. Supervisor: Alan Brooks, (612) 555-0163. May contact: Yes. Reason for leaving: needed full-time work.</p>" +
      "<ul><li>Shelved books and helped patrons find materials</li><li>Checked items in and out at the circulation desk</li></ul>" +
      "<h5>Education</h5><p>High School Diploma, Lincoln Park High School, 2020</p></article>",
    truth: {
      contact: { first: "Grace", last: "Lee", email: "grace.lee@example.com", phone: "(612) 555-0153", city: "Minneapolis", state: "MN", zip: "55417" },
      jobs: [
        { title: "Front Desk Associate", employer: "Lakeside Family Clinic", startM: 9, startY: 2022, current: true, hours: "40", supervisor: "Teresa Hall", supervisorPhone: "(612) 555-0161" },
        { title: "Library Page", employer: "Northside Public Library", startM: 6, startY: 2020, endM: 8, endY: 2022, hours: "20", supervisor: "Alan Brooks", supervisorPhone: "(612) 555-0163" }
      ],
      education: edu("Lincoln Park High School", "High school diploma", "2020")
    },
    parsed: {
      contact: { first: "Grace", last: "Lee", email: "grace.lee@example.com", phone: "(612) 555-0153", city: "Minneapolis", state: "MN", zip: "55417" },
      jobs: [
        job({ title: "Front Desk Associate", employer: "Lakeside Family Clinic", startM: "9", startY: "2022", current: true, hours: "40", wage: "$19.50 an hour", supervisor: "Teresa Hall",
          desc: "Check in 80+ patients a day and answer a four-line phone. Schedule appointments in the clinic’s computer system." }),
        job({ title: "Library Page", employer: "Northside Public Library", startM: "6", startY: "2020", endM: "8", endY: "2022", hours: "40", wage: "$15.00 an hour", supervisor: "Alan Brooks", supervisorPhone: "(612) 555-0163", reason: "Needed full-time work",
          desc: "Shelved books and helped patrons find materials. Checked items in and out at the circulation desk." })
      ],
      education: edu("Lincoln Park High School", "High school diploma", "2020")
    },
    errors: [
      { label: "The library job shows 40 hours a week instead of 20", why: "The system filled in full time. Government HR counts experience by hours, so this overstates it, and HR will check.",
        fields: ["j1-hours"], check: { jobField: { job: 1, fields: ["hours"] } } },
      { label: "The clinic supervisor's phone number was missed", why: "Government applications use it to check references. A blank can slow you down.",
        fields: ["j0-superPhone"], check: { jobField: { job: 0, fields: ["supervisorPhone"] } } }
    ],
    coach: ["Grace’s résumé already lists hours, pay and supervisors for every job. That’s a government-ready résumé.", "The system still got two details wrong. Check the hours and the phone numbers."]
  };

  var samuel = {
    id: "nh-samuel", person: "Samuel Okoro", file: "Samuel_Okoro_Resume.pdf", level: "Missing details", levelNum: 2,
    doc: '<article class="rdoc classic" aria-label="Résumé: Samuel Okoro"><p class="rname">Samuel Okoro</p>' +
      '<p class="rcontact">Brooklyn Park, MN 55445 &nbsp;|&nbsp; (763) 555-0175 &nbsp;|&nbsp; samuel.okoro@example.com</p>' +
      "<p>Organized, friendly office assistant who loves helping people.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Office Assistant, Northwest Community Center</b><span>March 2023 to Present</span></p>' +
      "<ul><li>Greet visitors and answer phones</li><li>Enter program sign-ups into the database</li></ul>" +
      '<p class="jobline"><b>Bus Driver Aide, Riverside School Bus Co.</b><span>September 2021 to February 2023</span></p>' +
      "<ul><li>Helped students on and off the bus safely</li><li>Kept daily ridership counts</li></ul>" +
      "<h5>Education</h5><p>High School Diploma, Riverside High School, 2021</p></article>" +
      '<aside style="background:#FFF4A8;max-width:calc(22rem * var(--zoom, 1));margin:calc(1.25rem * var(--zoom, 1)) auto 0;padding:calc(1rem * var(--zoom, 1)) calc(1.1rem * var(--zoom, 1));box-shadow:0 2px 6px rgba(0,0,0,0.18);transform:rotate(1deg);font-family:\'Comic Sans MS\',\'Marker Felt\',cursive;font-size:calc(0.9rem * var(--zoom, 1));color:#333" aria-label="Samuel’s notes">' +
      "<b>My notes for applications</b><br>Community Center: 30 hrs/week. Boss: Linda Park, (763) 555-0104. OK to contact.<br><br>" +
      "Bus aide: 25 hrs/week. Boss: Ray Dunn, (763) 555-0106. OK to contact. Left for more hours.</aside>",
    truth: {
      contact: { first: "Samuel", last: "Okoro", email: "samuel.okoro@example.com", phone: "(763) 555-0175", city: "Brooklyn Park", state: "MN", zip: "55445" },
      jobs: [
        { title: "Office Assistant", employer: "Northwest Community Center", startM: 3, startY: 2023, current: true, hours: "30", supervisor: "Linda Park" },
        { title: "Bus Driver Aide", employer: "Riverside School Bus Co.", startM: 9, startY: 2021, endM: 2, endY: 2023, hours: "25", supervisor: "Ray Dunn" }
      ],
      education: edu("Riverside High School", "High school diploma", "2021")
    },
    parsed: {
      contact: { first: "Samuel", last: "Okoro", email: "samuel.okoro@example.com", phone: "(763) 555-0175", city: "Brooklyn Park", state: "MN", zip: "55445" },
      jobs: [
        job({ title: "Office Assistant", employer: "Northwest Community Center", startM: "3", startY: "2023", current: true,
          desc: "Organized, friendly office assistant who loves helping people. Greet visitors and answer phones. Enter program sign-ups into the database." }),
        job({ title: "Bus Driver Aide", employer: "Riverside School Bus Co.", startM: "9", startY: "2021", endM: "2", endY: "2023",
          desc: "Helped students on and off the bus safely. Kept daily ridership counts." })
      ],
      education: edu("Riverside High School", "High school diploma", "2021")
    },
    errors: [
      { label: "Hours per week were missing for the community center job", why: "The résumé doesn't say, but Samuel’s notes do: 30. Without hours, HR can’t count the experience.",
        fields: ["j0-hours"], check: { jobField: { job: 0, fields: ["hours"] } } },
      { label: "Hours per week were missing for the bus aide job", why: "His notes say 25.",
        fields: ["j1-hours"], check: { jobField: { job: 1, fields: ["hours"] } } },
      { label: "The supervisors were missing", why: "Government forms ask for a supervisor on every job. They were only in his notes.",
        fields: ["j0-super", "j1-super"], check: [{ jobField: { job: 0, fields: ["supervisor"] } }, { jobField: { job: 1, fields: ["supervisor"] } }] },
      { label: "The summary line got pulled into the first job's description", why: "“Loves helping people” describes Samuel, not the job.",
        fields: ["j0-desc"], check: { excludes: { job: 0, terms: ["loves helping people"] } } }
    ],
    coach: ["A normal, clean résumé, but it’s missing what government forms ask for: hours and supervisors.", "Samuel keeps a notes sheet for exactly this. Scroll down in the résumé to find it. Keep one like it for yourself."]
  };

  var rosa = {
    id: "nh-rosa", person: "Rosa Delgado", file: "R Delgado resume (2).pdf", level: "Tricky", levelNum: 3,
    doc: '<article class="rdoc classic" aria-label="Résumé: Rosa Delgado"><p class="rname">Rosa Delgado</p>' +
      '<p class="rcontact">Saint Paul, MN 55107 &nbsp;|&nbsp; (651) 555-0124 &nbsp;|&nbsp; rosa.delgado@example.com</p>' +
      "<h5>Work Experience</h5>" +
      '<p class="jobline"><b>Customer Service Clerk (Supervisor: Dan Price)</b><span>May 2022 to Present</span></p>' +
      "<p>Harbor Foods Co-op, Saint Paul. 24 hours a week. Supervisor phone: (651) 555-0128</p>" +
      "<ul><li>Answer member questions at the service desk and by phone</li><li>Process returns and enter orders in the computer</li></ul>" +
      '<p class="jobline"><b>Childcare Assistant</b><span>August 2019 to April 2022</span></p>' +
      "<p>Little Steps Daycare, Saint Paul. 32 hours a week. Supervisor: Ann Cole, (651) 555-0129</p>" +
      "<ul><li>Kept attendance records and talked with parents at pickup</li></ul>" +
      "<h5>Volunteer Experience</h5>" +
      '<p class="jobline"><b>Front Desk Volunteer</b><span>January 2021 to Present</span></p>' +
      "<p>Westside Community Center, Saint Paul. 6 hours a week. Supervisor: Joe Lin</p>" +
      "<ul><li>Greet visitors, answer the phone and schedule room bookings</li></ul>" +
      "<h5>Education</h5><p>GED, Saint Paul Adult Learning Center, 2019</p></article>",
    truth: {
      contact: { first: "Rosa", last: "Delgado", email: "rosa.delgado@example.com", phone: "(651) 555-0124", city: "Saint Paul", state: "MN", zip: "55107" },
      jobs: [
        { title: "Customer Service Clerk", employer: "Harbor Foods Co-op", startM: 5, startY: 2022, current: true, hours: "24", supervisor: "Dan Price", supervisorPhone: "(651) 555-0128" },
        { title: "Childcare Assistant", employer: "Little Steps Daycare", startM: 8, startY: 2019, endM: 4, endY: 2022, hours: "32", supervisor: "Ann Cole", supervisorPhone: "(651) 555-0129" },
        { title: "Front Desk Volunteer", employer: "Westside Community Center", startM: 1, startY: 2021, current: true, hours: "6", supervisor: "Joe Lin" }
      ],
      education: edu("Saint Paul Adult Learning Center", "GED", "2019")
    },
    parsed: {
      contact: { first: "Rosa", last: "Delgado", email: "rosa.delgado@example.com", phone: "(651) 555-0124", city: "Saint Paul", state: "MN", zip: "55107" },
      jobs: [
        job({ title: "Customer Service Clerk (Supervisor: Dan Price)", employer: "Harbor Foods Co-op", startM: "5", startY: "2022", current: true, hours: "40", supervisorPhone: "(651) 555-0128",
          desc: "Answer member questions at the service desk and by phone. Process returns and enter orders in the computer." }),
        job({ title: "Childcare Assistant", employer: "Little Steps Daycare", startM: "8", startY: "2019", endM: "4", endY: "2022", hours: "32", supervisor: "Ann Cole", supervisorPhone: "(651) 555-0129",
          desc: "Kept attendance records and talked with parents at pickup." })
      ],
      education: edu("Saint Paul Adult Learning Center", "GED", "2019")
    },
    errors: [
      { label: "The supervisor's name got stuck in the job title", why: "The résumé put it in parentheses after the title, so the system kept it there.",
        fields: ["j0-title"], check: { hasJob: 0, exactTitle: true } },
      { label: "The supervisor box was left empty", why: "The name was in the title instead. Move it to the supervisor box.",
        fields: ["j0-super"], check: { jobField: { job: 0, fields: ["supervisor"] } } },
      { label: "Part-time hours became 40", why: "She works 24 hours a week. Overstating hours is something HR checks, and it can disqualify you.",
        fields: ["j0-hours"], check: { jobField: { job: 0, fields: ["hours"] } } },
      { label: "Her volunteer work was skipped", why: "Government jobs often count volunteer experience, and this one is front desk work. It was under its own heading, so the system skipped it.",
        fields: ["add-job"], check: { hasJob: 2 } }
    ],
    coach: ["Part-time work, volunteer work and supervisor names tucked in odd places. Government forms want all of it, in the right boxes.", "Volunteer experience counts. Add it as its own entry."]
  };

  window.NH_RESUMES = [grace, samuel, rosa];
})();
