import { Router } from "express";
import {
  createSchoolAnnouncement,
  createSchoolEvent,
  readSchoolAnnouncement,
  readSchoolEvent,
} from "../controller/announcementController";

const router: Router = Router();

router.route("/create-announcement/:schoolID").post(createSchoolAnnouncement);
router.route("/view-announcement/:schoolID").get(readSchoolAnnouncement);

router.route("/create-event/:schoolID").post(createSchoolEvent);
router.route("/view-event/:schoolID").get(readSchoolEvent);

export default router;
