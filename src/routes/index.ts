"use strict";

/* ------------------------------------------------------- */
// routes/:

// export {}

const router = require("express").Router();

// URL: /

auth: router.use("/users/auth", require("./auth"));

// user:
router.use("/users", require("./user"));
// token:
router.use("/tokens", require("./token"));
// comment:

// document:
// router.use('/documents', require('./document'))

/* ------------------------------------------------------- */
module.exports = router;
