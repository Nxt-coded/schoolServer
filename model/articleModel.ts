import { Document, Model, Schema, Types, model } from "mongoose";

interface iArticle {
  content: string;
  title: string;
  student: string;
  desc: string;
  schoolID: string;
  studentID: string;
  avatar: string;
  coverImage: string;
  like: string[];
  view: string[];
}

interface iArticleData extends iArticle, Document {}

const articleModel = new Schema<iArticleData>(
  {
    content: {
      type: String,
    },

    like: {
      type: [],
    },

    view: {
      type: [],
    },

    schoolID: {
      type: String,
    },

    coverImage: {
      type: String,
    },

    avatar: {
      type: String,
    },

    studentID: {
      type: String,
    },

    title: {
      type: String,
    },

    student: {
      type: String,
    },

    desc: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<iArticleData>("articles", articleModel);
