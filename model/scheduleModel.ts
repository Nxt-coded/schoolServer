import { Document, Schema, Types, model } from "mongoose";

interface iSchedule {
  time: string;
  subject: string;
  day: string;

  staffs: {};
}

interface iScheduleData extends iSchedule, Document {}

const scheduleModel = new Schema<iScheduleData>(
  {
    day: {
      type: String,
    },

    time: {
      type: String,
    },

    subject: {
      type: String,
    },

    staffs: {
      type: Types.ObjectId,
      ref: "staffs",
    },
  },
  { timestamps: true }
);

export default model<iScheduleData>("schedules", scheduleModel);
