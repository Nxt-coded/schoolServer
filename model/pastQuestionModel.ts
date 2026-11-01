import { Document, Schema, Types, model } from "mongoose";

interface iTimeTable {
  year: string;
  percent: number;
  subject: string;
  score: number;
  chosenAnswers: {};
}

interface iTimeTableData extends iTimeTable, Document {}

const pQuestionModel = new Schema<iTimeTableData>(
  {
    year: {
      type: String,
    },

    subject: {
      type: String,
    },

    percent: {
      type: Number,
    },

    score: {
      type: Number,
    },

    chosenAnswers: {
      type: {},
    },
  },
  { timestamps: true }
);

export default model<iTimeTableData>("pquestions", pQuestionModel);
