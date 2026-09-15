'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ActionResult } from '@/core/result';

interface UseServerActionOptions<TResult> {
  /** Làm mới dữ liệu server component sau khi thành công (mặc định: true). */
  refresh?: boolean;
  onSuccess?: (data: TResult) => void;
  onError?: (message: string) => void;
}

/**
 * Chuẩn hoá vòng đời gọi server action ở client:
 * pending / error / refresh, thay cho useState rải rác trong từng view.
 */
export function useServerAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<ActionResult<TResult>>,
  options: UseServerActionOptions<TResult> = {},
) {
  const { refresh = true, onSuccess, onError } = options;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<ActionResult<TResult>> => {
      setIsRunning(true);
      setError(null);
      try {
        const result = await action(...args);
        if (result.success) {
          onSuccess?.(result.data as TResult);
          if (refresh) startTransition(() => router.refresh());
        } else {
          setError(result.error);
          onError?.(result.error);
        }
        return result;
      } finally {
        setIsRunning(false);
      }
    },
    [action, onError, onSuccess, refresh, router],
  );

  return {
    execute,
    isLoading: isRunning || isPending,
    error,
    resetError: () => setError(null),
  };
}
