const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const subjects = await db.collection("subjects").find({ subjectTitle: "Bio" }).toArray();
    console.log(`Subjects found with title "Bio": ${subjects.length}`);

    if (subjects.length > 0) {
        console.log("First Bio Subject RAW:");
        console.log(JSON.stringify(subjects[0], null, 2));
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
