
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    console.log('--- RECENT EXAMINATIONS ---');
    const exams = await db.collection('examinations').find({}).sort({createdAt: -1}).limit(10).toArray();
    for (const e of exams) {
        const s = await db.collection('subjects').findOne({ _id: e.subject });
        console.log(`Exam ID: ${e._id}, Term: "${e.term}", Subject: "${s?.subjectTitle}" (ID: ${s?._id}), Status: ${e.status}`);
    }

    console.log('\n--- RECENT MIDTESTS ---');
    const midTests = await db.collection('midtests').find({}).sort({createdAt: -1}).limit(10).toArray();
    for (const m of midTests) {
        const s = await db.collection('subjects').findOne({ _id: m.subject });
        console.log(`MidTest ID: ${m._id}, Term: "${m.term}", Subject: "${s?.subjectTitle}" (ID: ${s?._id}), Status: ${m.status}`);
    }

    process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
