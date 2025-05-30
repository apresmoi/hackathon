"use client";

import { ChatArea } from "@/components/dine-ai/chat-area";
import { ChatInput } from "@/components/dine-ai/chat-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatView } from "@/hooks/use-chat-view"; // Updated import
import { ChefHat, User, Send, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";

// The Message interface from the hook will be used.
// If ChatMessage from hook is different, ChatArea/ChatMessage components need to align.
// Based on current plan, ChatMessage from hook will be {role, content}.

export default function DineAIHomePage() {
  const {
    chatHistory,
    userName,
    addMessage,
    newChat,
    setUserName,
  } = useChatView();

  const [nameInput, setNameInput] = useState(userName);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (userInput: string) => {
    if (userInput.trim()) {
      addMessage(userName, userInput);
    }
  };

  const handleSetUserName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
  };

  const handleNewChat = () => {
    newChat();
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <header className="p-4 shadow-lg bg-primary text-primary-foreground sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-center relative">
          <ChefHat size={36} className="mr-3" />
          <h1 className="text-4xl font-bold tracking-tight">DineAI</h1>
          <Button onClick={handleNewChat} variant="ghost" size="icon" className="absolute right-4 text-primary-foreground hover:bg-primary/80">
            <RefreshCw size={20} />
            <span className="sr-only">Nuevo Chat</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {!userName && (
          <div className="max-w-3xl mx-auto mb-4">
            <div className="flex items-center gap-2 p-3 bg-card shadow rounded-lg border border-border">
              <User size={20} className="text-muted-foreground" />
              <Input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Tu nombre"
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                onKeyPress={(e) => { if (e.key === 'Enter') handleSetUserName(); }}
              />
              <Button onClick={handleSetUserName} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Guardar Nombre
              </Button>
            </div>
          </div>
        )}
        {userName && (
          <p className="text-xs text-muted-foreground mt-1 px-1 mb-4">Usuario actual: {userName}</p>
        )}
        
        <div className="flex flex-col h-[calc(100%-100px)] md:h-[calc(100%-120px)]">
          <ChatArea messages={chatHistory} chatContainerRef={chatContainerRef} />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </main>
    </div>
  );
}
