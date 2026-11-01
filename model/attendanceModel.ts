import mongoose from "mongoose";

interface iClass {
  present?: boolean | null;
  absent?: boolean | null;
  studentFirstName?: string;
  studentLastName?: string;
  className?: string;

  classTeacher?: string;

  students?: {};
  classes?: {};
  staff?: {};

  date?: string;
  dateTime?: string;
}

interface iClassData extends iClass, mongoose.Document {
  _doc: any;
}

const attendanceModel = new mongoose.Schema(
  {
    date: {
      type: String,
      require: true,
    },
    studentFirstName: {
      type: String,
      require: true,
    },
    studentLastName: {
      type: String,
      require: true,
    },
    className: {
      type: String,
      require: true,
    },
    classTeacher: {
      type: String,
      require: true,
    },

    present: {
      type: Boolean,
      default: null,
    },

    absent: {
      type: Boolean,
      default: null,
    },

    dateTime: {
      type: String,
      require: true,
    },

    staffs: {
      type: mongoose.Types.ObjectId,
      ref: "staffs",
    },

    students: {
      type: mongoose.Types.ObjectId,
      ref: "students",
    },

    classes: {
      type: mongoose.Types.ObjectId,
      ref: "classes",
    },
  },
  { timestamps: true }
);

export default mongoose.model<iClassData>("attendances", attendanceModel);
