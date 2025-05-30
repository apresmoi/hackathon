// useChatView.ts
// --------------------------------------------------------------------
// A React-hook wrapper around three Jotai atoms:
//
//   • chatHistoryAtom – ChatHistory[] (sessionStorage)
//   • ordersAtom      – Order[]       (sessionStorage)
//   • userNameAtom    – string        (sessionStorage)
//
// It calls the server action `updateChatHistory`, then syncs the two
// atoms with the authoritative data returned by the server.
//
// --------------------------------------------------------------------
"use client";

import * as React from "react";
import { useAtom } from "jotai";
import { startTransition } from "react";

import { chatHistoryAtom, ordersAtom, userNameAtom } from "./atoms";
import { updateChatHistory } from "@/app/action";

/* ----------  Hook return type ------------------------------------ */
interface UseChatViewResult {
  chatHistory: any[];
  addMessage: (userName: string, message: string) => void;
  newChat: () => void;
  userName: string;
  setUserName: (name: string) => void;
}

/* ================================================================= */
export function useChatView(): UseChatViewResult {
  /* ------- atoms -------------------------------------------------- */
  const [chatHistory, setChatHistory] = useAtom(chatHistoryAtom);
  const [orders, setOrders] = useAtom(ordersAtom);
  const [userName, setUserName] = useAtom(userNameAtom);

  /* ------- addMessage – main entry point -------------------------- */
  const addMessage = React.useCallback(
    (userNameParam: string, message: string) => {
      const dinerName = userNameParam || userName;

      /* 1️⃣  keep session userName consistent */
      if (dinerName !== userName) setUserName(dinerName);

      /* 2️⃣  optimistic UI: add user message locally */
      const optimisticChat: any[] = [
        ...chatHistory,
        { role: "user", content: message },
      ];
      setChatHistory(optimisticChat);

      /* 3️⃣  server round-trip inside a transition */
      startTransition(() => {
        updateChatHistory(orders, dinerName, chatHistory, message)
          .then(({ chat, orders: newOrders }) => {
            setChatHistory(chat);
            console.log(newOrders);

            setOrders(newOrders as any);
          })
          .catch(console.error); // handle as you wish
      });
    },
    [chatHistory, orders, userName, setChatHistory, setOrders, setUserName]
  );

  /* ------- clear the conversation -------------------------------- */
  const newChat = React.useCallback(() => {
    setChatHistory([]);
  }, [setChatHistory]);

  /* ------- public API --------------------------------------------- */
  return {
    chatHistory,
    addMessage,
    newChat,
    userName,
    setUserName,
  };
}
