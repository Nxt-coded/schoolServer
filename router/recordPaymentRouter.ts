import { Router } from "express";
import {
  deleteFeesRecord,
  getAllFeeRecords,
  getOneFeeRecord,
  recordFeesPayment,
  recordSecondFeePayment,
} from "../controller/recordPaymentController";

const router: Router = Router();

router.route("/record-payment/:schoolID/:studentID").post(recordFeesPayment);
router.route("/second-payment/:recordID").patch(recordSecondFeePayment);

router.route("/getall-fee-records/:schoolID").get(getAllFeeRecords);
router.route("/getone-fee-records/:studentID").get(getOneFeeRecord);

router
  .route("/delete-fee-record/:schoolID/:studentID/:recordID")
  .delete(deleteFeesRecord);

export default router;
