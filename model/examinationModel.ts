import { Document, Schema, Types, model } from "mongoose";

interface iExam {
  quiz: {};
  subjectTitle: string;
  subjectID: string;
  status: string;
  session: string;
  term: string;
  totalQuestions: number;
  startExam: boolean;
  randomize: boolean;
  currentRound: number;
  opensAt?: Date;
  closesAt?: Date;

  subject: {};
  staff: {};
  performance: Array<{}>;
}

interface iExamData extends iExam, Document {}

const examModel = new Schema<iExamData>(
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
      default: "examination",
    },
    subjectID: {
      type: String,
    },
    startExam: {
      type: Boolean,
      default: false,
    },
    randomize: {
      type: Boolean,
      default: false,
    },
    currentRound: {
      type: Number,
      default: 1,
    },
    opensAt: {
      type: Date,
    },
    closesAt: {
      type: Date,
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

export default model<iExamData>("examinations", examModel);
