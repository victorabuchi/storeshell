import { useCallback, useEffect, useState } from 'react';

type State<T> = { data: T | undefined; error: Error | undefined; loading: boolean };

// Minimal data fetching: runs `fn` on mount and whenever `key` changes.
export function useAsync<T>(fn: () => Promise<T>, key: string) {
  const [state, setState] = useState<State<T>>({ data: undefined, error: undefined, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    fn().then(
      (data) => !cancelled && setState({ data, error: undefined, loading: false }),
      (error: Error) => !cancelled && setState({ data: undefined, error, loading: false }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const refetch = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, refetch };
}
