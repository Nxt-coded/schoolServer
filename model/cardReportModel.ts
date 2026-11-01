import { Document, Schema, Types, model } from "mongoose";

interface iCardReport {
  result: Array<{}>;
  approve: boolean;
  points: number;
  grade: string;
  classInfo: string;
  studentID: string;
  adminComment: string;
  attendance: string;
  classTeacherComment: string;

  psycho: boolean;
  peopleSkill: [];
  softSkill: [];
  physicalSkill: [];

  school: {};
  student: {};
  classes: {};
  performance: Array<{}>;
}

interface iCardReportData extends iCardReport, Document {}

const cardRportModel = new Schema<iCardReportData>(
  {
    result: [
      {
        type: {},
      },
    ],

    approve: {
      type: Boolean,
      default: false,
    },

    psycho: {
      type: Boolean,
      default: false,
    },

    points: {
      type: Number,
      default: 0,
    },

    studentID: {
      type: String,
    },

    classInfo: {
      type: String,
    },

    peopleSkill: {
      type: [],
    },

    physicalSkill: {
      type: [],
    },

    softSkill: {
      type: [],
    },

    grade: {
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

export default model<iCardReportData>("myReportCards", cardRportModel);
