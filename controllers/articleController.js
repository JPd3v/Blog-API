const Article = require("../models/article");
const { body, validationResult } = require("express-validator");

const { verifyUser } = require("../utils/authenticate");

exports.get_articles = (req, res, next) => {
  let queryparams = {};

  req.query.published ? (queryparams.published = req.query.published) : null;

  req.query.author ? (queryparams.author = req.query.author) : null;

  Article.find(queryparams)
    .populate("author", "-password -username")
    .sort({ published_date: -1 })
    .exec(function (err, articles_list) {
      if (err) {
        return next(err);
      }

      return res.json(articles_list);
    });
};

exports.get_single_article = (req, res) => {
  const articleId = req.params.id;
  Article.findById(articleId)
    .populate("author", " -password -username")
    .exec((err, article_info) => {
      if (err) {
        return res.status(403).json(err);
      }
      if (!article_info) {
        return res
          .status(404)
          .json({ error: "couldn't find article in database" });
      }
      return res.status(200).json(article_info);
    });
};

exports.post_article = [
  verifyUser,
  body("title", "title cannot be empty ").trim().isLength({ min: 1 }).escape(),
  body("content", "content cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("published", "published should be a boolean value").isBoolean().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(403).json({ response: errors });
    }
    try {
      let article = new Article({
        author: req.user._id,
        title: req.body.title,
        content: req.body.content,
        published: req.body.published,
      });

      req.body.published === "true"
        ? (article.published_date = new Date())
        : null;

      const saveArticle = await article.save();

      return res.status(200).json({
        succes: true,
        response: "Article added succefully",
        article: article,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
];

exports.put_article = [
  verifyUser,
  body("title", "title cannot be empty ").trim().isLength({ min: 1 }).escape(),
  body("content", "content cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("published", "published should be a boolean value").isBoolean().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(403).json({ response: errors });
    }
    const articleId = req.params.id;

    try {
      const articleRequest = await Article.findById(articleId);
      if (articleRequest.author.toString() === req.user._id.toString()) {
        articleRequest.title = req.body.title;
        articleRequest.content = req.body.content;
        articleRequest.published = req.body.published;

        req.body.published === "true" && !articleRequest.published_date
          ? (articleRequest.published_date = new Date())
          : null;

        await articleRequest.save();

        return res.status(200).json({
          succes: true,
          response: "article updated succefully",
          articleRequest,
        });
      } else {
        return res.status(401).json({
          response: "Only user creator of the article are allowed to edit it",
        });
      }
    } catch (error) {
      return res.status(500).json(err);
    }
  },
];

exports.delete_article = [
  verifyUser,
  async (req, res, next) => {
    const articleId = req.params.id;

    try {
      const articleRequest = await Article.findById(articleId);
      if (articleRequest.author.toString() === req.user._id.toString()) {
        const deleteArticle = await Article.findByIdAndDelete(articleId, {});

        return next();
      } else {
        return res
          .status(403)
          .json("Only user creator of the article are allowed to delete it");
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  },
];
