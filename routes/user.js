const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/sign-up", userController.post_user_sign_up);
router.post("/log-in", userController.post_user_log_in);
router.get("/refresh-token", userController.get_new_token);
router.get("/me", userController.get_user_info);
router.get("/log-out", userController.get_log_out);

module.exports = router;
