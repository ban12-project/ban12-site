import RequestNotificationPermission from '#/components/request-notification-permission'
import SendNotification from '#/components/send-notification'

export default function Home() {
  return (
    <main className="container">
      <RequestNotificationPermission />
      <br />
      <SendNotification />
    </main>
  )
}
