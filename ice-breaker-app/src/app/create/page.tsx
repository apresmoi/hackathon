
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage } from '@/components/ui/avatar'; // Added import
import { useToast } from '@/hooks/use-toast';
import { 
  currentMockUser, 
  mockIcebreakers, // Import mockIcebreakers for the select dropdown
  getMockIcebreakerById, 
  addIcebreakerWithFirstEntry, 
  addEntryToIcebreaker 
} from '@/lib/mock-data';
import { IceCream2, UploadCloud } from 'lucide-react';
import type { Icebreaker, Entry } from '@/lib/types'; // Import types

// Cannot use export const metadata on client component. 
// This page should have a title like "Create Icebreaker" set in a parent server component or layout if dynamic title is needed.

const formSchema = z.object({
  promptOption: z.enum(['existing', 'new']),
  existingPrompt: z.string().optional(), // This will now be an Icebreaker ID
  newPromptTitle: z.string().optional(),
  newPromptDescription: z.string().optional(),
  entryText: z.string().min(1, 'Your entry text cannot be empty.'),
  imageFile: z.instanceof(File).optional().nullable(), // Allow null
  topicType: z.enum(['text', 'photo', 'mixed']).default('mixed'),
}).superRefine((data, ctx) => {
  if (data.promptOption === 'existing' && !data.existingPrompt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please select an existing prompt.',
      path: ['existingPrompt'],
    });
  }
  if (data.promptOption === 'new') {
    if (!data.newPromptTitle || data.newPromptTitle.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New prompt title must be at least 3 characters.',
        path: ['newPromptTitle'],
      });
    }
    if (!data.newPromptDescription || data.newPromptDescription.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New prompt description must be at least 10 characters.',
        path: ['newPromptDescription'],
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateIcebreakerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // const [promptOption, setPromptOption] = useState<'existing' | 'new'>('existing'); // This state is managed by react-hook-form now
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      promptOption: 'existing',
      entryText: '',
      topicType: 'mixed',
      imageFile: null,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('imageFile', null);
      setImagePreview(null);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    
    if (!currentMockUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not found. Please log in.' });
      setIsLoading(false);
      return;
    }

    let imageUrl: string | undefined = undefined;
    if (data.imageFile) {
      try {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.imageFile as File);
        });
      } catch (error) {
        console.error("Error reading image file:", error);
        toast({ variant: 'destructive', title: 'Image Upload Error', description: 'Could not process the image.' });
        setIsLoading(false);
        return;
      }
    }

    const entryAuthor = currentMockUser;
    const entryCreatedAt = new Date().toISOString();

    if (data.promptOption === 'new') {
      if (!data.newPromptTitle || !data.newPromptDescription) {
        toast({ variant: 'destructive', title: 'Error', description: 'New prompt title and description are required.' });
        setIsLoading(false);
        return;
      }
      const newIcebreakerId = `icebreaker-${Date.now()}`;
      const newEntryId = `${newIcebreakerId}-entry-1`;

      const newEntryForNewIcebreaker: Entry = {
        id: newEntryId,
        icebreakerId: newIcebreakerId,
        authorId: entryAuthor.id,
        author: entryAuthor,
        text: data.entryText,
        contentUrl: imageUrl,
        createdAt: entryCreatedAt,
        likeCount: 0,
        comments: [],
      };

      const newIcebreaker: Icebreaker = {
        id: newIcebreakerId,
        title: data.newPromptTitle,
        description: data.newPromptDescription,
        topicType: data.topicType, // The new prompt's type is determined by the first entry's type
        authorId: entryAuthor.id,
        author: entryAuthor,
        createdAt: new Date().toISOString(),
        interactionCount: 0, 
        entries: [newEntryForNewIcebreaker], // Will be set by addIcebreakerWithFirstEntry
      };
      
      addIcebreakerWithFirstEntry(newIcebreaker, newEntryForNewIcebreaker);

      toast({
        title: 'New Icebreaker Posted!',
        description: `"${newIcebreaker.title}" is live.`,
      });

    } else if (data.promptOption === 'existing' && data.existingPrompt) {
      const targetIcebreaker = getMockIcebreakerById(data.existingPrompt); // existingPrompt is an ID

      if (!targetIcebreaker) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected prompt not found.' });
        setIsLoading(false);
        return;
      }

      const newEntryId = `${targetIcebreaker.id}-entry-${Date.now()}`;
      const newEntryForExistingIcebreaker: Entry = {
        id: newEntryId,
        icebreakerId: targetIcebreaker.id,
        authorId: entryAuthor.id,
        author: entryAuthor,
        text: data.entryText,
        contentUrl: imageUrl,
        createdAt: entryCreatedAt,
        likeCount: 0,
        comments: [],
      };

      addEntryToIcebreaker(targetIcebreaker.id, newEntryForExistingIcebreaker);

      toast({
        title: 'Entry Posted!',
        description: `Your entry for "${targetIcebreaker.title}" is live.`,
      });
    }

    setIsLoading(false);
    form.reset(); 
    setImagePreview(null);
    router.push('/'); 
    router.refresh(); // Important to reflect changes from mock data
  };
  
  const selectedPromptOption = form.watch('promptOption');
  const selectedTopicType = form.watch('topicType');

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <IceCream2 className="h-7 w-7 text-primary" />
            Create New Icebreaker
          </CardTitle>
          <CardDescription>Share something fun to help your team bond!</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Prompt Selection */}
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Select
                value={selectedPromptOption} // Controlled component
                onValueChange={(value: 'existing' | 'new') => {
                  form.setValue('promptOption', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose or create a prompt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">Use an existing prompt</SelectItem>
                  <SelectItem value="new">Create a new prompt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPromptOption === 'existing' && (
              <div className="space-y-2">
                <Label htmlFor="existingPrompt">Select Prompt</Label>
                <Select 
                  value={form.watch('existingPrompt')}
                  onValueChange={(value) => form.setValue('existingPrompt', value)}
                >
                  <SelectTrigger id="existingPrompt">
                    <SelectValue placeholder="Choose from available prompts..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIcebreakers.map(ib => (
                      <SelectItem key={ib.id} value={ib.id}>{ib.title} - <em className="text-xs text-muted-foreground">{ib.description.substring(0,30)}...</em></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.existingPrompt && <p className="text-sm text-destructive">{form.formState.errors.existingPrompt.message}</p>}
              </div>
            )}

            {selectedPromptOption === 'new' && (
              <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="newPromptTitle">New Prompt Title</Label>
                  <Input id="newPromptTitle" {...form.register('newPromptTitle')} placeholder="e.g., Your Favorite Workspace Gadget" />
                  {form.formState.errors.newPromptTitle && <p className="text-sm text-destructive">{form.formState.errors.newPromptTitle.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPromptDescription">New Prompt Description</Label>
                  <Textarea id="newPromptDescription" {...form.register('newPromptDescription')} placeholder="e.g., Share a photo or description of a gadget that makes your workday better." />
                  {form.formState.errors.newPromptDescription && <p className="text-sm text-destructive">{form.formState.errors.newPromptDescription.message}</p>}
                </div>
              </div>
            )}
            
            {/* Topic Type (for the entry, or new prompt type) */}
             <div className="space-y-2">
                <Label htmlFor="topicType">Entry Type {selectedPromptOption === 'new' && '(this will also be the new prompt type)'}</Label>
                <Select 
                  value={selectedTopicType}
                  onValueChange={(value: 'text' | 'photo' | 'mixed') => form.setValue('topicType', value)}
                >
                  <SelectTrigger id="topicType">
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="photo">Photo (with optional text)</SelectItem>
                    <SelectItem value="mixed">Mixed (Text and Photo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>


            {/* Your Entry */}
            <div className="space-y-2">
              <Label htmlFor="entryText">Your Entry</Label>
              <Textarea
                id="entryText"
                {...form.register('entryText')}
                placeholder="Share your story, thoughts, or context..."
                rows={5}
              />
              {form.formState.errors.entryText && <p className="text-sm text-destructive">{form.formState.errors.entryText.message}</p>}
            </div>

            {/* Image Upload */}
            {(selectedTopicType === 'photo' || selectedTopicType === 'mixed') && (
            <div className="space-y-2">
              <Label htmlFor="imageFile">Upload Image (Optional if 'mixed' or 'text')</Label>
              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" onClick={() => document.getElementById('imageFileInput')?.click()}>
                  <UploadCloud className="mr-2 h-4 w-4" /> Choose Image
                </Button>
                 <Input
                  id="imageFileInput" // Changed ID to avoid conflict with label's htmlFor
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden" // Keep it hidden, triggered by button
                />
                {imagePreview && <Avatar><AvatarImage src={imagePreview} alt="Preview" className="h-10 w-10 rounded-md object-cover" /></Avatar>}
              </div>
              {form.formState.errors.imageFile && <p className="text-sm text-destructive">{form.formState.errors.imageFile.message}</p>}
              <p className="text-xs text-muted-foreground">Max file size: 5MB. Accepted formats: JPG, PNG, GIF.</p>
            </div>
            )}

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post Icebreaker'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

