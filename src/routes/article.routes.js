const validateMiddleware = require("../middleware/validate.middleware");
const admin = require("../middleware/admin.middleware");
const auth = require("../middleware/auth.middleware");
const { validate, validatePatch } = require("../model/article.model");
const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../middleware/async.middleware");
const validateObjectId = require("../middleware/validateObjectId.middleware");
const articleController = require("../controllers/article.controllers");
const roleBaseAuthMiddleware = require("../middleware/roleBaseAuth.middleware.");

// This is used for registering a new article.
router.post(
  "/",
  auth,
  roleBaseAuthMiddleware(["editor"]),
  validateMiddleware(validate),
  asyncMiddleware(articleController.createArticle)
);

router.get("/", asyncMiddleware(articleController.fetchAllArticles));

router.get(
  "/:id",
  validateObjectId,
  asyncMiddleware(articleController.getArticleById)
);

router.put(
  "/:id",
  validateObjectId,
  // auth is used to make authenticate a article.
  auth,
  roleBaseAuthMiddleware(["editor"]),
  validateMiddleware(validatePatch),
  asyncMiddleware(articleController.updateArticle)
);

router.delete(
  "/:id",
  validateObjectId,
  auth,
  admin,
  asyncMiddleware(articleController.deleteArticle)
);
module.exports = router;
