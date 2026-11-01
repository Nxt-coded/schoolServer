import { Document, Schema, Types, model } from "mongoose";

interface iTimeTable {
  time: string;
  subject: string;
  day: string;
  CR: string;
  subjectTeacherID: string;

  classroom: {};
  staff: {};
}

interface iTimeTableData extends iTimeTable, Document {}

const timeTableModel = new Schema<iTimeTableData>(
  {
    day: {
      type: String,
    },

    time: {
      type: String,
    },

    subject: {
      type: String,
    },

    subjectTeacherID: {
      type: String,
    },

    CR: {
      type: String,
    },

    classroom: {
      type: Types.ObjectId,
      ref: "classes",
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
  },
  { timestamps: true }
);

export default model<iTimeTableData>("timeTables", timeTableModel);
