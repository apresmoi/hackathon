/* ----------  Types ---------- */

interface Order {
  id: string;
  desc: string;
  userName: string;
  status: "ordering" | "desided" | "cooking" | "finished";
}

interface ChatHistory {
  role: "user" | "assistant";
  content: string;
}

/* ----------  Helpers ---------- */

/**
 * Turns an array of orders into a Markdown bullet list
 * or a friendly sentence if the list is empty.
 */
function ordersToMarkdown(
  orders: Order[],
  emptyMessage: string
): string {
  if (orders.length === 0) {
    return emptyMessage;
  }

  return orders
    .map(
      o =>
        `- **${o.id}** – ${o.desc} (_${o.status}_)`
    )
    .join("\n");
}

/* ----------  Core functions ---------- */

/**
 * Returns the first non-finished order for a diner, plus a Markdown summary.
 */
export function getActiveOrder(
  orders: Order[],
  userName: string
): { activeOrder: Order | null; des: string } {
  const active = orders.find(
    o =>
      o.userName === userName &&
      o.status !== "finished"
  ) || null;

  const des = ordersToMarkdown(
    active ? [active] : [],
    `Looks like **${userName}** doesn’t have an active order right now.`
  );

  return { activeOrder: active, des };
}

/**
 * Returns every finished order for a diner, plus a Markdown summary.
 */
export function getFinisehdOrder(   // ← keeping the original spelling
  orders: Order[],
  userName: string
): { orderHistory: Order[]; des: string } {
  const history = orders.filter(
    o =>
      o.userName === userName &&
      o.status === "finished"
  );

  const des = ordersToMarkdown(
    history,
    `No finished orders on record for **${userName}** yet.`
  );

  return { orderHistory: history, des };
}
