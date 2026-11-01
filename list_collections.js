const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:");
    collections.forEach(c => console.log(` - ${c.name}`));

    // Also check one subject to see if it exists
    const subjectsCount = await db.collection("subjects").countDocuments();
    console.log(`Subjects count: ${subjectsCount}`);

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
