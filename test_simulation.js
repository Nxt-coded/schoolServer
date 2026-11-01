const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

const normalize = (val) => String(val || "").trim().toLowerCase();

async function run() {
  await mongoose.connect(DB);
  const db = mongoose.connection.db;

  const classId = new mongoose.Types.ObjectId("66d1d26ca9df5b77e39ad06e");
  const cls = await db.collection("classes").findOne({ _id: classId });
  const school = await db.collection("schools").findOne({ schoolName: "Next Demo" });

  const presentTerm = normalize(cls?.presentTerm || school?.presentTerm || "");
  const presentSession = normalize(school?.presentSession || "");

  console.log(`Class: ${cls.className}, Term: "${presentTerm}", Session: "${presentSession}"`);

  const subjects = await db.collection("subjects").find({ _id: { $in: cls.classSubjects || [] } }).toArray();

  for (const s of subjects) {
    const allExams = await db.collection("examinations").find({ _id: { $in: s.examination || [] } }).toArray();
    const allMidTests = await db.collection("midtests").find({ _id: { $in: s.midTest || [] } }).toArray();

    const matchesCurrentTerm = (e) =>
      !!presentTerm && normalize(e?.term || "") === presentTerm;
    const matchesCurrentSession = (e) =>
      !presentSession || !e?.session || normalize(e?.session || "") === presentSession;

    const currentExams = allExams.filter(e => matchesCurrentTerm(e) && matchesCurrentSession(e));
    const currentMidTests = allMidTests.filter(m => matchesCurrentTerm(m) && matchesCurrentSession(m));

    const activeExam = currentExams.find(e => e?.startExam === true) || currentExams[0];
    const activeMidTest = currentMidTests.find(m => m?.startMidTest === true) || currentMidTests[0];

    const studentExamMatch = !!activeExam?.startExam && matchesCurrentTerm(activeExam?.term) && matchesCurrentSession(activeExam?.session);
    const studentMidMatch = !!activeMidTest?.startMidTest && matchesCurrentTerm(activeMidTest?.term) && matchesCurrentSession(activeMidTest?.session);

    let status = [];
    if (studentExamMatch) status.push("Start Examination");
    if (studentMidMatch) status.push("Start Mid Test");
    if (status.length === 0) status.push("No Mid-Test/Examination Available yet");

    console.log(`- ${s.subjectTitle}: [${status.join(", ")}] (Exam found: ${!!activeExam}, MidTest found: ${!!activeMidTest})`);
  }

  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });

