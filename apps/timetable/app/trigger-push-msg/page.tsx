import { deleteSubscription } from '#/lib/actions'
import prisma from '#/lib/prisma'

import Trigger from './trigger'

export default async function Page() {
  const subscription = await prisma.pushSubscription.findMany()

  return (
    <main className="container">
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>subscription</th>
            <th>action</th>
          </tr>
        </thead>
        <tbody>
          {subscription.map((sub) => (
            <tr key={sub.id}>
              <td>{sub.id}</td>
              <td>{JSON.stringify(sub.subscription)}</td>
              <td>
                <form action={deleteSubscription}>
                  <input type="hidden" name="id" value={sub.id} />
                  <button type="submit">delete</button>
                </form>
                <Trigger id={sub.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
