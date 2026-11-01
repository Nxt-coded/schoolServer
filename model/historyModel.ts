import { Document, Schema, Types, model } from "mongoose";

interface iPurchased {
  date: string;
  studentName: string;
  studentClass: string;
  cart: [];
  reference: string;
  amount: number;
  purchasedID: string;
  delievered: boolean;

  school: {};
  student: {};
  staff: {};
}

interface iPurchasedData extends iPurchased, Document {}

const purchasedModel = new Schema<iPurchasedData>(
  {
    date: {
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

    delievered: {
      type: Boolean,
    },

    cart: {
      type: [],
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
  },
  { timestamps: true }
);

export default model<iPurchasedData>("purchasedHistories", purchasedModel);
