const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const { processPayment, sendStripeApiKey, processPaymentTest, webHook, confirmPayment } = require("../controllers/paymentController");
router.route("/payment/process").post(isAuthenticatedUser, processPayment);

router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey);

router.route("/create-checkout-session").post(processPaymentTest);

router.route("/webhook").post(webHook);

router.route("/confirmPayment/:sessionId").get(confirmPayment);



module.exports = router;