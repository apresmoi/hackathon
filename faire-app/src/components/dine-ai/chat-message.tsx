
"use client";

import type { ChatMessage as HookChatMessage } from '@/hooks/use-chat-view'; // Use ChatMessage from hook
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bot, UserCircle2 } from 'lucide-react';

interface ChatMessageProps {
  message: HookChatMessage; // Use ChatMessage from hook
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  // const isSystem = message.role === 'system'; // 'system' role not in new ChatMessage model from hook
  const isAI = message.role === 'assistant';

  // System messages are not part of the new ChatMessage model from the hook
  // if (isSystem) {
  //   return (
  //     <div className="my-2 text-center text-xs text-muted-foreground italic">
  //       {message.content}
  //     </div>
  //   );
  // }

  return (
    <div
      className={cn(
        "flex items-end space-x-2 my-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={20} />
          </AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          "max-w-[70%] p-0 rounded-xl shadow-md",
          isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border-border"
        )}
      >
        <CardContent className="p-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {/* Timestamp is removed as it's not in the new ChatMessage model from the hook */}
          {/* 
          <p className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p> 
          */}
        </CardContent>
      </Card>
      {isUser && (
        <Avatar className="h-8 w-8">
           <AvatarFallback className="bg-accent text-accent-foreground">
            <UserCircle2 size={20} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
