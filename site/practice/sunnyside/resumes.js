/*
  Sunny Side Diner practice résumés (chat-apply).
  The chat form only asks for name, phone, email, ZIP and work history, so every planted
  mistake lives in those fields. All people, businesses, schools, numbers and emails are invented.
*/
(function () {
  "use strict";

  var IC = {
    phone: '<svg width="12" height="12" viewBox="0 0 24 24" fill="#0E7C86" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z"/></svg>',
    mail: '<svg width="12" height="12" viewBox="0 0 24 24" fill="#0E7C86" aria-hidden="true"><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7.2L4.5 7v.2L12 13l7.5-5.8V7z"/></svg>',
    pin: '<svg width="12" height="12" viewBox="0 0 24 24" fill="#0E7C86" aria-hidden="true"><path d="M12 2a7 7 0 017 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z"/></svg>'
  };
  function blankEdu() { return { school: "", credential: "", year: "" }; }

  var darnell = {
    id: "ss-darnell", person: "Darnell Price", file: "Darnell-Price-Resume.pdf", level: "Clean", levelNum: 1,
    doc: '<article class="rdoc classic" aria-label="Résumé: Darnell Price">' +
      '<p class="rname">Darnell J. Price</p>' +
      '<p class="rcontact">Minneapolis, MN 55407 &nbsp;|&nbsp; (612) 555-0164 &nbsp;|&nbsp; darnell.price@example.com</p>' +
      "<h5>Summary</h5><p>Line cook who keeps a clean station and a fast ticket time. Food Handler card holder.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Line Cook, Pine Street Café</b><span>April 2022 to now</span></p><p>Minneapolis, MN</p>' +
      "<ul><li>Work grill and flat-top for 150+ covers on weekend brunch</li><li>Prep and label ingredients for the morning crew</li></ul>" +
      '<p class="jobline"><b>Prep Cook, Riverbend Senior Living</b><span>August 2019 to March 2022</span></p><p>Richfield, MN</p>' +
      "<ul><li>Prepped meals for 90 residents, including special diets</li><li>Kept the walk-in cooler organized and dated</li></ul>" +
      "<h5>Education</h5><p>High School Diploma, South Valley High School, 2019</p>" +
      "<h5>Skills</h5><p>Grill and flat-top, knife skills, Food Handler card, weekend availability</p></article>",
    truth: {
      contact: { first: "Darnell", last: "Price", email: "darnell.price@example.com", phone: "(612) 555-0164", zip: "55407" },
      jobs: [
        { title: "Line Cook", employer: "Pine Street Café", startM: 4, startY: 2022, current: true },
        { title: "Prep Cook", employer: "Riverbend Senior Living", startM: 8, startY: 2019, endM: 3, endY: 2022 }
      ],
      education: blankEdu()
    },
    parsed: {
      contact: { first: "Darnell J.", last: "Price", email: "darnell.price@example.com", phone: "(612) 555-0164", city: "", state: "", zip: "55407" },
      jobs: [
        { title: "Line Cook", employer: "Pine Street Café", location: "", startM: "4", startY: "2022", endM: "4", endY: "2022", current: false, desc: "" },
        { title: "Prep Cook", employer: "Riverbend Senior Living", location: "", startM: "8", startY: "2019", endM: "3", endY: "2022", current: false, desc: "" }
      ],
      education: blankEdu()
    },
    errors: [
      { label: "The middle initial got stuck to the first name", why: "“Darnell J.” won't match his ID or other records. First name is just Darnell.",
        fields: ["c-first"], check: { match: ["contact.first"] } },
      { label: "“to now” didn't register as a current job", why: "The system doesn't understand “now.” It copied the start date as the end date. Write “Present” on a résumé.",
        fields: ["j0-endM", "j0-endY", "j0-current"], check: { jobDates: 0 } }
    ],
    coach: ["A clean, one-column résumé. It still lost two small things. Small things are what get skipped."]
  };

  var abdi = {
    id: "ss-abdi", person: "Abdi Hassan", file: "Abdi Hassan resume FINAL.pdf", level: "Fancy format", levelNum: 2,
    doc: '<article class="rdoc table" aria-label="Résumé: Abdi Hassan">' +
      '<div class="top"><div class="photo" aria-hidden="true">AH</div><div><p class="rname">Abdi Hassan</p><p class="tagline">Server. Team player. Fast learner.</p></div></div>' +
      "<h5>Profile</h5><p>Friendly server with five years in busy dining rooms. Speaks English and Somali.</p>" +
      "<h5>Work History</h5>" +
      "<table><thead><tr><th>When</th><th>Role</th><th>Where</th></tr></thead><tbody>" +
      "<tr><td>06/2021 to Present</td><td>Server</td><td>Copper Kettle Café, Minneapolis</td></tr>" +
      "<tr><td>01/2019 to 05/2021</td><td>Dishwasher</td><td>Grandview Senior Living, Edina</td></tr></tbody></table>" +
      "<h5>Strengths</h5><p>Table service, POS systems, upselling specials, staying calm during the rush</p>" +
      '<div class="cbox"><span>' + IC.phone + "(612) 555-0129</span><span>" + IC.mail + "abdi.hassan@example.com</span><span>" + IC.pin + "Minneapolis, MN 55454</span></div></article>",
    truth: {
      contact: { first: "Abdi", last: "Hassan", email: "abdi.hassan@example.com", phone: "(612) 555-0129", zip: "55454" },
      jobs: [
        { title: "Server", employer: "Copper Kettle Café", startM: 6, startY: 2021, current: true },
        { title: "Dishwasher", employer: "Grandview Senior Living", startM: 1, startY: 2019, endM: 5, endY: 2021 }
      ],
      education: blankEdu()
    },
    parsed: {
      contact: { first: "Abdi", last: "Hassan", email: "", phone: "", city: "", state: "", zip: "" },
      jobs: [
        { title: "06/2021 to Present Server", employer: "", location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "" }
      ],
      education: blankEdu()
    },
    errors: [
      { label: "The phone number and email were missed", why: "They were in a shaded box at the bottom with icons. Systems often skip boxes and anything next to pictures.",
        fields: ["c-phone", "c-email"], check: { match: ["contact.phone", "contact.email"] } },
      { label: "The ZIP code was missed", why: "Same box at the bottom of the page.",
        fields: ["c-zip"], check: { match: ["contact.zip"] } },
      { label: "The table mashed the dates into the job title", why: "Tables get read cell by cell, left to right, so “When” and “Role” ran together.",
        fields: ["j0-title", "j0-employer"], check: { hasJob: 0, exactTitle: true } },
      { label: "The work dates never made it into the date boxes", why: "They were stuck in the title instead.",
        fields: ["j0-startM", "j0-startY", "j0-current"], check: { jobDates: 0 } },
      { label: "The second job was skipped", why: "The system stopped after the first row of the table.",
        fields: ["add-job"], check: { hasJob: 1 } }
    ],
    coach: ["Tables and boxes make a résumé look organized to people, and scrambled to computers.", "Look at the work history table, then look at what the system did with it."]
  };

  var renee = {
    id: "ss-renee", person: "Renee Lindgren", file: "resume.pdf", level: "Tricky", levelNum: 3,
    doc: '<article class="rdoc functional" aria-label="Résumé: Renee Lindgren">' +
      '<p class="rname">R E N E E &nbsp; L I N D G R E N</p>' +
      '<p class="rcontact">Minneapolis, MN 55409 &nbsp;&bull;&nbsp; 612.555.0177 &nbsp;&bull;&nbsp; renee.lindgren@example.com</p>' +
      '<p class="obj">Objective: To obtain a position in food service where I can grow.</p>' +
      "<h5>Customer Service</h5><ul><li>Greeted and helped 200+ customers a day with a smile</li><li>Handled complaints calmly and got managers when needed</li></ul>" +
      "<h5>Cash Handling</h5><ul><li>Balanced a register to the penny at every shift change</li><li>Trusted to open and close the store</li></ul>" +
      "<h5>Food Safety</h5><ul><li>Food Handler card, 2024</li><li>Restocked and rotated cold case items</li></ul>" +
      '<h5>Work History</h5><div class="hist"><p><span>Cashier, Corner Stop Market</span><span>2019 to 2024</span></p>' +
      "<p><span>Laundry Attendant, Brightside Laundry</span><span>2016 to 2019</span></p></div></article>",
    truth: {
      contact: { first: "Renee", last: "Lindgren", email: "renee.lindgren@example.com", phone: "(612) 555-0177", zip: "55409" },
      jobs: [
        { title: "Cashier", employer: "Corner Stop Market", startY: 2019, endY: 2024 },
        { title: "Laundry Attendant", employer: "Brightside Laundry", startY: 2016, endY: 2019 }
      ],
      education: blankEdu()
    },
    parsed: {
      contact: { first: "R", last: "E N E E L I N D G R E N", email: "renee.lindgren@example.com", phone: "612.555", city: "", state: "", zip: "55409" },
      jobs: [
        { title: "To obtain a position in food service where I can grow", employer: "Corner Stop Market", location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "" }
      ],
      education: blankEdu()
    },
    errors: [
      { label: "The spaced-out name was read letter by letter", why: "Big letter-spaced headings look stylish, but the system sees separate letters: “R” and “E N E E L I N D G R E N.”",
        fields: ["c-first", "c-last"], check: { match: ["contact.first", "contact.last"] } },
      { label: "The phone number got cut off at the period", why: "612.555.0177 looked like a decimal number. Dashes or parentheses are safer.",
        fields: ["c-phone"], check: { match: ["contact.phone"] } },
      { label: "The objective became the job title", why: "This résumé groups skills instead of jobs, so the system grabbed the first sentence it found.",
        fields: ["j0-title"], check: { hasJob: 0, exactTitle: true } },
      { label: "The work dates were missing", why: "The résumé only lists years, tucked at the bottom. If you only know the year, leave the month blank and be ready to explain.",
        fields: ["j0-startY", "j0-endY"], check: { jobYears: 0 } },
      { label: "The laundry job was skipped", why: "Work history at the very bottom of a skills-based résumé is easy for a system to miss.",
        fields: ["add-job"], check: { hasJob: 1 } }
    ],
    coach: ["This is a skills-based résumé: skills up top, jobs squeezed in at the bottom. People sometimes use it to soften a gap. Systems hate it.",
      "Only years are listed. Fill in the years, and leave the month blank if you don't know it."]
  };

  window.SS_RESUMES = [darnell, abdi, renee];
})();
