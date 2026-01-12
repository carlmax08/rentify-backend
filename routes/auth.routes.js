const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getRoles,
} = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.get("/roles/:userId", getRoles);

module.exports = router;

