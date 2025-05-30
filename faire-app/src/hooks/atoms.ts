// atoms.ts
// ----------
// Reusable Jotai atoms for storing Orders, userName and chatHistory
// with automatic JSON‑serialization to the chosen Web Storage.
//
// • `ordersAtom`   → localStorage  (persists across browser restarts)
// • `userNameAtom` → sessionStorage (cleared when the tab/window is closed)
// • `chatHistoryAtom` → sessionStorage
//
// The atoms are SSR‑safe: `createJSONStorage` delays the `window` access
// until the first subscription, so it won’t break on the server.

import { atomWithStorage, createJSONStorage } from 'jotai/utils'

/** Entity definitions *********************************************/
export interface Orders {
  id: string
  desc: string
  userName: string
  status: 'ordering' | 'desided' | 'cooking' | 'finished'
}

export interface ChatHistory {
  role: 'user' | 'assistant'
  content: string
}

/** Custom JSON storage helpers ************************************/

// Persistent (until user clears site‑data)
const localJSONStorage = createJSONStorage<Orders[]>(() => localStorage)

// Session‑scoped (cleared when the tab/window closes)
const sessionJSONStorage = createJSONStorage<any>(() => sessionStorage)

/** Atoms ***********************************************************/

// 1️⃣  Orders – array stored in localStorage under key "orders"
export const ordersAtom = atomWithStorage<Orders[]>(
  'orders',          // key
  [],                // default value
  localJSONStorage   // storage provider
)

// 2️⃣  userName – simple string synced to sessionStorage
export const userNameAtom = atomWithStorage<string>(
  'userName',        // key
  '',                // default value
  sessionJSONStorage // storage provider
)

// 3️⃣  chatHistory – array stored in sessionStorage
export const chatHistoryAtom = atomWithStorage<ChatHistory[]>(
  'chatHistory',
  [],
  sessionJSONStorage
)

/*******************************************************************/
// Usage example (inside a React component):
// const [orders, setOrders] = useAtom(ordersAtom)
// const [name, setName] = useAtom(userNameAtom)
// const [history, setHistory] = useAtom(chatHistoryAtom)
// *****************************************************************
