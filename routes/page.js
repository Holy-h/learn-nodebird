const express = require("express");

const router = express.Router();

router.get("/profile", (req, res) => {
  res.render("profile", { title: "Profile - NodeBird", user: null });
});

router.get("/join", (req, res) => {
  res.render("join", {
    title: "Join - NodeBird",
    user: null,
    joinError: req.flash("joinError")
  });
});

router.get("/", (req, res, next) => {
  res.render("main", {
    title: "NodeBird",
    twits: [],
    user: null,
    loginError: req.flash("loginError")
  });
});

module.exports = router;
