
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function findSubject() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    const subjects = await db.collection('subjects').find({ subjectTitle: /New Test Quiz/i }).toArray();
    console.log('--- Subjects Matching "New Test Quiz" ---');
    if (subjects.length === 0) {
        console.log('No subjects found with that title.');
    }

    for (const sub of subjects) {
        console.log(`\nSubject: ${sub.subjectTitle}`);
        console.log(`ID: ${sub._id}`);
        console.log(`ClassID: ${sub.classID}`);
        console.log(`subjectClassID: ${sub.subjectClassID}`);
        console.log(`school: ${sub.school}`);
        
        const exams = await db.collection('examinations').find({ _id: { $in: (sub.examination || []).map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
        console.log(`Exams (${exams.length}):`);
        exams.forEach(e => {
            console.log(`  - ID: ${e._id}, Term: "${e.term}", Status: "${e.status}", Session: "${e.session}"`);
        });

        const midTests = await db.collection('midTests').find({ _id: { $in: (sub.midTest || []).map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
        console.log(`Mid-Tests (${midTests.length}):`);
        midTests.forEach(m => {
            console.log(`  - ID: ${m._id}, Term: "${m.term}", Status: "${m.status}", Session: "${m.session}"`);
        });

        // Check classroom term
        const classId = sub.subjectClassID || sub.subjectClassIDs || sub.classID;
        if (classId) {
             const classroom = await db.collection('classes').findOne({ _id: new mongoose.Types.ObjectId(classId) });
             console.log(`Classroom PresentTerm: "${classroom?.presentTerm}"`);
        }
    }

    process.exit(0);
}

findSubject().catch(err => { console.error(err); process.exit(1); });
