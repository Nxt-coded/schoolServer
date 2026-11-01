
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function verify() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    const subjectID = '692d32fe681568bad8602ce4'; // New Test
    const subject = await db.collection('subjects').findOne({ _id: new mongoose.Types.ObjectId(subjectID) });
    
    console.log('--- Subject: ', subject.subjectTitle, ' ---');
    
    // Resolve term
    const classId = subject.subjectClassID || subject.subjectClassIDs || subject.classID;
    const classroom = await db.collection('classes').findOne({ _id: new mongoose.Types.ObjectId(classId) });
    const schoolId = classroom?.school || classroom?.schoolIDs || subject.school;
    const school = await db.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
    
    const presentTerm = (classroom?.presentTerm || school?.presentTerm || "").trim().toLowerCase();
    const presentSession = (school?.presentSession || "").trim();
    
    console.log('Target Term:', presentTerm);
    console.log('Target Session:', presentSession);

    // 1. Test "examination" array logic (Used by examinationController)
    console.log('\n--- Path A: examination array ---');
    const examsA = await db.collection('examinations').find({ _id: { $in: (subject.examination || []).map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
    const filteredA = examsA.filter(e => {
        return e.status === 'examination' && (e.term || "").trim().toLowerCase() === presentTerm;
    });
    console.log(`Found ${filteredA.length} exams for term "${presentTerm}"`);
    filteredA.forEach(e => console.log(`  - ID: ${e._id}, Term: "${e.term}", Session: "${e.session}"`));

    // 2. Test "quiz" array logic (Old/Conflicting path in quizController - we moved it to examination)
    console.log('\n--- Path B: Checking if any exams are still in quiz array (should be handled) ---');
    const quizesB = await db.collection('examinations').find({ _id: { $in: (subject.quiz || []).map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
    const filteredB = quizesB.filter(e => {
        return e.status === 'examination' && (e.term || "").trim().toLowerCase() === presentTerm;
    });
    console.log(`Found ${filteredB.length} exams in quiz array for term "${presentTerm}"`);

    // 3. Verify most recent exam from Path A has a session
    if (filteredA.length > 0) {
        const latest = filteredA[filteredA.length - 1];
        if (!latest.session) {
            console.log('\n⚠️ WARNING: Latest exam is missing session field!');
        } else {
            console.log('\n✅ Latest exam has session:', latest.session);
        }
    }

    process.exit(0);
}

verify().catch(err => { console.error(err); process.exit(1); });
