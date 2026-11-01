import { Document, model, Schema, Types } from "mongoose";

interface irecordPayment {
  // creating
  feePaid: Array<Number>;
  feePaidDate: string;
  feeBalance: number;
  paidByWho: string;
  paymentMode: string;

  // returning
  studentID: string;
  studentFirstName: string;
  studentLastName: string;
  studentClass: string;
  studentAvatar: string;
  parentMail: string;
  classFees: number;
  currentTerm: string;

  // defaults
  feePaymentComplete: boolean;

  // tied to
  student: {};
  term: {};
  school: {};
}

interface irecordPaymentData extends irecordPayment, Document {}

const recordPaymentModel = new Schema<irecordPaymentData>(
  {
    feePaid: [
      {
        type: Number,
      },
    ],
    feePaidDate: {
      type: String,
    },
    feeBalance: {
      type: Number,
    },
    paidByWho: {
      type: String,
    },
    paymentMode: {
      type: String,
    },
    studentID: {
      type: String,
    },
    studentFirstName: {
      type: String,
    },
    studentLastName: {
      type: String,
    },
    studentClass: {
      type: String,
    },
    studentAvatar: {
      type: String,
    },
    parentMail: {
      type: String,
    },
    classFees: {
      type: Number,
    },
    currentTerm: {
      type: String,
    },

    feePaymentComplete: {
      default: false,
      type: Boolean,
    },
    student: {
      type: Types.ObjectId,
      ref: "students",
    },
    term: {
      type: Types.ObjectId,
      ref: "academicSessionsTerms",
    },
    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<irecordPaymentData>("recordPayments", recordPaymentModel);
