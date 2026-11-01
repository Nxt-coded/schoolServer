import { Schema, model } from "mongoose";

interface Topic {
  id: string;
  title: string;
  duration: string;
  video: string;
  completed: boolean;
  description: string;
  keyPoints: string[];
}

interface ICourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  topics: Topic[];
}

const topicSchema = new Schema<Topic>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  video: { type: String, required: true },
  completed: { type: Boolean, default: false },
  description: { type: String, required: true },
  keyPoints: [{ type: String }],
});

const courseSchema = new Schema<ICourse>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    totalLessons: { type: Number, required: true },
    completedLessons: { type: Number, default: 0 },
    topics: [topicSchema],
  },
  { timestamps: true }
);

export default model<ICourse>("Course", courseSchema);
