import mongoose from "mongoose";
import env from "dotenv";
env.config();

const URL = "mongodb+srv://justtnext:justtnext@cluster0.9fh0y26.mongodb.net/nextIIDB?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(URL);
  const db = mongoose.connection.useDb("test"); // Or whatever DB name; mongoose will use connection URL
  // Just use the actual models
  const studentModel = require("./model/studentModel").default;
  const schoolModel = require("./model/schoolModel").default;
  
  const emailsToFind = ["08137204472", "justtnext@gmail.com"];
  const students = await studentModel.find().lean();
  
  console.log("Total students in DB:", students.length);
  for (let s of students.slice(0, 10)) { // just check a few if there are many
    console.log(`Student: ${s.studentFirstName} ${s.studentLastName}`);
    console.log(`  parentEmail: ${s.parentEmail}`);
    console.log(`  parentPhoneNumber: ${s.parentPhoneNumber}`);
    console.log(`  phone: ${s.phone}`);
    console.log("-----------------------");
  }
  
  const studentWithMatchingPhoneOrEmail = students.filter((s:any) => 
     s.parentPhoneNumber?.includes("0813") || s.parentEmail?.includes("justtnext")
  );
  
  console.log("Students matching target phone/email:");
  console.log(studentWithMatchingPhoneOrEmail.map((s:any) => ({
    name: s.studentFirstName, parentEmail: s.parentEmail, parentPhone: s.parentPhoneNumber, schoolId: s.schoolIDs
  })));

  if (studentWithMatchingPhoneOrEmail.length > 0) {
     const school = await schoolModel.findById(studentWithMatchingPhoneOrEmail[0].schoolIDs).lean();
     console.log("School SMS Settings for this student:");
     console.log("sendSMS flag:", school?.sendSMS);
  }

  mongoose.disconnect();
}

check().catch(console.error);
