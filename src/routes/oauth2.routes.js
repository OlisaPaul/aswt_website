const express = require("express");
const router = express.Router();
const ouath2Controller = require("../controllers/oauth2.controllers");

router.get("/", ouath2Controller.start);
router.get("/requestToken", ouath2Controller.requestToken);
router.get("/callback", ouath2Controller.callback);

router.get("/start", ouath2Controller.startStripe);
router.get("/stripe", ouath2Controller.stripeAuthorize);
router.get("/callback/stripe", ouath2Controller.stripeCallback);

module.exports = router;
