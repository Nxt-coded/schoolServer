const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  await mongoose.connect(DB);
  const db = mongoose.connection.db;
  const schoolId = '68f76cb2d4a512d2af8e3f6f';

  const school = await db.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
  console.log('School subjects count in school.subjects:', (school.subjects || []).length);

  const subjects = await db.collection('subjects').find({
    _id: { $in: (school.subjects || []).map(id => new mongoose.Types.ObjectId(id)) }
  }).toArray();

  console.log('Total subjects found in DB:', subjects.length);
  const designations = {};
  for (let s of subjects) {
    const des = s.designated || 'NO_DESIGNATION';
    if (!designations[des]) designations[des] = [];
    designations[des].push({
      title: s.subjectTitle,
      teacher: s.subjectTeacherName,
      teacherId: s.teacherID,
      classId: s.classID || s.subjectClassID || s.subjectClassIDs
    });
  }

  for (let des in designations) {
    console.log(`Designation: "${des}" -> ${designations[des].length} subjects`);
    for (let s of designations[des].slice(0, 3)) {
      console.log(`    ${s.title} | Teacher: ${s.teacher} | classId: ${s.classId}`);
    }
  }

  process.exit(0);
}

run().catch(console.error);
