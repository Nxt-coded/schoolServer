const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const student = await db.collection("students").findOne({ enrollmentID: "66da1305" });
    
    if (student) {
        console.log(`Student Found: ${student.studentFirstName} ${student.studentLastName}`);
        console.log(`ClassID: ${student.classID}`);
        console.log(`PresentClass: ${student.presentClass}`);
        
        const cls = await db.collection("classes").findOne({ _id: new mongoose.Types.ObjectId(student.classID) });
        if (cls) {
            console.log(`Classroom Name: ${cls.className}`);
            console.log(`Classroom PresentTerm: ${cls.presentTerm}`);
            console.log(`Total Subjects: ${cls.subjects ? cls.subjects.length : 0}`);
            
            // Get subjects details
            const subjects = await db.collection("subjects").find({ _id: { $in: (cls.subjects || []).map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
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
        }
    } else {
        console.log("Student not found");
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
