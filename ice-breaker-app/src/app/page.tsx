
import { IcebreakerCard } from '@/components/icebreaker/IcebreakerCard';
import { mockIcebreakers, currentMockUser } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IceCream2, MessageSquare } from 'lucide-react'; // Added MessageSquare import
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feed',
};

// Group icebreakers by month
const groupIcebreakersByMonth = (icebreakers: typeof mockIcebreakers) => {
  return icebreakers.reduce((acc, icebreaker) => {
    const monthYear = new Date(icebreaker.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(icebreaker);
    return acc;
  }, {} as Record<string, typeof mockIcebreakers>);
};


export default function FeedPage() {
  // Placeholder for fetching real data and infinite scroll
  const icebreakersByMonth = groupIcebreakersByMonth(mockIcebreakers);
  const months = Object.keys(icebreakersByMonth).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort months, newest first


  return (
    <div className="relative min-h-screen">
      <div className="space-y-8">
        {months.map((month) => (
          <section key={month} className="bg-card p-4 sm:p-6 rounded-lg shadow">
            {/* Placeholder for "melting" visual effect for the section */}
            <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{month}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {icebreakersByMonth[month].map((icebreaker) => (
                <IcebreakerCard key={icebreaker.id} icebreaker={icebreaker} />
              ))}
            </div>
          </section>
        ))}

        {mockIcebreakers.length === 0 && (
          <div className="text-center py-10">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No icebreakers yet!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to break the ice.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/create">
                  <IceCream2 className="mr-2 h-4 w-4" /> Create Icebreaker
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Action Button for Create New Icebreaker */}
      <Button
        asChild
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50"
        size="icon"
      >
        <Link href="/create" aria-label="Create new icebreaker">
          <IceCream2 className="h-7 w-7" />
        </Link>
      </Button>
      {/* Placeholder for infinite scroll loading indicator */}
    </div>
  );
}

