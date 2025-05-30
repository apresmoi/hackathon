// app/actions/updateChatHistory.ts
// ---------------------------------------------------------------------
// Server-side only – Next 13.4+ “Server Action”
// Updates the running chat **and** the restaurant’s order list
// in response to a new user message, using OpenAI in JSON-object mode.
//
// External helpers (imported from /lib):
//   • getActiveOrder
//   • getFinisehdOrder
// ---------------------------------------------------------------------
"use server";
import { Order } from "@/components/kitchen-orders/orders-provider";
import { ChatHistory } from "@/hooks/atoms";
import { getActiveOrder, getFinisehdOrder } from "@/lib/lib";
import "server-only";

const apikey = process.env.OPENAI_API_KEY

/* ------------------------------------------------------------------ */
/*  Types returned to the client                                      */
/* ------------------------------------------------------------------ */
export interface UpdateResult {
  chat: ChatHistory[]; // full, updated chat history
  orders: Order[]; // full, updated order list
}

/* ------------------------------------------------------------------ */
/*  Action                                                            */
/* ------------------------------------------------------------------ */
export async function updateChatHistory(
  orders: any[], // current order list for *all* diners
  userName: string, // who is chatting
  chat: ChatHistory[], // current chat history
  userMessage: string // freshly-typed user message
): Promise<UpdateResult> {
  /* 1. Optimistically append the new user message -------------------- */
  const chatPlusUser: ChatHistory[] = [
    ...chat,
    { role: "user", content: userMessage } satisfies ChatHistory,
  ];

  /* 2. Build contextual summaries with our helper functions ---------- */
  const { activeOrder, des: activeDes } = getActiveOrder(orders, userName);
  const { orderHistory, des: historyDes } = getFinisehdOrder(orders, userName);
  const menu = `
- Hamburger
Price: $5.00
Extras: Tomato, Lettuce
Add-ons: $0.50 each

- Cheeseburger
Price: $6.00
Extras: Tomato, Lettuce
Disclaimer: All hamburgers are cooked with standard bread.

### Vegetarian Menu :seedling:

- Veggie Delight
Price: $5.50
Extras: Tomato, Lettuce, Pickles
Add-ons: Avocado, Jalapeños – $0.50 each

- Grilled Portobello Burger
Price: $6.00
Extras: Arugula, Caramelized Onion
Add-ons: Vegan Cheese – $0.50

- Avocado Bean Burger
Price: $6.50
Extras: Lettuce, Tomato, Guacamole
Add-ons: Extra Guac – $0.50

- Falafel Burger
Price: $5.75
Extras: Lettuce, Tomato, Hummus
Add-ons: Feta Cheese – $0.50
Eggplant Parmesan Burger
Price: $6.25
Extras: Marinara, Mozzarella, Basil
Add-ons: Extra Cheese – $0.50
Disclaimer: All vegetarian burgers are served with standard bread. Vegan options available upon request.`;
  /* 3. Craft the **system prompt** using the `des` strings ------------ */
  const systemPrompt = `
You are Waiter-LLM.
${menu}

### Menu
# (leave empty; populate with dishes & prices at runtime)

### Active Order
${activeDes}

### Order History
${historyDes}

==================  RESPONSE FORMAT  ==================
Always reply with a single, minified JSON object **and nothing else**.
The object MUST have exactly these keys, in this order:

1. "answer" : string  
   • A short, polite statement to the guest.  
   • Keep it in natural language.  
   • DO NOT include menu, order lines, or any kitchen instructions here.

2. "status" : string  
   • Indicates where the guest is in the ordering flow.  
   • Allowed values (case-sensitive):  
       "ordering"  – the guest is still choosing or adding items  
       "decided"   – the guest has finished and the order is final

3. "desc" : string  
   • A concise, kitchen-ready description of the order, free of fluff.  
   • Format: one line per item → "<qty>x <item name> – <mods if any>"  

NO OTHER FIELDS. NO CHITCHAT. NO EXTRA TEXT OUTSIDE THE JSON.
Example (for illustration only):

{"answer":"Certainly! Your Margherita pizza will be right up.","status":"decided","desc":"1x Margherita Pizza – extra basil"}

========================================================`.trim();

  /* 4. Call OpenAI in JSON-object mode ------------------------------- */
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apikey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...chatPlusUser.map(({ role, content }) => ({ role, content })),
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  }

  const raw = await res.json();
  const parsed = JSON.parse(raw.choices?.[0]?.message?.content ?? "{}");

  console.log({parsed});

  const newStatus = parsed.status ?? "ordering";
  const assistantAnswer = parsed.answer ?? "✓ Order noted.";
  const newDesc = parsed.dec ?? activeOrder?.desc ?? "";

  /* 5. Update / create the diner’s active order ---------------------- */
  let updatedOrders = [...orders];

  if (activeOrder) {
    // mutate that order in copy of array
    updatedOrders = updatedOrders.map((o) =>
      o.id === activeOrder.id
        ? {
            ...o,
            status: newStatus === "decided" ? "desided" : "ordering",
            desc: newDesc || o.desc,
          }
        : o
    );
  } else if (newDesc) {
    // no active order → create one
    updatedOrders.push({
      id: crypto.randomUUID(),
      userName,
      desc: newDesc,
      status: newStatus === "decided" ? "desided" : "ordering",
    });
  }

  /* 6. Append the model’s answer to the chat ------------------------- */
  const finalChat: ChatHistory[] = [
    ...chatPlusUser,
    { role: "assistant", content: assistantAnswer },
  ];

  /* 7. Return the new state back to the client ----------------------- */
  return {
    chat: finalChat,
    orders: updatedOrders,
  };
}
