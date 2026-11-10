/*
  Brightway Staffing practice résumés (staffing agency application).
  All people, businesses, schools, numbers and emails are invented.
*/
(function () {
  "use strict";
  function edu(s, c, y) { return { school: s, credential: c, year: y }; }
  var RUN = 'style="display:flex;justify-content:space-between;font-size:calc(0.7 * var(--u));color:#888;border-bottom:1px solid #eee;padding-bottom:calc(0.3 * var(--u));margin-bottom:calc(1 * var(--u))"';
  var FOOT = 'class="pgfoot" style="font-size:calc(0.7 * var(--u));color:#888"';

  var luis = {
    id: "bw-luis", person: "Luis Ortega", file: "Luis-Ortega-Resume.pdf", level: "Clean", levelNum: 1,
    doc: '<article class="rdoc classic" aria-label="Résumé: Luis Ortega"><p class="rname">Luis Ortega</p>' +
      '<p class="rcontact">Brooklyn Park, Minnesota 55443 &nbsp;|&nbsp; (763) 555-0158 &nbsp;|&nbsp; luis.ortega@example.com</p>' +
      "<h5>Summary</h5><p>Machine operator with seven years in manufacturing. Forklift certified. Never missed a shift in 2025.</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Machine Operator, 2nd Shift</b><span>February 2022 to Present</span></p><p>Plymouth Precision Parts, Plymouth, MN</p>' +
      "<ul><li>Run and adjust two CNC lathes</li><li>Check parts against specs and log quality checks</li></ul>" +
      '<p class="jobline"><b>Assembler</b><span>April 2019 to January 2022</span></p><p>Northland Cabinets, Anoka, MN</p>' +
      "<ul><li>Built cabinet frames to order with power tools</li><li>Kept my station clean and safe</li></ul>" +
      "<h5>Education</h5><p>GED, Northside Adult Education, 2018</p></article>",
    truth: {
      contact: { first: "Luis", last: "Ortega", email: "luis.ortega@example.com", phone: "(763) 555-0158", city: "Brooklyn Park", state: "MN", zip: "55443" },
      jobs: [
        { title: "Machine Operator", employer: "Plymouth Precision Parts", startM: 2, startY: 2022, current: true },
        { title: "Assembler", employer: "Northland Cabinets", startM: 4, startY: 2019, endM: 1, endY: 2022 }
      ],
      education: edu("Northside Adult Education", "GED", "2018")
    },
    parsed: {
      contact: { first: "Luis", last: "Ortega", email: "luis.ortega@example.com", phone: "(763) 555-0158", city: "Brooklyn Park Minnesota", state: "", zip: "55443" },
      jobs: [
        { title: "Machine Operator, 2nd Shift", employer: "Plymouth Precision Parts", location: "Plymouth, MN", startM: "2", startY: "2022", endM: "", endY: "", current: true,
          desc: "Run and adjust two CNC lathes. Check parts against specs and log quality checks." },
        { title: "Assembler", employer: "Northland Cabinets", location: "Anoka, MN", startM: "4", startY: "2019", endM: "1", endY: "2022", current: false,
          desc: "Built cabinet frames to order with power tools. Kept my station clean and safe." }
      ],
      education: edu("Northside Adult Education", "GED", "2018")
    },
    errors: [
      { label: "“Minnesota” got stuck to the city", why: "The state was spelled out, so the system didn't recognize it as a state. MN works everywhere.",
        fields: ["c-city", "c-state"], check: { match: ["contact.city", "contact.state"] } },
      { label: "The shift got stuck to the job title", why: "“2nd Shift” is useful, but in the title it means searches for “Machine Operator” could miss you. Put it in the description.",
        fields: ["j0-title"], check: { hasJob: 0, exactTitle: true } }
    ],
    coach: ["A clean résumé. Two small things broke. Look at the address line and the first job title."]
  };

  var keisha = {
    id: "bw-keisha", person: "Keisha Brown", file: "Keisha_Brown_Resume.pdf", level: "Two pages", levelNum: 2,
    doc: '<article class="rdoc classic" aria-label="Résumé page 1: Keisha Brown"><p ' + RUN + "><span>Keisha Brown</span><span>Résumé</span></p>" +
      '<p class="rname">Keisha Brown</p><p class="rcontact">Minneapolis, MN 55412 &nbsp;|&nbsp; (612) 555-0171 &nbsp;|&nbsp; keisha.brown@example.com</p>' +
      "<h5>Summary</h5><p>Dependable production worker with five years on fast lines. Comfortable with quotas, quality checks and training new team members.</p>" +
      "<h5>Skills</h5><p>Packing and labeling, quality checks, food safety and sanitation, pallet jack, training new hires</p>" +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Packer, Packaging Plus</b><span>January 2023 to Present</span></p>' +
      "<ul><li>Pack and label 1,000+ units a shift on a fast line</li><li>Trained new packers on quality checks</li></ul>" +
      '<p class="jobline"><b>Line Worker, Golden Crust Bakery</b><span>March 2021 to December 2022</span></p>' +
      "<ul><li>Ran the bread slicer and bagger</li><li>Followed food safety and sanitation rules every shift</li></ul>" +
      "<p " + FOOT + ">Page 1 of 2</p></article>" +
      '<article class="rdoc classic" aria-label="Résumé page 2: Keisha Brown"><p ' + RUN + "><span>Keisha Brown</span><span>Résumé</span></p>" +
      "<ul><li>Boxed 300 cases a shift</li></ul>" +
      '<p class="jobline"><b>Housekeeper, Lakeview Inn</b><span>June 2018 to February 2021</span></p>' +
      "<ul><li>Cleaned 15 rooms a shift to inspection standards</li></ul>" +
      "<h5>Education</h5><p>High School Diploma, Riverview High School, 2018</p>" +
      "<h5>References</h5><p>Mike Anders, Shift Supervisor, Packaging Plus, (763) 555-0110</p>" +
      "<p " + FOOT + ">Page 2 of 2</p></article>",
    truth: {
      contact: { first: "Keisha", last: "Brown", email: "keisha.brown@example.com", phone: "(612) 555-0171", city: "Minneapolis", state: "MN", zip: "55412" },
      jobs: [
        { title: "Packer", employer: "Packaging Plus", startM: 1, startY: 2023, current: true },
        { title: "Line Worker", employer: "Golden Crust Bakery", startM: 3, startY: 2021, endM: 12, endY: 2022 },
        { title: "Housekeeper", employer: "Lakeview Inn", startM: 6, startY: 2018, endM: 2, endY: 2021 }
      ],
      education: edu("Riverview High School", "High school diploma", "2018")
    },
    parsed: {
      contact: { first: "Keisha", last: "Brown", email: "keisha.brown@example.com", phone: "(763) 555-0110", city: "Page 1 of 2", state: "", zip: "" },
      jobs: [
        { title: "Packer", employer: "Packaging Plus", location: "", startM: "1", startY: "2023", endM: "", endY: "", current: true,
          desc: "Pack and label 1,000+ units a shift on a fast line. Trained new packers on quality checks." },
        { title: "Line Worker", employer: "Golden Crust Bakery", location: "", startM: "3", startY: "2021", endM: "12", endY: "2022", current: false,
          desc: "Ran the bread slicer and bagger. Followed food safety and sanitation rules every shift." }
      ],
      education: edu("Boxed 300 cases a shift. Riverview High School", "High school diploma", "2018")
    },
    errors: [
      { label: "The phone number belongs to her reference, not her", why: "The system grabbed the last phone number on the page. Agencies would call her current supervisor instead of her.",
        fields: ["c-phone"], check: { match: ["contact.phone"] } },
      { label: "“Page 1 of 2” became the city", why: "The page footer got read as an address, and the real city, state and ZIP were lost.",
        fields: ["c-city", "c-state", "c-zip"], check: { match: ["contact.city", "contact.state", "contact.zip"] } },
      { label: "A line from page 2 landed in the school name", why: "The bullet that spilled onto page 2 got glued to the next thing the system found.",
        fields: ["e-school"], check: { match: ["education.school"] } },
      { label: "The housekeeping job on page 2 was skipped", why: "Systems often lose track at page breaks. Add it back with its dates.",
        fields: ["add-job"], check: [{ hasJob: 2 }, { jobDates: 2 }],
        datesOf: 2, datesLabel: "The housekeeping job’s dates don’t match the résumé", datesWhy: "You added it back, but the start or end date is off. Page 2 has the month and year.",
        titleLabel: "The housekeeping job’s title doesn’t match the résumé", titleWhy: "You added the Lakeview Inn job, but the job title is different. Copy the title from page 2." }
    ],
    coach: ["Two pages. The page footer, the references and the break between the pages all confused the system.", "Look at the phone number twice. Where did it come from?"]
  };

  /* Jobs left over from Mike's assignment list: an assignment as the title, or one of the sites as the employer */
  function leftovers(p) {
    var out = [];
    p.jobs.forEach(function (j, i) {
      if (/^(packaging|assembly|warehouse)$/i.test(String(j.title || "").trim()) || /twin city foods|metro electronics|cedar logistics/i.test(String(j.employer || ""))) out.push(i);
    });
    return out;
  }

  var mike = {
    id: "bw-mike", person: "Mike Turner", file: "MikeTurner.pdf", level: "Tricky", levelNum: 3,
    doc: '<article class="rdoc classic" aria-label="Résumé: Mike Turner"><p class="rname">Michael “Mike” Turner</p>' +
      '<p class="rcontact">Minneapolis, MN 55411 &nbsp;|&nbsp; (612) 555-0145 &nbsp;|&nbsp; mike.turner@example.com</p>' +
      "<h5>Experience</h5>" +
      '<p class="jobline"><b>Temporary Associate, Labor Solutions Staffing</b><span>2019 to 2024</span></p>' +
      "<p>Assignments:</p><ul><li>Packaging at Twin City Foods (3 months)</li><li>Assembly at Metro Electronics (6 months)</li><li>Warehouse at Cedar Logistics (1 year)</li><li>General labor at sites across the Twin Cities</li></ul>" +
      '<p class="jobline"><b>Dishwasher, Hilltop Diner</b><span>2016 to 2019</span></p><p>Minneapolis, MN</p>' +
      "<ul><li>Kept up with dishes for a 120-seat diner</li></ul>" +
      "<h5>Education</h5><p>High School Diploma, Westside High School, 2016</p></article>",
    truth: {
      contact: { first: "Michael", last: "Turner", email: "mike.turner@example.com", phone: "(612) 555-0145", city: "Minneapolis", state: "MN", zip: "55411" },
      jobs: [
        { title: "Temporary Associate", employer: "Labor Solutions Staffing", startY: 2019, endY: 2024 },
        { title: "Dishwasher", employer: "Hilltop Diner", startY: 2016, endY: 2019 }
      ],
      education: edu("Westside High School", "High school diploma", "2016")
    },
    parsed: {
      contact: { first: "Michael “Mike”", last: "Turner", email: "mike.turner@example.com", phone: "(612) 555-0145", city: "Minneapolis", state: "MN", zip: "55411" },
      jobs: [
        { title: "Packaging", employer: "Twin City Foods", location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "" },
        { title: "Assembly", employer: "Metro Electronics", location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "" },
        { title: "Warehouse", employer: "Cedar Logistics", location: "", startM: "", startY: "", endM: "", endY: "", current: false, desc: "" }
      ],
      education: edu("Westside High School", "High school diploma", "2016")
    },
    errors: [
      { label: "The nickname got stuck to the first name", why: "Use your legal first name in the name box. “Mike” can go in a preferred name box if there is one.",
        fields: ["c-first"], check: { match: ["contact.first"] } },
      { label: "Each temp assignment became its own job", why: "For temp work, the agency is the employer. List it once and put the assignments in the description.",
        fields: ["j0-title", "j0-employer"], check: [{ hasJob: 0 }, { fn: function (p) { return !leftovers(p).length; } }],
        leftovers: leftovers, titleOf: 0,
        titleLabel: "The agency job’s title doesn’t match the résumé", titleWhy: "You listed Labor Solutions Staffing, but the job title is different. Copy the title from the résumé." },
      { label: "The agency dates were missing or wrong", why: "The five years with Labor Solutions only show as years. Fill in the start and end years, and leave the months blank.",
        fields: ["j0-startY", "j0-endY"], check: { jobYears: 0 },
        datesOf: 0, datesLabel: "The agency years don’t match the résumé", datesWhy: "Check the start and end years for Labor Solutions against the résumé. Leave the months blank." },
      { label: "The diner job was skipped", why: "The system got lost after the list of assignments. Add it back with its years.",
        fields: ["add-job"], check: [{ hasJob: 1 }, { jobYears: 1 }],
        datesOf: 1, datesLabel: "The diner job’s years don’t match the résumé", datesWhy: "You added it back, but the years are off. Check them against the résumé.",
        titleLabel: "The diner job’s title doesn’t match the résumé", titleWhy: "You added the Hilltop Diner job, but the job title is different. Copy the title from the résumé." }
    ],
    coach: ["Five years of temp work, listed the way a lot of people do it. The system turned it into a mess.", "You'll need to remove some jobs and rebuild others. Remove buttons are at the top of each extra job."]
  };

  window.BW_RESUMES = [luis, keisha, mike];
})();
