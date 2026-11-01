
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function listRecent() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    console.log('--- Recent Subjects ---');
    const subjects = await db.collection('subjects').find().sort({ _id: -1 }).limit(10).toArray();
    subjects.forEach(s => console.log(`ID: ${s._id}, Title: "${s.subjectTitle}"`));

    console.log('\n--- Recent Examinations ---');
    const exams = await db.collection('examinations').find().sort({ _id: -1 }).limit(10).toArray();
    exams.forEach(e => console.log(`ID: ${e._id}, SubjectTitle: "${e.subjectTitle}", Term: "${e.term}", SubjectID: ${e.subjectID}`));

    console.log('\n--- Recent Mid-Tests ---');
    const midTests = await db.collection('midTests').find().sort({ _id: -1 }).limit(10).toArray();
    midTests.forEach(m => console.log(`ID: ${m._id}, SubjectTitle: "${m.subjectTitle}", Term: "${m.term}", SubjectID: ${m.subjectID}`));

    process.exit(0);
}

listRecent().catch(err => { console.error(err); process.exit(1); });
