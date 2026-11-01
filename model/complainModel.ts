import { Document, Schema, Types, model } from "mongoose";

interface iComplain {
  title: string;
  reporterID: string;

  importance: string;
  seen: boolean;
  resolve: boolean;

  school: {};
  teacher: {};
  student: {};
}

interface iComplainData extends iComplain, Document {}

const complainModel = new Schema<iComplainData>(
  {
    title: {
      type: String,
    },

    reporterID: {
      type: String,
    },

    importance: {
      type: String,
    },

    seen: {
      type: Boolean,
      default: false,
    },

    resolve: {
      type: Boolean,
      default: false,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },

    teacher: {
      type: Types.ObjectId,
      ref: "staffs",
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },
  },
  { timestamps: true }
);

export default model<iComplainData>("complains", complainModel);
