
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
    console.log('Connecting to database...');
    await mongoose.connect(DB);
    const db = mongoose.connection.db;
    
    // Check school and classroom from check_terms.js
    const schoolId = new mongoose.Types.ObjectId('669dcb73dc3a95fd969f2873');
    const classId = new mongoose.Types.ObjectId('66d1d26ca9df5b77e39ad06e');
    const school = await db.collection('schools').findOne({ _id: schoolId });
    const classroom = await db.collection('classes').findOne({ _id: classId });
    
    console.log('\n--- BASIC INFO ---');
    console.log('School ID:', schoolId);
    console.log('School PresentTerm:', school?.presentTerm);
    console.log('Classroom ID:', classId);
    console.log('Classroom PresentTerm:', classroom?.presentTerm);

    // Find the subject "New Test Quiz"
    console.log('\n--- LOOKING FOR SUBJECT \"New Test Quiz\" ---');
    const targetSubject = await db.collection('subjects').findOne({ subjectTitle: /New Test Quiz/i });
    if (targetSubject) {
        console.log('Subject Found:', targetSubject.subjectTitle, '(ID:', targetSubject._id, ')');
        console.log('  - classID (String) on Subject:', targetSubject.classID);
        console.log('  - class (ObjectId) on Subject:', targetSubject.class);
        
        // Inspect relate classroom if different
        if (targetSubject.class && targetSubject.class.toString() !== classId.toString()) {
            const otherClass = await db.collection('classes').findOne({ _id: targetSubject.class });
            console.log('  - Subject Refers to DIFFERENT Classroom:', otherClass?.className, '(ID:', otherClass?._id, ')');
            console.log('    - That Classroom PresentTerm:', otherClass?.presentTerm);
        }

        // Check Examinations
        const examIds = targetSubject.examination || [];
        console.log('\n  Examinations Linked to Subject (' + examIds.length + '):');
        const exams = await db.collection('examinations').find({ _id: { $in: examIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
        exams.forEach(e => {
            console.log('    - ID:', e._id);
            console.log('      Term:', e.term);
            console.log('      Status:', e.status);
            console.log('      Session:', e.session);
            console.log('      startExam (Visibility):', e.startExam);
        });

        // Check MidTests
        const midTestIds = targetSubject.midTest || [];
        console.log('\n  MidTests Linked to Subject (' + midTestIds.length + '):');
        const midTests = await db.collection('midtests').find({ _id: { $in: midTestIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
        midTests.forEach(m => {
            console.log('    - ID:', m._id);
            console.log('      Term:', m.term);
            console.log('      Status:', m.status);
            console.log('      Session:', m.session);
            console.log('      startMidTest (Visibility):', m.startMidTest);
        });
    } else {
        console.log('Subject \"New Test Quiz\" not found.');
        
        // List some subjects to see what they look like
        console.log('\n--- SAMPLE SUBJECTS ---');
        const samples = await db.collection('subjects').find({}).limit(5).toArray();
        samples.forEach(s => console.log('  -', s.subjectTitle, '(ID:', s._id, ')'));
    }

    process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
