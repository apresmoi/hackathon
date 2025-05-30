'use client';

import type { Icebreaker, Entry as EntryType, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { ThermometerLike } from './ThermometerLike';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { getMockUserById } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ImageIcon, TypeIcon } from 'lucide-react';

interface IcebreakerCardProps {
  icebreaker: Icebreaker;
}

export function IcebreakerCard({ icebreaker }: IcebreakerCardProps) {
  // Assuming the first entry is the main one by the icebreaker creator, or the most relevant one.
  // In a real app, this logic might be more complex (e.g. creator's specific entry).
  const primaryEntry = icebreaker.entries?.[0]; 
  const author = icebreaker.author || getMockUserById(icebreaker.authorId);
  const entryAuthor = primaryEntry?.author || (primaryEntry ? getMockUserById(primaryEntry.authorId) : author);

  const handleLike = () => {
    // Placeholder for like action on primaryEntry
    console.log('Liked entry:', primaryEntry?.id);
    // Update interaction counts, etc.
  };

  const handleCommentAdded = () => {
    // Placeholder for when a comment is added to primaryEntry
    console.log('Comment added to entry:', primaryEntry?.id);
    // Update interaction counts, etc.
  };
  
  const cardStyle = {}; // Placeholder for "warming up" effect based on likes.

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300" style={cardStyle} data-ai-hint="discussion communication">
      <CardHeader className="p-4">
        <div className="flex items-start space-x-3">
            {author && (
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={author.avatarUrl} alt={author.displayName} />
                <AvatarFallback>{author.displayName.substring(0,1)}</AvatarFallback>
              </Avatar>
            )}
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{icebreaker.title}</CardTitle>
            <CardDescription className="text-xs mt-1">
              Prompt by {author?.displayName || 'Unknown'} &bull; {formatDistanceToNow(new Date(icebreaker.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge variant={icebreaker.topicType === 'photo' ? 'secondary' : 'outline'} className="text-xs capitalize">
            {icebreaker.topicType === 'photo' && <ImageIcon className="mr-1 h-3 w-3" />}
            {icebreaker.topicType === 'text' && <TypeIcon className="mr-1 h-3 w-3" />}
            {icebreaker.topicType === 'mixed' && <><ImageIcon className="mr-1 h-3 w-3" /> <TypeIcon className="mr-1 h-3 w-3" /></>}
            {icebreaker.topicType}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">{icebreaker.description}</p>
      </CardHeader>

      {primaryEntry && (
        <CardContent className="p-4 flex-grow">
          <div className="space-y-3">
            {primaryEntry.authorId !== icebreaker.authorId && entryAuthor && ( // If entry author is different from prompt author
              <div className="flex items-center space-x-2 mb-2 border-b pb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entryAuthor.avatarUrl} alt={entryAuthor.displayName} />
                  <AvatarFallback>{entryAuthor.displayName.substring(0,1)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs font-medium">{entryAuthor.displayName} responded:</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(primaryEntry.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            )}
            {primaryEntry.contentUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <Image
                  src={primaryEntry.contentUrl}
                  alt={icebreaker.title}
                  fill // Changed from layout="fill"
                  style={{ objectFit: 'cover' }} // Changed from objectFit="cover"
                  data-ai-hint="team building"
                />
              </div>
            )}
            {primaryEntry.text && <p className="text-sm leading-relaxed">{primaryEntry.text}</p>}
          </div>
        </CardContent>
      )}
      
      {!primaryEntry && (
        <CardContent className="p-4 flex-grow">
            <p className="text-sm text-muted-foreground text-center py-4">No entries yet for this icebreaker.</p>
        </CardContent>
      )}

      {primaryEntry && (
        <CardFooter className="p-4 flex flex-col space-y-3 items-stretch bg-muted/30">
          <ThermometerLike initialLikeCount={primaryEntry.likeCount} onLike={handleLike} />
          <CommentSection 
            entryId={primaryEntry.id} 
            initialComments={primaryEntry.comments || []} 
            onCommentAdded={handleCommentAdded} 
          />
        </CardFooter>
      )}
    </Card>
  );
}
