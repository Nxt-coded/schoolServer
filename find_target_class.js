const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const classId = new mongoose.Types.ObjectId("66d1d26ca9df5b77e39ad06e");
    
    const cls = await db.collection("classes").findOne({ _id: classId });
    if (cls) {
        console.log("Classroom Found:");
        console.log(JSON.stringify(cls, null, 2));
        
        // Find subjects
        const subjectIds = (cls.subjects || []).map(id => new mongoose.Types.ObjectId(id));
        const subjects = await db.collection("subjects").find({ _id: { $in: subjectIds } }).toArray();
        console.log(`\nFound ${subjects.length} subjects for this class.`);
        
        for (const s of subjects) {
            const exams = await db.collection("examinations").find({ _id: { $in: s.examination || [] } }).toArray();
            console.log(`\nSubject: ${s.subjectTitle} (ID: ${s._id})`);
            console.log(`Examinations (${exams.length}):`);
            exams.forEach(e => {
                console.log(`  - ID: ${e._id}, Term: "${e.term}", Started: ${e.startExam}`);
            });
        }
    } else {
        console.log("Classroom not found");
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
