const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    const classId = new mongoose.Types.ObjectId("698b0ffb2efee068f97920ae");
    const classroom = await db.collection("classes").findOne({ _id: classId });
    
    if (!classroom) {
        console.log("Classroom not found");
        process.exit(1);
    }

    console.log(`Classroom: ${classroom.className}, Subjects: ${classroom.subjects.length}`);

    const subjects = await db.collection("subjects").find({ _id: { $in: classroom.subjects.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();

    for (const s of subjects) {
        const exams = await db.collection("examinations").find({ _id: { $in: s.examination || [] } }).toArray();
        if (exams.length > 0) {
            console.log(`\nSubject: ${s.subjectTitle} (ID: ${s._id})`);
            console.log(`Examinations (${exams.length}):`);
            exams.forEach(e => {
                console.log(`  - ID: ${e._id}, Term: "${e.term}", Status: "${e.status}", Started: ${e.startExam}`);
            });
        }
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
