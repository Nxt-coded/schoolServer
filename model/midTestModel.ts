import { Document, Schema, Types, model } from "mongoose";

interface iExam {
  quiz: {};
  subjectTitle: string;
  subjectID: string;
  status: string;
  session: string;
  term: string;
  totalQuestions: number;
  startMidTest: boolean;
  randomize: boolean;

  subject: {};
  staff: {};
  performance: Array<{}>;
}

interface iExamData extends iExam, Document {}

const midTestModel = new Schema<iExamData>(
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
      default: "midTest",
    },
    subjectID: {
      type: String,
    },
    startMidTest: {
      type: Boolean,
      default: false,
    },
    randomize: {
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

export default model<iExamData>("midTests", midTestModel);
