const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    const cls = await db.collection("classes").findOne({ className: "SSS 1" });
    if (cls) {
        console.log(`Class _id: ${cls._id}`);
        console.log(`Class _id type: ${typeof cls._id}`);
        console.log(`Is ObjectId? ${cls._id instanceof mongoose.Types.ObjectId}`);
        console.log(`Constructor name: ${cls._id.constructor.name}`);
    }
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
