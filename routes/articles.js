const express = require("express");
const router = express.Router();
const articlesController = require("../controllers/articleController");
const commentController = require("../controllers/commentController");

// articles routes
router.get("/", articlesController.get_articles);
router.post("/", articlesController.post_article);
router.get("/:id", articlesController.get_single_article);
router.put("/:id", articlesController.put_article);
router.delete(
  "/:id",
  articlesController.delete_article,
  commentController.delete_all_comments_of_article
);

// comments in articles routes
router.get("/:id/comments", commentController.get_comments_article);
router.post("/:id/comments", commentController.post_comment_article);
router.delete(
  "/:id/comments/:commentId",
  commentController.delete_comment_article
);

module.exports = router;
