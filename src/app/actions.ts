'use server'

import webpush from 'web-push'

type SerializedSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

let subscriptions: SerializedSubscription[] = [];

export async function subscribeUser(subscription: SerializedSubscription) {
  subscriptions.push(subscription);
  return { success: true, message: 'User subscribed successfully' };
}

export async function unsubscribeUser() {
  subscriptions = [];
  return { success: true, message: 'User unsubscribed successfully' };
}

export async function sendNotification(message: string) {
  webpush.setVapidDetails(
    'mailto:theangrathana1@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const payload = JSON.stringify({
    title: 'New Notification',
    body: message,
    icon: '/web-app-manifest-192x192.png',
    badge: '/web-app-manifest-192x192.png',
    url: '/'
  });

  const notifications = subscriptions.map(subscription =>
    webpush.sendNotification(subscription, payload)
  );

  try {
    await Promise.all(notifications);
    return { success: true, message: 'Notifications sent successfully' };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return { success: false, message: 'Error sending notifications' };
  }
}