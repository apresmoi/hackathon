import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// In-memory store for subscriptions (for mocking purposes)
let subscriptions: PushSubscription[] = [];

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    console.log('Received subscription on server:', subscription);
    
    // Basic validation
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: 'Invalid subscription object' }, { status: 400 });
    }

    // Store the subscription (in a real app, save to a database associated with a user)
    const existingSubscription = subscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!existingSubscription) {
      subscriptions.push(subscription);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you might want to send a test push notification here
    // or confirm subscription with the push service.

    return NextResponse.json({ message: 'Subscription successful' }, { status: 201 });
  } catch (error) {
    console.error("Failed to process subscription:", error);
    return NextResponse.json({ message: "Error processing subscription", error: (error as Error).message }, { status: 500 });
  }
}
