
const mongoose = require('mongoose');
const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function fixRecords() {
    await mongoose.connect(DB);
    const db = mongoose.connection.db;

    const session = "2026/2027";
    const term = "2nd Term";

    console.log('Fixing exams missing session/term for Next Demo...');
    
    // Fix exams mapped to Next Demo's target
    const result = await db.collection('examinations').updateMany(
        { 
            term: term,
            $or: [ { session: "" }, { session: { $exists: false } } ]
        },
        { 
            $set: { session: session } 
        }
    );

    console.log(`Updated ${result.modifiedCount} records.`);

    process.exit(0);
}

fixRecords().catch(err => { console.error(err); process.exit(1); });
