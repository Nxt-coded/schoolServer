const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    // Bio subject ID from previous dump: 6926cccb2b70ec438dd2737a
    const bioId = new mongoose.Types.ObjectId("6926cccb2b70ec438dd2737a");
    
    const subject = await db.collection("subjects").findOne({ _id: bioId });
    console.log("Full RAW Subject:");
    console.log(JSON.stringify(subject, null, 2));

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
