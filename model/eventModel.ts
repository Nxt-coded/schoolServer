import { Document, Model, Schema, Types, model } from "mongoose";

interface iEvent {
  details: string;
  date: string;
  title: string;
  status: string;

  cost: number;

  school: {};
}

interface iEventData extends iEvent, Document {}

const eventModel = new Schema<iEventData>(
  {
    title: {
      type: String,
    },

    details: {
      type: String,
    },

    status: {
      type: String,
    },

    date: {
      type: String,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iEventData>("events", eventModel);
