import { Document, Schema, Types, model } from "mongoose";

interface iremake {
  remark: string;
  weekPerformanceRatio: string;
  attendanceRatio: string;
  best: string;
  worst: string;
  classParticipation: string;
  sportParticipation: string;
  topicFocus: string;
  payment: number;
  announcement: {};
  generalPerformace: string;
  student: {};
  staff: {};
}

interface iremakeData extends iremake, Document {}

const remarkModel = new Schema<iremakeData>(
  {
    remark: {
      type: String,
    },
    weekPerformanceRatio: {
      type: String,
    },
    attendanceRatio: {
      type: String,
    },
    best: {
      type: String,
    },
    worst: {
      type: String,
    },
    classParticipation: {
      type: String,
    },
    sportParticipation: {
      type: String,
    },
    topicFocus: {
      type: String,
    },
    payment: {
      type: Number,
    },
    generalPerformace: {
      type: String,
    },
    announcement: {
      type: {},
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
  },
  { timestamps: true }
);

export default model<iremakeData>("remakes", remarkModel);
