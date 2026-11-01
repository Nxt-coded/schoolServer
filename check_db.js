const mongoose = require("mongoose");

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

const subjectSchema = new mongoose.Schema({
    subjectTitle: String,
    classID: String,
    school: { type: mongoose.Schema.Types.ObjectId, ref: "schools" },
    examination: [{ type: mongoose.Schema.Types.ObjectId, ref: "examinations" }],
    midTest: [{ type: mongoose.Schema.Types.ObjectId, ref: "midTests" }]
});

const examinationSchema = new mongoose.Schema({
    term: String,
    status: String,
    startExam: Boolean
});

const schoolSchema = new mongoose.Schema({
    presentTerm: String
});

const Subject = mongoose.model("subjects", subjectSchema);
const Examination = mongoose.model("examinations", examinationSchema);
const School = mongoose.model("schools", schoolSchema);

async function check() {
    await mongoose.connect(DB);
    console.log("Connected to DB");

    const subjects = await Subject.find({}).populate("examination");
    
    const relevantSubjects = subjects.filter(s => 
        s.examination.length > 0 &&
        ["Basic Tech", "Phy", "Bio", "Geo", "Test", "Civic Education", "New Test"].includes(s.subjectTitle || "")
    );

    console.log(`Found ${relevantSubjects.length} relevant subjects with exams`);

    for (const s of relevantSubjects) {
        console.log(`\nSubject: ${s.subjectTitle} (ID: ${s._id})`);
        console.log(`ClassID: ${s.classID}`);
        
        let schoolData = null;
        if (s.school) {
            schoolData = await School.findById(s.school);
            console.log(`School ID: ${s.school}, School PresentTerm: "${schoolData?.presentTerm}"`);
        }

        console.log(`Examinations (${s.examination.length}):`);
        s.examination.forEach((e) => {
            console.log(`  - ID: ${e._id}, Term: "${e.term}", Status: ${e.status}, Started: ${e.startExam}`);
        });
    }

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
