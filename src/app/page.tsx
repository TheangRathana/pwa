'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        console.log('Notification permission:', permission)
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
    } else {
      console.error('Notifications not supported')
    }
  }

  const sendNotification = () => {
    if (notificationPermission === 'granted') {
      try {
        new Notification('Test Notification', {
          body: 'This is a test notification from your PWA!',
          icon: '/icon-192x192.png'
        })
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    } else {
      console.error('Notification permission not granted')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">PWA Notification Test</h1>
      {notificationPermission === 'default' && (
        <button 
          onClick={requestPermission}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
        >
          Request Notification Permission
        </button>
      )}
      {notificationPermission === 'granted' && (
        <button 
          onClick={sendNotification}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2"
        >
          Send Test Notification
        </button>
      )}
      {notificationPermission === 'denied' && (
        <p className="text-red-500">Notification permission denied. Please enable notifications in your browser settings.</p>
      )}
      <p className="mt-2">Current permission status: {notificationPermission}</p>
    </div>
  )
}