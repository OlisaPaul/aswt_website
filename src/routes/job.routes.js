const validateMiddleware = require("../middleware/validate.middleware");
const admin = require("../middleware/admin.middleware");
const auth = require("../middleware/auth.middleware");
const {
  validate,
  validatePatch,
  validateAddFreelancer,
} = require("../model/job.model");
const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../middleware/async.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");
const jobController = require("../controllers/job.controllers");
const companyMiddleware = require("../middleware/company.middleware");

// This is used for registering a new job.
router.post(
  "/",
  auth,
  companyMiddleware,
  validateMiddleware(validate),
  asyncMiddleware(jobController.createJob)
);

router.get("/", asyncMiddleware(jobController.fetchAllJobs));

router.get("/companies", asyncMiddleware(jobController.getJobsByCompanyId));

router.get(
  "/jobName/:jobName",
  asyncMiddleware(jobController.getUserByUsername)
);

router.get("/:id", validateObjectId, asyncMiddleware(jobController.getJobById));

router.put(
  "/:id",
  validateObjectId,
  // auth is used to make authenticate a job.
  auth,
  validateMiddleware(validatePatch),
  asyncMiddleware(jobController.updateJob)
);

router.put(
  "/applicants/:id",
  validateObjectId,
  // auth is used to make authenticate a job.
  auth,
  companyMiddleware,
  validateMiddleware(validateAddFreelancer),
  asyncMiddleware(jobController.addFreelancer)
);

router.delete(
  "/:id",
  validateObjectId,
  auth,
  admin,
  asyncMiddleware(jobController.deleteJob)
);
module.exports = router;
