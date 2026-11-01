import { Document, Schema, Types, model } from "mongoose";

interface istore {
  title: string;
  description: string;
  avatar: string;
  avatarID: string;
  cost: number;
  school: {};
}

interface istoreData extends istore, Document {}

const storeModel = new Schema<istoreData>(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    avatar: {
      type: String,
    },
    avatarID: {
      type: String,
    },
    cost: {
      type: Number,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<istoreData>("stores", storeModel);
