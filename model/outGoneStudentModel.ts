import { Document, Schema, Types, model } from "mongoose";

interface iremake {
  studentName: string;

  student: {};
  schoolInfo: {};
}

interface iremakeData extends iremake, Document {}

const OutGoneStudentsModel = new Schema<iremakeData>(
  {
    studentName: {
      type: String,
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },

    schoolInfo: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iremakeData>("outGoneStudents", OutGoneStudentsModel);
