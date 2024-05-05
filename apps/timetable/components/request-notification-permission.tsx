'use client'

export default function RequestNotificationPermission() {
  const requestNotificationPermission = () => {
    if (Notification.permission === 'granted') return sendNotification()

    Notification.requestPermission(function (result) {
      if (result === 'granted') {
        console.log('用户允许接收通知')
        // 这里可以调用发送通知的函数
        sendNotification()
      } else {
        console.log('用户拒绝接收通知')
      }
    })
  }

  const sendNotification = () => {
    // 检查 service worker 是否可用
    if (!('serviceWorker' in navigator)) {
      return
    }

    navigator.serviceWorker.ready.then(function (registration) {
      registration.showNotification('新消息', {
        body: '您有一条新消息',
        // icon: '/icon.png',
        // badge: '/badge.png',
      })
    })
  }

  return <button onClick={requestNotificationPermission}>Request</button>
}
