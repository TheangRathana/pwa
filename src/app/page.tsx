'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <PushNotificationManager />
    </div>
  )
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Error registering service worker:', error)
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      setSubscription(sub)
      
      // Serialize the PushSubscription object
      const serializedSub = {
        endpoint: sub.endpoint,
        keys: {
          auth: arrayBufferToBase64(sub.getKey('auth')),
          p256dh: arrayBufferToBase64(sub.getKey('p256dh'))
        }
      }
      
      await subscribeUser(serializedSub)
    } catch (error) {
      console.error('Error subscribing to push:', error)
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      try {
        await sendNotification(message)
        setMessage('')
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  function arrayBufferToBase64(buffer: ArrayBuffer | null) {
    if (!buffer) return ''
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button 
            onClick={unsubscribeFromPush}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Unsubscribe
          </button>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button 
              onClick={sendTestNotification}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send Test
            </button>
          </div>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button 
            onClick={subscribeToPush}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  )
}