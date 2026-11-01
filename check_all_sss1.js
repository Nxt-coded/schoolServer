const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const classrooms = await db.collection("classes").find({ className: "SSS 1" }).toArray();
    console.log(`Found ${classrooms.length} "SSS 1" classrooms`);

    classrooms.forEach((c, i) => {
        console.log(`\nClassroom ${i+1}:`);
        console.log(`  ID: ${c._id}`);
        console.log(`  SchoolID: ${c.schoolIDs}`);
        console.log(`  PresentTerm: "${c.presentTerm}"`);
    });

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
