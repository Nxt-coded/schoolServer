import { Types } from "mongoose";
import { Document, Schema, model } from "mongoose";

interface iSchool {
  started: boolean;

  email: string;
  verify: boolean;
  enrollmentID: string;
  status: string;
  presentTerm: string;

  NumberOfDays: string;
  SchoolTeamResumption: string;
  SchoolTeamCloses: string;

  presentSession: string;
  presentSessionID: string;
  presentTermID: string;

  name: string;
  name2: string;

  peroid: string;
  startClass: string;
  endClass: string;
  startBreak: string;
  endBreak: string;

  timeTableStructure: Array<string>;

  schoolName: string;
  address: string;
  freeMode: boolean;

  avatar: string;
  avatarID: string;

  signature: string;
  signatureID: string;

  stamp: string;
  stampID: string;

  adminCode: string;
  plan: string;
  phone: string;
  organizationType: string;
  categoryType: string;

  bankDetails: {};

  session: Array<{}>;
  staff: Array<{}>;

  lessonNotes: Array<{}>;
  schoolTags: Array<{}>;

  receipt: [];
  paymentOptions: [];

  subjects: Array<{}>;
  classRooms: Array<{}>;

  payments: Array<{}>;
  announcements: Array<{}>;
  historys: Array<{}>;
  events: Array<{}>;
  students: Array<{}>;
  store: Array<{}>;
  articles: Array<{}>;
  pushClass: Array<{}>;
  gallaries: Array<{}>;
  complain: Array<{}>;
  reportCard: Array<{}>;
  midReportCard: Array<{}>;
  recordPayments: Array<{}>;
  classHistory: Array<{}>;
  purchaseHistory: Array<{}>;
  schoolFeesHistory: Array<{}>;
  outGoneStudents: Array<{}>;
  sendSMS: boolean;
  allowClassTeacherGrading: boolean;
}

interface iSchoolData extends iSchool, Document {}

const schoolModel = new Schema<iSchoolData>(
  {
    outGoneStudents: [
      {
        type: Types.ObjectId,
        ref: "outGoneStudents",
      },
    ],

    purchaseHistory: [
      {
        type: Types.ObjectId,
        ref: "purchasedHistories",
      },
    ],
    started: {
      type: Boolean,
      default: false,
    },

    presentSessionID: {
      type: String,
    },

    SchoolTeamResumption: {
      type: String,
    },

    SchoolTeamCloses: {
      type: String,
    },

    NumberOfDays: {
      type: String,
    },

    categoryType: {
      type: String,
    },

    startClass: {
      type: String,
    },

    endClass: {
      type: String,
    },

    startBreak: {
      type: String,
    },

    endBreak: {
      type: String,
    },

    peroid: {
      type: String,
    },

    timeTableStructure: {
      type: [],
    },

    paymentOptions: {
      type: [],
    },

    organizationType: {
      type: String,
    },

    adminCode: {
      type: String,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
    },

    freeMode: {
      type: Boolean,
      default: true,
    },
    presentTerm: {
      type: String,
    },
    presentSession: {
      type: String,
    },

    name: {
      type: String,
    },

    name2: {
      type: String,
    },

    avatarID: {
      type: String,
    },

    signature: {
      type: String,
    },

    signatureID: {
      type: String,
    },

    stamp: {
      type: String,
    },

    stampID: {
      type: String,
    },

    address: {
      type: String,
    },

    plan: {
      type: String,
      default: "in active",
    },

    schoolName: {
      type: String,
    },
    bankDetails: {
      type: {},
    },
    status: {
      type: String,
    },
    presentTermID: {
      type: String,
    },
    enrollmentID: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    sendSMS: {
      type: Boolean,
      default: false,
    },
    allowClassTeacherGrading: {
      type: Boolean,
      default: true,
    },

    schoolTags: [
      {
        type: {},
      },
    ],

    session: [
      {
        type: Types.ObjectId,
        ref: "academicSessions",
      },
    ],

    schoolFeesHistory: [
      {
        type: Types.ObjectId,
        ref: "schoolFeesHistories",
      },
    ],
    historys: [
      {
        type: Types.ObjectId,
        ref: "historys",
      },
    ],
    events: [
      {
        type: Types.ObjectId,
        ref: "events",
      },
    ],

    classHistory: [
      {
        type: Types.ObjectId,
        ref: "classHistroy",
      },
    ],

    announcements: [
      {
        type: Types.ObjectId,
        ref: "announcements",
      },
    ],

    reportCard: [
      {
        type: Types.ObjectId,
        ref: "myReportCards",
      },
    ],

    midReportCard: [
      {
        type: Types.ObjectId,
        ref: "myMidReportCards",
      },
    ],

    subjects: [
      {
        type: Types.ObjectId,
        ref: "subjects",
      },
    ],

    complain: [
      {
        type: Types.ObjectId,
        ref: "complains",
      },
    ],

    pushClass: [
      {
        type: Types.ObjectId,
        ref: "classHistories",
      },
    ],

    classRooms: [
      {
        type: Types.ObjectId,
        ref: "classes",
      },
    ],

    staff: [
      {
        type: Types.ObjectId,
        ref: "staffs",
      },
    ],

    payments: [
      {
        type: Types.ObjectId,
        ref: "payments",
      },
    ],
    recordPayments: [
      {
        type: Types.ObjectId,
        ref: "recordPayments",
      },
    ],

    students: [
      {
        type: Types.ObjectId,
        ref: "students",
      },
    ],

    store: [
      {
        type: Types.ObjectId,
        ref: "stores",
      },
    ],

    receipt: {
      type: [],
    },

    lessonNotes: [
      {
        type: Types.ObjectId,
        ref: "lessonNotes",
      },
    ],

    articles: [
      {
        type: Types.ObjectId,
        ref: "articles",
      },
    ],

    gallaries: [
      {
        type: Types.ObjectId,
        ref: "gallaries",
      },
    ],
  },
  { timestamps: true }
);

export default model<iSchoolData>("schools", schoolModel);
