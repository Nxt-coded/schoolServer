
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function broadSearch() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    console.log('--- Broad Subject Search ---');
    const subjects = await db.collection('subjects').find({ subjectTitle: /New Test/i }).toArray();
    subjects.forEach(s => {
        console.log(`ID: ${s._id}, Title: "${s.subjectTitle}"`);
    });

    if (subjects.length === 0) {
        console.log('No subjects found with title containing "New Test".');
    }

    process.exit(0);
}

broadSearch().catch(err => { console.error(err); process.exit(1); });
