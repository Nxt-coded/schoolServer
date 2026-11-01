
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function checkSub() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    const subId = '692d32fe681568bad8602ce4';
    const subject = await db.collection('subjects').findOne({ _id: new mongoose.Types.ObjectId(subId) });
    
    console.log('--- Subject ---');
    console.log('ID:', subject._id);
    console.log('school (ref):', subject.school);
    
    if (subject.school) {
        const school = await db.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(subject.school) });
        console.log('\n--- School ---');
        if (school) {
            console.log('Name:', school.schoolName);
            console.log('PresentSession:', school.presentSession);
            console.log('PresentTerm:', school.presentTerm);
        }
    }

    process.exit(0);
}

checkSub().catch(err => { console.error(err); process.exit(1); });
