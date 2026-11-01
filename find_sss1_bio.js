const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    // Find all "Bio" subjects
    const subjects = await db.collection("subjects").find({ subjectTitle: "Bio" }).toArray();
    console.log(`Found ${subjects.length} "Bio" subjects`);

    for (const s of subjects) {
        let className = "Unknown";
        if (s.classID) {
            const cls = await db.collection("classes").findOne({ _id: new mongoose.Types.ObjectId(s.classID) });
            className = cls ? cls.className : "Not Found";
        } else if (s.class) {
             const cls = await db.collection("classes").findOne({ _id: new mongoose.Types.ObjectId(s.class) });
             className = cls ? cls.className : "Not Found";
        }
        
        if (className === "SSS 1") {
            console.log(`\nSSS 1 Bio Subject Found!`);
            console.log(JSON.stringify(s, null, 2));
            
            const exams = await db.collection("examinations").find({ _id: { $in: s.examination || [] } }).toArray();
            console.log("Examinations:");
            exams.forEach(e => console.log(` - ${e._id}, Term: "${e.term}", Started: ${e.startExam}`));
        }
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
