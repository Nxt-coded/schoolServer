import { Document, Model, Schema, Types, model } from "mongoose";

interface iSubject {
  question: string;
  explanation: string;
  correctAnswer: number;
  options: Array<{}>;
  

  subjectTopic: {};
}

interface iSubjectData extends iSubject, Document {}

const subjectTopicQuizesModel = new Schema<iSubjectData>(
  {
    question: {
      type: String,
    },
    explanation: {
      type: String,
    },
    correctAnswer: {
      type: Number,
    },
    options: {
      type: [],
    },

    subjectTopic: {
      type: Types.ObjectId,
      ref: "subjectTopics",
    },

  },
  { timestamps: true }
);

export default model<iSubjectData>("subjectTopicQuizes", subjectTopicQuizesModel);
