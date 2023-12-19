"use strict";

// export {}

/* ------------------------------------------------------- */
// routes/user:

const router = require("express").Router();

const user = require("../controllers/user");

const { isAdmin } = require("../middlewares/permissions");
// URL: /users

// router.use(isAdmin)

router.route("/")
.get(user.list)
.post(user.create);

router
  .route("/:id")
  .get(user.read)
  .put(user.update)
  .patch(user.update)
  .delete(user.delete);

/* ------------------------------------------------------- */
module.exports = router;
