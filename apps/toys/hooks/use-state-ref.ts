import { useCallback, useRef, useState } from 'react';

export function useStateRef<T>(defaultValue: T) {
  const [state, setState] = useState(defaultValue);
  const ref = useRef<T>(state);

  const dispatch: React.Dispatch<T> = useCallback((value) => {
    ref.current = typeof value === 'function' ? value(ref.current) : value;
    setState(ref.current);
  }, []);

  return [state, dispatch, ref];
}
