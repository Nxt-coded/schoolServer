import { Document, Schema, Types, model } from "mongoose";

interface iTimeTable {
  quiz: {};
  subjectTitle: string;
  subjectID: string;
  status: string;
  session: string;
  term: string;
  totalQuestions: number;
  startExam: false;

  subject: {};
  staff: {};
  performance: Array<{}>;
}

interface iTimeTableData extends iTimeTable, Document {}

const quizModel = new Schema<iTimeTableData>(
  {
    quiz: {
      type: {},
    },
    term: {
      type: String,
    },
    session: {
      type: String,
    },
    subjectTitle: {
      type: String,
    },
    status: {
      type: String,
      default: "quiz",
    },
    subjectID: {
      type: String,
    },
    startExam: {
      type: Boolean,
      default: false,
    },
    totalQuestions: {
      type: Number,
    },

    subject: {
      type: Types.ObjectId,
      ref: "subjects",
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },

    performance: [
      {
        type: Types.ObjectId,
        ref: "performances",
      },
    ],
  },
  { timestamps: true }
);

export default model<iTimeTableData>("quizes", quizModel);
