import R3fEntry from '#/components/r3f-entry'

type Props = Readonly<{
  children: React.ReactNode
}>

export default function R3fLayout({ children }: Props) {
  return (
    <>
      {children}
      <R3fEntry />
    </>
  )
}
