
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function search() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    console.log('--- Searching Examinations ---');
    const exams = await db.collection('examinations').find({ subjectTitle: /New Test Quiz/i }).toArray();
    exams.forEach(e => console.log(`Exam ID: ${e._id}, SubjectID: ${e.subjectID}, Term: "${e.term}", Status: "${e.status}"`));

    console.log('\n--- Searching Mid-Tests ---');
    const midTests = await db.collection('midTests').find({ subjectTitle: /New Test Quiz/i }).toArray();
    midTests.forEach(m => console.log(`MidTest ID: ${m._id}, SubjectID: ${m.subjectID}, Term: "${m.term}", Status: "${m.status}"`));

    console.log('\n--- Searching Subjects ---');
    const subjects = await db.collection('subjects').find({ subjectTitle: /New Test Quiz/i }).toArray();
    subjects.forEach(s => console.log(`Subject ID: ${s._id}, Title: "${s.subjectTitle}"`));

    process.exit(0);
}

search().catch(err => { console.error(err); process.exit(1); });
