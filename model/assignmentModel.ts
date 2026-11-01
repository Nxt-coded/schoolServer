import { Document, Schema, Types, model } from "mongoose";

interface iTimeTable {
  assignmentTopic: string;
  assignmentDetails: string;
  assignmentDeadline: string;

  subjectTitle: string;

  subject: {};
  staff: {};
  class: {};
}

interface iTimeTableData extends iTimeTable, Document {}

const assignmentModel = new Schema<iTimeTableData>(
  {
    assignmentTopic: {
      type: String,
    },

    assignmentDetails: {
      type: String,
    },

    assignmentDeadline: {
      type: String,
    },

    subjectTitle: {
      type: String,
    },

    subject: {
      type: Types.ObjectId,
      ref: "subjects",
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },

    class: {
      type: Types.ObjectId,
      ref: "classes",
    },
  },
  { timestamps: true }
);

export default model<iTimeTableData>("assignments", assignmentModel);
