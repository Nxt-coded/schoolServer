import { Document, Schema, Types, model } from "mongoose";

interface iGallaries {
  title: string;
  description: string;
  avatar: string;
  avatarID: string;

  school: {};
}

interface iGallariesData extends iGallaries, Document {}

const gallaryModel = new Schema<iGallariesData>(
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

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iGallariesData>("gallaries", gallaryModel);
