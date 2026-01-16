import { memo, use, useMemo } from 'react';

interface DiffViewProps extends React.ComponentProps<'pre'> {
  old: string;
  newer: string;
}

const wasmModulePromise = import('@crates/similar-wasm-wrapper/pkg');

export default memo(function DiffView({ old, newer, ...props }: DiffViewProps) {
  const { diff_lines_unified } = use(wasmModulePromise);

  const diff = useMemo(() => {
    return diff_lines_unified(old, newer);
  }, [old, newer, diff_lines_unified]);

  return <pre {...props}>{diff}</pre>;
});
