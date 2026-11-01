"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controller/paymentController");
const router = (0, express_1.Router)();
router.route("/make-sms-payment/:schoolID").post(paymentController_1.makeSMSPayment);
router.route("/verify-sms-payment/:schoolID/:ref").get(paymentController_1.verifySMSPayment);
router.route("/payment/:schoolID").post(paymentController_1.createPayment);
router.route("/get-banks/:schoolID").get(paymentController_1.getBankAccount);
router.route("/payment/:schoolID").get(paymentController_1.viewSchoolPayment);
router.route("/store-payment/:schoolID").post(paymentController_1.paymentFromStore);
router.route("/create-payment-account/:schoolID").post(paymentController_1.createPaymentAccount);
// selected
router.route("/make-payment/:schoolID").post(paymentController_1.makePayment);
router.route("/verify-payment/:ref").get(paymentController_1.verifyTransaction);
router.route("/update-payment-info").post(paymentController_1.makeSplitPayment);
router.route("/make-store-payment").post(paymentController_1.storePayment);
router.route("/update-schoolfee-payment-info").post(paymentController_1.makeSplitSchoolfeePayment);
router.route("/make-schoolfee-payment").post(paymentController_1.schoolFeePayment);
router.route("/make-other-school-payment").post(paymentController_1.makeOtherSchoolPayment);
router
    .route("/verify-other-payment/:studentID/:ref")
    .post(paymentController_1.verifySchoolTransaction);
router
    .route("/verify-other-cash-payment/:studentID")
    .post(paymentController_1.verifyOtherSchoolTransaction);
exports.default = router;
