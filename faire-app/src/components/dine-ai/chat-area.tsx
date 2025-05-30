
"use client";

import { ChatMessage } from "@/components/dine-ai/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

interface ChatAreaProps {
  messages: any[]; // Use ChatMessage from hook
  chatContainerRef?: RefObject<HTMLDivElement>; 
}

export function ChatArea({ messages, chatContainerRef }: ChatAreaProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const refToUse = chatContainerRef || internalRef;

  useEffect(() => {
    if (refToUse.current) {
      refToUse.current.scrollTo({ top: refToUse.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, refToUse]);

  return (
    <ScrollArea className="flex-1 p-4 bg-background">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} /> // Use index as key
        ))}
        {/* isAiThinking indicator is removed as per new hook design */}
      </div>
    </ScrollArea>
  );
}
