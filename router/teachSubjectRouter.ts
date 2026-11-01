import { Router } from "express";
import { createTeachSubject, deleteOneTeachSubject, getAllTeachSubject, getOneTeachSubject, updateTeachSubject } from "../controller/createSubjectController";

const router = Router();

router.post("/create-teach-subject", createTeachSubject);
router.get("/teach-subject/", getAllTeachSubject);
router.get("/get-teach-subject/:teachSubjectID", getOneTeachSubject);

router.patch("/update-teach-subject/:teachSubjectID", updateTeachSubject);
router.delete(
  "/delete-teach-subject/:teachSubjectID",
  deleteOneTeachSubject
);

export default router;
