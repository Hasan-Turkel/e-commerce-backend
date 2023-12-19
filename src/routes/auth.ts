"use strict";

/* ------------------------------------------------------- */
// routes/auth:

const router = require("express").Router();

const auth = require("../controllers/auth");

// URL: /auth

router.post("/login", auth.login); // SimpleToken
router.get("/logout", auth.logout); // SimpleToken Logout
router.post("/logout", auth.logout); // SimpleToken Logout
router.post("/register", auth.register); // SimpleToken

/* ------------------------------------------------------- */
module.exports = router;
