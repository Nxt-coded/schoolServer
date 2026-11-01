const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    // SSS 1 IDs from classes collection
    const subjectIdStrings = [
        "66d1d26ca9df5b77e39ad074",
        "66d1d782a9df5b77e39ad5a6",
        "66d1d88ba9df5b77e39ad6de",
        "66d1d8c5a9df5b77e39ad741",
        "66d999f3b95442c34ab3f30a",
        "66d99c49b95442c34ab3f892",
        "66d9a1fbb95442c34ab40b6d",
        "69026a5466fd83d8c1a93c8a",
        "691451f061a5371e65809c71",
        "691afbcd3ce3b700e44a8afe",
        "691b00ef3ce3b700e44a8ba7",
        "691b03e73ce3b700e44a8c8c",
        "691b05e43ce3b700e44a8d06",
        "691b09923ce3b700e44a8e01",
        "691b0c5d3ce3b700e44a8e6c",
        "6920513e172498037d3599cd",
        "6926c5382b70ec438dd26ec9",
        "6926d7012b70ec438dd27b00"
    ];

    const subjectIds = subjectIdStrings.map(id => new mongoose.Types.ObjectId(id));
    const subjects = await db.collection("subjects").find({ _id: { $in: subjectIds } }).toArray();
    console.log(`Subjects found: ${subjects.length}`);

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
