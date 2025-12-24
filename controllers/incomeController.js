// import Income from "../models/Income.js";

// /**
//  * @desc Add new income
//  */
// export const addIncome = async (req, res) => {
//   try {
//     const { title, amount, source, date } = req.body;

//     if (!title || !amount) {
//       return res.status(400).json({ message: "Title and amount are required" });
//     }

//     const income = await Income.create({
//       user: req.user.id,
//       title,
//       amount,
//       source,
//       date,
//     });

//     res.status(201).json(income);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * @desc Get all incomes of logged-in user
//  */
// export const getIncomes = async (req, res) => {
//   try {
//     const incomes = await Income.find({ user: req.user.id }).sort({
//       date: -1,
//     });
//     res.json(incomes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * @desc Monthly income summary (for charts)
//  */
// export const getMonthlyIncome = async (req, res) => {
//   try {
//     const data = await Income.aggregate([
//       { $match: { user: req.user._id } },
//       {
//         $group: {
//           _id: { $month: "$date" },
//           total: { $sum: "$amount" },
//         },
//       },
//       { $sort: { "_id": 1 } },
//     ]);

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * @desc Delete income
//  */
// export const deleteIncome = async (req, res) => {
//   try {
//     const income = await Income.findById(req.params.id);

//     if (!income) {
//       return res.status(404).json({ message: "Income not found" });
//     }

//     if (income.user.toString() !== req.user.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     await income.deleteOne();
//     res.json({ message: "Income deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };










import Income from "../models/Income.js";

/* ✅ GET ALL INCOME */
export const getIncome = async (req, res) => {
  try {
    const income = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✅ ADD INCOME */
export const addIncome = async (req, res) => {
  try {
    const income = await Income.create({
      user: req.user.id,
      source: req.body.source,
      amount: req.body.amount,
      date: req.body.date,
      note: req.body.note,
    });
    res.status(201).json(income);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ✅ UPDATE INCOME */
export const updateIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(income);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ✅ DELETE INCOME */
export const deleteIncome = async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: "Income deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ✅ INCOME SUMMARY */
export const incomeSummary = async (req, res) => {
  try {
    const summary = await Income.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({ totalIncome: summary[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✅ MONTHLY INCOME TREND */
export const monthlyIncome = async (req, res) => {
  try {
    const trend = await Income.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
