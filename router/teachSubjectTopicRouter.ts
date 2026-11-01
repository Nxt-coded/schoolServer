import { Router } from "express";

import {
  createTeachSubjectTopic,
  deleteOneTeachSubjectTopic,
  getAllTeachSubjectTopic,
  getOneTeachSubjectTopic,
  getOneTeachSubjectTopicNow,
  updateTeachSubjectTopic,
} from "../controller/createTeachTopicsControlleer";

const router = Router();

router.post("/create-teach-subject-topic/:subjectID", createTeachSubjectTopic);

router.get("/teach-subject-topic/", getAllTeachSubjectTopic);
router.get(
  "/get-teach-subject-topic/:teachSubjectTopicID",
  getOneTeachSubjectTopic
);
router.get(
  "/get-one-teach-subject-topic/:teachSubjectTopicID",
  getOneTeachSubjectTopicNow
);

router.patch(
  "/update-teach-subject-topic/:teachSubjectTopicID",
  updateTeachSubjectTopic
);
router.delete(
  "/delete-teach-subject-topic/:subjectID/:teachSubjectTopicID",
  deleteOneTeachSubjectTopic
);

export default router;
