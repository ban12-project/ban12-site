export default function Layout(props: {
  children: React.ReactNode
  drawer: React.ReactNode
}) {
  return (
    <>
      {props.children}
      {props.drawer}
    </>
  )
}
