const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    // Bio SSS 1 ID: find it by subjectTitle "Bio" and check subjectClassID
    const subjects = await db.collection("subjects").find({ 
        subjectTitle: "Bio", 
        subjectClassID: "66d1d26ca9df5b77e39ad06e" 
    }).toArray();
    
    console.log(`Bio subjects found: ${subjects.length}`);

    for (const s of subjects) {
        const midTests = await db.collection("midtests").find({ _id: { $in: s.midTest || [] } }).toArray();
        console.log(`\nSubject: ${s.subjectTitle} (ID: ${s._id})`);
        console.log(`MidTests (${midTests.length}):`);
        midTests.forEach(m => {
            console.log(`  - ID: ${m._id}, Term: "${m.term}", Status: "${m.status}", Started: ${m.started}`);
        });
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
