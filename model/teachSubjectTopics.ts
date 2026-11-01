import { Document, Model, Schema, Types, model } from "mongoose";

interface iSubject {
title: string;
duration: string;
video: string;
description: string;

topicImage: string;

keyPoints: Array<{}>;
quizQuestions: Array<{}>;
subjectTopic: {};
}

interface iSubjectData extends iSubject, Document {}

const subjectTopicsModel = new Schema<iSubjectData>(
  {
    title: {
      type: String,
    },
    duration: {
      type: String,
    },
    video: {
      type: String,
    },

    description: {
      type: String,
    },

    topicImage: {
      type: String,
    },

    keyPoints: {
      type: [],
    },

    subjectTopic: {
      type: Types.ObjectId,
      ref: "subjectTeachings",
    },

    quizQuestions: [
      {
        type: Types.ObjectId,
        ref: "subjectTopicQuizes",
      },
    ],
  },
  { timestamps: true }
);

export default model<iSubjectData>("subjectTopics", subjectTopicsModel);
