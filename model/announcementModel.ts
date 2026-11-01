import { Document, Model, Schema, Types, model } from "mongoose";

interface iAnnouncement {
  details: string;
  date: string;
  title: string;
  status: string;

  cost: number;

  school: {};
}

interface iAnnouncementData extends iAnnouncement, Document {}

const announcementModel = new Schema<iAnnouncementData>(
  {
    title: {
      type: String,
    },

    details: {
      type: String,
    },

    date: {
      type: String,
    },

    status: {
      type: String,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iAnnouncementData>("announcements", announcementModel);
