import { Document, Model, Schema, Types, model } from "mongoose";

interface iSubject {
title: string;
description: string;
totalLessons: number;
topics: Array<{}>;
expectedOutcome: string;
instructor: string;
classCreatedFor: string;
credit: string;
relatedSubjectTags: string;
subjectImage: string;

}

interface iSubjectData extends iSubject, Document {}

const subjectTeachesModel = new Schema<iSubjectData>(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    totalLessons: {
      type: Number,
    },
    expectedOutcome: {
      type: String,
    },
    classCreatedFor: {
      type: String,
    },
    credit: {
      type: String,
    },
    relatedSubjectTags: {
      type: String,
    },
    subjectImage: {
      type: String,
    },
    topics: [
      {
        type: Types.ObjectId,
        ref: "subjectTopics",
      },
    ],
  },
  { timestamps: true }
);

export default model<iSubjectData>("subjectTeachings", subjectTeachesModel);
