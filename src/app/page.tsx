'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'

export default function PushNotificationManager() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async function () {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (error) {
          console.error('Service Worker registration failed:', error)
          setError('Service Worker registration failed. Push notifications may not work.')
        }
      });
    } else {
      setError('Service Workers are not supported in this browser. Push notifications will not work.')
    }
  }, []);

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      let sub
      try {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        })
      } catch (subscribeError) {
        console.error('Error subscribing to push:', subscribeError)
        if (Notification.permission === 'denied') {
          setError('Push notification permission was denied. Please allow notifications in your browser settings.')
        } else {
          setError('Failed to subscribe to push notifications. This might be due to browser settings or network issues.')
        }
        return
      }

      setSubscription(sub)

      const serializedSub = {
        endpoint: sub.endpoint,
        keys: {
          auth: arrayBufferToBase64(sub.getKey('auth')),
          p256dh: arrayBufferToBase64(sub.getKey('p256dh'))
        }
      }

      await subscribeUser(serializedSub)
      setError(null)
    } catch (error) {
      console.error('Error in subscribeToPush:', error)
      setError('An unexpected error occurred while subscribing to push notifications.')
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
      setError(null)
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      setError('Failed to unsubscribe from push notifications.')
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      try {
        await sendNotification(message)
        setMessage('')
        setError(null)
      } catch (error) {
        console.error('Error sending notification:', error)
        setError('Failed to send test notification.')
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

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Push Notifications</h3>
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      {subscription ? (
        <>
          <p style={{ color: '#10B981', marginBottom: '10px' }}>You are subscribed to push notifications.</p>
          <button
            onClick={unsubscribeFromPush}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Unsubscribe
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={sendTestNotification}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Send Test
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: '#F59E0B', marginBottom: '10px' }}>You are not subscribed to push notifications.</p>
          <button
            onClick={subscribeToPush}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  )
}