'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateTopicSuggestionAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bot, Sparkles, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Lightbulb className="mr-2 h-4 w-4" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export default function AiAssistantPage() {
  const { toast } = useToast();
  const initialState = { message: '', data: undefined, issues: undefined, fields: undefined };
  const [state, formAction] = useFormState(generateTopicSuggestionAction, initialState);

  useEffect(() => {
    if (state.message && !state.data && !state.issues) { // General error messages
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    } else if (state.message && state.data) { // Success message
       toast({
        title: 'Suggestions Ready!',
        description: state.message,
      });
    }
  }, [state, toast]);


  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-7 w-7 text-primary" />
            AI Topic Assistant
          </CardTitle>
          <CardDescription>
            Need help drafting an icebreaker topic? Enter your idea below, and our AI will polish it and suggest some alternatives.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userInput">Your Topic Idea</Label>
              <Textarea
                id="userInput"
                name="userInput"
                placeholder="e.g., 'photos of weird places' or 'favorite childhood memory'"
                rows={3}
                defaultValue={state.fields?.userInput}
                aria-describedby="userInput-error"
              />
              {state.issues && state.issues.map((issue, index) => (
                <p key={index} id="userInput-error" className="text-sm text-destructive">{issue}</p>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.data && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-md">Polished Topic:</h3>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md mt-1">{state.data.polishedTopic}</p>
            </div>
            <Separator/>
            <div>
              <h3 className="font-semibold text-md">Alternative Headlines:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-1">
                {state.data.alternativeHeadlines.map((headline, index) => (
                  <li key={index} className="p-2 bg-muted/50 rounded-md">{headline}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
       {state.message && !state.data && state.issues && (
         <Alert variant="destructive" className="mt-6">
           <AlertTitle>Oops! Something went wrong.</AlertTitle>
           <AlertDescription>
             {state.message}
             {state.issues && (
               <ul className="list-disc list-inside mt-2">
                 {state.issues.map((issue, index) => <li key={index}>{issue}</li>)}
               </ul>
             )}
           </AlertDescription>
         </Alert>
       )}
    </div>
  );
}
