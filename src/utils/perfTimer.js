// Lightweight timing utility for performance instrumentation.
// Timings are emitted at console.debug level — not visible in production
// unless DevTools is open with Verbose/Debug level enabled.

/**
 * Starts a timer for a named operation.
 * @param {string} label - Human-readable operation name
 * @returns {function} Call the returned function to stop the timer and log elapsed time
 */
export function startTimer(label) {
  const t = performance.now();
  return () => {
    const elapsed = (performance.now() - t).toFixed(1);
    console.debug(`[perf] ${label}: ${elapsed}ms`);
  };
}
