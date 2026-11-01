import { Document, Schema, Types, model } from "mongoose";

interface iSession {
  schoolID: string;
  presentTerm: string;
  year: string;
  term: Array<{}>;
  totalStudents: number;
  studentFeesPaid: number;
  studentFeesNotPaid: number;
  numberOfTeachers: number;
  numberOfSubjects: number;
  totalAmountRecieved: number;
  profit: number;
  school: {};
}

interface iSessionData extends iSession, Document {}

const sessionModel = new Schema<iSessionData>(
  {
    presentTerm: {
      type: String,
    },
    schoolID: {
      type: String,
    },

    year: {
      type: String,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },

    term: [
      {
        type: Types.ObjectId,
        ref: "academicSessionsTerms",
      },
    ],

    studentFeesPaid: {
      type: Number,
      default: 0,
    },

    studentFeesNotPaid: {
      type: Number,
      default: 0,
    },

    numberOfTeachers: {
      type: Number,
      default: 0,
    },

    numberOfSubjects: {
      type: Number,
      default: 0,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    totalAmountRecieved: {
      type: Number,
      default: 0,
    },

    profit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model<iSessionData>("academicSessions", sessionModel);
