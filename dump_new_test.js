const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const subjects = await db.collection("subjects").find({ subjectTitle: "New Test" }).toArray();
    console.log(`Subjects found with title "New Test": ${subjects.length}`);

    if (subjects.length > 0) {
        subjects.forEach(s => {
            console.log(`- _id: ${s._id}, type: ${typeof s._id}, constructor: ${s._id.constructor.name}`);
            console.log(`  classID: ${s.classID}, type: ${typeof s.classID}`);
            console.log(`  subjectClassID: ${s.subjectClassID}`);
        });
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
