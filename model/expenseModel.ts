import { Document, model, Schema, Types } from "mongoose";

interface iExpense {
  item: string;
  description: string;
  paymentMode: string;
  paymentCategory: string;
  amount: number;

  term: {};
}

interface iExpenseData extends iExpense, Document {}

const expenseModel = new Schema<iExpenseData>(
  {
    item: {
      type: String,
    },
    description: {
      type: String,
    },
    paymentMode: {
      type: String,
    },
    paymentCategory: {
      type: String,
    },
    amount: {
      type: Number,
    },

    term: {
      type: Types.ObjectId,
      ref: "academicSessionsTerms",
    },
  },
  { timestamps: true }
);

export default model<iExpenseData>("expenses", expenseModel);
