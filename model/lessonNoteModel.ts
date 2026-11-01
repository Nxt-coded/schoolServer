import { Document, Schema, Types, model } from "mongoose";

interface ilessonNote {
  week: string;
  teacher: string;
  teacherID: string;
  teacherClass: string;
  endingAt: string;
  createDate: string;
  subject: string;
  classes: string;
  term: string;
  subTopic: string;
  topic: string;
  period: string;
  duration: string;
  instructionalMaterial: string;
  referenceMaterial: string;
  previousKnowledge: string;
  specificObjectives: string;
  content: string;
  evaluation: string;
  summary: string;
  presentation: string;
  assignment: string;
  profilePic: string;
  adminSignation: boolean;
  rate: number;
  responseDetail: string;
  deadline: string;
  messageSent: boolean;
  rateData: any[];
  staff: {};
  school: {};
  class: {};
}

interface ilessonNoteData extends ilessonNote, Document {}

const lessonNoteModel = new Schema<ilessonNoteData>(
  {
    rate: {
      type: Number,
    },
    rateData: {
      type: [],
    },
    topic: {
      type: String,
    },
    teacher: {
      type: String,
    },
    teacherID: {
      type: String,
    },
    teacherClass: {
      type: String,
    },
    week: {
      type: String,
    },

    endingAt: {
      type: String,
    },

    createDate: {
      type: String,
    },
    classes: {
      type: String,
    },
    subTopic: {
      type: String,
    },
    period: {
      type: String,
    },
    duration: {
      type: String,
    },
    instructionalMaterial: {
      type: String,
    },
    referenceMaterial: {
      type: String,
    },
    previousKnowledge: {
      type: String,
    },
    subject: {
      type: String,
    },
    specificObjectives: {
      type: String,
    },
    content: {
      type: String,
    },
    evaluation: {
      type: String,
    },
    summary: {
      type: String,
    },
    presentation: {
      type: String,
    },
    term: {
      type: String,
    },
    assignment: {
      type: String,
    },
    responseDetail: {
      type: String,
      default: "",
    },
    deadline: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    messageSent: {
      type: Boolean,
      default: false,
    },
    adminSignation: {
      type: Boolean,
      default: false,
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
    class: {
      type: Types.ObjectId,
      ref: "classes",
    },
  },
  { timestamps: true }
);

export default model<ilessonNoteData>("lessonNotes", lessonNoteModel);
