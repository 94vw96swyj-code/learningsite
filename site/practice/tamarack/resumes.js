/*
  Tamarack State University practice résumés and cover letters (advanced résumé course).
  Each résumé has: doc (what the learner sees), truth (what the résumé actually says),
  parsed (what the university's system filled in), errors (each planted mistake, why it
  happened, and how it's checked), coach (notes for the form step) and quals (the honest
  answers to the qualification questions, from the résumé).
  Education here is a list (schools), because professional résumés often list more than one.
  window.TS_LETTERS holds every cover letter, so they can be turned into PDFs later.
  All people, schools, employers, phone numbers and emails are invented.
*/
(function () {
  "use strict";

  /* ---------- small helpers for the checks (no engine needed when this file loads) ---------- */
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  // job titles must match exactly (case, spaces and punctuation aside), so "Case Manager" is not "Lead Case Manager"
  function sameTitle(a, b) { return norm(a) === norm(b); }
  function has(a, b) { var x = norm(a), y = norm(b); return !!y && x.indexOf(y) !== -1; }
  function findJob(p, title, where) { return (p.jobs || []).filter(function (j) { return sameTitle(j.title, title) && has(j.employer, where); })[0]; }
  function years(j, from, to) { return !!j && +j.startY === from && (to === "now" ? !!j.current : !j.current && +j.endY === to); }
  function findSchool(p, test) { return (p.schools || []).filter(test)[0]; }
  function school(s, degree, major, status, year, gpa) { return { school: s, degree: degree, major: major, status: status, year: year, gpa: gpa || "" }; }
  function job(o) { return Object.assign({ location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "" }, o); }
  var NO_EDU = { school: "", credential: "", year: "" }; // the engine's own one-school box; this application uses schools instead

  /* dates on the cover letters and in the file list: recent files are dated from today */
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d; }
  function longDate(d) { return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }

  var ICON = {
    phone: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/></svg>',
    mail: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7.2L4.5 7v.2L12 13l7.5-5.8V7z"/></svg>',
    link: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F2B544" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>',
    pin: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#F2B544" aria-hidden="true"><path d="M12 2a7 7 0 017 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z"/></svg>'
  };
  var SUB = 'style="margin:0 0 calc(0.1 * var(--u))"';

  /* ---------- 1. Danielle Okafor: clean, one column, bachelor's degree ---------- */
  var danielle = {
    id: "ts-danielle", person: "Danielle Okafor", file: "Danielle-Okafor-Resume.pdf", level: "Clean", levelNum: 1, modified: 2,
    doc: '<article class="rdoc classic" aria-label="Résumé: Danielle Okafor"><p class="rname">Danielle Okafor</p>' +
      '<p class="rcontact">Saint Paul, MN 55104 &nbsp;|&nbsp; (651) 555-0132 &nbsp;|&nbsp; danielle.okafor@example.com</p>' +
      "<h5>Summary</h5><p>Program coordinator with seven years of experience running college access and youth programs. I plan events, track results and build strong partnerships with schools, families and volunteers.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Program Coordinator, Pathways College Access Program</b><span>August 2022 to Present</span></p><p ' + SUB + ">Cityview Community Foundation, Saint Paul, MN</p>" +
      "<ul><li>Coordinate a college access program for 140 high school students a year, most of them the first in their family to go to college</li>" +
      "<li>Plan 25+ events a year, including campus visits, financial aid nights and family workshops</li>" +
      "<li>Track attendance and student results in a database and write quarterly reports for funders</li>" +
      "<li>Supervise two part-time program assistants and eight volunteer tutors</li></ul>" +
      '<p class="jobline"><b>Youth Program Specialist</b><span>June 2019 to July 2022</span></p><p ' + SUB + ">Northend Youth Center, Saint Paul, MN</p>" +
      "<ul><li>Ran after-school and summer programs for 60 middle school students</li><li>Recruited, trained and scheduled 15 volunteers each semester</li><li>Built partnerships with three neighborhood schools</li></ul>" +
      '<p class="jobline"><b>Resident Assistant</b><span>September 2017 to May 2019</span></p><p ' + SUB + ">Kettle River University, Duluth, MN</p>" +
      "<ul><li>Planned monthly programs for a floor of 45 first-year students</li><li>Referred students to tutoring, counseling and other campus services</li></ul>" +
      "<h5>Education</h5>" +
      '<p class="jobline"><b>Bachelor of Arts in Sociology, Minor in Nonprofit Management</b><span>2015 to 2019</span></p><p>Kettle River University, Duluth, MN</p>' +
      "<h5>Skills</h5><p>Event planning, student advising, program data and reports, spreadsheets, public speaking, volunteer management</p></article>",
    truth: {
      contact: { first: "Danielle", last: "Okafor", email: "danielle.okafor@example.com", phone: "(651) 555-0132", city: "Saint Paul", state: "MN", zip: "55104" },
      jobs: [
        { title: "Program Coordinator", employer: "Cityview Community Foundation", startM: 8, startY: 2022, current: true },
        { title: "Youth Program Specialist", employer: "Northend Youth Center", startM: 6, startY: 2019, endM: 7, endY: 2022 },
        { title: "Resident Assistant", employer: "Kettle River University", startM: 9, startY: 2017, endM: 5, endY: 2019 }
      ],
      education: NO_EDU,
      schools: [school("Kettle River University", "Bachelor's degree", "Sociology", "Completed", "2019")]
    },
    parsed: {
      contact: { first: "Danielle", last: "Okafor", email: "danielle.okafor@example.com", phone: "(651) 555-0132", city: "Saint Paul", state: "MN", zip: "55104" },
      jobs: [
        job({ title: "Program Coordinator", employer: "Pathways College Access Program", location: "Saint Paul, MN", startM: "8", startY: "2022", current: true,
          desc: "Coordinate a college access program for 140 high school students a year, most of them the first in their family to go to college. Plan 25+ events a year, including campus visits, financial aid nights and family workshops. Track attendance and student results in a database and write quarterly reports for funders. Supervise two part-time program assistants and eight volunteer tutors." }),
        job({ title: "Youth Program Specialist", employer: "Northend Youth Center", location: "Saint Paul, MN", startM: "6", startY: "2019", endM: "7", endY: "2022",
          desc: "Ran after-school and summer programs for 60 middle school students. Recruited, trained and scheduled 15 volunteers each semester. Built partnerships with three neighborhood schools." }),
        job({ title: "Resident Assistant", employer: "Kettle River University", location: "Duluth, MN", startM: "9", startY: "2017", endM: "5", endY: "2019",
          desc: "Planned monthly programs for a floor of 45 first-year students. Referred students to tutoring, counseling and other campus services." })
      ],
      education: NO_EDU,
      schools: [school("Kettle River University", "Bachelor's degree", "Nonprofit Management", "Completed", "2015")]
    },
    errors: [
      { label: "The program name went into the Employer box", why: "Pathways College Access Program is the program Danielle runs. Her employer is Cityview Community Foundation. Reference checks call the employer, so it has to be right.",
        fields: ["j0-employer"], check: { hasJob: 0 } },
      { label: "Her minor was read as her major", why: "The degree line says Sociology, with a minor in Nonprofit Management. The system took the last subject on the line. Jobs that ask for a related field look at the major.",
        fields: ["ed0-major"], check: { fn: function (p) { var s = findSchool(p, function (x) { return has(x.school, "kettle river"); }) || (p.schools || [])[0]; return !!s && /^sociology\b/.test(norm(s.major)); } } },
      { label: "The year she started college went in the Year box", why: "The résumé shows 2015 to 2019. The form asks when she finished, and that was 2019.",
        fields: ["ed0-year"], check: { fn: function (p) { var s = findSchool(p, function (x) { return has(x.school, "kettle river"); }) || (p.schools || [])[0]; return !!s && digits(s.year) === "2019"; } } }
    ],
    coach: ["A clean, one-column résumé. Most of it came through.", "Check the education line word by word. Then check which name went in the Employer box for her first job."],
    quals: { edu: "bachelor", exp: "Yes", firstgen: "Yes", lang: "No", langs: "" },
    qualsWhy: "Danielle has a bachelor’s degree (Sociology, 2019) and more than 2 years coordinating programs, so the honest answers are “I have a bachelor’s degree” and Yes."
  };

  /* ---------- 2. Tou Vang: two columns, qualifies through education plus experience ---------- */
  var tou = {
    id: "ts-tou", person: "Tou Vang", file: "TouVang_Resume_2026.pdf", level: "Two columns", levelNum: 2, modified: 3,
    doc: '<article class="rdoc sidebar" aria-label="Résumé: Tou Vang"><div class="side">' +
      '<div class="avatar" aria-hidden="true">TV</div>' +
      "<h5>Contact</h5>" +
      '<p class="ico">' + ICON.phone + "<span>(651) 555-0119</span></p>" +
      '<p class="ico">' + ICON.mail + "<span>tou.vang@example.com</span></p>" +
      '<p class="ico">' + ICON.link + "<span>connectpro.example.com/touvang</span></p>" +
      '<p class="ico">' + ICON.pin + "<span>Maplewood, MN 55109</span></p>" +
      "<h5>Education</h5>" +
      '<p style="margin-bottom:calc(0.6 * var(--u))"><b>B.S., Human Services</b><br>Northern Pines University (online)<br>Expected May 2028</p>' +
      "<p><b>A.A., Liberal Arts</b><br>Mill City Community College<br>2019</p>" +
      "<h5>Languages</h5><p>Hmong (native)<br>English (fluent)</p>" +
      "<h5>Skills</h5>" +
      '<p class="skill">Program planning<br><span class="dots" aria-label="5 out of 5">●●●●●</span></p>' +
      '<p class="skill">Volunteer scheduling<br><span class="dots" aria-label="4 out of 5">●●●●○</span></p>' +
      '<p class="skill">Databases and reports<br><span class="dots" aria-label="4 out of 5">●●●●○</span></p>' +
      '</div><div class="main">' +
      '<p class="rname">Tou<br>Vang</p><p class="rtitle">Program Coordinator</p>' +
      "<h5>Profile</h5><p>Bilingual program coordinator with six years in adult and family education. I plan events people actually come to, keep volunteers organized, and help learners find their next step.</p>" +
      "<h5>Experience</h5>" +
      '<p class="co">EASTVIEW FAMILY LEARNING CENTER</p><p>Saint Paul, MN</p>' +
      '<p style="margin-top:calc(0.45 * var(--u))"><b>Program Coordinator</b><br><span class="dates">Mar 2023 to Present</span></p>' +
      "<ul><li>Coordinate adult education and family literacy programs for 300+ learners a year</li><li>Plan orientation days, graduation events and monthly family nights</li><li>Schedule 20 volunteer tutors and track attendance in a database</li></ul>" +
      "<p><b>Program Assistant</b><br><span class=\"dates\">Jan 2020 to Feb 2023</span></p>" +
      "<ul><li>Registered learners and answered questions in Hmong and English</li><li>Set up classrooms and ordered supplies for 12 classes</li></ul>" +
      '<p class="co">MILL CITY COMMUNITY COLLEGE</p><p>Student Services Assistant (work-study), Minneapolis, MN<br><span class="dates">Sep 2017 to May 2019</span></p>' +
      "<ul><li>Helped students sign up for tutoring and advising</li><li>Planned welcome week events with student clubs</li></ul>" +
      "</div></article>",
    truth: {
      contact: { first: "Tou", last: "Vang", email: "tou.vang@example.com", phone: "(651) 555-0119", city: "Maplewood", state: "MN", zip: "55109" },
      jobs: [
        { title: "Program Coordinator", employer: "Eastview Family Learning Center", startM: 3, startY: 2023, current: true },
        { title: "Program Assistant", employer: "Eastview Family Learning Center", startM: 1, startY: 2020, endM: 2, endY: 2023 },
        { title: "Student Services Assistant", employer: "Mill City Community College", startM: 9, startY: 2017, endM: 5, endY: 2019 }
      ],
      education: NO_EDU,
      schools: [school("Northern Pines University", "Bachelor's degree", "Human Services", "In progress", "2028"),
        school("Mill City Community College", "Associate degree", "Liberal Arts", "Completed", "2019")]
    },
    parsed: {
      contact: { first: "Tou", last: "Vang", email: "connectpro.example.com/touvang", phone: "(651) 555-0119", city: "Maplewood", state: "MN", zip: "55109" },
      jobs: [
        job({ title: "Program Coordinator", employer: "Eastview Family Learning Center", location: "Saint Paul, MN", startM: "1", startY: "2020", current: true,
          desc: "Coordinate adult education and family literacy programs for 300+ learners a year. Plan orientation days, graduation events and monthly family nights. Schedule 20 volunteer tutors and track attendance in a database. Registered learners and answered questions in Hmong and English. Set up classrooms and ordered supplies for 12 classes." }),
        job({ title: "Student Services Assistant (work-study)", employer: "Mill City Community College", location: "Minneapolis, MN", startM: "9", startY: "2017", endM: "5", endY: "2019",
          desc: "Helped students sign up for tutoring and advising. Planned welcome week events with student clubs." })
      ],
      education: NO_EDU,
      schools: [school("Northern Pines University", "Bachelor's degree", "Human Services", "Completed", "2028")]
    },
    errors: [
      { label: "His profile link landed in the Email box", why: "In the sidebar, the web address for his online profile sits right under his email, and the system grabbed the wrong line.",
        fields: ["c-email"], check: { match: ["contact.email"] } },
      { label: "The coordinator job started in 2020 instead of March 2023", why: "He was a Program Assistant first and became Program Coordinator in March 2023. The system gave the coordinator title all six years, which overstates his time in the role.",
        fields: ["j0-startM", "j0-startY"], check: { fn: function (p) { var j = findJob(p, "Program Coordinator", "eastview"); return !!j && +j.startM === 3 && +j.startY === 2023 && !!j.current; } } },
      { label: "His Program Assistant job was left out", why: "Both jobs were at Eastview Family Learning Center under one heading, so the system made only one job. Add the Program Assistant job with its own dates: January 2020 to February 2023.",
        fields: ["add-job"], check: { fn: function (p) { var j = findJob(p, "Program Assistant", "eastview"); return !!j && +j.startM === 1 && +j.startY === 2020 && !j.current && +j.endM === 2 && +j.endY === 2023; } } },
      { label: "The bachelor’s degree he’s still working on was marked Completed", why: "The résumé says “Expected May 2028.” Marking it Completed claims a degree he doesn’t have yet, and universities check degrees.",
        fields: ["ed0-status"], check: { fn: function (p) { var s = findSchool(p, function (x) { return has(x.school, "northern pines"); }); return !!s && s.status === "In progress" && s.degree === "Bachelor's degree"; } } },
      { label: "His associate degree was skipped", why: "The system read only the first degree in the sidebar. His associate degree from Mill City Community College (2019) counts toward this job’s education and experience requirement.",
        fields: ["add-edu"], check: { fn: function (p) { var s = findSchool(p, function (x) { return has(x.school, "mill city"); }); return !!s && s.degree === "Associate degree" && s.status === "Completed" && digits(s.year) === "2019"; } } }
    ],
    coach: ["Two columns: his contact details, education and languages are in the left sidebar. Systems often scramble sidebars.", "He held two jobs at the same place. Make sure each one is on the form with its own dates."],
    quals: { edu: "combo", exp: "Yes", firstgen: "No", lang: "Yes", langs: "Hmong" },
    qualsWhy: "Tou’s bachelor’s degree isn’t finished, so “I have a bachelor’s degree” isn’t true. His associate degree (about 2 years of school) plus more than 2 years of related work add up to 4 years. That’s the combination answer. He has coordinated programs since 2023, so Yes to 2 years."
  };

  /* ---------- 3. Amina Yusuf: skills-based (functional), the trickiest ---------- */
  var ROLE = 'style="display:block;margin:0 0 calc(0.55 * var(--u))"';
  var amina = {
    id: "ts-amina", person: "Amina Yusuf", file: "AYusuf_Resume_final_v3.pdf", level: "Tricky", levelNum: 3, modified: 4,
    doc: '<article class="rdoc functional" aria-label="Résumé: Amina Yusuf">' +
      '<p class="rname" style="letter-spacing:0.2em">AMINA YUSUF</p>' +
      '<p class="rcontact">Student Support and Program Coordination</p>' +
      '<p class="obj">Student support professional with 12 years of experience helping first-generation and immigrant students and families reach their goals. Fluent in Somali and English.</p>' +
      "<h5>Program Coordination</h5><ul><li>Plan and run orientation for 400 new students each fall, with 30 staff and student volunteers</li>" +
      "<li>Grew a peer mentor program from 12 to 35 mentors</li><li>Managed event budgets up to $15,000 and tracked every expense</li></ul>" +
      "<h5>Student Advising and Support</h5><ul><li>Advise a caseload of 150 students, most of them the first in their family in college</li>" +
      "<li>Connect students with tutoring, financial aid, food support and counseling</li><li>Track student progress in a records system and follow up when grades slip</li></ul>" +
      "<h5>Partnerships and Outreach</h5><ul><li>Built referral partnerships with 10 community organizations</li><li>Led family information nights in Somali and English</li></ul>" +
      '<h5>Work History</h5><div class="hist">' +
      "<p><span><b>Ridgeway Technical College</b>, Saint Paul, MN</span><span>2021 to Present</span></p>" +
      "<p " + ROLE + ">Student Success Coach, reporting to the Director of Student Success</p>" +
      "<p><span><b>Westbank Family Services</b>, Minneapolis, MN</span><span>2016 to 2021</span></p>" +
      "<p " + ROLE + ">Lead Case Manager (2019 to 2021). Case Manager (2016 to 2019).</p>" +
      "<p><span><b>Northway Resettlement Services</b>, Saint Cloud, MN</span><span>2014 to 2016</span></p>" +
      "<p " + ROLE + ">Volunteer and Events Coordinator</p></div>" +
      "<h5>Education</h5><p>Graduate Certificate, Academic Advising. Bluestem State University, 2022</p>" +
      "<p>B.S., Psychology, GPA 3.6. Bluestem State University, 2014</p>" +
      '<p class="pgfoot" style="font-size:calc(0.78 * var(--u));color:#555">Amina Yusuf &nbsp;&bull;&nbsp; Minneapolis, MN 55406 &nbsp;&bull;&nbsp; (612) 555-0186 &nbsp;&bull;&nbsp; amina.yusuf@example.com</p></article>',
    truth: {
      contact: { first: "Amina", last: "Yusuf", email: "amina.yusuf@example.com", phone: "(612) 555-0186", city: "Minneapolis", state: "MN", zip: "55406" },
      jobs: [
        { title: "Student Success Coach", employer: "Ridgeway Technical College", startY: 2021, current: true },
        { title: "Lead Case Manager", employer: "Westbank Family Services", startY: 2019, endY: 2021 },
        { title: "Case Manager", employer: "Westbank Family Services", startY: 2016, endY: 2019 },
        { title: "Volunteer and Events Coordinator", employer: "Northway Resettlement Services", startY: 2014, endY: 2016 }
      ],
      education: NO_EDU,
      schools: [school("Bluestem State University", "Certificate", "Academic Advising", "Completed", "2022"),
        school("Bluestem State University", "Bachelor's degree", "Psychology", "Completed", "2014", "3.6")]
    },
    parsed: {
      contact: { first: "Amina", last: "Yusuf", email: "amina.yusuf@example.com", phone: "(612) 555-0186", city: "Saint Paul", state: "MN", zip: "55406" },
      jobs: [
        job({ title: "Director of Student Success", employer: "Ridgeway Technical College", location: "Saint Paul, MN", startY: "2021", current: true }),
        job({ title: "Lead Case Manager", employer: "Westbank Family Services", location: "Minneapolis, MN", startY: "2016", endY: "2019" }),
        job({ title: "Case Manager", employer: "Westbank Family Services", location: "Minneapolis, MN", startY: "2019", endY: "2021" }),
        job({ title: "Volunteer and Events Coordinator", employer: "Northway Resettlement Services", location: "Saint Cloud, MN", startY: "2014", endY: "2016" })
      ],
      education: NO_EDU,
      schools: [school("Bluestem State University", "Master's degree", "Academic Advising", "Completed", "2022"),
        school("Bluestem State University", "Bachelor's degree", "Psychology, GPA 3.6", "Completed", "2014")]
    },
    errors: [
      { label: "Her supervisor’s title became her job title", why: "The work history line names her own title, Student Success Coach, then her supervisor’s. The system took the wrong one, and “Director” claims a job she never had.",
        fields: ["j0-title"], check: { fn: function (p) { return !!findJob(p, "Student Success Coach", "ridgeway") && !(p.jobs || []).some(function (j) { return /\bdirector\b/.test(norm(j.title)); }); } } },
      { label: "Her promotion’s dates were swapped", why: "She was a Case Manager from 2016 to 2019, then Lead Case Manager from 2019 to 2021. The system flipped the dates, so it looked like she was moved down.",
        fields: ["j1-startY", "j1-endY", "j2-startY", "j2-endY"], check: { fn: function (p) { return years(findJob(p, "Lead Case Manager", "westbank"), 2019, 2021) && years(findJob(p, "Case Manager", "westbank"), 2016, 2019); } } },
      { label: "The city came from her job, not her address", why: "Her address is in the line at the very bottom of the page. The system took the first city it found, from her job in Saint Paul. She lives in Minneapolis.",
        fields: ["c-city"], check: { match: ["contact.city"] } },
      { label: "Her graduate certificate was read as a master’s degree", why: "The résumé says Graduate Certificate in Academic Advising. A certificate is not a degree. Claiming a master’s degree you don’t have can cost you the job, even after you’re hired.",
        fields: ["ed0-degree"], check: { fn: function (p) { var s = findSchool(p, function (x) { return has(x.major, "advising"); }); return !!s && s.degree === "Certificate"; } } },
      { label: "Her GPA landed in the Major box", why: "“Psychology, GPA 3.6” was read as one major. The major is Psychology. Put 3.6 in the GPA box, or leave GPA blank, since it’s optional.",
        fields: ["ed1-major"], check: { fn: function (p) { var s = findSchool(p, function (x) { return has(x.major, "psych"); }); if (!s) return false;
          var m = norm(s.major), g = String(s.gpa || "").trim();
          return /^psychology\b/.test(m) && !/\d|\bgpa\b/.test(m) && (!g || Math.abs(parseFloat(g) - 3.6) < 0.001); } } }
    ],
    coach: ["A skills-based résumé: skills on top, a short work history at the bottom with years only. When the résumé gives only a year, leave the month blank.",
      "Her contact line is at the very bottom of the page. Check every job title, every date and every degree against the résumé."],
    quals: { edu: "bachelor", exp: "Yes", firstgen: "Yes", lang: "Yes", langs: "Somali" },
    qualsWhy: "Amina has a bachelor’s degree (Psychology, 2014) and years of coordinating programs and events, so the honest answers are “I have a bachelor’s degree” and Yes."
  };

  /* ---------- cover letters ---------- */
  var LP = 'style="margin:0 0 calc(0.85 * var(--u))"';
  function letter(o) {
    return '<article class="rdoc classic" aria-label="Cover letter from ' + o.name + '">' +
      '<p style="font-size:calc(1.45 * var(--u));font-weight:600;color:#1F2A44;margin:0">' + o.name + "</p>" +
      '<p style="color:#555;margin:0 0 calc(1.6 * var(--u))">' + o.contact + "</p>" +
      "<p " + LP + ">" + o.date + "</p>" +
      (o.to ? "<p " + LP + ">" + o.to.join("<br>") + "</p>" : "") +
      (o.re ? "<p " + LP + "><b>" + o.re + "</b></p>" : "") +
      "<p " + LP + ">" + o.hello + "</p>" +
      o.body.map(function (t) { return "<p " + LP + ">" + t + "</p>"; }).join("") +
      '<p style="margin:calc(1.2 * var(--u)) 0 0">Sincerely,</p><p style="margin:calc(1.8 * var(--u)) 0 0">' + o.name + "</p></article>";
  }
  var TSU = ["Hiring Committee", "Student Success Center", "Tamarack State University, Twin Rivers Campus", "St. Paul, MN"];
  var RE = "Re: Program Coordinator, Job Opening ID 362184";
  var D_CON = "Saint Paul, MN 55104 &nbsp;|&nbsp; (651) 555-0132 &nbsp;|&nbsp; danielle.okafor@example.com";
  var T_CON = "Maplewood, MN 55109 &nbsp;|&nbsp; (651) 555-0119 &nbsp;|&nbsp; tou.vang@example.com";
  var A_CON = "Minneapolis, MN 55406 &nbsp;|&nbsp; (612) 555-0186 &nbsp;|&nbsp; amina.yusuf@example.com";
  function L(o) {
    var when = o.dated ? o.dated : longDate(daysAgo(o.modified));
    return { id: o.id, owner: o.owner, person: o.person, file: o.file, right: !!o.right, what: o.what, modified: o.modified, modifiedText: o.dated || "",
      level: "Cover letter", levelNum: 1, doc: letter({ name: o.person, contact: o.contact, date: when, to: o.to, re: o.re, hello: o.hello, body: o.body }) };
  }

  var LETTERS = [
    /* Danielle: the newest file is for another employer; the old one is generic */
    L({ id: "ts-danielle-cl-larkspur", owner: "ts-danielle", person: "Danielle Okafor", contact: D_CON, file: "Okafor_CoverLetter_LarkspurHealth.pdf", modified: 0,
      what: "addressed to Larkspur Health",
      to: ["Hiring Manager", "Community Programs", "Larkspur Health", "Minneapolis, MN"], re: "Re: Community Program Coordinator", hello: "Dear Hiring Manager,",
      body: ["I am writing to apply for the Community Program Coordinator position at Larkspur Health. For the past four years I have run programs for students and families in Saint Paul, and I am excited to bring that experience to community health.",
        "In my current role I plan more than 25 events a year and track attendance and results for our funders. I also supervise two program assistants and eight volunteer tutors. I would bring the same planning and follow-through to Larkspur’s health fairs and family programs.",
        "Thank you for your time. I would welcome the chance to talk about how I can support Larkspur Health and the families you serve."] }),
    L({ id: "ts-danielle-cl-tsu", owner: "ts-danielle", person: "Danielle Okafor", contact: D_CON, file: "Okafor_CoverLetter_Tamarack_ProgramCoordinator.pdf", modified: 1, right: true,
      what: "for this job",
      to: TSU, re: RE, hello: "Dear Hiring Committee,",
      body: ["I am writing to apply for the Program Coordinator position in the Student Success Center at Tamarack State University. For the past four years I have run a college access program for 140 high school students a year, most of them the first in their family to go to college. Helping students take the next step is the work I care about most.",
        "In my current role I plan more than 25 events a year, from campus visits to financial aid nights, and I track attendance and results for our funders. I also supervise two program assistants and eight volunteer tutors, which has prepared me to train and schedule your peer mentors.",
        "Thank you for your time. I would welcome the chance to talk about how I can support Tamarack students. You can reach me at (651) 555-0132 or danielle.okafor@example.com."] }),
    L({ id: "ts-danielle-cl-old", owner: "ts-danielle", person: "Danielle Okafor", contact: D_CON, file: "Danielle Okafor Cover Letter.docx", modified: 1300, dated: "March 14, 2022",
      what: "an old letter for a Youth Program Manager job",
      hello: "Dear Hiring Manager,",
      body: ["I am excited to apply for the Youth Program Manager position at your organization. I have three years of experience running after-school and summer programs for middle school students.",
        "I am a hard worker and a fast learner. I get along well with young people, parents and volunteers, and I am always on time.",
        "Thank you for your consideration. I look forward to hearing from you."] }),

    /* Tou: the file names look right; only the letters themselves tell you */
    L({ id: "ts-tou-cl-larkspur", owner: "ts-tou", person: "Tou Vang", contact: T_CON, file: "Vang_Tou_CoverLetter_ProgramCoord.pdf", modified: 0,
      what: "addressed to Larkspur Health",
      to: ["Hiring Manager", "Family Health Programs", "Larkspur Health", "Saint Paul, MN"], re: "Re: Program Coordinator, Family Health Programs", hello: "Dear Hiring Manager,",
      body: ["I am applying for the Program Coordinator position with Larkspur Health’s Family Health Programs. As Program Coordinator at Eastview Family Learning Center, I run programs for more than 300 adult learners and their families each year.",
        "I plan orientation days, graduation events and family nights, and I schedule and support 20 volunteer tutors. I speak Hmong and English, and I know how much it means to a family when someone explains the next step in a language they trust.",
        "Thank you for considering me. I would be glad to talk about how I can help Larkspur Health reach more families."] }),
    L({ id: "ts-tou-cl-tsu", owner: "ts-tou", person: "Tou Vang", contact: T_CON, file: "Vang_Tou_CoverLetter_TSU.pdf", modified: 1, right: true,
      what: "for this job",
      to: TSU, re: RE, hello: "Dear Hiring Committee,",
      body: ["I am applying for the Program Coordinator position in the Student Success Center at Tamarack State University. As Program Coordinator at Eastview Family Learning Center, I run programs for more than 300 adult learners and their families each year.",
        "I plan orientation days, graduation events and family nights, and I schedule and support 20 volunteer tutors. I speak Hmong and English, and I know how much it means to a student when someone explains the next step in a language they trust.",
        "I am finishing my bachelor’s degree in Human Services while I work, so I understand the balancing act many of your students face. Thank you for considering me. I would be glad to talk about how I can support Tamarack students."] }),
    L({ id: "ts-tou-cl-advisor", owner: "ts-tou", person: "Tou Vang", contact: T_CON, file: "Vang_Tou_CoverLetter_TSU_Advising.pdf", modified: 9,
      what: "for a Transfer Advisor job",
      to: ["Hiring Committee", "Transfer Student Center", "Tamarack State University, Twin Rivers Campus", "St. Paul, MN"], re: "Re: Transfer Advisor, Job Opening ID 362302", hello: "Dear Hiring Committee,",
      body: ["I am applying for the Transfer Advisor position in the Transfer Student Center at Tamarack State University. I transferred from a community college myself, and I would love to help other students make the same move.",
        "At Eastview Family Learning Center I help adult learners plan their next step, and I answer questions in Hmong and English every day.",
        "Thank you for considering me. I would be glad to talk about how I can support transfer students at Tamarack."] }),

    /* Amina: two files with almost the same name, and an old general letter */
    L({ id: "ts-amina-cl-larkspur", owner: "ts-amina", person: "Amina Yusuf", contact: A_CON, file: "Yusuf_Cover_Letter_Program_Coordinator (1).pdf", modified: 0,
      what: "addressed to Larkspur Health",
      to: ["Hiring Committee", "Patient and Family Services", "Larkspur Health", "Minneapolis, MN"], re: "Re: Program Coordinator", hello: "Dear Hiring Committee,",
      body: ["I am writing to apply for the Program Coordinator position with Patient and Family Services at Larkspur Health. For 12 years I have helped immigrant and first-generation families find their way through big systems, from colleges to social services.",
        "I plan and run large events, including an orientation for 400 people each fall, and I have built referral partnerships with 10 community organizations. I speak Somali and English.",
        "Thank you for your time. I would welcome the chance to talk about how I can help Larkspur Health serve patients and families."] }),
    L({ id: "ts-amina-cl-tsu", owner: "ts-amina", person: "Amina Yusuf", contact: A_CON, file: "Yusuf_Cover_Letter_Program_Coordinator.pdf", modified: 1, right: true,
      what: "for this job",
      to: TSU, re: RE, hello: "Dear Hiring Committee,",
      body: ["I am writing to apply for the Program Coordinator position in the Student Success Center at Tamarack State University. For 12 years I have helped first-generation and immigrant students and families reach their goals.",
        "As a Student Success Coach at Ridgeway Technical College, I plan and run orientation for 400 new students each fall, and I grew our peer mentor program from 12 to 35 mentors. I advise a caseload of 150 students and connect them with tutoring, financial aid and counseling. I speak Somali and English.",
        "Thank you for your time. I would welcome the chance to talk about how I can support Tamarack students."] }),
    L({ id: "ts-amina-cl-old", owner: "ts-amina", person: "Amina Yusuf", contact: A_CON, file: "CoverLetter_general_OLD.docx", modified: 2600, dated: "June 3, 2019",
      what: "an old letter for a Case Manager job",
      hello: "To Whom It May Concern:",
      body: ["Please accept this letter as my application for the Case Manager position. I have three years of experience working with refugee families.",
        "I am organized, caring and dependable. I work well with families, coworkers and community partners.",
        "Thank you for your consideration."] })
  ];

  danielle.lettersWhy = "One letter was addressed to Larkspur Health, and one was an old letter for a Youth Program Manager job. Only one named Tamarack State University and the Program Coordinator job.";
  tou.lettersWhy = "One letter was for a Program Coordinator job at Larkspur Health, and one was for a Transfer Advisor job at Tamarack. The file names didn’t tell you that. Only opening them did.";
  amina.lettersWhy = "The file with “(1)” in its name was addressed to Larkspur Health, and the old letter was for a Case Manager job. Only one named Tamarack State University and this job.";

  window.TS_RESUMES = [danielle, tou, amina];
  window.TS_LETTERS = LETTERS;
})();
