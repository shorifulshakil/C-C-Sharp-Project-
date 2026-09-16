'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingProgressProps {
  isLoading: boolean;
  className?: string;
  onComplete?: () => void;
}

export function LoadingProgress({
  isLoading,
  className,
  onComplete,
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const progressRef = useRef(0);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------
  // Cleanup helper
  // -------------------------------------------------------
  const clearTimers = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }

    if (finishIntervalRef.current) {
      clearInterval(finishIntervalRef.current);
      finishIntervalRef.current = null;
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    clearTimers();

    // =====================================================
    // START LOADING
    // =====================================================
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      progressRef.current = 0;

      /*
       * Smooth simulated loading
       *
       * 0  -> 70  = Normal/Fast
       * 70 -> 90  = Medium
       * 90 -> 95  = Slow
       *
       * It will NEVER reach 100% while isLoading === true.
       */

      loadingIntervalRef.current = setInterval(() => {
        setProgress((current) => {
          let next = current;

          if (current < 70) {
            // Main loading phase
            next = current + 0.75;
          } else if (current < 90) {
            // Slow down
            next = current + 0.30;
          } else if (current < 95) {
            // Very slow near completion
            next = current + 0.07;
          } else {
            // Stay at 95% until actual loading finishes
            next = 95;
          }

          progressRef.current = next;

          return next;
        });
      }, 100);

      return () => {
        clearTimers();
      };
    }

    // =====================================================
    // LOADING FINISHED
    // =====================================================

    setVisible(true);

    /*
     * Complete the remaining progress.
     *
     * Example:
     *
     * 72% -> 100%
     * 91% -> 100%
     * 95% -> 100%
     */

    finishIntervalRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          if (finishIntervalRef.current) {
            clearInterval(finishIntervalRef.current);
            finishIntervalRef.current = null;
          }

          return 100;
        }

        const remaining = 100 - current;

        let increment: number;

        if (remaining > 25) {
          increment = 3;
        } else if (remaining > 10) {
          increment = 2;
        } else if (remaining > 3) {
          increment = 1;
        } else {
          increment = 0.5;
        }

        const next = Math.min(100, current + increment);

        progressRef.current = next;

        return next;
      });
    }, 30);

    /*
     * Hide the progress bar after completion.
     */
    hideTimeoutRef.current = setTimeout(() => {
      setProgress(100);
      progressRef.current = 100;

      setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 200);
    }, 650);

    return () => {
      clearTimers();
    };
  }, [isLoading, onComplete]);

  // Don't render anything when hidden
  if (!visible) {
    return null;
  }

  const displayProgress = Math.min(
    100,
    Math.round(progress)
  );

  // Dynamic loading message
  const loadingMessage =
    displayProgress >= 100
      ? 'Complete'
      : displayProgress >= 95
        ? 'Finishing...'
        : displayProgress >= 80
          ? 'Almost there...'
          : displayProgress >= 50
            ? 'Loading...'
            : 'Starting...';

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-[100]',
        className
      )}
    >
      {/* ================================================= */}
      {/* TOP PROGRESS BAR */}
      {/* ================================================= */}

      <div className="h-1 bg-neutral-200/60 backdrop-blur-sm">
        <div
          className={cn(
            'relative h-full',
            'bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500',
            'transition-[width] duration-100 ease-linear'
          )}
          style={{
            width: `${progress}%`,
          }}
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-white/30 blur-[2px]" />

          {/* Moving Shine */}
          <div
            className={cn(
              'absolute inset-y-0 right-0 w-24',
              'bg-gradient-to-r from-transparent via-white/50 to-transparent',
              'animate-shimmer'
            )}
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* PERCENTAGE BADGE */}
      {/* ================================================= */}

      <div className="fixed right-4 top-4 sm:right-6 sm:top-5">
        <div
          className={cn(
            'flex items-center gap-3',
            'rounded-full',
            'border border-neutral-200/80',
            'bg-white/95',
            'px-4 py-2.5',
            'shadow-lg shadow-neutral-900/5',
            'backdrop-blur-xl',
            'transition-all duration-300',
            displayProgress >= 100
              ? 'scale-95 opacity-0'
              : 'scale-100 opacity-100'
          )}
        >
          {/* ================================================= */}
          {/* CIRCULAR PROGRESS */}
          {/* ================================================= */}

          <div className="relative h-5 w-5 shrink-0">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              {/* Background Circle */}
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-neutral-200"
              />

              {/* Progress Circle */}
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${displayProgress * 0.565} 100`}
                className="text-primary-500"
                transform="rotate(-90 12 12)"
              />
            </svg>
          </div>

          {/* ================================================= */}
          {/* PERCENTAGE */}
          {/* ================================================= */}

          <span className="min-w-[3ch] text-right text-sm font-semibold tabular-nums text-neutral-700">
            {displayProgress}%
          </span>

          {/* ================================================= */}
          {/* STATUS */}
          {/* ================================================= */}

          <span className="hidden text-xs font-medium text-neutral-500 sm:inline">
            {loadingMessage}
          </span>
        </div>
      </div>
    </div>
  );
}