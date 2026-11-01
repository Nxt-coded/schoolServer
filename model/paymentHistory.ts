import { Document, Schema, Types, model } from "mongoose";

interface iPaymentDeata {
  paymentRef: string;
  costPaid: number;

  school: {};
}

interface iPaymentDeataData extends iPaymentDeata, Document {}

const paymentReceiptModel = new Schema<iPaymentDeataData>(
  {
    paymentRef: {
      type: String,
    },

    costPaid: {
      type: Number,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iPaymentDeataData>("repts", paymentReceiptModel);
