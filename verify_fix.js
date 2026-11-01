const axios = require("axios");

async function verify() {
  const subjectID = "69afc8b8c5a72cd302af89ff";
  const baseUrl = "https://startschoolnextbe.onrender.com/api"; // Assuming default port from index.ts if not specified, but let's try to find it.

  // Actually, I can just use mongoose to simulate what the controller does
  const mongoose = require("mongoose");
  const DB =
    "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

  await mongoose.connect(DB);
  const db = mongoose.connection.db;

  const subject = await db
    .collection("subjects")
    .findOne({ _id: new mongoose.Types.ObjectId(subjectID) });
  console.log("--- Subject Info ---");
  console.log("Title:", subject.subjectTitle);
  console.log("subjectClassID:", subject.subjectClassID);

  const classId =
    subject.subjectClassID || subject.subjectClassIDs || subject.classID;
  const classroom = await db
    .collection("classes")
    .findOne({ _id: new mongoose.Types.ObjectId(classId) });
  const presentTerm = (classroom?.presentTerm || "").trim().toLowerCase();
  console.log("Classroom PresentTerm:", presentTerm);

  const exams = await db
    .collection("examinations")
    .find({
      _id: {
        $in: (subject.examination || []).map(
          (id) => new mongoose.Types.ObjectId(id),
        ),
      },
    })
    .toArray();
  console.log("Total Exams for subject:", exams.length);

  const filtered = exams.filter((e) => {
    const termMatch = (e.term || "").trim().toLowerCase() === presentTerm;
    return termMatch && e.status === "examination";
  });

  console.log("Filtered Exams (Current Term):", filtered.length);
  filtered.forEach((e) => {
    console.log(`  - ID: ${e._id}, Term: "${e.term}"`);
  });

  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
