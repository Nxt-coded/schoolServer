import { Document, Schema, Types, model } from "mongoose";

interface iSessionHistroy {
  classHistory: Array<{}>;
}

interface iSessionHistoryData extends iSessionHistroy, Document {}

const sessionHistroyModel = new Schema<iSessionHistoryData>(
  {
    classHistory: [
      {
        type: Types.ObjectId,
        ref: "classHistory",
      },
    ],
  },
  { timestamps: true }
);

export default model<iSessionHistoryData>(
  "sessionHistroys",
  sessionHistroyModel
);
