import { Document, Model, Schema, Types, model } from "mongoose";

interface iStaff {
  subjectTitle: string;
  subjectID: string;
  subjectTeacher: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  studentGrade: string;
  totalQuestions: number;
  markPerQuestion: string;
  quizID: string;
  remark: string;
  quizDone: boolean;
  quizRecorded: boolean;
  status: string;

  studentScore: number;
  performanceRating: number;
  attemptNumber?: number;

  paymentID: string;

  student: {};
  quiz: {};
  examination: {};
  subject: {};
}

interface iStaffData extends iStaff, Document {}

const performanceModel = new Schema<iStaffData>(
  {
    status: {
      type: String,
    },
    quizID: {
      type: String,
    },
    remark: {
      type: String,
    },
    quizDone: {
      type: Boolean,
      default: false,
    },
    quizRecorded: {
      type: Boolean,
      default: false,
    },

    className: {
      type: String,
    },

    subjectTitle: {
      type: String,
    },
    subjectID: {
      type: String,
    },

    studentName: {
      type: String,
    },
    studentAvatar: {
      type: String,
    },

    subjectTeacher: {
      type: String,
    },

    studentGrade: {
      type: String,
    },
    totalQuestions: {
      type: Number,
    },
    markPerQuestion: {
      type: String,
    },

    studentScore: {
      type: Number,
    },

    performanceRating: {
      type: Number,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },
    examination: {
      type: Types.ObjectId,
      ref: "quizes",
    },
    quiz: {
      type: Types.ObjectId,
      ref: "examinations",
    },
    subject: {
      type: Types.ObjectId,
      ref: "subjects",
    },
  },
  { timestamps: true }
);

export default model<iStaffData>("performances", performanceModel);
