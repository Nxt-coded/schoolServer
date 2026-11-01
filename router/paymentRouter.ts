import { Router } from "express";
import {
  createPayment,
  createPaymentAccount,
  getBankAccount,
  makeOtherSchoolPayment,
  makePayment,
  makeSplitPayment,
  makeSplitSchoolfeePayment,
  paymentFromStore,
  schoolFeePayment,
  storePayment,
  verifyOtherSchoolTransaction,
  verifySchoolTransaction,
  verifyTransaction,
  viewSchoolPayment,
  makeSMSPayment,
  verifySMSPayment,
} from "../controller/paymentController";

const router: Router = Router();

router.route("/make-sms-payment/:schoolID").post(makeSMSPayment);
router.route("/verify-sms-payment/:schoolID/:ref").get(verifySMSPayment);

router.route("/payment/:schoolID").post(createPayment);

router.route("/get-banks/:schoolID").get(getBankAccount);

router.route("/payment/:schoolID").get(viewSchoolPayment);
router.route("/store-payment/:schoolID").post(paymentFromStore);
router.route("/create-payment-account/:schoolID").post(createPaymentAccount);

// selected
router.route("/make-payment/:schoolID").post(makePayment);
router.route("/verify-payment/:ref").get(verifyTransaction);

router.route("/update-payment-info").post(makeSplitPayment);
router.route("/make-store-payment").post(storePayment);

router.route("/update-schoolfee-payment-info").post(makeSplitSchoolfeePayment);
router.route("/make-schoolfee-payment").post(schoolFeePayment);
router.route("/make-other-school-payment").post(makeOtherSchoolPayment);

router
  .route("/verify-other-payment/:studentID/:ref")
  .post(verifySchoolTransaction);

router
  .route("/verify-other-cash-payment/:studentID")
  .post(verifyOtherSchoolTransaction);

export default router;
