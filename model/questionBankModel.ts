import { Document, Schema, Types, model } from "mongoose";

interface IQuestionBankItem extends Document {
  schoolID: Types.ObjectId;
  subjectID: Types.ObjectId;
  assessmentType: "examination" | "midTest";
  questionKind: "objective" | "theory";
  question: Record<string, unknown>;
  sourceAssessmentID: Types.ObjectId;
  sourceQuestionIndex: number;
  createdBy: Types.ObjectId;
}

const questionBankSchema = new Schema<IQuestionBankItem>(
  {
    schoolID: {
      type: Schema.Types.ObjectId,
      ref: "schools",
      required: true,
      index: true,
    },
    subjectID: {
      type: Schema.Types.ObjectId,
      ref: "subjects",
      required: true,
      index: true,
    },
    assessmentType: {
      type: String,
      enum: ["examination", "midTest"],
      required: true,
      index: true,
    },
    questionKind: {
      type: String,
      enum: ["objective", "theory"],
      default: "objective",
      required: true,
    },
    question: {
      type: Schema.Types.Mixed,
      required: true,
    },
    sourceAssessmentID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    sourceQuestionIndex: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

questionBankSchema.index(
  { sourceAssessmentID: 1, sourceQuestionIndex: 1 },
  { unique: true }
);

export default model<IQuestionBankItem>("questionBanks", questionBankSchema);
