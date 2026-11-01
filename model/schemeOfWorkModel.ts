import { Document, Schema, model } from "mongoose";

interface LearningItem {
  id: string;
  value: string;
}

interface iScheme {
  weeks: string;
  subject: string;
  classType: string;
  status: string;
  topics: LearningItem[];
  term: string;
  marked: boolean,
  uploaded: boolean,
  uniqueId: string,
  learningObject: LearningItem[];
  learningActivities: LearningItem[];
  embeddedCoreSkills: LearningItem[];
  learningResource: LearningItem[];
  meta?: {
    uploaded: boolean;
    uniqueId: string;
  };
}

interface iSchemeData extends iScheme, Document {}

const LearningItemSchema = new Schema<LearningItem>({
  id: { type: String, required: true },
  value: { type: String, required: true },
});

const SchemeModel = new Schema<iSchemeData>(
  {
    classType: { type: String, required: true },
    weeks: { type: String, required: true },
    status: { type: String },
    topics: { type: [LearningItemSchema], required: true },
    subject: { type: String, required: true },
    term: { type: String },
    learningObject: { type: [LearningItemSchema], default: [] },
    learningActivities: { type: [LearningItemSchema], default: [] },
    learningResource: { type: [LearningItemSchema], default: [] },
    embeddedCoreSkills: { type: [LearningItemSchema], default: [] },
    meta: {
      type: {
        uploaded: { type: Boolean, default: false },
        uniqueId: { type: String, unique: true },
      },
    },
  },
  { timestamps: true }
);

export default model<iSchemeData>("Scheme", SchemeModel);
