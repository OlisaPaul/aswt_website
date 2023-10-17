const { Article } = require("../model/article.model");
const articleService = require("../services/article.services");
const userService = require("../services/user.services");
const serviceService = require("../services/service.services");
const entryService = require("../services/entry.services");
const { errorMessage, successMessage } = require("../common/messages.common");
const { MESSAGES, errorAlreadyExists } = require("../common/constants.common");

class ArticleController {
  //Create a new article
  async createArticle(req, res) {
    const { title, articleDetails } = req.body;
    const editorId = req.user._id;

    const [editor] = await userService.getUserByRoleAndId(editorId, "editor");

    if (!editor) return res.status(404).send(errorMessage("editor"));

    const article = await articleService.createArticle(
      editorId,
      title,
      articleDetails
    );

    res.send(successMessage(MESSAGES.CREATED, article));
  }

  //get article from the database, using their email
  async getArticleById(req, res) {
    const article = await articleService.getArticleById(req.params.id);
    if (!article) return res.status(404).send(errorMessage("article"));

    res.send(successMessage(MESSAGES.FETCHED, article));
  }

  async getArticleByEntryIdAndStaffId(req, res) {
    const { entryId, staffId } = req.body;

    const article = await articleService.getArticleByEntryIdAndStaffId(
      entryId,
      staffId
    );
    if (!article) return res.status(404).send(errorMessage("article"));

    res.send(successMessage(MESSAGES.FETCHED, article));
  }

  //get all entries in the article collection/table
  async fetchAllArticles(req, res) {
    const entries = await articleService.getAllArticles();

    res.send(successMessage(MESSAGES.FETCHED, entries));
  }

  //Update/edit article data
  async updateArticle(req, res) {
    const article = await articleService.getArticleById(req.params.id);
    if (!article) return res.status(404).send(errorMessage("article"));

    let updatedArticle = req.body;
    updatedArticle = await articleService.updateArticleById(
      req.params.id,
      updatedArticle
    );

    res.send(successMessage(MESSAGES.UPDATED, updatedArticle));
  }

  //Delete article account entirely from the database
  async deleteArticle(req, res) {
    const article = await articleService.getArticleById(req.params.id);
    if (!article) return res.status(404).send(errorMessage("article"));

    await articleService.deleteArticle(req.params.id);

    res.send(successMessage(MESSAGES.DELETED, article));
  }
}

module.exports = new ArticleController();
