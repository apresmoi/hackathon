"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyPopper } from 'lucide-react';

interface OrderConfirmedViewProps {
  orderNumber: string;
  onStartNewOrder: () => void;
}

export function OrderConfirmedView({ orderNumber, onStartNewOrder }: OrderConfirmedViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8 bg-gradient-to-br from-accent/10 via-background to-primary/10">
      <Card className="w-full max-w-md text-center shadow-2xl bg-card border-none">
        <CardHeader>
          <div className="mx-auto bg-accent text-accent-foreground rounded-full p-4 w-fit mb-4">
            <PartyPopper size={40} />
          </div>
          <CardTitle className="text-3xl font-bold text-accent">¡Pedido Confirmado!</CardTitle>
          <CardDescription className="text-muted-foreground pt-2 text-lg">
            Gracias por elegir DineAI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-foreground">Tu pedido está siendo preparado.</p>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm text-primary font-medium">Tu Número de Pedido es:</p>
            <p className="text-2xl font-bold text-primary tracking-wider">{orderNumber}</p>
          </div>
          <p className="text-xs text-muted-foreground">Por favor, guarda este número para tu referencia.</p>
        </CardContent>
        <CardFooter className="flex justify-center p-6">
          <Button 
            onClick={onStartNewOrder} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg rounded-full shadow-lg"
            size="lg"
          >
            Realizar Otro Pedido
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
