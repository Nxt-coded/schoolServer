import { Document, Schema, Types, model } from "mongoose";

interface iSessionTerm {
  year: string;
  term: string;
  payRef: string;
  presentTerm: string;

  plan: boolean;
  costPaid: number;
  classResult: any;
  paymentOptions: [];
  storePayment: [];
  schoolFeePayment: [];
  expensePayOut: [];
  totalStudents: number;
  studentFeesPaid: number;
  studentFeesNotPaid: number;
  numberOfTeachers: number;
  numberOfSubjects: number;
  totalAmountRecieved: number;
  profit: number;
  budget: number;
  expense: Array<{}>;
  recordPayments: Array<{}>;
  session: {};
}

interface iSessionTermData extends iSessionTerm, Document {}

const termModel = new Schema<iSessionTermData>(
  {
    year: {
      type: String,
    },

    paymentOptions: {
      type: [],
    },
    classResult: {
      type: [],
    },

    expensePayOut: {
      type: [],
    },

    schoolFeePayment: {
      type: [],
    },

    storePayment: {
      type: [],
    },

    presentTerm: {
      type: String,
    },

    budget: {
      type: Number,
    },

    expense: [
      {
        type: Types.ObjectId,
        ref: "expenses",
      },
    ],

    payRef: {
      type: String,
      default: "",
    },

    costPaid: {
      type: Number,
    },

    plan: {
      type: Boolean,
      default: false,
    },

    term: {
      type: String,
    },

    studentFeesPaid: {
      type: Number,
      default: 0,
    },

    studentFeesNotPaid: {
      type: Number,
      default: 0,
    },

    numberOfTeachers: {
      type: Number,
      default: 0,
    },

    numberOfSubjects: {
      type: Number,
      default: 0,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },
    recordPayments: [
      {
        type: Types.ObjectId,
        ref: "recordPayments",
      },
    ],

    totalAmountRecieved: {
      type: Number,
      default: 0,
    },

    session: {
      type: Types.ObjectId,
      ref: "academicSessions",
    },
  },
  { timestamps: true }
);

export default model<iSessionTermData>("academicSessionsTerms", termModel);
