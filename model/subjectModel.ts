import { Document, Model, Schema, Types, model } from "mongoose";

interface iSubject {
  schoolName: string;
  teacherID: string;
  classID: string;
  subjectTeacherName: string;
  subjectTitle: string;
  designated: string;
  subjectClassIDs: string;
  subjectClassID: string;

  quiz: Array<{}>;
  midTest: Array<{}>;
  examination: Array<{}>;
  assignment: Array<{}>;
  assignmentResolve: Array<{}>;

  recordData: Array<{}>;

  subjectPerformance: number;
  school: {};
  class: {};
  classDetails: {};
  performance: Array<{}>;
  reportCard: Array<{}>;
  midReportCard: Array<{}>;
}

interface iSubjectData extends iSubject, Document {}

const subjectModel = new Schema<iSubjectData>(
  {
    recordData: [
      {
        type: Types.ObjectId,
        ref: "myReportCards",
      },
    ],
    assignmentResolve: [
      {
        type: Types.ObjectId,
        ref: "resolvs",
      },
    ],
    quiz: [
      {
        type: Types.ObjectId,
        ref: "quizes",
      },
    ],
    midTest: [
      {
        type: Types.ObjectId,
        ref: "midTests",
      },
    ],
    examination: [
      {
        type: Types.ObjectId,
        ref: "examinations",
      },
    ],
    assignment: [
      {
        type: Types.ObjectId,
        ref: "assignments",
      },
    ],

    performance: [
      {
        type: Types.ObjectId,
        ref: "performances",
      },
    ],

    midReportCard: [
      {
        type: Types.ObjectId,
        ref: "myMidReportCards",
      },
    ],
    subjectClassIDs: {
      type: String,
    },
    subjectClassID: {
      type: String,
    },
    teacherID: {
      type: String,
    },
    classID: {
      type: String,
    },
    schoolName: {
      type: String,
    },
    subjectTeacherName: {
      type: String,
    },
    subjectTitle: {
      type: String,
    },
    designated: {
      type: String,
    },
    classDetails: {
      type: {},
    },

    subjectPerformance: {
      type: Number,
      default: 0,
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

export default model<iSubjectData>("subjects", subjectModel);
