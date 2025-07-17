import { Suspense } from 'react'

export default function Layout(props: {
  children: React.ReactNode
  drawer: React.ReactNode
}) {
  return (
    <Suspense>
      {props.children}
      {props.drawer}
    </Suspense>
  )
}
