'use client';

import { useState } from 'react';
import type { Comment as CommentType, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { currentMockUser, getMockUserById } from '@/lib/mock-data';

interface CommentSectionProps {
  entryId: string;
  initialComments: CommentType[];
  onCommentAdded: (newComment: CommentType) => void; // Placeholder
}

export function CommentSection({ entryId, initialComments, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitComment = () => {
    if (!newCommentText.trim() || !currentMockUser) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newComment: CommentType = {
        id: `comment-${Date.now()}`,
        entryId,
        authorId: currentMockUser.id,
        author: currentMockUser,
        text: newCommentText,
        createdAt: new Date().toISOString(),
      };
      setComments(prevComments => [newComment, ...prevComments]); // Add to top
      onCommentAdded(newComment);
      setNewCommentText('');
      setIsLoading(false);
    }, 500);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="comments">
        <AccordionTrigger className="text-sm hover:no-underline">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length} Comments</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {comments.map((comment) => {
              const author = comment.author || getMockUserById(comment.authorId);
              return (
                <Card key={comment.id} className="bg-muted/50 p-3 shadow-none">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={author?.avatarUrl} alt={author?.displayName} />
                      <AvatarFallback>{author?.displayName?.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{author?.displayName || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-xs mt-1">{comment.text}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
            {comments.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first!</p>}
          </div>
          <div className="mt-4 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="text-xs min-h-[60px]"
              rows={2}
            />
            <Button onClick={handleSubmitComment} disabled={isLoading || !newCommentText.trim()} size="sm" className="w-full text-xs">
              <Send className="mr-2 h-3 w-3" />
              {isLoading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
