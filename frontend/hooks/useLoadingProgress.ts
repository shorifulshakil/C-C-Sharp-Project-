'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLoadingProgressOptions {
  /** Minimum loading time in ms (prevents flash) */
  minDuration?: number;
  /** Simulate progress steps */
  simulateProgress?: boolean;
}

interface UseLoadingProgressReturn {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Whether loading is complete */
  isComplete: boolean;
  /** Start loading */
  start: () => void;
  /** Complete loading */
  complete: () => void;
  /** Reset progress */
  reset: () => void;
}

export function useLoadingProgress(options: UseLoadingProgressOptions = {}): UseLoadingProgressReturn {
  const { minDuration = 800, simulateProgress = true } = options;
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const start = useCallback(() => {
    setProgress(0);
    setIsComplete(false);
    setStartTime(Date.now());
    setHasCompleted(false);
  }, []);

  const complete = useCallback(() => {
    if (!startTime) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDuration - elapsed);

    setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsComplete(true);
        setHasCompleted(true);
      }, 300);
    }, remaining);
  }, [startTime, minDuration]);

  const reset = useCallback(() => {
    setProgress(0);
    setIsComplete(true);
    setStartTime(null);
    setHasCompleted(false);
  }, []);

  useEffect(() => {
    if (isComplete || !startTime || !simulateProgress || hasCompleted) return;

    const steps = [
      { target: 15, delay: 100 },
      { target: 35, delay: 200 },
      { target: 55, delay: 250 },
      { target: 75, delay: 300 },
      { target: 90, delay: 350 },
    ];

    const timeouts: NodeJS.Timeout[] = [];

    steps.forEach((step) => {
      const timeout = setTimeout(() => {
        setProgress(prev => Math.min(prev + 5, step.target));
      }, step.delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [startTime, isComplete, simulateProgress, hasCompleted]);

  return { progress, isComplete, start, complete, reset };
}
