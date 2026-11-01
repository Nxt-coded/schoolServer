const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(DB);
  const db = mongoose.connection.db;

  const classId = new mongoose.Types.ObjectId("66d1d26ca9df5b77e39ad06e");
  const cls = await db.collection("classes").findOne({ _id: classId });

  console.log("Class:", cls.className, "presentTerm:", cls.presentTerm);
  console.log("Class subjects count:", cls.classSubjects?.length);

  const subjects = await db.collection("subjects").find({ _id: { $in: cls.classSubjects || [] } }).toArray();

  for (const s of subjects) {
    console.log(`\n================================`);
    console.log(`Subject: "${s.subjectTitle}" (_id: ${s._id})`);
    console.log("examination IDs:", s.examination);
    console.log("midTest IDs:", s.midTest);

    if (s.examination && s.examination.length > 0) {
      const exams = await db.collection("examinations").find({ _id: { $in: s.examination } }).toArray();
      exams.forEach(e => {
        console.log(`  [EXAM] _id: ${e._id}, term: "${e.term}", session: "${e.session}", status: ${e.status}, startExam: ${e.startExam}`);
      });
    }

    if (s.midTest && s.midTest.length > 0) {
      const midTests = await db.collection("midtests").find({ _id: { $in: s.midTest } }).toArray();
      midTests.forEach(m => {
        console.log(`  [MID-TEST] _id: ${m._id}, term: "${m.term}", session: "${m.session}", status: ${m.status}, startMidTest: ${m.startMidTest}`);
      });
    }
  }

  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });

