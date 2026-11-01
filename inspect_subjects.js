const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(DB);
  const db = mongoose.connection.db;

  const titles = ["Basic Tech", "Phy", "Bio", "Geo", "Test", "Civic Education", "New Test", "English Language", "English"];
  const subjects = await db.collection("subjects").find({ subjectTitle: { $in: titles } }).toArray();

  console.log(`Found ${subjects.length} subjects`);
  for (const s of subjects) {
    console.log(`\n--- Subject: ${s.subjectTitle} (_id: ${s._id}) ---`);
    console.log("classID / subjectClassID:", s.classID, s.subjectClassID, s.subjectClassIDs);
    console.log("examination count:", s.examination?.length);
    console.log("midTest count:", s.midTest?.length);

    if (s.examination && s.examination.length > 0) {
      const exams = await db.collection("examinations").find({ _id: { $in: s.examination } }).toArray();
      exams.forEach(e => {
        console.log(`  Exam _id: ${e._id}, term: "${e.term}", session: "${e.session}", status: ${e.status}, startExam: ${e.startExam}`);
      });
    }

    if (s.midTest && s.midTest.length > 0) {
      const midTests = await db.collection("midtests").find({ _id: { $in: s.midTest } }).toArray();
      midTests.forEach(m => {
        console.log(`  MidTest _id: ${m._id}, term: "${m.term}", session: "${m.session}", status: ${m.status}, startMidTest: ${m.startMidTest}`);
      });
    }
  }

  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
