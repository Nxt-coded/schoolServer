const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    const schoolId = new mongoose.Types.ObjectId("669dcb73dc3a95fd969f2873");
    const school = await db.collection("schools").findOne({ _id: schoolId });
    console.log("School PresentTerm:", school?.presentTerm);

    const classId = new mongoose.Types.ObjectId("66d1d26ca9df5b77e39ad06e");
    const classroom = await db.collection("classes").findOne({ _id: classId });
    console.log("Classroom PresentTerm:", classroom?.presentTerm);

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
