import { memo, useMemo } from 'react'

interface DiffViewProps extends React.ComponentProps<'pre'> {
  old: string
  newer: string
}

export default memo(function DiffView({ old, newer, ...props }: DiffViewProps) {
  const diff = useMemo(async () => {
    const { default: init, diff_lines_unified } = await import(
      '@crates/similar-wasm-wrapper/pkg'
    )
    await init()

    return diff_lines_unified(old, newer)
  }, [old, newer])

  return <pre {...props}>{diff}</pre>
})
