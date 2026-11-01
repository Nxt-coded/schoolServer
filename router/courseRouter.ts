import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  updateTopicStatus,
} from "../controller/courseController";

const router = Router();

router.post("/course/create", createCourse);
router.get("/course/", getAllCourses);
router.get("/course/:id", getCourse);
router.put("/course/:id", updateCourse);
router.delete("/course/:id", deleteCourse);
router.patch("/course/:courseId/topics/:topicId/toggle", updateTopicStatus);

export default router;
