import { Document, Schema, Types, model } from "mongoose";

interface iReportCard {
  name: string;
  teacherName: string;
  gender: string;
  image: string;
  classes: string;
  session: string;
  DOB: string;
  age: string;
  ht: string;
  wt: string;
  clubSociety: string;
  color: string;
  continuousAssesment: string;
  examScore: string;
  totalScore: string;
  grade: string;
  position: string;
  remarks: string;
  classAVG: string;
  totalObtainedScore: string;
  toataTage: string;
  totalObtainableScore: string;
  totalGrade: string;
  adminSignation: boolean;
  teachersRemark: string;
  principalRemark: string;
  date: string;
  newTermDate: string;
  subject: Array<{}>;
  staff: {};
  school: {};
  student: {};
}

interface iReportCardData extends iReportCard, Document {}

const ReportCardModel = new Schema<iReportCardData>(
  {
    teachersRemark: {
      type: String,
    },
    principalRemark: {
      type: String,
    },
    date: {
      type: String,
    },
    newTermDate: {
      type: String,
    },
    clubSociety: {
      type: String,
    },
    teacherName: {
      type: String,
    },
    gender: {
      type: String,
    },
    image: {
      type: String,
    },
    name: {
      type: String,
    },

    classes: {
      type: String,
    },

    session: {
      type: String,
    },
    age: {
      type: String,
    },
    wt: {
      type: String,
    },
    color: {
      type: String,
    },
    continuousAssesment: {
      type: String,
    },
    examScore: {
      type: String,
    },
    totalScore: {
      type: String,
    },
    grade: {
      type: String,
    },
    totalGrade: {
      type: String,
    },
    DOB: {
      type: String,
    },
    position: {
      type: String,
    },
    remarks: {
      type: String,
    },
    classAVG: {
      type: String,
    },
    totalObtainedScore: {
      type: String,
    },
    toataTage: {
      type: String,
    },
    ht: {
      type: String,
    },
    totalObtainableScore: {
      type: String,
    },
    adminSignation: {
      type: Boolean,
      default: false,
    },
    subject: [
      {
        type: Types.ObjectId,
      },
    ],
    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
    student: {
      type: Types.ObjectId,
      ref: "students",
    },
  },
  { timestamps: true }
);

export default model<iReportCardData>("reportCards", ReportCardModel);
