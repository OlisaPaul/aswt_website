const express = require("express");
const stripeControllers = require("../controllers/stripe.controllers");
const router = express.Router();
const qboAsyncMiddleware = require("../middleware/qboAsync.middleware");

router.post(
  "/appointment-checkout-session",
  qboAsyncMiddleware(stripeControllers.stripeCheckoutSession)
);

module.exports = router;
