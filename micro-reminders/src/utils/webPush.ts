"use client";

// This should be your VAPID public key, obtained from your push service provider.
// For development, you can generate a pair using `npx web-push generate-vapid-keys`.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BDS_REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY_HERE_sDS';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    alert('Push notifications are not supported by your browser. Please try using a modern browser like Chrome, Firefox, or Edge.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('User IS subscribed.');
      return subscription;
    }

    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'denied') {
      console.warn('Permission for notifications was denied');
      alert('You denied permission for notifications. To enable them later, click the lock icon in your browser\'s address bar and allow notifications.');
      return null;
    }
    
    if (permission === 'default') {
      console.warn('Permission for notifications was dismissed');
      alert('Please allow notifications to receive reminders. You can try again by clicking the Subscribe button.');
      return null;
    }

    // For development/testing, we'll use a mock subscription
    // In production, you would use a real VAPID key
    const mockSubscription = {
      endpoint: 'https://mock-push-endpoint.com',
      keys: {
        p256dh: 'mock-p256dh-key',
        auth: 'mock-auth-key'
      }
    };

    console.log('User is subscribed:', mockSubscription);
    return mockSubscription as unknown as PushSubscription;

  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    alert('Failed to subscribe to push notifications. Please try again later.');
    return null;
  }
}

export async function unsubscribeUserFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('User is not subscribed. No need to unsubscribe.');
      return true;
    }

    const successful = await subscription.unsubscribe();
    if (successful) {
      console.log('User unsubscribed successfully.');
      // Optionally, notify your backend about the unsubscription
      // Example:
      // await fetch('/api/unsubscribe', {
      //   method: 'POST',
      //   body: JSON.stringify({ endpoint: subscription.endpoint }),
      //   headers: { 'Content-Type': 'application/json' },
      // });
      return true;
    } else {
      console.error('Failed to unsubscribe user.');
      return false;
    }
  } catch (error) {
    console.error('Error unsubscribing user: ', error);
    return false;
  }
}
