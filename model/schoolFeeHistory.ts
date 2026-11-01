import { Document, Schema, Types, model } from "mongoose";

interface iPurchased {
  date: string;

  studentName: string;
  studentClass: string;

  term: string;
  session: string;
  studentID: string;

  reference: string;
  amount: number;

  termID: string;
  sessionID: string;

  purchasedID: string;
  image: string;

  confirm: boolean;

  school: {};
  student: {};
}

interface iPurchasedData extends iPurchased, Document {}

const schoolFessHistoryModel = new Schema<iPurchasedData>(
  {
    studentID: {
      type: String,
    },

    termID: {
      type: String,
    },

    sessionID: {
      type: String,
    },

    date: {
      type: String,
    },
    session: {
      type: String,
    },

    image: {
      type: String,
    },

    term: {
      type: String,
    },

    studentName: {
      type: String,
    },

    studentClass: {
      type: String,
    },

    amount: {
      type: Number,
    },

    reference: {
      type: String,
    },

    purchasedID: {
      type: String,
    },

    confirm: {
      type: Boolean,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },
  },
  { timestamps: true }
);

export default model<iPurchasedData>(
  "schoolFeesHistories",
  schoolFessHistoryModel
);
