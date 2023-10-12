const { Article } = require("../model/article.model");

class ArticleService {
  //Create new article
  async createArticle(editorId, title, articleDetails) {
    const article = new Article({ editorId, title, articleDetails });

    return await article.save();
  }

  async getArticleById(articleId) {
    return await Article.findById(articleId);
  }

  async validateArticleIds(articleIds) {
    const articles = await Article.find({
      _id: { $in: articleIds },
    });

    const foundIds = articles.map((d) => d._id.toString());

    const missingIds = articleIds.filter((id) => !foundIds.includes(id));

    return missingIds;
  }

  async getArticleByEntryIdAndStaffId(entryId, staffId) {
    return await Article.findOne({ entryId, staffId });
  }

  async getAllArticles() {
    return await Article.find().sort({ _id: -1 });
  }

  async updateArticleById(id, article) {
    return await Article.findByIdAndUpdate(
      id,
      {
        $set: article,
      },
      { new: true }
    );
  }

  async deleteArticle(id) {
    return await Article.findByIdAndRemove(id);
  }
}

module.exports = new ArticleService();
