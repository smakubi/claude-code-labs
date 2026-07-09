import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getPendingOrders } from "./queries/order_queries";
import { sendSlackMessage } from "./slack";

// This entry point runs once per day as a cron job.
const PENDING_ALERT_THRESHOLD_DAYS = 3;
const ALERT_CHANNEL = "#order-alerts";

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db);

  // Flag orders stuck in "pending" for too long so someone can follow up.
  const staleOrders = await getPendingOrders(db, PENDING_ALERT_THRESHOLD_DAYS);

  for (const order of staleOrders) {
    const daysPending = Math.floor(order.days_since_created);
    const phone = order.phone ?? "no phone on file";
    const text =
      `:warning: Order *${order.order_number}* has been pending for ` +
      `${daysPending} days.\n` +
      `Customer: ${order.customer_name} — ${phone}. Please follow up.`;

    await sendSlackMessage({ channel: ALERT_CHANNEL, text });
  }
}

main();
