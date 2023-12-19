"use strict";

// export {}

/* ------------------------------------------------------- */
// routes/user:

const router = require("express").Router();

const user = require("../controllers/user");

const { isAdmin, isLogin } = require("../middlewares/permissions");
// URL: /users

// router.use(isAdmin)

router.route("/")
.get(isAdmin, user.list)
.post(isAdmin, user.create);

router
  .route("/:id")
  .get(isLogin, user.read)
  .put(isLogin, user.update)
  .patch(isLogin, user.update)
  .delete(isAdmin, user.delete);

/* ------------------------------------------------------- */
module.exports = router;
