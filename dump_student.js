const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const student = await db.collection("students").findOne({ enrollmentID: "66da1305" });
    
    if (student) {
        console.log("Full RAW Student:");
        console.log(JSON.stringify(student, null, 2));
    } else {
        console.log("Student not found");
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
