
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function inspect() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    const subId = '692d32fe681568bad8602ce4';
    const subject = await db.collection('subjects').findOne({ _id: new mongoose.Types.ObjectId(subId) });
    
    console.log('--- Subject Detail ---');
    if (!subject) {
        console.log('Subject not found!');
    } else {
        console.log('Title:', subject.subjectTitle);
        console.log('ClassID:', subject.classID);
        console.log('subjectClassID:', subject.subjectClassID);
        console.log('Examination Array:', subject.examination);
        
        const classId = subject.subjectClassID || subject.subjectClassIDs || subject.classID;
        if (classId) {
            const classroom = await db.collection('classes').findOne({ _id: new mongoose.Types.ObjectId(classId) });
            console.log('Classroom PresentTerm:', classroom?.presentTerm);
        }

        if (subject.examination && subject.examination.length > 0) {
            const exams = await db.collection('examinations').find({ _id: { $in: subject.examination.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
            console.log('\nLinked Exams:');
            exams.forEach(e => {
                console.log(`  - ID: ${e._id}, Term: "${e.term}", Status: "${e.status}"`);
            });
        }
    }

    process.exit(0);
}

inspect().catch(err => { console.error(err); process.exit(1); });
