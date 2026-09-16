'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Something went wrong!</h2>
        <p className="text-neutral-600 mb-4">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="btn btn-primary btn-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
