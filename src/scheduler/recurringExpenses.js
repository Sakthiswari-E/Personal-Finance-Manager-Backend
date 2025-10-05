// backend/src/scheduler/recurringExpenses.js
import cron from "node-cron";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import utc from "dayjs/plugin/utc.js";
import Expense from "../models/Expense.js";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

const freqUnit = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

/**
 * Core recurring expense processor (can run manually or via cron)
 */
export async function runRecurringProcessing() {
  console.log("[recurring] Running recurring expense processor...");
  const today = dayjs().utc().startOf("day");

  const templates = await Expense.find({ "recurrence.enabled": true });

  for (const tpl of templates) {
    try {
      const rec = tpl.recurrence || {};
      const start = rec.startDate
        ? dayjs(rec.startDate).utc().startOf("day")
        : dayjs(tpl.date).utc().startOf("day");
      const lastGenerated = rec.lastGeneratedAt
        ? dayjs(rec.lastGeneratedAt).utc().startOf("day")
        : start;
      const endDate = rec.endDate
        ? dayjs(rec.endDate).utc().endOf("day")
        : null;

      let next = lastGenerated
        .add(1, freqUnit[rec.frequency || "monthly"])
        .startOf("day");
      const toInsert = [];

      while (
        next.isSameOrBefore(today) &&
        (!endDate || next.isSameOrBefore(endDate))
      ) {
        const exists = await Expense.findOne({
          generatedFromRecurring: tpl._id,
          date: {
            $gte: next.toDate(),
            $lt: dayjs(next).add(1, "day").toDate(),
          },
        });

        if (!exists) {
          toInsert.push({
            user: tpl.user,
            amount: tpl.amount,
            date: next.toDate(),
            category: tpl.category,
            description: tpl.description,
            type: tpl.type,
            generatedFromRecurring: tpl._id,
            recurrence: {},
          });
        }

        next = next.add(1, freqUnit[rec.frequency || "monthly"]);
      }

      if (toInsert.length) {
        await Expense.insertMany(toInsert);
        console.log(
          `[recurring] Inserted ${toInsert.length} new expense(s) for template ${tpl._id}`
        );
      }

      const newLast =
        toInsert.length > 0
          ? dayjs(toInsert[toInsert.length - 1].date)
              .utc()
              .startOf("day")
          : lastGenerated;

      tpl.recurrence.lastGeneratedAt = newLast.toDate();
      await tpl.save();
    } catch (err) {
      console.error("[recurring] Error processing template", tpl._id, err);
    }
  }
}

/**
 * Initializes the cron scheduler
 */
export function initRecurring() {
  console.log(
    " Recurring expense scheduler initialized (runs daily at 00:05)..."
  );

  // Run every day at 00:05
  cron.schedule("5 0 * * *", async () => {
    try {
      await runRecurringProcessing();
    } catch (err) {
      console.error("[recurring] Scheduled job failed:", err);
    }
  });
}
