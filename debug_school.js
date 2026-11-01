
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function debug() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    const classId = '66d1d26ca9df5b77e39ad06e';
    const classroom = await db.collection('classes').findOne({ _id: new mongoose.Types.ObjectId(classId) });
    
    console.log('--- Classroom ---');
    console.log('ID:', classroom._id);
    console.log('school (ref):', classroom.school);
    console.log('schoolIDs (string):', classroom.schoolIDs);
    
    const schoolId = classroom.school || classroom.schoolIDs;
    if (schoolId) {
        const school = await db.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
        console.log('\n--- School ---');
        if (school) {
            console.log('Name:', school.schoolName);
            console.log('PresentSession:', school.presentSession);
            console.log('PresentTerm:', school.presentTerm);
        } else {
            console.log('School not found for ID:', schoolId);
        }
    }

    process.exit(0);
}

debug().catch(err => { console.error(err); process.exit(1); });
