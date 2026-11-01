import { Document, Schema, Types, model } from "mongoose";

interface iCardReport {
  results: Array<{}>;
  approve: boolean;
  totalPoints: number;
  mainGrade: string;
  classInfo: string;
  studentID: string;
  term: string;
  session: string;
  adminComment: string;
  attendance: string;
  classTeacherComment: string;

  subject: {};
  school: {};
  student: {};
  classes: {};
  performance: Array<{}>;
}

interface iCardReportData extends iCardReport, Document {}

const historicalResultModel = new Schema<iCardReportData>(
  {
    results: [
      {
        type: {},
      },
    ],

    approve: {
      type: Boolean,
      default: true,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    studentID: {
      type: String,
    },

    classInfo: {
      type: String,
    },

    session: {
      type: String,
    },

    term: {
      type: String,
    },

    mainGrade: {
      type: String,
      default: "Not Recorded Yet",
    },

    adminComment: {
      type: String,
    },

    attendance: {
      type: String,
    },

    classTeacherComment: {
      type: String,
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },

    subject: {
      type: Types.ObjectId,
      ref: "subjects",
    },

    classes: {
      type: Types.ObjectId,
      ref: "classes",
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iCardReportData>(
  "historicalResults",
  historicalResultModel
);
