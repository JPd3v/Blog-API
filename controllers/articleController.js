const Article = require("../models/article");
const { body, validationResult } = require("express-validator");
const article = require("../models/article");

const { verifyUser } = require("../utils/authenticate");

exports.get_articles = (req, res, next) => {
  const published = req.query.published === "true" ? { published: true } : {};
  Article.find(published)
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
  article
    .findById(articleId)
    .populate("author", " -password -username")
    .exec((err, article_info) => {
      if (err) {
        return res.status(403).json(err);
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
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(403).json({ response: errors });
    }

    const article = new Article({
      author: req.user._id,
      title: req.body.title,
      content: req.body.content,
      published: req.body.published,
      published_date: new Date(),
    }).save((err) => {
      if (err) {
        return res.status(500).json({ response: err });
      }
      return res.status(200).json({
        succes: true,
        response: "article added succefully",
        article: article,
      });
    });
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
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(403).json({ response: errors });
    }
    const articleId = req.params.id;

    Article.findByIdAndUpdate(
      articleId,
      {
        title: req.body.title,
        content: req.body.content,
        published: req.body.published,
      },
      (err) => {
        if (err) {
          return res.status(403).json({ response: err });
        }
        res
          .status(200)
          .json({ succes: true, response: "article updated succefully" });
      }
    );
  },
];

exports.delete_article = [
  verifyUser,
  (req, res) => {
    const articleId = req.params.id;

    Article.findByIdAndDelete(articleId, {}, (err) => {
      if (err) {
        return res
          .status(404)
          .json({ response: `cannot found article ${articleId}` });
      }
      return res
        .status(200)
        .json({ succes: true, response: "article deleted successfully" });
    });
  },
];
