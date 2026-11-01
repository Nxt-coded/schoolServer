import { Document, Schema, Types, model } from "mongoose";

interface istore {
  resultHistory: any[];
  principalsRemark: string;
  session: string;
  term: string;
  className: string;
  classTeacherName: string;
  classRoom: {};
}

interface istoreData extends istore, Document {}

const classHistoryModel = new Schema<istoreData>(
  {
    resultHistory: {
      type: [],
    },
    principalsRemark: {
      type: String,
    },
    session: {
      type: String,
    },
    term: {
      type: String,
    },
    classTeacherName: {
      type: String,
    },
    className: {
      type: String,
    },

    classRoom: {
      type: Types.ObjectId,
      ref: "classes",
    },
  },
  { timestamps: true }
);

export default model<istoreData>("classHistories", classHistoryModel);
