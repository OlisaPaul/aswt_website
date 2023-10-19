const express = require("express");
const webhookControllers = require("../controllers/webhook.controllers");
const router = express.Router();
const qboAsyncMiddleware = require("../middleware/qboAsync.middleware");

router.post("/", qboAsyncMiddleware(webhookControllers.webhook));
router.post(
  "/stripe-acoounts",
  express.raw({ type: "application/json" }),
  qboAsyncMiddleware(webhookControllers.stripeWebHook)
);

module.exports = router;
