import { Document, Model, Schema, Types, model } from "mongoose";

interface iStaff {
  subjectTitle: string;
  subjectTeacher: string;
  studentName: string;
  className: string;
  studentGrade: string;
  assignmentID: string;
  assignmentResult: string;
  remark: string;

  studentScore: number;
  performanceRating: Number;

  paymentID: string;

  student: {};
  class: {};
  assignment: {};
  subject: {};
}

interface iStaffData extends iStaff, Document {}

const assignmentResolveModel = new Schema<iStaffData>(
  {
    assignmentResult: {
      type: String,
    },

    assignmentID: {
      type: String,
    },

    remark: {
      type: String,
    },

    className: {
      type: String,
    },

    subjectTitle: {
      type: String,
    },

    studentName: {
      type: String,
    },

    subjectTeacher: {
      type: String,
    },

    studentGrade: {
      type: String,
    },

    studentScore: {
      type: Number,
    },

    performanceRating: {
      type: Number,
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },
    assignment: {
      type: Types.ObjectId,
      ref: "assignments",
    },
    subject: {
      type: Types.ObjectId,
      ref: "subjects",
    },
    class: {
      type: Types.ObjectId,
      ref: "classrooms",
    },
  },
  { timestamps: true }
);

export default model<iStaffData>("reolves", assignmentResolveModel);
