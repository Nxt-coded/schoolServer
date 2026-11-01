import { Router } from "express";


import {
  createBulkTeachSubjectTopicQuiz,
  createTeachSubjectTopicQuiz,
  deleteOneTeachSubjectTopicQuiz,
  getOneTeachSubjectTopicQuiz,
  updateTeachSubjectTopicQuiz,
} from "../controller/createTeachTopicQuiz";

const router = Router();

router.post(
  "/create-teach-subject-topic-quiz/:topicID",
  createTeachSubjectTopicQuiz
);

router.post(
  "/create-bulk-teach-subject-topic-quiz/:topicID",
  createBulkTeachSubjectTopicQuiz
);

// router.get("/teach-subject-topic/", getAllTeachSubjectTopicQuiz);
router.get(
  "/get-teach-subject-topic-quiz/:teachSubjectTopicID",
  getOneTeachSubjectTopicQuiz
);

router.patch(
  "/update-teach-subject-topic-quiz/:teachSubjectTopicQuizID",
  updateTeachSubjectTopicQuiz
);
router.delete(
  "/delete-teach-subject-topic-quiz/:subjectID/:teachSubjectTopicQuizID",
  deleteOneTeachSubjectTopicQuiz
);

export default router;
