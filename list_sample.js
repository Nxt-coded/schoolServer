const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const subjects = await db.collection("subjects").find({}).limit(5).toArray();
    console.log("Subjects sample:");
    console.log(JSON.stringify(subjects, null, 2));

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
