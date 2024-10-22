export async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
}

export function showNotification(title: string, options?: NotificationOptions) {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, options);
    } else {
        console.log("Notification permission not granted.");
    }
}