
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";
import type { FormEvent } from 'react';
import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  // isLoading prop is removed as per new hook design
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 border-t bg-card">
      <Input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Pregunta sobre el menú o haz tu pedido..."
        className="flex-1 rounded-full focus-visible:ring-primary focus-visible:ring-offset-0"
        // disabled={isLoading} // isLoading removed
        aria-label="Entrada de chat"
      />
      <Button
        type="submit"
        size="icon"
        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={!input.trim()} // Button disabled only if input is empty
        aria-label="Enviar mensaje"
      >
        <SendHorizonal size={20} />
      </Button>
    </form>
  );
}
