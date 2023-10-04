const validateMiddleware = require("../middleware/validate.middleware");
const admin = require("../middleware/admin.middleware");
const auth = require("../middleware/auth.middleware");
const { validate, validatePatch } = require("../model/form.model");
const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../middleware/async.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");
const formController = require("../controllers/form.controllers");
const companyMiddleware = require("../middleware/company.middleware");

// This is used for registering a new form.
router.post(
  "/",
  validateMiddleware(validate),
  asyncMiddleware(formController.createForm)
);

router.get("/", asyncMiddleware(formController.fetchForms));

router.get(
  "/:id",
  validateObjectId,
  asyncMiddleware(formController.getFormById)
);

router.put(
  "/:id",
  validateObjectId,
  // auth is used to make authenticate a form.
  auth,
  validateMiddleware(validatePatch),
  asyncMiddleware(formController.updateForm)
);

router.delete(
  "/:id",
  validateObjectId,
  auth,
  admin,
  asyncMiddleware(formController.deleteForm)
);
module.exports = router;
