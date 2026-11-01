const mongoose = require("mongoose");
const URL = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function inspect() {
  try {
    console.log("Connecting to online MongoDB...");
    await mongoose.connect(URL, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully!");
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }

  const db = mongoose.connection.db;

  // Let's find any student who has subjects in their subjects array
  const studentWithSubjects = await db.collection("students").findOne({
    subjects: { $exists: true, $not: { $size: 0 } }
  });

  if (studentWithSubjects) {
    console.log("Found student with subjects:", studentWithSubjects.studentFirstName, studentWithSubjects.studentLastName);
    console.log("Subjects:", studentWithSubjects.subjects);
  } else {
    console.log("No student has any subjects in their student profile (subjects array is empty or missing for all).");
  }

  // Let's also check a sample student in SSS 2, e.g. EMMANUEL OKOSA
  const emmanuel = await db.collection("students").findOne({
    studentFirstName: { $regex: /EMMANUEL/i },
    studentLastName: { $regex: /OKOSA/i }
  });

  if (emmanuel) {
    console.log("\nEmmanuel Okosa:", emmanuel.studentFirstName, emmanuel.studentLastName);
    console.log("Emmanuel subjects:", emmanuel.subjects);
    // Find all his report cards
    const reportCards = await db.collection("myreportcards").find({ studentID: String(emmanuel._id) }).toArray();
    console.log(`Report cards for Emmanuel: ${reportCards.length}`);
    for (let rc of reportCards) {
      console.log(`- ID: ${rc._id}, ClassInfo: ${rc.classInfo}`);
      console.log("  Results:");
      rc.result.forEach(r => {
        console.log(`    * ${r.subject}: test4=${r.test4}, exam=${r.exam}, points=${r.points}, grade=${r.grade}`);
      });
    }
  } else {
    console.log("Emmanuel Okosa not found in online DB.");
  }

  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
