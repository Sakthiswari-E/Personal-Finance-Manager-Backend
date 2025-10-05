const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const cats = await Category.find({
    $or: [{ user: req.user.id }, { user: null }],
  }).sort({ name: 1 });
  res.json(cats);
});

router.post("/", auth, async (req, res) => {
  const { name, color } = req.body;
  const c = await Category.create({ user: req.user.id, name, color });
  res.json(c);
});

module.exports = router;
