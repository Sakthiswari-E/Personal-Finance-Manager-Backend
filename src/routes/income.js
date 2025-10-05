import express from "express";
import Income from "../models/Income.js";
import protect from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.post("/", async (req, res) => {
  const { amount, date, source, description } = req.body;
  const inc = new Income({
    user: req.user._id,
    amount,
    date,
    source,
    description,
  });
  await inc.save();
  res.status(201).json(inc);
});

router.get("/", async (req, res) => {
  const list = await Income.find({ user: req.user._id }).sort({ date: -1 });
  res.json(list);
});

export default router;
