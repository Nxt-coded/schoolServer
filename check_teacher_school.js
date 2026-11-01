
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function checkTeacher() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    const classId = '66d1d26ca9df5b77e39ad06e';
    const classroom = await db.collection('classes').findOne({ _id: new mongoose.Types.ObjectId(classId) });
    
    if (classroom?.teacherID) {
        const teacher = await db.collection('staffs').findOne({ _id: new mongoose.Types.ObjectId(classroom.teacherID) });
        console.log('--- Teacher ---');
        console.log('ID:', teacher._id);
        console.log('schoolIDs:', teacher.schoolIDs);
        
        if (teacher.schoolIDs) {
            const sid = Array.isArray(teacher.schoolIDs) ? teacher.schoolIDs[0] : teacher.schoolIDs;
            const school = await db.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(sid) });
            console.log('\n--- School from Teacher ---');
            if (school) {
                console.log('Name:', school.schoolName);
                console.log('Session:', school.presentSession);
            }
        }
    }

    console.log('\n--- All Schools (First 3) ---');
    const schools = await db.collection('schools').find().limit(3).toArray();
    schools.forEach(s => console.log(`ID: ${s._id}, Name: ${s.schoolName}, Session: ${s.presentSession}, Term: ${s.presentTerm}`));

    process.exit(0);
}

checkTeacher().catch(err => { console.error(err); process.exit(1); });
