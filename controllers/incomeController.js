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







// // Backend/controllers/incomeController.js
// import Income from "../models/Income.js";

// /* ✅ GET ALL INCOME */
// export const getIncome = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const income = await Income.find({ user: req.user._id })
//       .sort({ date: -1 });

//     res.status(200).json(income);
//   } catch (err) {
//     console.error("GET INCOME ERROR:", err);
//     res.status(500).json({ message: "Failed to fetch income" });
//   }
// };

// /* ✅ ADD INCOME */
// export const addIncome = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const income = await Income.create({
//       user: req.user._id,
//       source: req.body.source,
//       amount: req.body.amount,
//       date: req.body.date,
//       note: req.body.note,
//     });

//     res.status(201).json(income);
//   } catch (err) {
//     console.error("ADD INCOME ERROR:", err);
//     res.status(400).json({ message: "Failed to add income" });
//   }
// };

// /* ✅ UPDATE INCOME (OWNER ONLY) */
// export const updateIncome = async (req, res) => {
//   try {
//     const income = await Income.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       req.body,
//       { new: true }
//     );

//     if (!income) {
//       return res.status(404).json({ message: "Income not found" });
//     }

//     res.json(income);
//   } catch (err) {
//     console.error("UPDATE INCOME ERROR:", err);
//     res.status(400).json({ message: "Failed to update income" });
//   }
// };

// /* ✅ DELETE INCOME (OWNER ONLY) */
// export const deleteIncome = async (req, res) => {
//   try {
//     const income = await Income.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!income) {
//       return res.status(404).json({ message: "Income not found" });
//     }

//     res.json({ message: "Income deleted successfully" });
//   } catch (err) {
//     console.error("DELETE INCOME ERROR:", err);
//     res.status(400).json({ message: "Failed to delete income" });
//   }
// };

// /* ✅ INCOME SUMMARY */
// export const incomeSummary = async (req, res) => {
//   try {
//     const summary = await Income.aggregate([
//       { $match: { user: req.user._id } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     res.json({ totalIncome: summary[0]?.total || 0 });
//   } catch (err) {
//     console.error("INCOME SUMMARY ERROR:", err);
//     res.status(500).json({ message: "Failed to fetch income summary" });
//   }
// };

// /* ✅ MONTHLY INCOME TREND */
// export const monthlyIncome = async (req, res) => {
//   try {
//     const trend = await Income.aggregate([
//       { $match: { user: req.user._id } },
//       {
//         $group: {
//           _id: { $month: "$date" },
//           total: { $sum: "$amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     res.json(trend);
//   } catch (err) {
//     console.error("MONTHLY INCOME ERROR:", err);
//     res.status(500).json({ message: "Failed to fetch monthly income" });
//   }
// };







// Backend/controllers/incomeController.js
import Income from "../models/Income.js";

/* ================================
   ✅ GET ALL INCOME
================================ */
export const getIncome = async (req, res) => {
  try {
    const income = await Income.find({ user: req.user._id })
      .sort({ date: -1 });

    res.status(200).json(income);
  } catch (err) {
    console.error("GET INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch income" });
  }
};

/* ================================
   ✅ ADD INCOME
================================ */
export const addIncome = async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;

    // ✅ Validation
    if (!category || !amount || !date) {
      return res.status(400).json({
        message: "Category, amount and date are required",
      });
    }

    const income = await Income.create({
      user: req.user._id,
      category,
      amount,
      date,
      description,
    });

    res.status(201).json(income);
  } catch (err) {
    console.error("ADD INCOME ERROR:", err);
    res.status(400).json({ message: "Failed to add income" });
  }
};
// UPDATE INCOME
export const updateIncome = async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;

    if (!req.params.id) {
      return res.status(400).json({ message: "Income ID is required" });
    }

    const income = await Income.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id, // ensures only owner can update
      },
      {
        category,
        amount,
        date,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({
      message: "Income updated successfully",
      income,
    });
  } catch (error) {
    console.error("UPDATE INCOME ERROR:", error);
    res.status(500).json({ message: "Failed to update income" });
  }
};

/* ================================
   ✅ DELETE INCOME (OWNER ONLY)
================================ */
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    console.error("DELETE INCOME ERROR:", err);
    res.status(400).json({ message: "Failed to delete income" });
  }
};

/* ================================
   ✅ INCOME SUMMARY
================================ */
export const incomeSummary = async (req, res) => {
  try {
    const summary = await Income.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      totalIncome: summary[0]?.total || 0,
    });
  } catch (err) {
    console.error("INCOME SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch income summary" });
  }
};

/* ================================
   ✅ MONTHLY INCOME TREND
================================ */
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
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(trend);
  } catch (err) {
    console.error("MONTHLY INCOME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch monthly income" });
  }
};
