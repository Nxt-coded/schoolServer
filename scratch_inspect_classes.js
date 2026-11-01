const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const DB = 'mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  await mongoose.connect(DB);
  const db = mongoose.connection.db;
  const schoolId = '68f76cb2d4a512d2af8e3f6f';

  // Check JSS 2A in Cardoso
  const jss2a = await db.collection('classes').findOne({
    className: 'JSS 2A',
    $or: [{ school: schoolId }, { schoolIDs: schoolId }],
  });
  console.log('JSS 2A class ID:', jss2a?._id?.toString(), 'Students count:', jss2a?.students?.length);
  
  if (jss2a && jss2a.students && jss2a.students.length > 0) {
    for (let i = 0; i < Math.min(3, jss2a.students.length); i++) {
      const sid = jss2a.students[i];
      const st = await db.collection('students').findOne({
        _id: new mongoose.Types.ObjectId(sid)
      });
      console.log('Student:', st?.studentFirstName, st?.studentLastName, 'classAssigned:', st?.classAssigned, 'presentClassID:', st?.presentClassID);
    }
  }

  if (jss2a && jss2a.classSubjects && jss2a.classSubjects.length > 0) {
    const subjects = await db.collection('subjects').find({
      _id: { $in: jss2a.classSubjects.slice(0, 3).map(id => new mongoose.Types.ObjectId(id)) }
    }).toArray();
    for (let s of subjects) {
      console.log('Subject in JSS 2A:', s.subjectTitle, '| designated:', s.designated, '| Teacher:', s.subjectTeacherName, '| TeacherID:', s.teacherID);
    }
  }

  // Check staff assignments in Cardoso
  const teachers = await db.collection('staffs').find({
    schoolIDs: schoolId,
  }).toArray();
  console.log('\nCardoso teachers count:', teachers.length);
  for (let t of teachers.slice(0, 5)) {
    console.log('Teacher:', t.staffName, 'classesAssigned:', JSON.stringify(t.classesAssigned), 'subjectAssigned:', JSON.stringify(t.subjectAssigned));
  }

  process.exit(0);
}

run().catch(console.error);
