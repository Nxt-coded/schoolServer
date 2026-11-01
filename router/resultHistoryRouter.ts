import { Router } from "express";
import {
  createResultHistory,
  deleteResultHistory,
  viewResultHistory,
} from "../controller/historicalResultController";

const router: Router = Router();

router
  .route("/create-result-history/:schoolID/:studentID")
  .post(createResultHistory);

router.route("/view-student-result-history/:studentID").get(viewResultHistory);

router
  .route("/delete-student-result-history/:studentID/:resultID")
  .delete(deleteResultHistory);

export default router;
