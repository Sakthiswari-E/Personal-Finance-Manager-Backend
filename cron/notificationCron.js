// cron/notificationsCron.js
import cron from "node-cron";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";
import { createNotification } from "../utils/notify.js";

cron.schedule("* * * * *", async () => {
  console.log("⏰ Notification Cron Running...");

  try {
    /* --------------------------------------------------
       BUDGET ALERTS
    -------------------------------------------------- */
    const budgets = await Budget.find();

    for (const budget of budgets) {
      const total = await Expense.aggregate([
        { $match: { user: budget.user, category: budget.category } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const spent = total[0]?.total || 0;
      const percent = (spent / budget.amount) * 100;

      const recentNotif = await Notification.findOne({
        userId: budget.user,    // ✅ FIXED
        type: "budget",
        message: { $regex: budget.category, $options: "i" }
      }).sort({ createdAt: -1 });

      const already80 = recentNotif?.message.includes("80%");
      const already100 = recentNotif?.message.includes("exceeded");

      if (percent >= 100 && !already100) {
        await createNotification(
          budget.user,
          "budget",
          `⚠️ You exceeded your budget for ${budget.category}!`
        );
      } else if (percent >= 80 && percent < 100 && !already80) {
        await createNotification(
          budget.user,
          "budget",
          `⚠️ You have used 80% of your ${budget.category} budget.`
        );
      }
    }

    /* --------------------------------------------------
       GOAL PROGRESS ALERTS
    -------------------------------------------------- */
    const goals = await Goal.find();

    for (const goal of goals) {
      const percent = (goal.saved / goal.target) * 100;

      const recentGoalNotif = await Notification.findOne({
        userId: goal.user,    // ✅ FIXED
        type: "goal",
        message: { $regex: goal.name, $options: "i" }
      }).sort({ createdAt: -1 });

      const already80 = recentGoalNotif?.message.includes("80%");
      const already100 = recentGoalNotif?.message.includes("Achieved");

      if (percent >= 100 && !already100) {
        await createNotification(
          goal.user,
          "goal",
          `🎯 Goal Achieved! You reached: ${goal.name}`
        );
      } else if (percent >= 80 && percent < 100 && !already80) {
        await createNotification(
          goal.user,
          "goal",
          `🔥 You reached 80% of your goal: ${goal.name}`
        );
      }
    }

    console.log("✅ Notification Cron Finished!");
  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
});




// import cron from "node-cron";
// import Budget from "../models/Budget.js";
// import Expense from "../models/Expense.js";
// import RecurringBill from "../models/RecurringBill.js";
// import Goal from "../models/Goal.js";
// import Notification from "../models/Notification.js";
// import { createNotification } from "../utils/notify.js";

// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Notification Cron Running...");

//   try {
//     /* -------------------- BUDGET ALERTS -------------------- */
//     const budgets = await Budget.find();

//     for (const budget of budgets) {
//       const total = await Expense.aggregate([
//         { $match: { userId: budget.userId, category: budget.category } },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]);

//       const spent = total[0]?.total || 0;
//       const percent = (spent / budget.limit) * 100;

//       // Get last notification for budget & category
//       const recentNotif = await Notification.findOne({
//         userId: budget.userId,
//         type: "budget",
//         message: { $regex: budget.category, $options: "i" }
//       }).sort({ createdAt: -1 });

//       const already80 = recentNotif?.message.includes("80%");
//       const already100 = recentNotif?.message.includes("exceeded");

//       if (percent >= 100 && !already100) {
//         await createNotification(
//           budget.userId,
//           "budget",
//           `⚠️ You exceeded your budget for ${budget.category}!`
//         );
//       } else if (percent >= 80 && percent < 100 && !already80) {
//         await createNotification(
//           budget.userId,
//           "budget",
//           `⚠️ You have used 80% of your ${budget.category} budget.`
//         );
//       }
//     }

//     /* -------------------- BILL DUE TODAY -------------------- */
//     const today = new Date().toISOString().split("T")[0];
//     const dueBills = await RecurringBill.find({ nextDueDate: today });

//     for (const bill of dueBills) {
//       await createNotification(
//         bill.userId,
//         "bill",
//         `📅 Your ${bill.name} bill of ₹${bill.amount} is due today.`
//       );

//       // Move due date by 1 month
//       const next = new Date(bill.nextDueDate);
//       next.setMonth(next.getMonth() + 1);

//       bill.nextDueDate = next;
//       await bill.save();
//     }

//     /* -------------------- GOAL PROGRESS -------------------- */
//     const goals = await Goal.find();

//     for (const goal of goals) {
//       const percent = (goal.saved / goal.target) * 100;

//       const recentGoalNotif = await Notification.findOne({
//         userId: goal.userId,
//         type: "goal",
//         message: { $regex: goal.name, $options: "i" }
//       }).sort({ createdAt: -1 });

//       const already80 = recentGoalNotif?.message.includes("80%");
//       const already100 = recentGoalNotif?.message.includes("Achieved");

//       if (percent >= 100 && !already100) {
//         await createNotification(
//           goal.userId,
//           "goal",
//           `🎯 Goal Achieved! You reached: ${goal.name}`
//         );
//       } else if (percent >= 80 && percent < 100 && !already80) {
//         await createNotification(
//           goal.userId,
//           "goal",
//           `🔥 You reached 80% of your goal: ${goal.name}`
//         );
//       }
//     }

//     console.log("✅ Notification Cron Finished!");
//   } catch (error) {
//     console.error("❌ Cron Error:", error);
//   }
// });


// import cron from "node-cron";
// import Budget from "../models/Budget.js";
// import Expense from "../models/Expense.js";
// import RecurringBill from "../models/RecurringBill.js";
// import Goal from "../models/Goal.js";
// import { createNotification } from "../utils/notify.js";

// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Notification Cron Running...");

//   try {
//     /* ---------- Budget Alerts ---------- */
//     const budgets = await Budget.find();

//     for (const budget of budgets) {
// const total = await Expense.aggregate([
//   { 
//     $match: { 
//       userId: budget.userId,   // FIXED FIELD
//       category: budget.category 
//     } 
//   },
//   { $group: { _id: null, total: { $sum: "$amount" } } },
// ]);


//       const spent = total[0]?.total || 0;
//       const percent = (spent / budget.limit) * 100;

//       if (percent >= 100) {
//         await createNotification(
//           budget.user,
//           "budget",
//           `⚠️ You exceeded your budget for ${budget.category}!`
//         );
//       } else if (percent >= 80) {
//         await createNotification(
//           budget.user,
//           "budget",
//           `⚠️ You have used 80% of your ${budget.category} budget.`
//         );
//       }
//     }

//     /* ---------- Bill Due Today ---------- */
//     const today = new Date().toISOString().split("T")[0];
//     const dueBills = await RecurringBill.find({ nextDueDate: today });

//     for (const bill of dueBills) {
//       await createNotification(
//         bill.user,
//         "bill",
//         `📅 Your ${bill.name} bill of ₹${bill.amount} is due today.`
//       );

//       // Move nextDueDate by 1 month
//       const next = new Date(bill.nextDueDate);
//       next.setMonth(next.getMonth() + 1);

//       bill.nextDueDate = next;
//       await bill.save();
//     }

//     /* ---------- Goal Progress ---------- */
//     const goals = await Goal.find();

//     for (const goal of goals) {
//       const percent = (goal.saved / goal.target) * 100;

//       if (percent >= 100) {
//         await createNotification(
//           goal.user,
//           "goal",
//           `🎯 Goal Achieved! You reached: ${goal.name}`
//         );
//       } else if (percent >= 80) {
//         await createNotification(
//           goal.user,
//           "goal",
//           `🔥 You reached 80% of your goal: ${goal.name}`
//         );
//       }
//     }

//     console.log("✅ Notification Cron Finished!");
//   } catch (error) {
//     console.error("❌ Cron Error:", error);
//   }
// });











// // backend/cron/notificationsCron.js
// import cron from "node-cron";
// import Budget from "../models/Budget.js";
// import Expense from "../models/Expense.js";
// import RecurringBill from "../models/RecurringBill.js";
// import Goal from "../models/Goal.js";
// import { createNotification } from "../utils/notify.js";

// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Notification Cron Running...");

//   try {
//     /* ------------------------------------------------
//        🔔 BUDGET ALERTS
//     ------------------------------------------------ */
//     const budgets = await Budget.find();

//     for (const budget of budgets) {
//       // Get total spent for that user + category
//       const total = await Expense.aggregate([
//         {
//           $match: {
//             userId: budget.userId,   // MUST BE userId
//             category: budget.category,
//           }
//         },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]);

//       const spent = total[0]?.total || 0;
//       const percent = (spent / budget.limit) * 100;

//       /* ---- Prevent Duplicate Notifications ---- */
//       const recentNotif = await Notification.findOne({
//         user: budget.userId,
//         type: "budget",
//         message: { $regex: budget.category, $options: "i" }
//       }).sort({ createdAt: -1 });

//       const already80 = recentNotif?.message.includes("80%");
//       const already100 = recentNotif?.message.includes("exceeded");

//       /* ---- Check Conditions ---- */
//       if (percent >= 100 && !already100) {
//         await createNotification(
//           budget.userId,
//           "budget",
//           `⚠️ You exceeded your budget for ${budget.category}!`
//         );
//       } else if (percent >= 80 && !already80 && percent < 100) {
//         await createNotification(
//           budget.userId,
//           "budget",
//           `⚠️ You have used 80% of your ${budget.category} budget.`
//         );
//       }
//     }

//     /* ------------------------------------------------
//        📅 BILL DUE TODAY
//     ------------------------------------------------ */
//     const today = new Date().toISOString().split("T")[0];

//     const dueBills = await RecurringBill.find({ nextDueDate: today });

//     for (const bill of dueBills) {
//       await createNotification(
//         bill.user,
//         "bill",
//         `📅 Your ${bill.name} bill of ₹${bill.amount} is due today.`
//       );

//       // Move date by 1 month
//       const next = new Date(bill.nextDueDate);
//       next.setMonth(next.getMonth() + 1);

//       bill.nextDueDate = next;
//       await bill.save();
//     }

//     /* ------------------------------------------------
//        🎯 GOAL PROGRESS
//     ------------------------------------------------ */
//     const goals = await Goal.find();

//     for (const goal of goals) {
//       const percent = (goal.saved / goal.target) * 100;

//       const recentGoalNotif = await Notification.findOne({
//         user: goal.user,
//         type: "goal",
//         message: { $regex: goal.name, $options: "i" }
//       }).sort({ createdAt: -1 });

//       const already80 = recentGoalNotif?.message.includes("80%");
//       const already100 = recentGoalNotif?.message.includes("Achieved");

//       if (percent >= 100 && !already100) {
//         await createNotification(
//           goal.user,
//           "goal",
//           `🎯 Goal Achieved! You reached: ${goal.name}`
//         );
//       } else if (percent >= 80 && percent < 100 && !already80) {
//         await createNotification(
//           goal.user,
//           "goal",
//           `🔥 You reached 80% of your goal: ${goal.name}`
//         );
//       }
//     }

//     console.log("✅ Notification Cron Finished!");
//   } catch (error) {
//     console.error("❌ Cron Error:", error);
//   }
// });
