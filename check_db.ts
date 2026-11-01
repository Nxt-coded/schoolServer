import { connect, model, Schema, Types } from "mongoose";

const DB = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

const subjectSchema = new Schema({
    subjectTitle: String,
    classID: String,
    examination: [{ type: Types.ObjectId, ref: "examinations" }],
    midTest: [{ type: Types.ObjectId, ref: "midTests" }]
});

const examinationSchema = new Schema({
    term: String,
    status: String,
    startExam: Boolean
});

const Subject = model("subjects", subjectSchema);
const Examination = model("examinations", examinationSchema);

async function check() {
    await connect(DB);
    console.log("Connected to DB");

    const subjects = await Subject.find({}).populate("examination");
    
    // We are looking for SSS 1 subjects. 
    // From my browser subagent, I saw "Basic Tech", "Phy", "Bio", etc.
    
    const relevantSubjects:any = subjects.filter( (s:any)   => 
        ["Basic Tech", "Phy", "Bio", "Geo", "Test", "Civic Education", "New Test"].includes(s.subjectTitle || "")
    );

    console.log(`Found ${relevantSubjects.length} relevant subjects`);

    relevantSubjects.forEach((s:any) => {
        console.log(`\nSubject: ${s.subjectTitle} (ID: ${s._id})`);
        console.log(`ClassID: ${s.classID}`);
        console.log(`Examinations (${s.examination.length}):`);
        s.examination.forEach((e: any) => {
            console.log(`  - ID: ${e._id}, Term: "${e.term}", Status: ${e.status}, Started: ${e.startExam}`);
        });
    });

    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
