import { Document, Model, Schema, Types, model } from "mongoose";

interface iExpenditure {
  budget: string;
  StartDate: string;
  EndDate: string;
  expenseAmount: Number;
  expenseCategory: string;
  paymentMethod: string;
  description: string;

  school: {};
}

interface iExpenditureData extends iExpenditure, Document {}

const expenditureModel = new Schema<iExpenditureData>(
  {
    budget: {
      type: String,
    },

    StartDate: {
      type: String,
    },
    EndDate: {
      type: String,
    },
    expenseAmount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
    },
    description: {
      type: String,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iExpenditureData>("expenditures", expenditureModel);
