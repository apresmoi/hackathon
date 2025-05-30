"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface OrderConfirmationSliderProps {
  onConfirm: () => void;
  orderSummary: string;
  onCancel: () => void; 
}

export function OrderConfirmationSlider({ onConfirm, orderSummary, onCancel }: OrderConfirmationSliderProps) {
  const [isConfirmedBySwitch, setIsConfirmedBySwitch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmationToggle = (checked: boolean) => {
    if (checked) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsConfirmedBySwitch(true);
        onConfirm();
        setIsProcessing(false); 
      }, 1500); 
    } else {
      setIsConfirmedBySwitch(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-lg shadow-2xl bg-card border-none">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <CheckCircle2 size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Confirma Tu Pedido</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            ¡Casi listo! Por favor, revisa tu selección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 md:px-8">
          <div className="p-4 border border-border rounded-lg bg-muted/30 max-h-60 overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Resumen del Pedido:</h3>
            <pre className="whitespace-pre-wrap text-sm text-foreground/80">{orderSummary || "Los detalles de tu pedido aparecerán aquí."}</pre>
          </div>
          
          <div className="flex items-center justify-center space-x-3 p-4 bg-primary/10 rounded-lg">
            <Label htmlFor="confirm-order-switch" className={`text-lg font-medium ${isConfirmedBySwitch || isProcessing ? 'text-muted-foreground' : 'text-primary'}`}>
              {isProcessing ? "Procesando..." : isConfirmedBySwitch ? "¡Pedido Realizado!" : "Desliza para Confirmar"}
            </Label>
            <Switch
              id="confirm-order-switch"
              checked={isConfirmedBySwitch || isProcessing}
              onCheckedChange={handleConfirmationToggle}
              disabled={isConfirmedBySwitch || isProcessing}
              className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-primary/50 w-20 h-10 [&>span]:w-8 [&>span]:h-8 [&>span]:data-[state=checked]:translate-x-10 transition-all"
              aria-label="Interruptor para confirmar pedido"
            />
             {isProcessing && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 p-6 md:px-8">
           <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={isProcessing || isConfirmedBySwitch}
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 hover:text-primary"
          >
            Volver al Chat
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
