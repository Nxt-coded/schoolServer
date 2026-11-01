"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const classroomModel_1 = __importDefault(require("./model/classroomModel"));
const MONGODB_URI = "mongodb://127.0.0.1:27017/SchoolDB"; // Adjust if necessary
async function debugData() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        const classID = "65f08726896f69324e9309b6"; // Replace with an actual classID from the user's project if possible, or search for one
        // Let's find any classroom first
        const classroom = await classroomModel_1.default.findOne().populate({
            path: "classSubjects",
            populate: [
                {
                    path: "examination",
                },
                {
                    path: "midTest",
                },
            ],
        });
        if (!classroom) {
            console.log("No classroom found");
            return;
        }
        console.log(`Checking Classroom: ${classroom.className}`);
        console.log(`Present Term: ${classroom.presentTerm}`);
        // console.log(`Present Session: ${classroom.presentSession}`); // Wait, presentSession is not in iClass model?
        if (classroom.classSubjects && classroom.classSubjects.length > 0) {
            classroom.classSubjects.forEach((subject) => {
                console.log(`\nSubject: ${subject.subjectTitle}`);
                console.log(`Exams count: ${subject.examination?.length || 0}`);
                if (subject.examination?.length > 0) {
                    subject.examination.forEach((exam) => {
                        console.log(` - Exam Term: ${exam.term}, Session: ${exam.session}`);
                    });
                }
                console.log(`MidTests count: ${subject.midTest?.length || 0}`);
                if (subject.midTest?.length > 0) {
                    subject.midTest.forEach((test) => {
                        console.log(` - Test Term: ${test.term}, Session: ${test.session}`);
                    });
                }
            });
        }
        else {
            console.log("No subjects found for this class");
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
debugData();
